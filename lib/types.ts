import { Database } from "@/database.types";

// Extract types from Supabase
export type User = Database["public"]["Tables"]["users"]["Row"];
export type ClientProfile =
  Database["public"]["Tables"]["client_profiles"]["Row"];
export type DeveloperProfile =
  Database["public"]["Tables"]["developer_profiles"]["Row"];
export type Bounty = Database["public"]["Tables"]["bounties"]["Row"];
export type ClaimedBounty =
  Database["public"]["Tables"]["claimed_bounties"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Dispute = Database["public"]["Tables"]["disputes"]["Row"];

// Enum types
export type BountyStatus = Database["public"]["Enums"]["bounty_status"];
export type ClaimedBountyStatus =
  Database["public"]["Enums"]["claimed_bounty_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type DisputeStatus = Database["public"]["Enums"]["dispute_status"];

// Extended types
export type UserWithProfile = User & {
  clientProfile?: ClientProfile;
  developerProfile?: DeveloperProfile;
};

export type BountyWithDetails = Bounty & {
  client: ClientProfile & {
    user: User;
  };
  claimedBounty?: ClaimedBounty & {
    developer: DeveloperProfile & {
      user: User;
    };
  };
  comments?: (Comment & {
    user: User;
  })[];
};

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type MainNavItem = NavItem;

export type SidebarNavItem = {
  title: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
} & (
  | {
      href: string;
      items?: never;
    }
  | {
      href?: string;
      items: NavItem[];
    }
);

export type DashboardConfig = {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
};
