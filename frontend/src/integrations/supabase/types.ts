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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      client_documents: {
        Row: {
          client_id: string
          created_at: string
          doc_type: string
          id: string
          title: string
          updated_at: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          client_id: string
          created_at?: string
          doc_type: string
          id?: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          client_id?: string
          created_at?: string
          doc_type?: string
          id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      client_meetings: {
        Row: {
          client_id: string
          created_at: string
          duration_minutes: number
          id: string
          meeting_type: string
          notes: string | null
          recording_url: string | null
          scheduled_at: string
          status: string
          title: string
        }
        Insert: {
          client_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_type?: string
          notes?: string | null
          recording_url?: string | null
          scheduled_at: string
          status?: string
          title: string
        }
        Update: {
          client_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_type?: string
          notes?: string | null
          recording_url?: string | null
          scheduled_at?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding: {
        Row: {
          client_id: string
          client_name: string
          company_name: string
          created_at: string
          email: string
          id: string
          notification_frequency: string | null
          onboarding_completed: boolean
          onboarding_step: number
          portal_access_enabled: boolean
          preferred_contact_method: string | null
          receive_alerts: boolean
          receive_opportunities: boolean
          receive_reports: boolean
          timezone: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          client_name: string
          company_name: string
          created_at?: string
          email: string
          id?: string
          notification_frequency?: string | null
          onboarding_completed?: boolean
          onboarding_step?: number
          portal_access_enabled?: boolean
          preferred_contact_method?: string | null
          receive_alerts?: boolean
          receive_opportunities?: boolean
          receive_reports?: boolean
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_name?: string
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          notification_frequency?: string | null
          onboarding_completed?: boolean
          onboarding_step?: number
          portal_access_enabled?: boolean
          preferred_contact_method?: string | null
          receive_alerts?: boolean
          receive_opportunities?: boolean
          receive_reports?: boolean
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_plans: {
        Row: {
          billing_cycle: string
          client_id: string
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean
          plan_name: string
          price: number
        }
        Insert: {
          billing_cycle?: string
          client_id: string
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          plan_name: string
          price: number
        }
        Update: {
          billing_cycle?: string
          client_id?: string
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          plan_name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tasks: {
        Row: {
          assigned_to: string | null
          client_id: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          amazon_connected: boolean
          amazon_seller_id: string | null
          assigned_employee_id: string | null
          assigned_team_lead_id: string | null
          auth_user_id: string | null
          client_type: string
          company_name: string
          contact_name: string
          created_at: string
          email: string
          email_notifications_enabled: boolean
          health_score: number
          health_status: string
          id: string
          mrr: number
          package: string
          updated_at: string
        }
        Insert: {
          amazon_connected?: boolean
          amazon_seller_id?: string | null
          assigned_employee_id?: string | null
          assigned_team_lead_id?: string | null
          auth_user_id?: string | null
          client_type: string
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          email_notifications_enabled?: boolean
          health_score?: number
          health_status?: string
          id?: string
          mrr?: number
          package?: string
          updated_at?: string
        }
        Update: {
          amazon_connected?: boolean
          amazon_seller_id?: string | null
          assigned_employee_id?: string | null
          assigned_team_lead_id?: string | null
          auth_user_id?: string | null
          client_type?: string
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          email_notifications_enabled?: boolean
          health_score?: number
          health_status?: string
          id?: string
          mrr?: number
          package?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_assigned_team_lead_id_fkey"
            columns: ["assigned_team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_updates: {
        Row: {
          ai_suggestion: string | null
          approved_for_client: boolean
          category: string
          client_id: string
          created_at: string
          employee_id: string
          feedback_requested: boolean
          id: string
          is_growth_opportunity: boolean
          update_text: string
        }
        Insert: {
          ai_suggestion?: string | null
          approved_for_client?: boolean
          category?: string
          client_id: string
          created_at?: string
          employee_id: string
          feedback_requested?: boolean
          id?: string
          is_growth_opportunity?: boolean
          update_text: string
        }
        Update: {
          ai_suggestion?: string | null
          approved_for_client?: boolean
          category?: string
          client_id?: string
          created_at?: string
          employee_id?: string
          feedback_requested?: boolean
          id?: string
          is_growth_opportunity?: boolean
          update_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_updates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_updates_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_metrics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          last_updated_by: string | null
          metric_key: string
          metric_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          last_updated_by?: string | null
          metric_key: string
          metric_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          last_updated_by?: string | null
          metric_key?: string
          metric_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_notification_log: {
        Row: {
          actual_value: number | null
          error_message: string | null
          id: string
          notification_type: string
          recipient_email: string
          sent_at: string
          status: string
          subject: string
          threshold_type: string | null
          threshold_value: number | null
        }
        Insert: {
          actual_value?: number | null
          error_message?: string | null
          id?: string
          notification_type: string
          recipient_email: string
          sent_at?: string
          status?: string
          subject: string
          threshold_type?: string | null
          threshold_value?: number | null
        }
        Update: {
          actual_value?: number | null
          error_message?: string | null
          id?: string
          notification_type?: string
          recipient_email?: string
          sent_at?: string
          status?: string
          subject?: string
          threshold_type?: string | null
          threshold_value?: number | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: string
          team_lead_id: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          role?: string
          team_lead_id?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          team_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      team_leads: {
        Row: {
          created_at: string
          department: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          department: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          department?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_summaries: {
        Row: {
          client_id: string
          generated_at: string
          growth_opportunities: string[] | null
          highlights: string[] | null
          id: string
          summary_text: string
          week_end: string
          week_start: string
        }
        Insert: {
          client_id: string
          generated_at?: string
          growth_opportunities?: string[] | null
          highlights?: string[] | null
          id?: string
          summary_text: string
          week_end: string
          week_start: string
        }
        Update: {
          client_id?: string
          generated_at?: string
          growth_opportunities?: string[] | null
          highlights?: string[] | null
          id?: string
          summary_text?: string
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_summaries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "founder" | "team_lead" | "employee" | "client"
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
      app_role: ["admin", "founder", "team_lead", "employee", "client"],
    },
  },
} as const
