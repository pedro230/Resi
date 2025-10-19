export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      maintenance_requests: {
        Row: {
          actual_response_hours: number | null
          approved_at: string | null
          assigned_at: string | null
          category: Database["public"]["Enums"]["service_category"]
          completed_at: string | null
          completion_notes: string | null
          created_at: string | null
          description: string
          estimated_response_hours: number | null
          id: string
          photo_url: string | null
          priority: number | null
          property_id: string
          provider_id: string | null
          rating: number | null
          real_estate_id: string
          rejected_at: string | null
          rejection_reason: string | null
          requested_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["maintenance_status"] | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_response_hours?: number | null
          approved_at?: string | null
          assigned_at?: string | null
          category: Database["public"]["Enums"]["service_category"]
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          description: string
          estimated_response_hours?: number | null
          id?: string
          photo_url?: string | null
          priority?: number | null
          property_id: string
          provider_id?: string | null
          rating?: number | null
          real_estate_id: string
          rejected_at?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_response_hours?: number | null
          approved_at?: string | null
          assigned_at?: string | null
          category?: Database["public"]["Enums"]["service_category"]
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          description?: string
          estimated_response_hours?: number | null
          id?: string
          photo_url?: string | null
          priority?: number | null
          property_id?: string
          provider_id?: string | null
          rating?: number | null
          real_estate_id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_real_estate_id_fkey"
            columns: ["real_estate_id"]
            isOneToOne: false
            referencedRelation: "real_estate_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          full_name: string
          id: string
          months_in_region: number | null
          phone: string | null
          resident_level: Database["public"]["Enums"]["resident_level"] | null
          resident_score: number | null
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          full_name: string
          id: string
          months_in_region?: number | null
          phone?: string | null
          resident_level?: Database["public"]["Enums"]["resident_level"] | null
          resident_score?: number | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          months_in_region?: number | null
          phone?: string | null
          resident_level?: Database["public"]["Enums"]["resident_level"] | null
          resident_score?: number | null
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          active: boolean | null
          address: string
          city: string
          created_at: string | null
          id: string
          property_code: string | null
          real_estate_id: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address: string
          city: string
          created_at?: string | null
          id?: string
          property_code?: string | null
          real_estate_id: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string
          city?: string
          created_at?: string | null
          id?: string
          property_code?: string | null
          real_estate_id?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_real_estate_id_fkey"
            columns: ["real_estate_id"]
            isOneToOne: false
            referencedRelation: "real_estate_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      real_estate_companies: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          cnpj: string | null
          created_at: string | null
          email: string
          id: string
          max_properties: number | null
          name: string
          phone: string | null
          plan_type: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          email: string
          id?: string
          max_properties?: number | null
          name: string
          phone?: string | null
          plan_type?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string
          id?: string
          max_properties?: number | null
          name?: string
          phone?: string | null
          plan_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          active: boolean | null
          address: string | null
          categories: Database["public"]["Enums"]["service_category"][] | null
          city: string
          cpf_cnpj: string | null
          created_at: string | null
          email: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string
          rating: number | null
          total_jobs: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          categories?: Database["public"]["Enums"]["service_category"][] | null
          city: string
          cpf_cnpj?: string | null
          created_at?: string | null
          email: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone: string
          rating?: number | null
          total_jobs?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          categories?: Database["public"]["Enums"]["service_category"][] | null
          city?: string
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string
          rating?: number | null
          total_jobs?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_priority_by_level: {
        Args: { level: Database["public"]["Enums"]["resident_level"] }
        Returns: number
      }
    }
    Enums: {
      maintenance_status:
        | "pending_approval"
        | "approved"
        | "in_progress"
        | "completed"
        | "rejected"
        | "cancelled"
      resident_level: "bronze" | "silver" | "gold" | "visitor"
      service_category:
        | "electrical"
        | "plumbing"
        | "appliances"
        | "cleaning"
        | "general"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      maintenance_status: [
        "pending_approval",
        "approved",
        "in_progress",
        "completed",
        "rejected",
        "cancelled",
      ],
      resident_level: ["bronze", "silver", "gold", "visitor"],
      service_category: [
        "electrical",
        "plumbing",
        "appliances",
        "cleaning",
        "general",
      ],
    },
  },
} as const
