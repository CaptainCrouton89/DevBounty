"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface CompletedBountiesProps {
  count: number;
  profileType: "developer" | "client";
}

export function CompletedBounties({
  count,
  profileType,
}: CompletedBountiesProps) {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Completed Bounties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{count}</span>
            <span className="text-sm text-muted-foreground">
              {profileType === "developer"
                ? "Bounties completed"
                : "Bounties fulfilled"}
            </span>
          </div>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            {profileType === "developer" ? "Developer" : "Client"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
