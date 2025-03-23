"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BountyFormData } from "../BountyCreationWizard";
import { RequirementsWizard } from "../RequirementsWizard";

interface RequirementsStepProps {
  formData: BountyFormData;
  updateFormData: (data: Partial<BountyFormData>) => void;
  updateStepValidation: (isValid: boolean) => void;
}

export default function RequirementsStep({
  formData,
  updateFormData,
  updateStepValidation,
}: RequirementsStepProps) {
  // Requirements are already in formData, but we keep a local copy for better UX
  const [requirements, setRequirements] = useState<
    Array<{
      title: string;
      description: string;
      details: string;
    }>
  >(formData.requirements || []);

  // Update parent form and validation when requirements change
  useEffect(() => {
    updateFormData({ requirements });
    updateStepValidation(requirements.length > 0);
  }, [requirements, updateFormData, updateStepValidation]);

  // Add requirement handler for the wizard
  const addRequirement = (requirement: {
    title: string;
    description: string;
    details: string;
  }) => {
    if (!requirements.some((req) => req.title === requirement.title)) {
      setRequirements([...requirements, requirement]);
    }
  };

  // Remove requirement handler
  const removeRequirement = (index: number) => {
    const updatedRequirements = [...requirements];
    updatedRequirements.splice(index, 1);
    setRequirements(updatedRequirements);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bounty Requirements</h2>
        <p className="text-muted-foreground">
          Define clear requirements for what developers need to deliver.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requirements list */}
        <Card>
          <CardHeader>
            <CardTitle>Your Requirements</CardTitle>
            <CardDescription>
              Requirements define what developers need to accomplish
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requirements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No requirements added yet. Use the wizard to add some.
              </div>
            ) : (
              <div className="space-y-4">
                {requirements.map((req, index) => (
                  <div
                    key={`${req.title}-${index}`}
                    className="border rounded-md p-4 relative"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <h3 className="font-medium">{req.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {req.description}
                    </p>
                    <p className="text-sm">{req.details}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div>
              <Badge variant="outline" className="mr-2">
                {requirements.length} Requirements
              </Badge>
            </div>
          </CardFooter>
        </Card>

        {/* Requirements wizard */}
        <div>
          <RequirementsWizard
            onAddRequirement={addRequirement}
            existingRequirements={requirements}
          />

          {/* Custom requirement form */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Custom Requirement</CardTitle>
              <CardDescription>
                Can't find what you need? Add a custom requirement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Add a placeholder custom requirement
                  const customTitle = `Custom Requirement ${requirements.filter((r) => r.title.includes("Custom Requirement")).length + 1}`;
                  addRequirement({
                    title: customTitle,
                    description: "Add your custom requirement description",
                    details:
                      "Provide detailed information about what needs to be accomplished",
                  });
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Custom Requirement
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help text */}
      <div className="bg-muted/50 p-4 rounded-md">
        <h3 className="text-sm font-medium flex items-center">
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          Tips for effective requirements
        </h3>
        <ul className="mt-2 text-sm text-muted-foreground space-y-1 ml-6 list-disc">
          <li>Be specific about what needs to be delivered</li>
          <li>Include acceptance criteria when possible</li>
          <li>Consider adding technical constraints or guidelines</li>
          <li>Make requirements testable and measurable</li>
        </ul>
      </div>
    </div>
  );
}
