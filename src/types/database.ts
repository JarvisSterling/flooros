export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          plan: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          plan?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          plan?: string;
          created_by?: string | null;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          org_id: string | null;
          role: "owner" | "admin" | "editor" | "viewer";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          org_id?: string | null;
          role?: "owner" | "admin" | "editor" | "viewer";
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          org_id?: string | null;
          role?: "owner" | "admin" | "editor" | "viewer";
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          slug: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          venue: string | null;
          status: "draft" | "published" | "live" | "archived";
          settings: Record<string, unknown>;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          slug: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          venue?: string | null;
          status?: "draft" | "published" | "live" | "archived";
          settings?: Record<string, unknown>;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          venue?: string | null;
          status?: "draft" | "published" | "live" | "archived";
          settings?: Record<string, unknown>;
          logo_url?: string | null;
          created_at?: string;
        };
      };
      floor_plans: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          order: number;
          width: number;
          height: number;
          background_url: string | null;
          settings: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          order?: number;
          width?: number;
          height?: number;
          background_url?: string | null;
          settings?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          order?: number;
          width?: number;
          height?: number;
          background_url?: string | null;
          settings?: Record<string, unknown>;
          created_at?: string;
        };
      };
      floors: {
        Row: {
          id: string;
          plan_id: string;
          name: string;
          level: number;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          name: string;
          level?: number;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          name?: string;
          level?: number;
          order?: number;
          created_at?: string;
        };
      };
      objects: {
        Row: {
          id: string;
          floor_id: string;
          type: string;
          x: number;
          y: number;
          width: number;
          height: number;
          rotation: number;
          properties: Record<string, unknown>;
          layer: string;
          locked: boolean;
          visible: boolean;
          z_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          floor_id: string;
          type: string;
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          rotation?: number;
          properties?: Record<string, unknown>;
          layer?: string;
          locked?: boolean;
          visible?: boolean;
          z_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          floor_id?: string;
          type?: string;
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          rotation?: number;
          properties?: Record<string, unknown>;
          layer?: string;
          locked?: boolean;
          visible?: boolean;
          z_index?: number;
          created_at?: string;
        };
      };
      booths: {
        Row: {
          id: string;
          object_id: string | null;
          floor_id: string;
          event_id: string;
          number: string | null;
          name: string | null;
          size_category: "small" | "medium" | "large" | "xl" | null;
          status: "available" | "reserved" | "sold" | "blocked";
          price: number | null;
          exhibitor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          object_id?: string | null;
          floor_id: string;
          event_id: string;
          number?: string | null;
          name?: string | null;
          size_category?: "small" | "medium" | "large" | "xl" | null;
          status?: "available" | "reserved" | "sold" | "blocked";
          price?: number | null;
          exhibitor_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          object_id?: string | null;
          floor_id?: string;
          event_id?: string;
          number?: string | null;
          name?: string | null;
          size_category?: "small" | "medium" | "large" | "xl" | null;
          status?: "available" | "reserved" | "sold" | "blocked";
          price?: number | null;
          exhibitor_id?: string | null;
          created_at?: string;
        };
      };
      exhibitors: {
        Row: {
          id: string;
          event_id: string;
          user_id: string | null;
          company_name: string;
          description: string | null;
          logo_url: string | null;
          website: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          social_links: Record<string, unknown>;
          category: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id?: string | null;
          company_name: string;
          description?: string | null;
          logo_url?: string | null;
          website?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          social_links?: Record<string, unknown>;
          category?: string | null;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string | null;
          company_name?: string;
          description?: string | null;
          logo_url?: string | null;
          website?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          social_links?: Record<string, unknown>;
          category?: string | null;
          tags?: string[];
          created_at?: string;
        };
      };
      booth_reservations: {
        Row: {
          id: string;
          booth_id: string;
          exhibitor_id: string;
          status: "pending" | "confirmed" | "cancelled";
          reserved_at: string;
          confirmed_at: string | null;
          payment_id: string | null;
        };
        Insert: {
          id?: string;
          booth_id: string;
          exhibitor_id: string;
          status?: "pending" | "confirmed" | "cancelled";
          reserved_at?: string;
          confirmed_at?: string | null;
          payment_id?: string | null;
        };
        Update: {
          id?: string;
          booth_id?: string;
          exhibitor_id?: string;
          status?: "pending" | "confirmed" | "cancelled";
          reserved_at?: string;
          confirmed_at?: string | null;
          payment_id?: string | null;
        };
      };
      event_categories: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          color: string;
          icon: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          color?: string;
          icon?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          color?: string;
          icon?: string | null;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          event_id: string;
          booth_id: string | null;
          visitor_id: string | null;
          event_type: "view" | "click" | "direction" | "bookmark";
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          booth_id?: string | null;
          visitor_id?: string | null;
          event_type: "view" | "click" | "direction" | "bookmark";
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          booth_id?: string | null;
          visitor_id?: string | null;
          event_type?: "view" | "click" | "direction" | "bookmark";
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
      };
      team_invitations: {
        Row: {
          id: string;
          org_id: string;
          email: string;
          role: string;
          invited_by: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          email: string;
          role?: string;
          invited_by?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          email?: string;
          role?: string;
          invited_by?: string | null;
          status?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Organization = Tables<"organizations">;
export type UserProfile = Tables<"user_profiles">;
export type Event = Tables<"events">;
export type FloorPlan = Tables<"floor_plans">;
export type Floor = Tables<"floors">;
export type FloorObject = Tables<"objects">;
export type Booth = Tables<"booths">;
export type Exhibitor = Tables<"exhibitors">;
export type BoothReservation = Tables<"booth_reservations">;
export type EventCategory = Tables<"event_categories">;
export type AnalyticsEvent = Tables<"analytics_events">;
export type TeamInvitation = Tables<"team_invitations">;
