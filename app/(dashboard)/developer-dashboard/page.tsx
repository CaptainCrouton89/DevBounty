"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/db/supabase/client";
import { useAuth } from "@/lib/supabase/auth-context";
import { DeveloperProfile } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Clock, Code, DollarSign, Filter, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Define simplified bounty types for the dashboard
interface DashboardBounty {
  id: string;
  title: string;
  description: string;
  bounty_amount: number;
  status: string;
  category: string;
  tags: string[] | null;
  created_at: string | null;
  expires_at: string;
  client_profiles?: {
    company_name: string | null;
    average_rating: number | null;
    users: {
      username: string;
    };
  };
}

interface ClaimedBounty {
  id: string;
  bounty_id: string;
  claimed_at: string | null;
  delivery_deadline: string;
  status: string;
  payment_status: string;
  pull_request_url: string | null;
  bounty?: DashboardBounty;
}

type FilterOption = "newest" | "amount-high" | "amount-low" | "all";
type CategoryFilter = string | "all";

export default function DeveloperDashboard() {
  const { user, userWithProfile } = useAuth();
  const supabase = createClient();
  const [availableBounties, setAvailableBounties] = useState<DashboardBounty[]>(
    []
  );
  const [claimedBounties, setClaimedBounties] = useState<ClaimedBounty[]>([]);
  const [completedBounties, setCompletedBounties] = useState<ClaimedBounty[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [developerProfile, setDeveloperProfile] =
    useState<DeveloperProfile | null>(null);
  const [sortFilter, setSortFilter] = useState<FilterOption>("newest");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);

  useEffect(() => {
    const fetchDeveloperData = async () => {
      if (!user || !userWithProfile?.developerProfile?.id) {
        return;
      }

      setLoading(true);
      try {
        const developerId = userWithProfile.developerProfile.id;

        // Fetch developer profile
        const { data: profileData, error: profileError } = await supabase
          .from("developer_profiles")
          .select("*")
          .eq("id", developerId)
          .single();

        if (profileError) {
          console.error("Error fetching developer profile:", profileError);
        } else {
          setDeveloperProfile(profileData);
        }

        // Fetch claimed bounties for this developer
        const { data: claimedData, error: claimedError } = await supabase
          .from("claimed_bounties")
          .select(
            `
            *,
            bounty:bounty_id (
              *,
              client_profiles:client_id (
                *,
                users:user_id (*)
              )
            )
          `
          )
          .eq("developer_id", developerId);

        if (claimedError) {
          console.error("Error fetching claimed bounties:", claimedError);
        } else if (claimedData) {
          // Process claimed bounties
          const inProgress = claimedData.filter(
            (claim) =>
              claim.status === "in_progress" || claim.status === "delivered"
          );

          const completed = claimedData.filter(
            (claim) => claim.status === "approved"
          );

          setClaimedBounties(inProgress);
          setCompletedBounties(completed);

          // Calculate total earnings
          const total = completed.reduce(
            (sum, claim) => sum + (claim.bounty?.bounty_amount || 0),
            0
          );
          setTotalEarnings(total);
        }

        // Fetch available bounties (open bounties that match developer's skills)
        const { data: allBounties, error: bountiesError } = await supabase
          .from("bounties")
          .select(
            `
            *,
            client_profiles:client_id (
              *,
              users:user_id (*)
            )
          `
          )
          .eq("status", "open");

        if (bountiesError) {
          console.error("Error fetching available bounties:", bountiesError);
        } else if (allBounties) {
          // Get unique categories
          const allCategories = [
            ...new Set(allBounties.map((b) => b.category)),
          ];
          setCategories(allCategories);

          // Filter bounties by developer skills if skills are defined
          let matchedBounties = allBounties;
          if (profileData?.skills && profileData.skills.length > 0) {
            matchedBounties = allBounties.filter((bounty) => {
              // Match against tags or category
              return (
                bounty.tags?.some((tag) =>
                  profileData.skills?.includes(tag.toLowerCase())
                ) || profileData.skills?.includes(bounty.category.toLowerCase())
              );
            });
          }

          setAvailableBounties(matchedBounties);
        }
      } catch (error) {
        console.error("Error in data fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeveloperData();
  }, [user, userWithProfile]);

  // Filter and sort logic for bounties
  const getFilteredBounties = (bounties: DashboardBounty[]) => {
    // First apply category filter
    let filtered = bounties;
    if (categoryFilter !== "all") {
      filtered = bounties.filter(
        (bounty) => bounty.category === categoryFilter
      );
    }

    // Then apply sort filter
    switch (sortFilter) {
      case "newest":
        return [...filtered].sort(
          (a, b) =>
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
        );
      case "amount-high":
        return [...filtered].sort((a, b) => b.bounty_amount - a.bounty_amount);
      case "amount-low":
        return [...filtered].sort((a, b) => a.bounty_amount - b.bounty_amount);
      default:
        return filtered;
    }
  };

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

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Please Sign In</h1>
          <p className="mb-4">
            You need to be signed in to view your dashboard
          </p>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!userWithProfile?.developerProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            Developer Profile Required
          </h1>
          <p className="mb-4">
            You need to create a developer profile to access the developer
            dashboard
          </p>
          <Link href="/create-developer-profile">
            <Button>Create Developer Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <Card className="sticky top-24">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src="" alt={userWithProfile.username} />
                  <AvatarFallback>
                    {userWithProfile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{userWithProfile.username}</CardTitle>
                  <CardDescription>{userWithProfile.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {developerProfile?.skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {(!developerProfile?.skills ||
                    developerProfile.skills.length === 0) && (
                    <p className="text-sm text-muted-foreground">
                      No skills added yet
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Rating
                </h3>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span>
                    {developerProfile?.average_rating?.toFixed(1) || "N/A"}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({developerProfile?.rating_count || 0} reviews)
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Active Claims:</span>
                    <span className="font-medium">
                      {claimedBounties.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Bounties:</span>
                    <span className="font-medium">
                      {completedBounties.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Earnings:</span>
                    <span className="font-medium text-green-600">
                      ${totalEarnings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/profile/edit">
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Developer Dashboard</h1>
          </div>

          <Tabs defaultValue="available" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="available" className="flex-1">
                Available Bounties{" "}
                <Badge variant="secondary" className="ml-2">
                  {availableBounties.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="claimed" className="flex-1">
                Your Claims{" "}
                <Badge variant="secondary" className="ml-2">
                  {claimedBounties.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">
                Completed{" "}
                <Badge variant="secondary" className="ml-2">
                  {completedBounties.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Filter section */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="flex gap-2 items-center">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sortFilter}
                  onValueChange={(value) =>
                    setSortFilter(value as FilterOption)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="amount-high">Highest Amount</SelectItem>
                    <SelectItem value="amount-low">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="available" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading bounties...</div>
              ) : getFilteredBounties(availableBounties).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No available bounties match your skills
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add more skills to your profile or check back later for new
                    opportunities
                  </p>
                </div>
              ) : (
                getFilteredBounties(availableBounties).map((bounty) => (
                  <Link href={`/bounties/${bounty.id}`} key={bounty.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge
                              className={`${getBountyStatusColor(bounty.status)}`}
                            >
                              {bounty.status.charAt(0).toUpperCase() +
                                bounty.status.slice(1)}
                            </Badge>
                            <CardTitle className="mt-2">
                              {bounty.title}
                            </CardTitle>
                            <CardDescription>
                              {bounty.client_profiles?.company_name ||
                                bounty.client_profiles?.users.username}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              <span className="text-2xl font-bold">
                                {bounty.bounty_amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Expires {getTimeRemaining(bounty.expires_at)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-muted-foreground">
                          {bounty.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <div className="flex items-center">
                          <Badge variant="outline">{bounty.category}</Badge>
                          {bounty.tags && bounty.tags.length > 0 && (
                            <Badge variant="outline" className="ml-2">
                              {bounty.tags[0]}
                            </Badge>
                          )}
                          {bounty.tags && bounty.tags.length > 1 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              +{bounty.tags.length - 1} more
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Posted{" "}
                          {new Date(
                            bounty.created_at || ""
                          ).toLocaleDateString()}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              )}
            </TabsContent>

            <TabsContent value="claimed" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading your claims...</div>
              ) : claimedBounties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You haven't claimed any bounties yet
                  </p>
                  <Link href="/bounties">
                    <Button>Browse Available Bounties</Button>
                  </Link>
                </div>
              ) : (
                claimedBounties.map((claim) => (
                  <Link href={`/bounties/${claim.bounty_id}`} key={claim.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge
                              className={`${getBountyStatusColor(claim.status)}`}
                            >
                              {claim.status === "in_progress"
                                ? "In Progress"
                                : claim.status === "delivered"
                                  ? "Delivered"
                                  : claim.status.charAt(0).toUpperCase() +
                                    claim.status.slice(1)}
                            </Badge>
                            <CardTitle className="mt-2">
                              {claim.bounty?.title}
                            </CardTitle>
                            <CardDescription>
                              {claim.bounty?.client_profiles?.company_name ||
                                claim.bounty?.client_profiles?.users.username}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              <span className="text-2xl font-bold">
                                {claim.bounty?.bounty_amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-end text-sm text-muted-foreground mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                Due {getTimeRemaining(claim.delivery_deadline)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-muted-foreground">
                          {claim.bounty?.description}
                        </p>
                        {claim.status === "delivered" &&
                          claim.pull_request_url && (
                            <div className="mt-2 flex items-center">
                              <Badge variant="outline" className="mr-2">
                                PR Submitted
                              </Badge>
                              <a
                                href={claim.pull_request_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Code className="h-3 w-3" /> View PR
                              </a>
                            </div>
                          )}
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <div className="flex items-center">
                          <Badge variant="outline">
                            {claim.bounty?.category}
                          </Badge>
                          {claim.bounty?.tags &&
                            claim.bounty.tags.length > 0 && (
                              <Badge variant="outline" className="ml-2">
                                {claim.bounty.tags[0]}
                              </Badge>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Claimed{" "}
                          {new Date(
                            claim.claimed_at || ""
                          ).toLocaleDateString()}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  Loading completed bounties...
                </div>
              ) : completedBounties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    You haven't completed any bounties yet
                  </p>
                </div>
              ) : (
                completedBounties.map((claim) => (
                  <Link href={`/bounties/${claim.bounty_id}`} key={claim.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge
                              className={`${getBountyStatusColor(claim.status)}`}
                            >
                              {claim.status.charAt(0).toUpperCase() +
                                claim.status.slice(1)}
                            </Badge>
                            <CardTitle className="mt-2">
                              {claim.bounty?.title}
                            </CardTitle>
                            <CardDescription>
                              {claim.bounty?.client_profiles?.company_name ||
                                claim.bounty?.client_profiles?.users.username}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              <span className="text-2xl font-bold">
                                {claim.bounty?.bounty_amount.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              <Badge
                                variant={
                                  claim.payment_status === "paid"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {claim.payment_status === "paid"
                                  ? "Payment Received"
                                  : "Payment Pending"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-muted-foreground">
                          {claim.bounty?.description}
                        </p>
                        {claim.pull_request_url && (
                          <div className="mt-2">
                            <a
                              href={claim.pull_request_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Code className="h-3 w-3" /> View PR
                            </a>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between border-t pt-4">
                        <div className="flex items-center">
                          <Badge variant="outline">
                            {claim.bounty?.category}
                          </Badge>
                          {claim.bounty?.tags &&
                            claim.bounty.tags.length > 0 && (
                              <Badge variant="outline" className="ml-2">
                                {claim.bounty.tags[0]}
                              </Badge>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Completed{" "}
                          {new Date(
                            claim.claimed_at || ""
                          ).toLocaleDateString()}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
