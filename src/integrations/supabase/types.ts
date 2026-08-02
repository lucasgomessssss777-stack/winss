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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      daily_stats: {
        Row: {
          date: string
          double_clicks: number
          form_starts: number
          payments_amount: number
          payments_count: number
          quiz_completions: number
          quiz_starts: number
          visits: number
        }
        Insert: {
          date: string
          double_clicks?: number
          form_starts?: number
          payments_amount?: number
          payments_count?: number
          quiz_completions?: number
          quiz_starts?: number
          visits?: number
        }
        Update: {
          date?: string
          double_clicks?: number
          form_starts?: number
          payments_amount?: number
          payments_count?: number
          quiz_completions?: number
          quiz_starts?: number
          visits?: number
        }
        Relationships: []
      }
      hourly_stats: {
        Row: {
          date: string
          double_clicks: number
          form_starts: number
          hour: number
          payments_amount: number
          payments_count: number
          quiz_completions: number
          quiz_starts: number
          visits: number
        }
        Insert: {
          date: string
          double_clicks?: number
          form_starts?: number
          hour: number
          payments_amount?: number
          payments_count?: number
          quiz_completions?: number
          quiz_starts?: number
          visits?: number
        }
        Update: {
          date?: string
          double_clicks?: number
          form_starts?: number
          hour?: number
          payments_amount?: number
          payments_count?: number
          quiz_completions?: number
          quiz_starts?: number
          visits?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          banco: string | null
          created_at: string
          external_id: string | null
          id: string
          nome: string | null
          paid_at: string | null
          premio_valor: number | null
          status: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          banco?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          nome?: string | null
          paid_at?: string | null
          premio_valor?: number | null
          status?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          banco?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          nome?: string | null
          paid_at?: string | null
          premio_valor?: number | null
          status?: string
          transaction_id?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          double_clicks: number
          id: number
          visits: number
        }
        Insert: {
          double_clicks?: number
          id?: number
          visits?: number
        }
        Update: {
          double_clicks?: number
          id?: number
          visits?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_daily_double_click: { Args: never; Returns: undefined }
      increment_daily_form_start: { Args: never; Returns: undefined }
      increment_daily_payment: { Args: { amount: number }; Returns: undefined }
      increment_daily_quiz_completion: { Args: never; Returns: undefined }
      increment_daily_quiz_start: { Args: never; Returns: undefined }
      increment_daily_visits: { Args: never; Returns: undefined }
      increment_double_clicks: { Args: never; Returns: undefined }
      increment_hourly_double_click: { Args: never; Returns: undefined }
      increment_hourly_form_start: { Args: never; Returns: undefined }
      increment_hourly_payment: { Args: { amount: number }; Returns: undefined }
      increment_hourly_quiz_completion: { Args: never; Returns: undefined }
      increment_hourly_quiz_start: { Args: never; Returns: undefined }
      increment_hourly_visits: { Args: never; Returns: undefined }
      increment_visits: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
