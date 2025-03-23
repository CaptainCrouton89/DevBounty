"use client";

import BountyCreationWizard from "@/components/BountyCreationWizard";

export default function CreateBountyPage() {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Create a Bounty</h1>
      <p className="text-muted-foreground mb-8">
        Follow the steps below to create a detailed bounty specification.
      </p>

      <BountyCreationWizard />
    </div>
  );
}
