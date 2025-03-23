"use client";

import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/db/supabase/check-env-vars";
import { createClient } from "@/db/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggleWrapper } from "./theme-toggle-wrapper";
import { Button } from "./ui/button";

export default function AuthButton() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();
  }, [supabase]);

  if (!hasEnvVars) {
    return (
      <>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <ThemeToggleWrapper />
            <Button
              asChild
              size="sm"
              variant={"outline"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={"default"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }
  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <ThemeToggleWrapper />
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2 items-center">
      <ThemeToggleWrapper />
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/register">Sign up</Link>
      </Button>
    </div>
  );
}
