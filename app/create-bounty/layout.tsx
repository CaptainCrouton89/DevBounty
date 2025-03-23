"use client";

import { useAuth } from "@/lib/supabase/auth-context";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export default function CreateBountyLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, userWithProfile } = useAuth();

  // Redirect if not logged in or user is not a client
  if (!user) {
    redirect("/sign-in");
  }

  if (!userWithProfile?.clientProfile) {
    redirect("/create-client-profile");
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <main>{children}</main>
    </div>
  );
}
