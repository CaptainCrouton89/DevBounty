export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bounties: {
        Row: {
          bounty_amount: number;
          category: string;
          client_id: string;
          created_at: string | null;
          description: string;
          dibs_duration: unknown;
          expires_at: string;
          github_repo: string;
          id: string;
          requirements: Json | null;
          status: Database["public"]["Enums"]["bounty_status"];
          tags: string[] | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          bounty_amount: number;
          category: string;
          client_id: string;
          created_at?: string | null;
          description: string;
          dibs_duration: unknown;
          expires_at: string;
          github_repo: string;
          id?: string;
          requirements?: Json | null;
          status?: Database["public"]["Enums"]["bounty_status"];
          tags?: string[] | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          bounty_amount?: number;
          category?: string;
          client_id?: string;
          created_at?: string | null;
          description?: string;
          dibs_duration?: unknown;
          expires_at?: string;
          github_repo?: string;
          id?: string;
          requirements?: Json | null;
          status?: Database["public"]["Enums"]["bounty_status"];
          tags?: string[] | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bounties_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "client_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      claimed_bounties: {
        Row: {
          bounty_id: string;
          claimed_at: string | null;
          delivery_deadline: string;
          developer_id: string;
          id: string;
          payment_status: Database["public"]["Enums"]["payment_status"];
          pull_request_url: string | null;
          status: Database["public"]["Enums"]["claimed_bounty_status"];
        };
        Insert: {
          bounty_id: string;
          claimed_at?: string | null;
          delivery_deadline: string;
          developer_id: string;
          id?: string;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          pull_request_url?: string | null;
          status?: Database["public"]["Enums"]["claimed_bounty_status"];
        };
        Update: {
          bounty_id?: string;
          claimed_at?: string | null;
          delivery_deadline?: string;
          developer_id?: string;
          id?: string;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          pull_request_url?: string | null;
          status?: Database["public"]["Enums"]["claimed_bounty_status"];
        };
        Relationships: [
          {
            foreignKeyName: "claimed_bounties_bounty_id_fkey";
            columns: ["bounty_id"];
            isOneToOne: true;
            referencedRelation: "bounties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "claimed_bounties_developer_id_fkey";
            columns: ["developer_id"];
            isOneToOne: false;
            referencedRelation: "developer_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      client_profiles: {
        Row: {
          average_rating: number | null;
          company_name: string | null;
          created_at: string | null;
          id: string;
          payment_email: string;
          rating_count: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          average_rating?: number | null;
          company_name?: string | null;
          created_at?: string | null;
          id?: string;
          payment_email: string;
          rating_count?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          average_rating?: number | null;
          company_name?: string | null;
          created_at?: string | null;
          id?: string;
          payment_email?: string;
          rating_count?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          bounty_id: string;
          content: string;
          created_at: string | null;
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          bounty_id: string;
          content: string;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          bounty_id?: string;
          content?: string;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_bounty_id_fkey";
            columns: ["bounty_id"];
            isOneToOne: false;
            referencedRelation: "bounties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      developer_profiles: {
        Row: {
          average_rating: number | null;
          created_at: string | null;
          id: string;
          payment_email: string;
          rating_count: number | null;
          skills: string[] | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          average_rating?: number | null;
          created_at?: string | null;
          id?: string;
          payment_email: string;
          rating_count?: number | null;
          skills?: string[] | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          average_rating?: number | null;
          created_at?: string | null;
          id?: string;
          payment_email?: string;
          rating_count?: number | null;
          skills?: string[] | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "developer_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      disputes: {
        Row: {
          bounty_id: string;
          client_id: string;
          created_at: string | null;
          developer_id: string;
          id: string;
          reason: string;
          resolution: string | null;
          resolved_at: string | null;
          status: Database["public"]["Enums"]["dispute_status"];
          updated_at: string | null;
        };
        Insert: {
          bounty_id: string;
          client_id: string;
          created_at?: string | null;
          developer_id: string;
          id?: string;
          reason: string;
          resolution?: string | null;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["dispute_status"];
          updated_at?: string | null;
        };
        Update: {
          bounty_id?: string;
          client_id?: string;
          created_at?: string | null;
          developer_id?: string;
          id?: string;
          reason?: string;
          resolution?: string | null;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["dispute_status"];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "disputes_bounty_id_fkey";
            columns: ["bounty_id"];
            isOneToOne: false;
            referencedRelation: "bounties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "disputes_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "disputes_developer_id_fkey";
            columns: ["developer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          bounty_id: string;
          claimed_bounty_id: string;
          client_id: string;
          created_at: string | null;
          developer_id: string;
          dispute_id: string | null;
          id: string;
          payment_address: string;
          payment_method: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          bounty_id: string;
          claimed_bounty_id: string;
          client_id: string;
          created_at?: string | null;
          developer_id: string;
          dispute_id?: string | null;
          id?: string;
          payment_address: string;
          payment_method: string;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          bounty_id?: string;
          claimed_bounty_id?: string;
          client_id?: string;
          created_at?: string | null;
          developer_id?: string;
          dispute_id?: string | null;
          id?: string;
          payment_address?: string;
          payment_method?: string;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_bounty_id_fkey";
            columns: ["bounty_id"];
            isOneToOne: false;
            referencedRelation: "bounties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_claimed_bounty_id_fkey";
            columns: ["claimed_bounty_id"];
            isOneToOne: false;
            referencedRelation: "claimed_bounties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "client_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_developer_id_fkey";
            columns: ["developer_id"];
            isOneToOne: false;
            referencedRelation: "developer_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_dispute_id_fkey";
            columns: ["dispute_id"];
            isOneToOne: false;
            referencedRelation: "disputes";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          bounty_id: string;
          comment: string | null;
          created_at: string | null;
          id: string;
          rating: number;
          reviewee_id: string;
          reviewer_id: string;
        };
        Insert: {
          bounty_id: string;
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          rating: number;
          reviewee_id: string;
          reviewer_id: string;
        };
        Update: {
          bounty_id?: string;
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          rating?: number;
          reviewee_id?: string;
          reviewer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_bounty_id_fkey";
            columns: ["bounty_id"];
            isOneToOne: false;
            referencedRelation: "bounties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey";
            columns: ["reviewee_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          full_name: string;
          id: string;
          is_admin: boolean | null;
          preferences: Json | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          full_name: string;
          id?: string;
          is_admin?: boolean | null;
          preferences?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          full_name?: string;
          id?: string;
          is_admin?: boolean | null;
          preferences?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      bounty_status: "open" | "claimed" | "completed" | "expired";
      claim_status: "active" | "completed" | "expired" | "canceled";
      claimed_bounty_status:
        | "in_progress"
        | "delivered"
        | "approved"
        | "rejected"
        | "expired";
      dispute_status: "pending" | "in_review" | "resolved";
      payment_status: "pending" | "paid";
      user_role: "client" | "developer" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
