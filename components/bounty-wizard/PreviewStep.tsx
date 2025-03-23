"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  FileCode,
} from "lucide-react";
import { BountyFormData } from "../BountyCreationWizard";

interface PreviewStepProps {
  formData: BountyFormData;
}

export default function PreviewStep({ formData }: PreviewStepProps) {
  // Format dates for display
  const expirationDate = format(formData.expiresAt, "PPP");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Preview Your Bounty</h2>
        <p className="text-muted-foreground">
          Review your bounty details before submitting.
        </p>
      </div>

      {/* Basic Info Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                {formData.title || "Untitled Bounty"}
              </CardTitle>
              <CardDescription>
                {formData.category && (
                  <Badge variant="outline" className="mt-2">
                    {formData.category}
                  </Badge>
                )}
                {formData.tags.length > 0 &&
                  formData.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="ml-2 mt-2">
                      {tag}
                    </Badge>
                  ))}
              </CardDescription>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">
                ${formData.bountyAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Description
              </h3>
              <p className="mt-1 whitespace-pre-line">
                {formData.description || "No description provided."}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                GitHub Repository
              </h3>
              <p className="mt-1 flex items-center">
                <FileCode className="h-4 w-4 mr-2" />
                <a
                  href={formData.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {formData.githubRepo || "No repository specified."}
                </a>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Timeframe
                </h3>
                <div className="mt-1 space-y-2">
                  <p className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Expires: {expirationDate}
                  </p>
                  <p className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Dibs Duration: {formData.dibsDuration} days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements ({formData.requirements.length})</CardTitle>
          <CardDescription>
            These requirements will be used to evaluate the bounty completion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.requirements.length === 0 ? (
            <p className="text-muted-foreground">No requirements specified.</p>
          ) : (
            <div className="space-y-4">
              {formData.requirements.map((req, i) => (
                <div key={i} className="border rounded-md p-4">
                  <h3 className="font-medium flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    {req.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {req.description}
                  </p>
                  <p className="text-sm mt-2">{req.details}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Confirmation */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 bg-primary rounded-full p-1 text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-medium">Ready to Submit</h3>
              <p className="text-sm text-muted-foreground mt-1">
                By submitting this bounty, you agree to pay the specified amount
                to the developer who successfully completes all requirements to
                your satisfaction.
              </p>
              <div className="flex mt-4">
                <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click the Submit Bounty button below to create your bounty.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
