"use client";

import { createClient } from "@/db/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { UserWithProfile } from "../types";

type AuthContextType = {
  user: User | null;
  userWithProfile: UserWithProfile | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    isClient: boolean
  ) => Promise<any>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isClient: boolean;
  isDeveloper: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [userWithProfile, setUserWithProfile] =
    useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const setData = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      console.log("session", session);
      if (error) {
        console.error(error);
      }
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          // Get user profile data
          const { data: clientProfile } = await supabase
            .from("client_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          const { data: developerProfile } = await supabase
            .from("developer_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          // Get user basic data
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (userData) {
            setUserWithProfile({
              ...userData,
              clientProfile: clientProfile || undefined,
              developerProfile: developerProfile || undefined,
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
      setIsLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    setData();

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    isClient: boolean
  ) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create user record
      if (authData.user) {
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          full_name: fullName,
          is_client: isClient,
          email: email,
          is_admin: false,
        });

        if (userError) throw userError;
      }

      return authData;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setUserWithProfile(null);
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper getters
  const isClient = !!userWithProfile?.clientProfile;
  const isDeveloper = !!userWithProfile?.developerProfile;

  return (
    <AuthContext.Provider
      value={{
        user,
        userWithProfile,
        session,
        signIn,
        signUp,
        signOut,
        isLoading,
        isClient,
        isDeveloper,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
