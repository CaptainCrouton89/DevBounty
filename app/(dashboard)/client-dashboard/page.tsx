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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/db/supabase/client";
import { useAuth } from "@/lib/supabase/auth-context";
import { ClientProfile } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { PlusCircle, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Define a simplified bounty type for the dashboard to avoid type issues
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
  claimed_bounties?: {
    delivery_deadline: string;
    [key: string]: any;
  }[];
}

export default function ClientDashboard() {
  const { user, userWithProfile } = useAuth();
  const [activeBounties, setActiveBounties] = useState<DashboardBounty[]>([]);
  const [pastBounties, setPastBounties] = useState<DashboardBounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(
    null
  );
  const supabase = createClient();

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user || !userWithProfile?.clientProfile?.id) {
        return;
      }

      setLoading(true);
      try {
        const clientId = userWithProfile.clientProfile.id;

        // Fetch client profile
        const { data: profileData, error: profileError } = await supabase
          .from("client_profiles")
          .select("*")
          .eq("id", clientId)
          .single();

        if (profileError) {
          console.error("Error fetching client profile:", profileError);
        } else {
          setClientProfile(profileData);
        }

        // Fetch bounties for this client
        const { data, error } = await supabase
          .from("bounties")
          .select(
            `
            *,
            client_profiles:client_id (
              *,
              users:user_id (*)
            ),
            claimed_bounties:id (
              *,
              developer_profiles:developer_id (
                *,
                users:user_id (*)
              )
            )
          `
          )
          .eq("client_id", clientId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching bounties:", error);
        } else if (data) {
          // Maps API data to our simplified DashboardBounty type
          const simplifyBounties = (bounties: any[]): DashboardBounty[] => {
            return bounties.map((b) => ({
              id: b.id,
              title: b.title,
              description: b.description,
              bounty_amount: b.bounty_amount,
              status: b.status,
              category: b.category,
              tags: b.tags,
              created_at: b.created_at,
              expires_at: b.expires_at,
              claimed_bounties: b.claimed_bounties,
            }));
          };

          // Split bounties into active and past
          const active = simplifyBounties(
            data.filter((bounty) => ["open", "claimed"].includes(bounty.status))
          );

          const past = simplifyBounties(
            data.filter((bounty) =>
              ["completed", "expired"].includes(bounty.status)
            )
          );

          setActiveBounties(active);
          setPastBounties(past);
        }
      } catch (error) {
        console.error("Error in data fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [user, userWithProfile]);

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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeRemaining = (bounty: DashboardBounty) => {
    if (
      bounty.status === "claimed" &&
      bounty.claimed_bounties &&
      bounty.claimed_bounties.length > 0
    ) {
      const claimedBounty = bounty.claimed_bounties[0];
      return formatDistanceToNow(new Date(claimedBounty.delivery_deadline), {
        addSuffix: true,
      });
    }

    if (bounty.status === "open") {
      return formatDistanceToNow(new Date(bounty.expires_at), {
        addSuffix: true,
      });
    }

    return null;
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

  if (!userWithProfile?.clientProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Client Profile Required</h1>
          <p className="mb-4">
            You need to create a client profile to access the client dashboard
          </p>
          <Link href="/create-client-profile">
            <Button>Create Client Profile</Button>
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
                  Company
                </h3>
                <p>{clientProfile?.company_name || "Not specified"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Rating
                </h3>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span>
                    {clientProfile?.average_rating?.toFixed(1) || "N/A"}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({clientProfile?.rating_count || 0} reviews)
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Active Bounties:</span>
                    <span className="font-medium">{activeBounties.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Bounties:</span>
                    <span className="font-medium">
                      {
                        pastBounties.filter((b) => b.status === "completed")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/disputed-bounties">
                <Button variant="outline" className="w-full">
                  View Disputed Bounties
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Your Bounties</h1>
            <Link href="/create-bounty">
              <Button size="lg" className="gap-2">
                <PlusCircle className="h-5 w-5" />
                Post New Bounty
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active" className="flex-1">
                Active Bounties{" "}
                <Badge variant="secondary" className="ml-2">
                  {activeBounties.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex-1">
                Past Bounties{" "}
                <Badge variant="secondary" className="ml-2">
                  {pastBounties.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading bounties...</div>
              ) : activeBounties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You don't have any active bounties yet
                  </p>
                  <Link href="/create-bounty">
                    <Button>Post Your First Bounty</Button>
                  </Link>
                </div>
              ) : (
                activeBounties.map((bounty) => (
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
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              ${bounty.bounty_amount.toLocaleString()}
                            </div>
                            {getTimeRemaining(bounty) && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {getTimeRemaining(bounty)}
                              </div>
                            )}
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

            <TabsContent value="past" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading bounties...</div>
              ) : pastBounties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No past bounties found
                  </p>
                </div>
              ) : (
                pastBounties.map((bounty) => (
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
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              ${bounty.bounty_amount.toLocaleString()}
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
          </Tabs>
        </div>
      </div>
    </div>
  );
}
