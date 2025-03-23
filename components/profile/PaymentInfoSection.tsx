"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { createClient } from "@/db/supabase/client";
import { UserWithProfile } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@supabase/supabase-js";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Form validation schema
const formSchema = z.object({
  paymentEmail: z.string().email("Must be a valid email address"),
});

interface PaymentInfoSectionProps {
  user: User;
  userWithProfile: UserWithProfile | null;
}

export default function PaymentInfoSection({
  user,
  userWithProfile,
}: PaymentInfoSectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Determine if user has a developer or client profile
  const profileType = userWithProfile?.developerProfile
    ? "developer"
    : userWithProfile?.clientProfile
      ? "client"
      : null;

  // Get the payment email based on profile type
  const getPaymentEmail = () => {
    if (!userWithProfile) return "";

    if (userWithProfile.developerProfile) {
      return userWithProfile.developerProfile.payment_email || "";
    }

    if (userWithProfile.clientProfile) {
      return userWithProfile.clientProfile.payment_email || "";
    }

    return "";
  };

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentEmail: getPaymentEmail(),
    },
  });

  // Save payment information
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userWithProfile || !profileType) return;

    try {
      setIsLoading(true);
      const supabase = createClient();

      if (profileType === "developer" && userWithProfile.developerProfile) {
        // Update developer payment info
        const { error } = await supabase
          .from("developer_profiles")
          .update({
            payment_email: values.paymentEmail,
          })
          .eq("id", userWithProfile.developerProfile.id);

        if (error) throw error;
      } else if (profileType === "client" && userWithProfile.clientProfile) {
        // Update client payment info
        const { error } = await supabase
          .from("client_profiles")
          .update({
            payment_email: values.paymentEmail,
          })
          .eq("id", userWithProfile.clientProfile.id);

        if (error) throw error;
      }

      toast.success("Payment information updated successfully!");
    } catch (error: any) {
      console.error("Error updating payment information:", error);
      toast.error(error.message || "Failed to update payment information");
    } finally {
      setIsLoading(false);
    }
  };

  // If user doesn't have a profile yet
  if (!profileType) {
    return (
      <Alert variant="destructive">
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
      <div className="pb-4">
        <h3 className="text-lg font-medium mb-2">Payment Information</h3>
        <p className="text-sm text-muted-foreground">
          DevBounty uses Zelle for payment processing. Please provide the email
          address associated with your Zelle account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="paymentEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zelle Email</FormLabel>
                <FormControl>
                  <Input placeholder="your-email@example.com" {...field} />
                </FormControl>
                <FormDescription>
                  This email will be used for receiving payments via Zelle
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Payment Information"}
          </Button>
        </form>
      </Form>

      <Alert className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment Information</AlertTitle>
        <AlertDescription>
          {profileType === "developer"
            ? "As a developer, you'll receive payments through Zelle when clients approve your completed bounties."
            : "As a client, your payment email is used to verify your identity when processing bounty payments."}
        </AlertDescription>
      </Alert>
    </div>
  );
}
