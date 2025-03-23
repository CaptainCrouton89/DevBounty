"use client";

import AccountInfoSection from "@/components/profile/AccountInfoSection";
import PaymentInfoSection from "@/components/profile/PaymentInfoSection";
import PreferencesSection from "@/components/profile/PreferencesSection";
import ProfileSettingsSection from "@/components/profile/ProfileSettingsSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/db/supabase/client";
import { UserWithProfile } from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userWithProfile, setUserWithProfile] =
    useState<UserWithProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      try {
        setLoading(true);

        // Check authenticated user
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          throw error || new Error("User not found");
        }

        setUser(user);

        // Fetch user profile data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select(
            `
            id,
            full_name,
            created_at,
            updated_at,
            is_admin,
            preferences,
            developer_profiles (
              id,
              user_id,
              skills,
              payment_email,
              average_rating,
              rating_count,
              created_at,
              updated_at
            ),
            client_profiles (
              id,
              user_id,
              company_name,
              payment_email,
              average_rating,
              rating_count,
              created_at,
              updated_at
            )
          `
          )
          .eq("id", user.id)
          .single();

        if (userError) throw userError;

        // Transform data to match UserWithProfile type
        const userProfile: UserWithProfile = {
          id: userData.id,
          full_name: userData.full_name,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
          is_admin: userData.is_admin || null,
          preferences: userData.preferences,
          developerProfile: userData.developer_profiles || undefined,
          clientProfile: userData.client_profiles || undefined,
        };

        setUserWithProfile(userProfile);
      } catch (error) {
        console.error("Error loading user profile:", error);
        // Redirect to login if not authenticated
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !userWithProfile) {
    return (
      <div className="container max-w-4xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>
              You need to be logged in to view your profile.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4">
              <h2 className="text-xl font-semibold">Account Information</h2>
              <Separator />
              <AccountInfoSection
                user={user}
                userWithProfile={userWithProfile}
              />
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <h2 className="text-xl font-semibold">Payment Information</h2>
              <Separator />
              <PaymentInfoSection
                user={user}
                userWithProfile={userWithProfile}
              />
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              <Separator />
              <ProfileSettingsSection
                user={user}
                userWithProfile={userWithProfile}
              />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <h2 className="text-xl font-semibold">Preferences</h2>
              <Separator />
              <PreferencesSection
                user={user}
                userWithProfile={userWithProfile}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
