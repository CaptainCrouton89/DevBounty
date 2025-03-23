"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// Import step components
import BasicInfoStep from "./bounty-wizard/BasicInfoStep";
import GitHubIntegrationStep from "./bounty-wizard/GitHubIntegrationStep";
import PreviewStep from "./bounty-wizard/PreviewStep";
import RequirementsStep from "./bounty-wizard/RequirementsStep";
import TimeframeStep from "./bounty-wizard/TimeframeStep";

// Define the bounty form type
export interface BountyFormData {
  // Basic Info
  title: string;
  description: string;
  bountyAmount: number;
  category: string;
  tags: string[];

  // GitHub Integration
  githubRepo: string;

  // Requirements
  requirements: Array<{
    title: string;
    description: string;
    details: string;
  }>;

  // Timeframe
  dibsDuration: number; // in days
  expiresAt: Date;
}

// Define steps
const STEPS = [
  { id: "basic-info", label: "Basic Info" },
  { id: "github", label: "GitHub Integration" },
  { id: "requirements", label: "Requirements" },
  { id: "timeframe", label: "Timeframe" },
  { id: "preview", label: "Preview & Submit" },
];

export default function BountyCreationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(20);

  // Initialize form data with defaults
  const [formData, setFormData] = useState<BountyFormData>({
    title: "",
    description: "",
    bountyAmount: 0,
    category: "",
    tags: [],
    githubRepo: "",
    requirements: [],
    dibsDuration: 7, // Default 7 days
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days from now
  });

  // Step validation states
  const [stepValidation, setStepValidation] = useState({
    0: false, // Basic Info
    1: false, // GitHub
    2: false, // Requirements
    3: false, // Timeframe
  });

  // Update form data
  const updateFormData = (data: Partial<BountyFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Update step validation
  const updateStepValidation = (step: number, isValid: boolean) => {
    setStepValidation((prev) => ({ ...prev, [step]: isValid }));
  };

  // Handle next step
  const goToNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setProgress((prev) => Math.min(100, prev + 20));
    }
  };

  // Handle previous step
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setProgress((prev) => Math.max(20, prev - 20));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Format data for API
      const bountyData = {
        title: formData.title,
        description: formData.description,
        bounty_amount: formData.bountyAmount,
        github_repo: formData.githubRepo,
        category: formData.category,
        tags: formData.tags,
        requirements: formData.requirements,
        dibs_duration: `${formData.dibsDuration} days`,
        expires_at: formData.expiresAt.toISOString(),
      };

      // Submit to API
      const response = await fetch("/api/bounties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bountyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create bounty");
      }

      const data = await response.json();

      toast.success("Bounty created successfully!");

      // Redirect to the bounty page
      router.push(`/bounties/${data.id}`);
    } catch (error) {
      console.error("Error creating bounty:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create bounty"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if the current step is valid and next button should be enabled
  const isNextEnabled = () => {
    if (currentStep === STEPS.length - 1) return true; // Preview step
    return stepValidation[currentStep as keyof typeof stepValidation];
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            formData={formData}
            updateFormData={updateFormData}
            updateStepValidation={(isValid) => updateStepValidation(0, isValid)}
          />
        );
      case 1:
        return (
          <GitHubIntegrationStep
            formData={formData}
            updateFormData={updateFormData}
            updateStepValidation={(isValid) => updateStepValidation(1, isValid)}
          />
        );
      case 2:
        return (
          <RequirementsStep
            formData={formData}
            updateFormData={updateFormData}
            updateStepValidation={(isValid) => updateStepValidation(2, isValid)}
          />
        );
      case 3:
        return (
          <TimeframeStep
            formData={formData}
            updateFormData={updateFormData}
            updateStepValidation={(isValid) => updateStepValidation(3, isValid)}
          />
        );
      case 4:
        return <PreviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`text-xs font-medium ${
                index <= currentStep ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">{renderStep()}</CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button onClick={goToNextStep} disabled={!isNextEnabled()}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                Submit Bounty
                <Save className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
