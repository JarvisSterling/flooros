// Auto-generated Supabase Database types for FloorOS
// This file provides strict typing for all Supabase client operations.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          org_id: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          org_id?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          org_id?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          id: string;
          org_id: string;
          organizer_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          venue: string | null;
          status: string;
          settings: Json;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          organizer_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          venue?: string | null;
          status?: string;
          settings?: Json;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          organizer_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          venue?: string | null;
          status?: string;
          settings?: Json;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
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
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          order?: number;
          width?: number;
          height?: number;
          background_url?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          order?: number;
          width?: number;
          height?: number;
          background_url?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "floor_plans_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "floors_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "floor_plans";
            referencedColumns: ["id"];
          }
        ];
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
          properties: Json;
          layer: string;
          z_index: number;
          created_at: string;
          updated_at: string;
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
          properties?: Json;
          layer?: string;
          z_index?: number;
          created_at?: string;
          updated_at?: string;
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
          properties?: Json;
          layer?: string;
          z_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "objects_floor_id_fkey";
            columns: ["floor_id"];
            isOneToOne: false;
            referencedRelation: "floors";
            referencedColumns: ["id"];
          }
        ];
      };
      booths: {
        Row: {
          id: string;
          object_id: string;
          floor_id: string | null;
          event_id: string;
          booth_number: string;
          number: string | null;
          name: string | null;
          status: string;
          category: string | null;
          size_category: string | null;
          size_sqm: number | null;
          price: number | null;
          pricing_tier: string | null;
          exhibitor_id: string | null;
          max_capacity: number | null;
          amenities: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          object_id: string;
          floor_id?: string | null;
          event_id: string;
          booth_number: string;
          number?: string | null;
          name?: string | null;
          status?: string;
          category?: string | null;
          size_category?: string | null;
          size_sqm?: number | null;
          price?: number | null;
          pricing_tier?: string | null;
          exhibitor_id?: string | null;
          max_capacity?: number | null;
          amenities?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          object_id?: string;
          floor_id?: string | null;
          event_id?: string;
          booth_number?: string;
          number?: string | null;
          name?: string | null;
          status?: string;
          category?: string | null;
          size_category?: string | null;
          size_sqm?: number | null;
          price?: number | null;
          pricing_tier?: string | null;
          exhibitor_id?: string | null;
          max_capacity?: number | null;
          amenities?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booths_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booths_exhibitor_id_fkey";
            columns: ["exhibitor_id"];
            isOneToOne: false;
            referencedRelation: "exhibitors";
            referencedColumns: ["id"];
          }
        ];
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
          social_links: Json;
          category: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
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
          social_links?: Json;
          category?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
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
          social_links?: Json;
          category?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exhibitors_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
      booth_reservations: {
        Row: {
          id: string;
          booth_id: string;
          exhibitor_id: string;
          status: string;
          reserved_at: string;
          confirmed_at: string | null;
          payment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booth_id: string;
          exhibitor_id: string;
          status?: string;
          reserved_at?: string;
          confirmed_at?: string | null;
          payment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booth_id?: string;
          exhibitor_id?: string;
          status?: string;
          reserved_at?: string;
          confirmed_at?: string | null;
          payment_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booth_reservations_booth_id_fkey";
            columns: ["booth_id"];
            isOneToOne: false;
            referencedRelation: "booths";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "booth_reservations_exhibitor_id_fkey";
            columns: ["exhibitor_id"];
            isOneToOne: false;
            referencedRelation: "exhibitors";
            referencedColumns: ["id"];
          }
        ];
      };
      event_categories: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          color?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_categories_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
      analytics_events: {
        Row: {
          id: string;
          event_id: string;
          booth_id: string | null;
          exhibitor_id: string | null;
          visitor_id: string;
          event_type: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          booth_id?: string | null;
          exhibitor_id?: string | null;
          visitor_id: string;
          event_type: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          booth_id?: string | null;
          exhibitor_id?: string | null;
          visitor_id?: string;
          event_type?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
      team_invitations: {
        Row: {
          id: string;
          org_id: string;
          email: string;
          role: string;
          invited_by: string;
          status: string;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          email: string;
          role: string;
          invited_by: string;
          status?: string;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          email?: string;
          role?: string;
          invited_by?: string;
          status?: string;
          created_at?: string;
          expires_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "team_invitations_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types
type PublicSchema = Database["public"];
type Tables = PublicSchema["Tables"];

export type TableRow<T extends keyof Tables> = Tables[T]["Row"];
export type TableInsert<T extends keyof Tables> = Tables[T]["Insert"];
export type TableUpdate<T extends keyof Tables> = Tables[T]["Update"];
