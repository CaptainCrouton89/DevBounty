"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/db/supabase/client";
import { UserWithProfile } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@supabase/supabase-js";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// User preferences type
interface UserPreferences {
  darkMode?: boolean;
  emailNotifications?: boolean;
  [key: string]: any;
}

// Form validation schema for preferences
const preferencesSchema = z.object({
  darkMode: z.boolean().default(false),
  emailNotifications: z.boolean().default(true),
});

interface PreferencesSectionProps {
  user: User;
  userWithProfile: UserWithProfile | null;
}

export default function PreferencesSection({
  user,
  userWithProfile,
}: PreferencesSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { setTheme, theme } = useTheme();

  // Get current preferences
  const getUserPreferences = (): UserPreferences => {
    if (
      userWithProfile?.preferences &&
      typeof userWithProfile.preferences === "object"
    ) {
      return userWithProfile.preferences as UserPreferences;
    }
    return {};
  };

  // Create form for preferences
  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      darkMode: theme === "dark",
      emailNotifications: getUserPreferences().emailNotifications ?? true,
    },
  });

  // Watch dark mode to update theme
  const darkMode = form.watch("darkMode");

  useEffect(() => {
    setTheme(darkMode ? "dark" : "light");
  }, [darkMode, setTheme]);

  // Save preferences
  const onSubmit = async (values: z.infer<typeof preferencesSchema>) => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      // Get current preferences
      const currentPreferences = getUserPreferences();

      // Update user preferences
      const { error } = await supabase
        .from("users")
        .update({
          preferences: {
            ...currentPreferences,
            darkMode: values.darkMode,
            emailNotifications: values.emailNotifications,
          },
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Preferences updated successfully!");
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast.error(error.message || "Failed to update preferences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="darkMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Dark Mode</FormLabel>
                  <FormDescription>
                    Enable dark mode for the application.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emailNotifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Email Notifications
                  </FormLabel>
                  <FormDescription>
                    Receive email notifications for bounty updates, messages,
                    and more.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
