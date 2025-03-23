import { createClient } from "@/db/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Parse the request body
    const body = await request.json();
    const { bounty_id, reason } = body;

    if (!bounty_id) {
      return NextResponse.json(
        { error: "Bounty ID is required" },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "Dispute reason is required" },
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

    // Get the bounty
    const { data: bounty, error: bountyError } = await supabase
      .from("bounties")
      .select(
        `
        *,
        client_profiles!inner (
          id,
          user_id
        )
      `
      )
      .eq("id", bounty_id)
      .single();

    if (bountyError || !bounty) {
      return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
    }

    // Get the claimed bounty
    const { data: claimedBounty, error: claimedBountyError } = await supabase
      .from("claimed_bounties")
      .select(
        `
        *,
        developer_profiles!inner (
          id,
          user_id
        )
      `
      )
      .eq("bounty_id", bounty_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Check if user is involved in the bounty
    const isClient = bounty.client_profiles.user_id === userId;
    const isDeveloper =
      claimedBounty && claimedBounty.developer_profiles.user_id === userId;

    if (!isClient && !isDeveloper) {
      return NextResponse.json(
        { error: "Only parties involved in the bounty can create a dispute" },
        { status: 403 }
      );
    }

    // Check if a dispute already exists
    const { data: existingDispute, error: disputeCheckError } = await supabase
      .from("disputes")
      .select("id")
      .eq("bounty_id", bounty_id)
      .is("resolved_at", null)
      .single();

    if (existingDispute) {
      return NextResponse.json(
        { error: "An active dispute already exists for this bounty" },
        { status: 400 }
      );
    }

    // Create a new dispute
    const { data: dispute, error: createDisputeError } = await supabase
      .from("disputes")
      .insert({
        bounty_id: bounty_id,
        claimed_bounty_id: claimedBounty?.id,
        client_id: bounty.client_id,
        developer_id: claimedBounty?.developer_id,
        created_by_id: isClient
          ? bounty.client_id
          : claimedBounty?.developer_id,
        created_by_type: isClient ? "client" : "developer",
        reason,
        status: "open",
      })
      .select()
      .single();

    if (createDisputeError) {
      return NextResponse.json(
        {
          error: "Failed to create dispute",
          details: createDisputeError.message,
        },
        { status: 500 }
      );
    }

    // Update bounty status to "disputed"
    const { error: updateBountyError } = await supabase
      .from("bounties")
      .update({ status: "open" })
      .eq("id", bounty_id);

    if (updateBountyError) {
      // If updating bounty fails, delete the dispute to maintain consistency
      await supabase.from("disputes").delete().eq("id", dispute.id);

      return NextResponse.json(
        {
          error: "Failed to update bounty status",
          details: updateBountyError.message,
        },
        { status: 500 }
      );
    }

    // If there's a claimed bounty, update its status too
    if (claimedBounty) {
      const { error: updateClaimError } = await supabase
        .from("claimed_bounties")
        .update({ status: "expired" })
        .eq("id", claimedBounty.id);

      if (updateClaimError) {
        console.error(
          "Failed to update claimed bounty status:",
          updateClaimError
        );
        // Not critical, continue without failing the request
      }
    }

    // Success response
    return NextResponse.json({
      message: "Dispute created successfully",
      dispute,
      bounty_id,
      status: "disputed",
    });
  } catch (error) {
    console.error("Error creating dispute:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
