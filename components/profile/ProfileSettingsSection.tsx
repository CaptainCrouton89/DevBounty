"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/db/supabase/client";
import { UserWithProfile } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@supabase/supabase-js";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Developer skills options
const DEVELOPER_SKILLS = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "react", label: "React" },
  { value: "next", label: "Next.js" },
  { value: "node", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "django", label: "Django" },
  { value: "ruby", label: "Ruby" },
  { value: "rails", label: "Ruby on Rails" },
  { value: "php", label: "PHP" },
  { value: "laravel", label: "Laravel" },
  { value: "java", label: "Java" },
  { value: "spring", label: "Spring" },
  { value: "csharp", label: "C#" },
  { value: "dotnet", label: ".NET" },
  { value: "go", label: "Go" },
  { value: "aws", label: "AWS" },
  { value: "azure", label: "Azure" },
  { value: "gcp", label: "Google Cloud" },
  { value: "docker", label: "Docker" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "devops", label: "DevOps" },
  { value: "flutter", label: "Flutter" },
  { value: "mobile", label: "Mobile Development" },
  { value: "android", label: "Android" },
  { value: "ios", label: "iOS" },
  { value: "swift", label: "Swift" },
  { value: "react-native", label: "React Native" },
];

// Form validation schema for developer profile
const developerProfileSchema = z.object({
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  experienceLevel: z.string().min(1, "Experience level is required"),
});

// Form validation schema for client profile
const clientProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyWebsite: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().length(0)),
});

interface ProfileSettingsSectionProps {
  user: User;
  userWithProfile: UserWithProfile | null;
}

export default function ProfileSettingsSection({
  user,
  userWithProfile,
}: ProfileSettingsSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [profileType, setProfileType] = useState<"developer" | "client" | null>(
    null
  );

  // Determine profile type based on user data
  useEffect(() => {
    if (userWithProfile?.developerProfile) {
      setProfileType("developer");
      // Initialize skills array from profile
      if (userWithProfile.developerProfile.skills) {
        setSelectedSkills(
          Array.isArray(userWithProfile.developerProfile.skills)
            ? userWithProfile.developerProfile.skills
            : []
        );
      }
    } else if (userWithProfile?.clientProfile) {
      setProfileType("client");
    }
  }, [userWithProfile]);

  // Create form for developer profile
  const developerForm = useForm<z.infer<typeof developerProfileSchema>>({
    resolver: zodResolver(developerProfileSchema),
    defaultValues: {
      skills: userWithProfile?.developerProfile?.skills || [],
      experienceLevel: "intermediate", // Default value since it's not in the current database
    },
  });

  // Create form for client profile
  const clientForm = useForm<z.infer<typeof clientProfileSchema>>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: {
      companyName: userWithProfile?.clientProfile?.company_name || "",
      companyWebsite: "", // Not in current database schema
    },
  });

  // Handle skill selection
  const handleSkillSelection = (skill: string) => {
    let updatedSkills: string[];

    if (selectedSkills.includes(skill)) {
      updatedSkills = selectedSkills.filter((s) => s !== skill);
    } else {
      updatedSkills = [...selectedSkills, skill];
    }

    setSelectedSkills(updatedSkills);
    developerForm.setValue("skills", updatedSkills);
  };

  // Save developer profile settings
  const onSaveDeveloperProfile = async (
    values: z.infer<typeof developerProfileSchema>
  ) => {
    if (!userWithProfile?.developerProfile) return;

    try {
      setIsLoading(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("developer_profiles")
        .update({
          skills: values.skills,
          // Store the experience level in the user preferences table for now
          // This would need to be migrated to the developer_profiles table in the future
        })
        .eq("id", userWithProfile.developerProfile.id);

      if (error) throw error;

      // Update user preferences to store experience level for now
      const { error: prefError } = await supabase
        .from("users")
        .update({
          preferences: {
            ...(typeof userWithProfile.preferences === "object"
              ? userWithProfile.preferences
              : {}),
            experienceLevel: values.experienceLevel,
          },
        })
        .eq("id", user.id);

      if (prefError) throw prefError;

      toast.success("Developer profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating developer profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Save client profile settings
  const onSaveClientProfile = async (
    values: z.infer<typeof clientProfileSchema>
  ) => {
    if (!userWithProfile?.clientProfile) return;

    try {
      setIsLoading(true);
      const supabase = createClient();

      const { error } = await supabase
        .from("client_profiles")
        .update({
          company_name: values.companyName,
          // Store website in user preferences for now
        })
        .eq("id", userWithProfile.clientProfile.id);

      if (error) throw error;

      // Update user preferences to store website for now
      if (values.companyWebsite) {
        const { error: prefError } = await supabase
          .from("users")
          .update({
            preferences: {
              ...(typeof userWithProfile.preferences === "object"
                ? userWithProfile.preferences
                : {}),
              companyWebsite: values.companyWebsite,
            },
          })
          .eq("id", user.id);

        if (prefError) throw prefError;
      }

      toast.success("Client profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating client profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile type switch (if user doesn't have one)
  if (!profileType) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Profile Required</AlertTitle>
        <AlertDescription>
          You need to create a developer or client profile first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {profileType === "developer" && (
        <Form {...developerForm}>
          <form
            onSubmit={developerForm.handleSubmit(onSaveDeveloperProfile)}
            className="space-y-4"
          >
            <FormField
              control={developerForm.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">
                        Beginner (0-2 years)
                      </SelectItem>
                      <SelectItem value="intermediate">
                        Intermediate (2-5 years)
                      </SelectItem>
                      <SelectItem value="advanced">
                        Advanced (5-8 years)
                      </SelectItem>
                      <SelectItem value="expert">Expert (8+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This helps clients understand your expertise level
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={developerForm.control}
              name="skills"
              render={() => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <FormDescription>
                    Select the skills you have expertise in
                  </FormDescription>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {DEVELOPER_SKILLS.map((skill) => (
                      <Badge
                        key={skill.value}
                        variant={
                          selectedSkills.includes(skill.value)
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => handleSkillSelection(skill.value)}
                      >
                        {skill.label}
                      </Badge>
                    ))}
                  </div>

                  {developerForm.formState.errors.skills?.message && (
                    <p className="text-sm font-medium text-destructive mt-2">
                      {developerForm.formState.errors.skills?.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Developer Profile"}
            </Button>
          </form>
        </Form>
      )}

      {profileType === "client" && (
        <Form {...clientForm}>
          <form
            onSubmit={clientForm.handleSubmit(onSaveClientProfile)}
            className="space-y-4"
          >
            <FormField
              control={clientForm.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Your company or organization name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={clientForm.control}
              name="companyWebsite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Website</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Your company's website
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Client Profile"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
