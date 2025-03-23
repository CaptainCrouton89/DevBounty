import { createClient } from "@/db/supabase/client";
import { BountyStatus, ClaimedBountyStatus, PaymentStatus } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

// Using a type alias for Database since we have import issues
type Database = any;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    // Parse the request body
    const body = await request.json();
    const { dispute_id, resolution, outcome } = body;

    if (!dispute_id) {
      return NextResponse.json(
        { error: "Dispute ID is required" },
        { status: 400 }
      );
    }

    if (!resolution || resolution.trim().length === 0) {
      return NextResponse.json(
        { error: "Resolution explanation is required" },
        { status: 400 }
      );
    }

    if (!outcome || !["client", "developer", "split"].includes(outcome)) {
      return NextResponse.json(
        { error: "Valid outcome is required (client, developer, or split)" },
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

    // Check if the user is an admin
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (userError || !user || !user.is_admin) {
      return NextResponse.json(
        { error: "Only admins can resolve disputes" },
        { status: 403 }
      );
    }

    // Get the dispute details
    const { data: dispute, error: disputeError } = await supabase
      .from("disputes")
      .select(
        `
        *,
        bounties:bounty_id (
          *,
          client_profiles:client_id (*)
        ),
        claimed_bounties:claimed_bounty_id (
          *,
          developer_profiles:developer_id (*)
        )
      `
      )
      .eq("id", dispute_id)
      .single();

    if (disputeError || !dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    // Check if dispute is already resolved
    if (dispute.status !== "resolved") {
      return NextResponse.json(
        { error: "This dispute is already resolved" },
        { status: 400 }
      );
    }

    // Begin transaction
    // 1. Update dispute status
    const { error: updateDisputeError } = await supabase
      .from("disputes")
      .update({
        status: "resolved",
        resolution,
        resolution_outcome: outcome,
        resolved_at: new Date().toISOString(),
        resolved_by_id: userId,
      })
      .eq("id", dispute_id);

    if (updateDisputeError) {
      return NextResponse.json(
        {
          error: "Failed to update dispute",
          details: updateDisputeError.message,
        },
        { status: 500 }
      );
    }

    // 2. Update bounty and claimed bounty based on outcome
    let newBountyStatus = "";
    let newClaimedBountyStatus = "";
    let paymentStatus = "";

    switch (outcome) {
      case "client":
        // Client wins - bounty goes back to open, claimed bounty is canceled
        newBountyStatus = "open";
        newClaimedBountyStatus = "canceled";
        paymentStatus = "canceled";
        break;
      case "developer":
        // Developer wins - bounty is completed, payment should be processed
        newBountyStatus = "completed";
        newClaimedBountyStatus = "approved";
        paymentStatus = "ready";
        break;
      case "split":
        // Split decision - partial payment
        newBountyStatus = "completed";
        newClaimedBountyStatus = "approved";
        paymentStatus = "partial";
        break;
    }

    // Update bounty status
    const { error: updateBountyError } = await supabase
      .from("bounties")
      .update({
        status: newBountyStatus as BountyStatus,
        ...(newBountyStatus === "completed"
          ? { completed_at: new Date().toISOString() }
          : {}),
      })
      .eq("id", dispute.bounty_id);

    if (updateBountyError) {
      return NextResponse.json(
        {
          error: "Failed to update bounty status",
          details: updateBountyError.message,
        },
        { status: 500 }
      );
    }

    // Update claimed bounty if one exists
    if (dispute.claimed_bounties) {
      const { error: updateClaimError } = await supabase
        .from("claimed_bounties")
        .update({
          status: newClaimedBountyStatus as ClaimedBountyStatus,
          payment_status: paymentStatus as PaymentStatus,
          ...(newClaimedBountyStatus === "approved"
            ? { approved_at: new Date().toISOString() }
            : {}),
        })
        .eq("id", dispute.claimed_bounties.id);

      if (updateClaimError) {
        return NextResponse.json(
          {
            error: "Failed to update claimed bounty",
            details: updateClaimError.message,
          },
          { status: 500 }
        );
      }

      // If developer wins or split, create payment record
      if (outcome === "developer" || outcome === "split") {
        // Calculate payment amount
        const amount = dispute.bounties.bounty_amount;
        const finalAmount = outcome === "split" ? amount / 2 : amount;

        // Get payment address
        const paymentAddress =
          dispute.claimed_bounties.developer_profiles.payment_address;

        // Create payment record
        const { error: paymentError } = await supabase.from("payments").insert({
          dispute_id: dispute_id,
          bounty_id: dispute.bounty_id,
          claimed_bounty_id: dispute.claimed_bounty_id,
          client_id: dispute.client_id,
          developer_id: dispute.developer_id,
          amount: finalAmount,
          status: "pending",
        });

        if (paymentError) {
          console.error("Failed to create payment record:", paymentError);
          // Non-critical error, continue
        }
      }
    }

    // Success response
    return NextResponse.json({
      message: "Dispute resolved successfully",
      dispute_id,
      resolution,
      outcome,
      status: "resolved",
      resolved_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error resolving dispute:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
