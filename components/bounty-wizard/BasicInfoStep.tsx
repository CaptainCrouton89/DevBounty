"use client";

import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BountyFormData } from "../BountyCreationWizard";

// Categories for the bounty
const CATEGORIES = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "mobile", label: "Mobile" },
  { value: "bug", label: "Bug Fixes" },
  { value: "security", label: "Security" },
  { value: "database", label: "Database" },
  { value: "testing", label: "Testing" },
  { value: "devops", label: "DevOps" },
];

// Validation schema for basic info step
const basicInfoSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  bountyAmount: z
    .number()
    .min(5, "Minimum bounty amount is $5")
    .max(100000, "Maximum bounty amount is $100,000"),
  category: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()),
});

interface BasicInfoStepProps {
  formData: BountyFormData;
  updateFormData: (data: Partial<BountyFormData>) => void;
  updateStepValidation: (isValid: boolean) => void;
}

export default function BasicInfoStep({
  formData,
  updateFormData,
  updateStepValidation,
}: BasicInfoStepProps) {
  // Create form
  const form = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: formData.title,
      description: formData.description,
      bountyAmount: formData.bountyAmount,
      category: formData.category,
      tags: formData.tags,
    },
  });

  // Watch form values to update validation state
  const { formState } = form;

  // Update parent form when values change
  const onValuesChange = (values: Partial<z.infer<typeof basicInfoSchema>>) => {
    updateFormData(values);
  };

  // Update step validation when form validity changes
  useEffect(() => {
    updateStepValidation(
      formState.isValid &&
        !formState.errors.title &&
        !formState.errors.description &&
        !formState.errors.bountyAmount &&
        !formState.errors.category
    );
  }, [formState, updateStepValidation]);

  // Handle tag input (comma-separated)
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Split by commas, trim whitespace, and filter out empty strings
    const tags = inputValue
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    form.setValue("tags", tags);
    updateFormData({ tags });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
        <p className="text-muted-foreground">
          Provide essential details about your bounty to attract developers.
        </p>
      </div>

      <Form {...form}>
        <form
          onChange={form.handleSubmit(
            (values) => onValuesChange(values),
            (errors) => console.log(errors)
          )}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bounty Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="E.g., Fix login authentication bug"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide a detailed description of the bounty"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bountyAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bounty Amount ($USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="50"
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                      value={field.value.toString()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormItem>
            <FormLabel>Tags (comma-separated)</FormLabel>
            <FormControl>
              <Input
                placeholder="react, typescript, bugfix"
                value={formData.tags.join(", ")}
                onChange={handleTagsChange}
              />
            </FormControl>
          </FormItem>
        </form>
      </Form>
    </div>
  );
}
