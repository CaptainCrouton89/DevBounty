"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { UserIcon } from "lucide-react";

type ProfileHeaderProps = {
  username: string;
  joinDate: string | null;
  profileType: "developer" | "client" | null;
  averageRating?: number | null;
};

export function ProfileHeader({
  username,
  joinDate,
  profileType,
  averageRating,
}: ProfileHeaderProps) {
  // Format the join date to show as "Joined 2 months ago"
  const formattedJoinDate = joinDate
    ? `Joined ${formatDistanceToNow(new Date(joinDate))} ago`
    : "Join date unknown";

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 py-8">
      {/* Avatar */}
      <Avatar className="h-24 w-24">
        <AvatarFallback className="bg-primary/10 text-primary text-xl">
          <UserIcon className="h-12 w-12" />
        </AvatarFallback>
      </Avatar>

      {/* User info */}
      <div className="flex flex-col items-center md:items-start">
        <h1 className="text-3xl font-bold">{username}</h1>

        <div className="flex flex-wrap items-center gap-3 mt-1">
          {/* Profile type badge */}
          {profileType && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium",
                profileType === "developer"
                  ? "border-blue-500/50 text-blue-600"
                  : "border-emerald-500/50 text-emerald-600"
              )}
            >
              {profileType === "developer" ? "Developer" : "Client"}
            </Badge>
          )}

          {/* Join date */}
          <span className="text-sm text-muted-foreground">
            {formattedJoinDate}
          </span>

          {/* Rating */}
          {averageRating !== undefined && averageRating !== null && (
            <div className="flex items-center">
              <span className="text-sm font-medium">
                {averageRating.toFixed(1)} ★
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
