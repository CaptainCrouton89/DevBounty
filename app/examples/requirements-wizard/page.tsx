"use client";

import { RequirementsWizard } from "@/components/RequirementsWizard";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useState } from "react";

interface Requirement {
  title: string;
  description: string;
  details: string;
}

export default function RequirementsWizardExample() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [bountyTitle, setBountyTitle] = useState("");
  const [bountyDescription, setBountyDescription] = useState("");

  const addRequirement = (requirement: Requirement) => {
    // Check if requirement already exists to avoid duplicates
    if (!requirements.some((req) => req.title === requirement.title)) {
      setRequirements([...requirements, requirement]);
    }
  };

  const removeRequirement = (index: number) => {
    const newRequirements = [...requirements];
    newRequirements.splice(index, 1);
    setRequirements(newRequirements);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`Bounty created with ${requirements.length} requirements`);
    // In a real app, you would submit the form data to your API
    console.log({
      title: bountyTitle,
      description: bountyDescription,
      requirements,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create Bounty Example</h1>
      <p className="text-gray-500 mb-8">
        This example demonstrates how to use the Requirements Wizard component
        to help users create bounties with pre-defined requirement templates.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bounty Details</CardTitle>
                <CardDescription>
                  Basic information about your bounty
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={bountyTitle}
                    onChange={(e) => setBountyTitle(e.target.value)}
                    placeholder="Enter a descriptive title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={bountyDescription}
                    onChange={(e) => setBountyDescription(e.target.value)}
                    placeholder="Describe what you need"
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
                <CardDescription>
                  Define what you need for this bounty to be completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requirements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No requirements added yet. Use the wizard to add some.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requirements.map((req, index) => (
                      <div
                        key={index}
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
                        <p className="text-sm text-gray-500 mb-2">
                          {req.description}
                        </p>
                        <p className="text-sm">{req.details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <Badge variant="outline" className="mr-2">
                    {requirements.length} Requirements
                  </Badge>
                </div>
                <Button type="submit" disabled={requirements.length === 0}>
                  Create Bounty
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        {/* Requirements Wizard Section */}
        <div>
          <RequirementsWizard
            onAddRequirement={addRequirement}
            existingRequirements={requirements}
          />
        </div>
      </div>
    </div>
  );
}
