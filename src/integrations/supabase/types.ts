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
      gifts: {
        Row: {
          blend_intensity: string | null
          blend_mood: string | null
          blend_name: string | null
          blend_notes: Json | null
          blend_story: string | null
          created_at: string
          duo_partner_mood: string | null
          duo_partner_name: string | null
          duo_partner_personality: string | null
          gifter_name: string | null
          id: string
          is_duo: boolean | null
          memory: string | null
          mood: string
          occasion: string
          personal_message: string | null
          personality: string
          reaction_emoji: string | null
          reaction_message: string | null
          recipient_name: string | null
          relationship_depth: string | null
          revealed_at: string | null
          scent_letter: string | null
          share_code: string
          zodiac_sign: string | null
        }
        Insert: {
          blend_intensity?: string | null
          blend_mood?: string | null
          blend_name?: string | null
          blend_notes?: Json | null
          blend_story?: string | null
          created_at?: string
          duo_partner_mood?: string | null
          duo_partner_name?: string | null
          duo_partner_personality?: string | null
          gifter_name?: string | null
          id?: string
          is_duo?: boolean | null
          memory?: string | null
          mood: string
          occasion: string
          personal_message?: string | null
          personality: string
          reaction_emoji?: string | null
          reaction_message?: string | null
          recipient_name?: string | null
          relationship_depth?: string | null
          revealed_at?: string | null
          scent_letter?: string | null
          share_code?: string
          zodiac_sign?: string | null
        }
        Update: {
          blend_intensity?: string | null
          blend_mood?: string | null
          blend_name?: string | null
          blend_notes?: Json | null
          blend_story?: string | null
          created_at?: string
          duo_partner_mood?: string | null
          duo_partner_name?: string | null
          duo_partner_personality?: string | null
          gifter_name?: string | null
          id?: string
          is_duo?: boolean | null
          memory?: string | null
          mood?: string
          occasion?: string
          personal_message?: string | null
          personality?: string
          reaction_emoji?: string | null
          reaction_message?: string | null
          recipient_name?: string | null
          relationship_depth?: string | null
          revealed_at?: string | null
          scent_letter?: string | null
          share_code?: string
          zodiac_sign?: string | null
        }
        Relationships: []
      }
      partner_applications: {
        Row: {
          business_type: string | null
          company_name: string
          contact_name: string
          created_at: string
          email: string
          estimated_volume: string | null
          id: string
          message: string | null
          phone: string | null
          status: string
          website: string | null
        }
        Insert: {
          business_type?: string | null
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          estimated_volume?: string | null
          id?: string
          message?: string | null
          phone?: string | null
          status?: string
          website?: string | null
        }
        Update: {
          business_type?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          estimated_volume?: string | null
          id?: string
          message?: string | null
          phone?: string | null
          status?: string
          website?: string | null
        }
        Relationships: []
      }
      saved_blends: {
        Row: {
          blend_number: number
          concentration: string
          created_at: string
          harmony_score: number | null
          id: string
          name: string | null
          scent_notes: Json
          story_text: string | null
          total_price: number | null
          user_id: string | null
          volume: number
        }
        Insert: {
          blend_number?: number
          concentration: string
          created_at?: string
          harmony_score?: number | null
          id?: string
          name?: string | null
          scent_notes?: Json
          story_text?: string | null
          total_price?: number | null
          user_id?: string | null
          volume: number
        }
        Update: {
          blend_number?: number
          concentration?: string
          created_at?: string
          harmony_score?: number | null
          id?: string
          name?: string | null
          scent_notes?: Json
          story_text?: string | null
          total_price?: number | null
          user_id?: string | null
          volume?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
