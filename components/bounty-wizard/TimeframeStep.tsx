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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { HelpCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BountyFormData } from "../BountyCreationWizard";

// Dibs durations options
const DIBS_DURATIONS = [
  { value: "3", label: "3 days" },
  { value: "5", label: "5 days" },
  { value: "7", label: "7 days (recommended)" },
  { value: "10", label: "10 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
];

// Validation schema for timeframe step
const timeframeSchema = z.object({
  dibsDuration: z
    .number()
    .min(1, "Dibs duration is required")
    .max(30, "Maximum dibs duration is 30 days"),
  expiresAt: z.date().min(new Date(), "Expiration date must be in the future"),
});

interface TimeframeStepProps {
  formData: BountyFormData;
  updateFormData: (data: Partial<BountyFormData>) => void;
  updateStepValidation: (isValid: boolean) => void;
}

export default function TimeframeStep({
  formData,
  updateFormData,
  updateStepValidation,
}: TimeframeStepProps) {
  // Create form
  const form = useForm<z.infer<typeof timeframeSchema>>({
    resolver: zodResolver(timeframeSchema),
    defaultValues: {
      dibsDuration: formData.dibsDuration,
      expiresAt: formData.expiresAt,
    },
  });

  // Watch form values to update validation state
  const { formState } = form;

  // Update parent form when values change
  const onValuesChange = (values: Partial<z.infer<typeof timeframeSchema>>) => {
    updateFormData(values);
  };

  // Update step validation when form validity changes
  useEffect(() => {
    updateStepValidation(
      formState.isValid &&
        !formState.errors.dibsDuration &&
        !formState.errors.expiresAt
    );
  }, [formState, updateStepValidation]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Timeframes</h2>
        <p className="text-muted-foreground">
          Set timeframes for developers to claim and complete your bounty.
        </p>
      </div>

      <Form {...form}>
        <form
          onChange={form.handleSubmit((values) => onValuesChange(values))}
          className="space-y-6"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium">Dibs Duration</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full"
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span className="sr-only">Dibs Duration Info</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Dibs duration is the time a developer has to work on and
                      complete the bounty after claiming it.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              This determines how long developers have to complete the bounty
              after claiming it.
            </p>
          </div>

          <FormField
            control={form.control}
            name="dibsDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dibs Duration</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dibs duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIBS_DURATIONS.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Recommended: 7 days gives developers sufficient time to work
                  on most tasks.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-1">
            <h3 className="text-base font-medium">Bounty Expiration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              When your bounty will expire if not claimed by any developer.
            </p>
          </div>

          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiration Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      field.onChange(date);
                    }}
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </FormControl>
                <FormDescription>
                  The bounty will be listed as expired after this date if not
                  claimed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-muted/50 p-4 rounded-md mt-6">
            <h3 className="text-sm font-medium mb-2">Timeline Summary</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Bounty Created:</span>
                <span>{format(new Date(), "PPP")}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">
                  Expires If Not Claimed:
                </span>
                <span>{format(form.watch("expiresAt"), "PPP")}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">
                  Developer Work Period:
                </span>
                <span>{form.watch("dibsDuration")} days after claiming</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">
                  If Claimed Today, Due By:
                </span>
                <span>
                  {format(
                    addDays(new Date(), form.watch("dibsDuration")),
                    "PPP"
                  )}
                </span>
              </li>
            </ul>
          </div>
        </form>
      </Form>
    </div>
  );
}
