import { createClient } from "@/db/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Parse the request body
    const body = await request.json();
    const { bounty_id } = body;

    if (!bounty_id) {
      return NextResponse.json(
        { error: "Bounty ID is required" },
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

    // Get the bounty and check if the current user is the owner
    const { data: bounty, error: bountyError } = await supabase
      .from("bounties")
      .select(
        `
        *,
        client_profiles!inner (
          user_id
        )
      `
      )
      .eq("id", bounty_id)
      .single();

    if (bountyError || !bounty) {
      return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
    }

    // Verify the user is the bounty owner
    if (bounty.client_profiles.user_id !== userId) {
      // Check if the user is an admin
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", userId)
        .single();

      const isAdmin = user?.is_admin === true;

      if (!isAdmin) {
        return NextResponse.json(
          { error: "Only the client who posted this bounty can approve it" },
          { status: 403 }
        );
      }
    }

    // Check if bounty is in review status
    if (bounty.status !== "completed") {
      return NextResponse.json(
        { error: "This bounty is not ready for approval" },
        { status: 400 }
      );
    }

    // Get the claimed bounty
    const { data: claimedBounty, error: claimedBountyError } = await supabase
      .from("claimed_bounties")
      .select(
        `
        *,
        developer_profiles!inner (id, user_id, payment_address)
      `
      )
      .eq("bounty_id", bounty_id)
      .eq("status", "delivered")
      .single();

    if (claimedBountyError || !claimedBounty) {
      return NextResponse.json(
        { error: "Completed bounty claim not found" },
        { status: 404 }
      );
    }

    // Begin transaction
    // 1. Update claimed bounty status to approved
    const { error: updateClaimError } = await supabase
      .from("claimed_bounties")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        payment_status: "pending",
      })
      .eq("id", claimedBounty.id);

    if (updateClaimError) {
      return NextResponse.json(
        {
          error: "Failed to update claimed bounty status",
          details: updateClaimError.message,
        },
        { status: 500 }
      );
    }

    // 2. Update bounty status to completed
    const { error: updateBountyError } = await supabase
      .from("bounties")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", bounty_id);

    if (updateBountyError) {
      // Try to rollback the claimed bounty update if the bounty update fails
      await supabase
        .from("claimed_bounties")
        .update({
          status: "delivered",
          approved_at: null,
          payment_status: "pending",
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

    // 3. Create a payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        bounty_id: bounty_id,
        claimed_bounty_id: claimedBounty.id,
        client_id: bounty.client_id,
        developer_id: claimedBounty.developer_id,
        amount: bounty.bounty_amount,
        payment_method: "USD",
        payment_address: claimedBounty.developer_profiles.payment_address,
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      // This is not a critical error since the bounty is already approved
      console.error("Failed to create payment record:", paymentError);
    }

    // Success response
    return NextResponse.json({
      message: "Bounty approved successfully",
      bounty_id,
      status: "completed",
      payment: payment || {
        amount: bounty.bounty_amount,
        payment_method: "USD",
        payment_address: claimedBounty.developer_profiles.payment_address,
        status: "pending",
      },
      approved_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error approving bounty:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
