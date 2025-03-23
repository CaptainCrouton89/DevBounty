import { createClient } from "@/db/supabase/client";

// Users
export const getUserById = async (id: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const getUserWithProfileById = async (id: string) => {
  const supabase = createClient();
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (userError) throw userError;

  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("user_id", id)
    .single();

  const { data: developerProfile } = await supabase
    .from("developer_profiles")
    .select("*")
    .eq("user_id", id)
    .single();

  return {
    ...user,
    clientProfile,
    developerProfile,
  };
};

// Bounties
export const getAllBounties = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
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
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getBountyById = async (id: string) => {
  const supabase = createClient();
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
      ),
      comments:id (
        *,
        users:user_id (*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const createBounty = async (bounty: any) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bounties")
    .insert(bounty)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Comments
export const getCommentsByBountyId = async (bountyId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      users:user_id (*)
    `
    )
    .eq("bounty_id", bountyId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};

export const createComment = async (comment: any) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .insert(comment)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Claimed Bounties
export const claimBounty = async (claim: any) => {
  const supabase = createClient();
  // Start a transaction
  const { data: claimedBounty, error: claimError } = await supabase
    .from("claimed_bounties")
    .insert(claim)
    .select()
    .single();

  if (claimError) throw claimError;

  // Update bounty status
  const { error: updateError } = await supabase
    .from("bounties")
    .update({ status: "claimed" })
    .eq("id", claim.bounty_id);

  if (updateError) throw updateError;

  return claimedBounty;
};

// Client Profiles
export const createClientProfile = async (profile: any) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("client_profiles")
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Developer Profiles
export const createDeveloperProfile = async (profile: any) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("developer_profiles")
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Reviews
export const createReview = async (review: any) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Disputes
export const createDispute = async (dispute: any) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("disputes")
    .insert(dispute)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Define types for profile data
type DeveloperProfile = {
  id: string;
  skills: string[] | null;
  average_rating: number | null;
  rating_count: number | null;
  created_at: string | null;
};

type ClientProfile = {
  id: string;
  company_name: string | null;
  average_rating: number | null;
  rating_count: number | null;
  created_at: string | null;
};

type UserData = {
  id: string;
  username: string;
  created_at: string | null;
  developer_profiles: DeveloperProfile[] | null;
  client_profiles: ClientProfile[] | null;
};

type PublicProfile = {
  id: string;
  username: string;
  created_at: string | null;
  profileType: "developer" | "client" | null;
  profile: DeveloperProfile | ClientProfile | null;
};

export const getPublicUserProfile = async (
  username: string
): Promise<PublicProfile | null> => {
  const supabase = createClient();

  // Fetch user data with profiles
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select(
      `
      id,
      username,
      created_at,
      developer_profiles:developer_profiles (
        id,
        skills,
        average_rating,
        rating_count,
        created_at
      ),
      client_profiles:client_profiles (
        id,
        company_name,
        average_rating,
        rating_count,
        created_at
      )
    `
    )
    .eq("username", username)
    .single();

  if (userError) {
    console.error("Error fetching user profile:", userError);
    return null;
  }

  // Cast to our type
  const typedUserData = userData as unknown as UserData;

  // Transform the data for public consumption (removing sensitive info)
  const profileType =
    typedUserData.developer_profiles &&
    typedUserData.developer_profiles.length > 0
      ? "developer"
      : typedUserData.client_profiles &&
          typedUserData.client_profiles.length > 0
        ? "client"
        : null;

  let profileData: DeveloperProfile | ClientProfile | null = null;

  if (
    profileType === "developer" &&
    typedUserData.developer_profiles &&
    typedUserData.developer_profiles.length > 0
  ) {
    profileData = typedUserData.developer_profiles[0];
  } else if (
    profileType === "client" &&
    typedUserData.client_profiles &&
    typedUserData.client_profiles.length > 0
  ) {
    profileData = typedUserData.client_profiles[0];
  }

  return {
    id: typedUserData.id,
    username: typedUserData.username,
    created_at: typedUserData.created_at,
    profileType,
    profile: profileData,
  };
};

export const getCompletedBountiesCount = async (
  userId: string,
  profileType: "developer" | "client"
) => {
  const supabase = createClient();

  if (profileType === "developer") {
    // Get developer profile id
    const { data: devProfile, error: devError } = await supabase
      .from("developer_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (devError || !devProfile) return 0;

    // Count completed bounties for developer
    const { count, error } = await supabase
      .from("claimed_bounties")
      .select("*", { count: "exact", head: true })
      .eq("developer_id", devProfile.id)
      .eq("status", "approved");

    if (error) {
      console.error("Error counting completed bounties:", error);
      return 0;
    }

    return count || 0;
  } else if (profileType === "client") {
    // Get client profile id
    const { data: clientProfile, error: clientError } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (clientError || !clientProfile) return 0;

    // Count completed bounties for client
    const { count, error } = await supabase
      .from("bounties")
      .select("*", { count: "exact", head: true })
      .eq("client_id", clientProfile.id)
      .eq("status", "completed");

    if (error) {
      console.error("Error counting completed bounties:", error);
      return 0;
    }

    return count || 0;
  }

  return 0;
};

export const getUserReviews = async (
  userId: string,
  profileType: "developer" | "client"
) => {
  const supabase = createClient();

  // Fetch reviews where this user is the reviewee
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      reviewer_id,
      bounty_id,
      users!reviewer_id (
        id,
        username
      )
    `
    )
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  return reviews || [];
};
