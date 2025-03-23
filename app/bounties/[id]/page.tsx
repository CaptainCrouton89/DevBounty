"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/db/supabase/client";
import { useAuth } from "@/lib/supabase/auth-context";
import { getBountyById, getCommentsByBountyId } from "@/lib/supabase/utils";
import { BountyWithDetails } from "@/lib/types";
import { format, formatDistanceToNow } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Code,
  DollarSign,
  ExternalLink,
  Github,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BountyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, userWithProfile } = useAuth();
  const [bounty, setBounty] = useState<BountyWithDetails | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    const fetchBountyDetails = async () => {
      try {
        setLoading(true);
        const bountyData = await getBountyById(id);
        setBounty(bountyData);

        // Get comments
        const commentsData = await getCommentsByBountyId(id);
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching bounty details:", error);
        toast.error("Failed to load bounty details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBountyDetails();
    }
  }, [id]);

  const getBountyStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "claimed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeRemaining = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getUsername = (user: any) => {
    return user.username || user.email.split("@")[0];
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const handleNewComment = async () => {
    if (!user || !newComment.trim()) return;
    const supabase = createClient();

    try {
      setCommentSubmitting(true);

      const { data, error } = await supabase
        .from("comments")
        .insert({
          bounty_id: id,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select("*, users:user_id (*)");

      if (error) throw error;

      // Add the new comment to the comments array
      setComments([...comments, data[0]]);
      setNewComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleClaimBounty = async () => {
    if (!user) {
      toast.error("You must be logged in to claim a bounty");
      return;
    }

    if (!userWithProfile?.developer_profiles) {
      toast.error("You need a developer profile to claim bounties");
      return;
    }

    try {
      setSubmittingAction(true);
      const supabase = createClient();

      // Calculate deadline based on bounty dibs_duration
      const dibsDuration = bounty?.dibs_duration || "7 days";
      const days = parseInt(dibsDuration.split(" ")[0]) || 7;
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + days);

      // Create a claimed bounty record
      const { data, error } = await supabase.from("claimed_bounties").insert({
        bounty_id: id,
        developer_id: userWithProfile.developer_profiles.id,
        delivery_deadline: deadline.toISOString(),
        status: "in_progress",
      });

      if (error) {
        throw error;
      }

      // Update bounty status
      const { error: updateError } = await supabase
        .from("bounties")
        .update({ status: "claimed" })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      toast.success("Bounty claimed successfully!");
      // Refresh the bounty data
      const bountyData = await getBountyById(id);
      setBounty(bountyData);
    } catch (error: any) {
      console.error("Error claiming bounty:", error);
      toast.error(error.message || "Failed to claim bounty");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCompleteBounty = async () => {
    if (!user || !bounty?.claimed_bounties?.[0]) return;

    // Redirect to the complete bounty form
    window.location.href = `/bounties/${id}/complete`;
  };

  const handleApproveBounty = async () => {
    if (!user || !bounty) return;

    try {
      setSubmittingAction(true);

      const response = await fetch("/api/bounties/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bounty_id: id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve bounty");
      }

      toast.success("Bounty approved successfully!");
      // Refresh bounty data
      const bountyData = await getBountyById(id);
      setBounty(bountyData);
    } catch (error: any) {
      console.error("Error approving bounty:", error);
      toast.error(error.message || "Failed to approve bounty");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Function to determine if the user is the client who created the bounty
  const isClient = () => {
    if (!user || !bounty) return false;
    return bounty.client?.user?.id === user.id;
  };

  // Function to determine if the user is the developer who claimed the bounty
  const isDeveloper = () => {
    if (!user || !bounty || !bounty.claimedBounty) return false;
    return bounty.claimedBounty.developer?.user?.id === user.id;
  };

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading bounty details...</p>
        </div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Bounty Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The bounty you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/explore">Browse Bounties</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Bounty Header Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge className={getBountyStatusColor(bounty.status)}>
                    {bounty.status.charAt(0).toUpperCase() +
                      bounty.status.slice(1)}
                  </Badge>
                  <CardTitle className="text-2xl mt-2">
                    {bounty.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-bold">
                      ${bounty.bounty_amount.toLocaleString()}
                    </span>
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground flex flex-col items-end">
                  <div className="flex items-center gap-1 mb-1">
                    <CalendarIcon className="h-4 w-4" />
                    Posted {format(new Date(bounty.created_at || ""), "PPP")}
                  </div>
                  {bounty.status === "open" && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Expires {getTimeRemaining(bounty.expires_at)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {bounty.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="outline">{bounty.category}</Badge>
                {bounty.tags &&
                  bounty.tags.map((tag: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
              </div>

              {bounty.github_repo && (
                <a
                  href={bounty.github_repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-2"
                >
                  <Github className="h-4 w-4" />
                  {bounty.github_repo.replace("https://github.com/", "")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </CardContent>
          </Card>

          {/* Requirements Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requirements</CardTitle>
              <CardDescription>
                What needs to be delivered for this bounty
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bounty.requirements && bounty.requirements.length > 0 ? (
                <ul className="space-y-4">
                  {bounty.requirements.map((req: any, index: number) => (
                    <li
                      key={index}
                      className="border-l-2 border-primary pl-4 py-1"
                    >
                      <h4 className="font-medium">{req.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {req.description}
                      </p>
                      {req.details && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {req.details}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">
                  No specific requirements provided
                </p>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Discussion</CardTitle>
              <CardDescription>
                Questions and comments about this bounty
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No comments yet. Be the first to start the discussion!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.users?.avatar_url} />
                        <AvatarFallback>
                          {getInitials(getUsername(comment.users))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <p className="font-medium text-sm">
                            {getUsername(comment.users)}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at || ""), "PPP")}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {user ? (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {getInitials(user.email || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button
                        onClick={handleNewComment}
                        disabled={!newComment.trim() || commentSubmitting}
                        size="sm"
                      >
                        {commentSubmitting ? "Posting..." : "Post Comment"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    You need to be signed in to join the discussion
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={bounty.client?.user?.avatar_url} />
                  <AvatarFallback>
                    {getInitials(
                      bounty.client?.company_name ||
                        bounty.client?.user?.username ||
                        "CL"
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {bounty.client?.company_name ||
                      bounty.client?.user?.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bounty.client?.location || "Location not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status and Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getBountyStatusColor(bounty.status)}>
                    {bounty.status.charAt(0).toUpperCase() +
                      bounty.status.slice(1)}
                  </Badge>
                </div>

                {bounty.status === "claimed" && bounty.claimedBounty && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Claimed by:</span>
                      <span className="font-medium">
                        {bounty.claimedBounty.developer?.user?.username ||
                          "Developer"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Due date:</span>
                      <span>
                        {format(
                          new Date(bounty.claimedBounty.delivery_deadline),
                          "PPP"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time left:</span>
                      <span>
                        {getTimeRemaining(
                          bounty.claimedBounty.delivery_deadline
                        )}
                      </span>
                    </div>
                  </>
                )}

                {bounty.status === "completed" && bounty.claimedBounty && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Completed by:
                      </span>
                      <span className="font-medium">
                        {bounty.claimedBounty.developer?.user?.username ||
                          "Developer"}
                      </span>
                    </div>
                    {bounty.claimedBounty.pull_request_url && (
                      <a
                        href={bounty.claimedBounty.pull_request_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        <Code className="h-3 w-3" /> View Pull Request
                      </a>
                    )}
                  </>
                )}
              </div>

              <Separator />

              {/* Context-aware actions */}
              <div className="space-y-2">
                {bounty.status === "open" && user && (
                  <Button
                    className="w-full"
                    onClick={handleClaimBounty}
                    disabled={submittingAction || isClient()}
                  >
                    {submittingAction ? "Processing..." : "Claim Bounty"}
                  </Button>
                )}

                {bounty.status === "claimed" && isDeveloper() && (
                  <Button
                    className="w-full"
                    onClick={handleCompleteBounty}
                    disabled={submittingAction}
                  >
                    {submittingAction ? "Processing..." : "Submit Completion"}
                  </Button>
                )}

                {bounty.status === "completed" && isClient() && (
                  <Button
                    className="w-full"
                    onClick={handleApproveBounty}
                    disabled={submittingAction}
                  >
                    {submittingAction ? "Processing..." : "Approve & Pay"}
                  </Button>
                )}

                {bounty.status === "open" && isClient() && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/bounties/${id}/edit`}>Edit Bounty</Link>
                  </Button>
                )}

                {!user && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Sign in to claim this bounty
                    </p>
                    <Button asChild className="w-full">
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bounty Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bounty Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{bounty.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reward:</span>
                  <span className="font-medium">
                    ${bounty.bounty_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Posted:</span>
                  <span>
                    {format(new Date(bounty.created_at || ""), "PPP")}
                  </span>
                </div>
                {bounty.status === "open" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expires:</span>
                    <span>{format(new Date(bounty.expires_at), "PPP")}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Time to complete:
                  </span>
                  <span>{bounty.dibs_duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
