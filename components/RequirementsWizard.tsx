"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface RequirementTemplate {
  id: string;
  title: string;
  description: string;
  details: string;
}

interface CategoryTemplates {
  [category: string]: RequirementTemplate[];
}

interface RequirementsWizardProps {
  onAddRequirement: (requirement: {
    title: string;
    description: string;
    details: string;
  }) => void;
  existingRequirements?: {
    title: string;
    description: string;
    details: string;
  }[];
}

export const RequirementsWizard = ({
  onAddRequirement,
  existingRequirements = [],
}: RequirementsWizardProps) => {
  const [templates, setTemplates] = useState<CategoryTemplates | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequirements, setSelectedRequirements] = useState<Set<string>>(
    new Set()
  );

  const categories = [
    { value: "frontend", label: "Frontend" },
    { value: "backend", label: "Backend" },
    { value: "mobile", label: "Mobile" },
    { value: "bug", label: "Bug Fixes" },
    { value: "security", label: "Security" },
    { value: "database", label: "Database" },
    { value: "testing", label: "Testing" },
    { value: "devops", label: "DevOps" },
  ];

  // Check if a requirement is already added by comparing titles
  const isRequirementAdded = (title: string) => {
    return existingRequirements.some((req) => req.title === title);
  };

  // Add selected IDs to track selection state
  const toggleRequirementSelection = (requirementId: string) => {
    const newSelection = new Set(selectedRequirements);
    if (newSelection.has(requirementId)) {
      newSelection.delete(requirementId);
    } else {
      newSelection.add(requirementId);
    }
    setSelectedRequirements(newSelection);
  };

  // Fetch requirement templates when component mounts or category changes
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/requirements/wizard${selectedCategory ? `?category=${selectedCategory}` : ""}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch templates: ${response.status}`);
        }

        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        setError("Failed to load requirement templates");
        console.error(err);
        toast.error("Failed to load requirement templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [selectedCategory]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleAddRequirement = (requirement: RequirementTemplate) => {
    onAddRequirement({
      title: requirement.title,
      description: requirement.description,
      details: requirement.details,
    });
    toast.success(`Added requirement: ${requirement.title}`);
    // Clear the selection for this requirement
    const newSelection = new Set(selectedRequirements);
    newSelection.delete(requirement.id);
    setSelectedRequirements(newSelection);
  };

  const addSelectedRequirements = () => {
    if (templates && selectedCategory) {
      const categoryTemplates = templates[selectedCategory];
      if (categoryTemplates) {
        categoryTemplates.forEach((template) => {
          if (
            selectedRequirements.has(template.id) &&
            !isRequirementAdded(template.title)
          ) {
            onAddRequirement({
              title: template.title,
              description: template.description,
              details: template.details,
            });
          }
        });
        toast.success(`Added ${selectedRequirements.size} requirements`);
        setSelectedRequirements(new Set()); // Clear selections after adding
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Requirements Wizard</CardTitle>
        <CardDescription>
          Select from pre-defined requirement templates to add to your bounty
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="category-select" className="text-sm font-medium">
              Category
            </label>
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger id="category-select">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="text-center py-4">Loading templates...</div>
          )}

          {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
          )}

          {!loading && !error && templates && selectedCategory && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Templates</h3>
                {selectedRequirements.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addSelectedRequirements}
                  >
                    Add Selected ({selectedRequirements.size})
                  </Button>
                )}
              </div>

              <Accordion type="multiple" className="w-full">
                {templates[selectedCategory]?.map((template) => {
                  const isAdded = isRequirementAdded(template.title);
                  const isSelected = selectedRequirements.has(template.id);

                  return (
                    <AccordionItem
                      key={template.id}
                      value={template.id}
                      className={`border rounded-md mb-2 ${isAdded ? "bg-muted/20" : ""} ${isSelected ? "ring-1 ring-primary" : ""}`}
                    >
                      <div className="flex items-center">
                        {!isAdded && (
                          <div className="ml-2 mr-2">
                            <input
                              type="checkbox"
                              id={`select-${template.id}`}
                              checked={isSelected}
                              onChange={() =>
                                toggleRequirementSelection(template.id)
                              }
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </div>
                        )}
                        <AccordionTrigger className="flex-1 hover:no-underline py-3">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium text-left">
                              {template.title}
                            </span>
                            {isAdded && (
                              <Badge
                                variant="outline"
                                className="ml-2 bg-green-50 text-green-700 border-green-200"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" /> Added
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        {!isAdded && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddRequirement(template);
                            }}
                            className="mr-2"
                            title="Add this requirement"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <AccordionContent className="px-4 pb-3">
                        <p className="text-sm text-muted-foreground mb-2">
                          {template.description}
                        </p>
                        <p className="text-sm">{template.details}</p>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setSelectedCategory("")}>
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
};
