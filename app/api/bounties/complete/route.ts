import { createClient } from "@/db/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Parse the request body
    const body = await request.json();
    const { bounty_id, pull_request_url } = body;

    if (!bounty_id) {
      return NextResponse.json(
        { error: "Bounty ID is required" },
        { status: 400 }
      );
    }

    if (!pull_request_url) {
      return NextResponse.json(
        { error: "GitHub Pull Request URL is required" },
        { status: 400 }
      );
    }

    // Validate GitHub PR URL format
    const githubPrPattern =
      /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/\d+$/;
    if (!githubPrPattern.test(pull_request_url)) {
      return NextResponse.json(
        { error: "Invalid GitHub Pull Request URL format" },
        { status: 400 }
      );
    }

    // Get the current user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if the user has a developer profile
    const { data: developerProfile, error: profileError } = await supabase
      .from("developer_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !developerProfile) {
      return NextResponse.json(
        { error: "Developer profile not found" },
        { status: 404 }
      );
    }

    // Get the bounty and check if it's currently claimed
    const { data: bounty, error: bountyError } = await supabase
      .from("bounties")
      .select("*")
      .eq("id", bounty_id)
      .single();

    if (bountyError || !bounty) {
      return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
    }

    if (bounty.status !== "claimed") {
      return NextResponse.json(
        { error: "This bounty is not currently claimed" },
        { status: 400 }
      );
    }

    // Get the claimed bounty and check if the current user is the claimer
    const { data: claimedBounty, error: claimedBountyError } = await supabase
      .from("claimed_bounties")
      .select(
        `
        *,
        developer_profiles!inner (
          user_id
        )
      `
      )
      .eq("bounty_id", bounty_id)
      .eq("status", "in_progress")
      .single();

    if (claimedBountyError || !claimedBounty) {
      return NextResponse.json(
        { error: "Claimed bounty information not found" },
        { status: 404 }
      );
    }

    // Verify the user is the one who claimed the bounty
    if (claimedBounty.developer_profiles.user_id !== userId) {
      return NextResponse.json(
        {
          error:
            "Only the developer who claimed this bounty can submit a completion",
        },
        { status: 403 }
      );
    }

    // Begin transaction to update records
    // 1. Update claimed bounty with PR link and status
    const { error: updateClaimError } = await supabase
      .from("claimed_bounties")
      .update({
        status: "delivered",
        pull_request_url,
        completed_at: new Date().toISOString(),
      })
      .eq("id", claimedBounty.id);

    if (updateClaimError) {
      return NextResponse.json(
        {
          error: "Failed to update claimed bounty",
          details: updateClaimError.message,
        },
        { status: 500 }
      );
    }

    // 2. Update bounty status to review (client needs to approve)
    const { error: updateBountyError } = await supabase
      .from("bounties")
      .update({ status: "completed" })
      .eq("id", bounty_id);

    if (updateBountyError) {
      // Try to rollback the claimed bounty update if the bounty update fails
      await supabase
        .from("claimed_bounties")
        .update({
          status: "in_progress",
          pull_request_url: null,
          completed_at: null,
        })
        .eq("id", claimedBounty.id);

      return NextResponse.json(
        {
          error: "Failed to update bounty status",
          details: updateBountyError.message,
        },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      message: "Bounty completed successfully and ready for review",
      bounty_id,
      pull_request_url,
      status: "review",
      completed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error completing bounty:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
