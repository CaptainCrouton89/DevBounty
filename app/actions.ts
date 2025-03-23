"use server";

import { createClient } from "@/db/supabase/server";
import { encodedRedirect } from "@/lib/utils/utils";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("fullName")?.toString();
  const isClient = formData.get("isClient")?.toString() === "true";
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/register",
      "Email and password are required"
    );
  }

  console.log("email", email);
  console.log("password", password);
  console.log("fullName", fullName);
  console.log("isClient", isClient);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/register", error.message);
  }

  if (!data.user) {
    return encodedRedirect("error", "/register", "Something went wrong");
  }

  const { error: insertError } = await supabase.from("users").insert({
    id: data.user.id,
    full_name: fullName!,
    is_client: isClient,
  });

  if (isClient) {
    const { error: insertClientError } = await supabase
      .from("client_profiles")
      .insert({
        user_id: data.user.id,
        payment_email: email,
        average_rating: 0,
        rating_count: 0,
      });

    if (insertClientError) {
      console.error(insertClientError.code + " " + insertClientError.message);
      return encodedRedirect("error", "/register", insertClientError.message);
    }
  } else {
    const { error: insertUserError } = await supabase
      .from("developer_profiles")
      .insert({
        user_id: data.user.id,
        payment_email: email,
        average_rating: 0,
        rating_count: 0,
      });

    if (insertUserError) {
      console.error(insertUserError.code + " " + insertUserError.message);
      return encodedRedirect("error", "/register", insertUserError.message);
    }
  }

  if (insertError) {
    console.error(insertError.code + " " + insertError.message);
    return encodedRedirect("error", "/register", insertError.message);
  } else {
    revalidatePath("/", "layout");

    return encodedRedirect(
      "success",
      "/login",
      "Thanks for signing up! Please check your email for a verification link."
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/login", error.message);
  }

  revalidatePath("/", "layout");
  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed"
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
