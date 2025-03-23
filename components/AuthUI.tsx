"use client";

import {
  forgotPasswordAction,
  signInAction,
  signUpAction,
} from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type AuthView =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "email-verification";

interface AuthUIProps {
  defaultView?: AuthView;
  message?: Message;
  resetPasswordToken?: string;
}

export function AuthUI({
  defaultView = "login",
  message,
  resetPasswordToken,
}: AuthUIProps) {
  const [view, setView] = useState<AuthView>(defaultView);

  const renderView = () => {
    switch (view) {
      case "login":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>
                Enter your email and password to sign in to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" action={signInAction}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setView("forgot-password")}
                      className="text-xs text-primary underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {message && <FormMessage message={message} />}
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("register")}
                  className="text-primary font-medium underline"
                >
                  Sign up
                </button>
              </div>
            </CardFooter>
          </Card>
        );

      case "register":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>
                Register to access the DevBounty platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" action={signUpAction}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
                {message && <FormMessage message={message} />}
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-primary font-medium underline"
                >
                  Sign in
                </button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </CardFooter>
          </Card>
        );

      case "forgot-password":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center">
                <button
                  className="mr-2 p-1 rounded-full hover:bg-muted"
                  onClick={() => setView("login")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <CardTitle className="text-2xl">Forgot Password</CardTitle>
                  <CardDescription>
                    Enter your email to reset your password
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" action={forgotPasswordAction}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                {message && <FormMessage message={message} />}
                <Button type="submit" className="w-full">
                  Send Reset Link
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case "reset-password":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>Enter your new password</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" action={"/api/auth/reset-password"}>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                </div>
                {message && <FormMessage message={message} />}
                <Button type="submit" className="w-full">
                  Reset Password
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case "email-verification":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Verify Your Email</CardTitle>
              <CardDescription>
                Check your email for a verification link
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">
                We&apos;ve sent a verification link to your email address.
                Please check your inbox and click the link to verify your
                account.
              </p>
              <p className="text-sm text-muted-foreground">
                If you don&apos;t see the email, check your spam folder or{" "}
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-primary font-medium underline"
                >
                  try signing in again
                </button>
              </p>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="text-center p-6">
              <p>Something went wrong. Please try again.</p>
              <Button className="mt-4" onClick={() => setView("login")}>
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="w-full py-8 px-4 flex justify-center items-center min-h-[calc(100vh-80px)]">
      {renderView()}
    </div>
  );
}
