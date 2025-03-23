"use client";

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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { GitBranch, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BountyFormData } from "../BountyCreationWizard";

// Validation schema for GitHub integration step
const githubSchema = z.object({
  githubRepo: z
    .string()
    .min(1, "Repository URL is required")
    .refine(
      (url) => /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/.test(url),
      "Must be a valid GitHub repository URL (e.g., https://github.com/username/repository)"
    ),
});

interface GitHubIntegrationStepProps {
  formData: BountyFormData;
  updateFormData: (data: Partial<BountyFormData>) => void;
  updateStepValidation: (isValid: boolean) => void;
}

export default function GitHubIntegrationStep({
  formData,
  updateFormData,
  updateStepValidation,
}: GitHubIntegrationStepProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [repoInfo, setRepoInfo] = useState<{
    name: string;
    description: string;
    exists: boolean;
  } | null>(null);

  // Create form
  const form = useForm<z.infer<typeof githubSchema>>({
    resolver: zodResolver(githubSchema),
    defaultValues: {
      githubRepo: formData.githubRepo,
    },
  });

  // Watch form values to update validation state
  const { formState } = form;
  const githubRepo = form.watch("githubRepo");

  // Update parent form when values change
  const onValuesChange = (values: Partial<z.infer<typeof githubSchema>>) => {
    updateFormData(values);
  };

  // Update step validation when form validity changes
  useEffect(() => {
    updateStepValidation(formState.isValid && !formState.errors.githubRepo);
  }, [formState, updateStepValidation]);

  // Validate GitHub repository
  const validateRepo = async () => {
    try {
      setIsValidating(true);
      setRepoInfo(null);

      if (!githubRepo) return;

      // Extract username and repo from URL
      const match = githubRepo.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) return;

      const [, username, repo] = match;

      // We would ideally validate against the GitHub API here
      // But for now, we'll just simulate a validation
      // In a real app, you'd do something like:
      // const response = await fetch(`https://api.github.com/repos/${username}/${repo}`);

      // Simulate API call with 1 second delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate a valid repository
      setRepoInfo({
        name: repo,
        description: `Repository for ${repo}`,
        exists: true,
      });
    } catch (error) {
      console.error("Error validating repository:", error);
      setRepoInfo({
        name: "",
        description: "",
        exists: false,
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">GitHub Integration</h2>
        <p className="text-muted-foreground">
          Connect your bounty to a GitHub repository to provide context and
          codebase access.
        </p>
      </div>

      <Form {...form}>
        <form
          onChange={form.handleSubmit((values) => onValuesChange(values))}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="githubRepo"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Repository URL</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full"
                        >
                          <Info className="h-3 w-3" />
                          <span className="sr-only">Repository URL info</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Enter the URL of the GitHub repository that developers
                          will work on. This should be in the format:
                          https://github.com/username/repository
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="https://github.com/username/repository"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={validateRepo}
                    disabled={isValidating || !githubRepo}
                  >
                    {isValidating ? "Validating..." : "Validate"}
                  </Button>
                </div>
                <FormDescription>
                  Provide the full URL to the GitHub repository that contains
                  the codebase for this bounty.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {repoInfo && (
            <div
              className={`p-4 rounded-md border ${repoInfo.exists ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              {repoInfo.exists ? (
                <div className="flex items-start gap-2">
                  <GitBranch className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-green-800">
                      Repository Validated Successfully
                    </h3>
                    <p className="text-sm text-green-700">
                      {repoInfo.name}: {repoInfo.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-red-700">
                  <h3 className="font-medium">Repository Not Found</h3>
                  <p className="text-sm">
                    Please check the URL and make sure the repository exists and
                    is public.
                  </p>
                </div>
              )}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
