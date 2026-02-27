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
      admin_audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      formula_ingredients: {
        Row: {
          concentration_pct: number
          created_at: string
          formula_id: string
          id: string
          ingredient_id: string
          layer_override: string | null
        }
        Insert: {
          concentration_pct?: number
          created_at?: string
          formula_id: string
          id?: string
          ingredient_id: string
          layer_override?: string | null
        }
        Update: {
          concentration_pct?: number
          created_at?: string
          formula_id?: string
          id?: string
          ingredient_id?: string
          layer_override?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "formula_ingredients_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formula_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      formulas: {
        Row: {
          compliance_notes: string | null
          compliance_status: string
          concentration_type: string
          created_at: string
          description: string | null
          evolution_summary: string | null
          formula_number: number
          harmony_score: number | null
          id: string
          name: string
          stability_score: number | null
          status: string
          total_concentration: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          compliance_notes?: string | null
          compliance_status?: string
          concentration_type?: string
          created_at?: string
          description?: string | null
          evolution_summary?: string | null
          formula_number?: number
          harmony_score?: number | null
          id?: string
          name: string
          stability_score?: number | null
          status?: string
          total_concentration?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          compliance_notes?: string | null
          compliance_status?: string
          concentration_type?: string
          created_at?: string
          description?: string | null
          evolution_summary?: string | null
          formula_number?: number
          harmony_score?: number | null
          id?: string
          name?: string
          stability_score?: number | null
          status?: string
          total_concentration?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
      ifra_restrictions: {
        Row: {
          amendment_number: string | null
          created_at: string
          effective_date: string | null
          id: string
          ingredient_id: string
          max_concentration: number
          notes: string | null
          product_category: string
        }
        Insert: {
          amendment_number?: string | null
          created_at?: string
          effective_date?: string | null
          id?: string
          ingredient_id: string
          max_concentration: number
          notes?: string | null
          product_category?: string
        }
        Update: {
          amendment_number?: string | null
          created_at?: string
          effective_date?: string | null
          id?: string
          ingredient_id?: string
          max_concentration?: number
          notes?: string | null
          product_category?: string
        }
        Relationships: [
          {
            foreignKeyName: "ifra_restrictions_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_interactions: {
        Row: {
          accord_name: string | null
          created_at: string
          id: string
          ingredient_a_id: string
          ingredient_b_id: string
          interaction_strength: number
          interaction_type: string
          notes: string | null
        }
        Insert: {
          accord_name?: string | null
          created_at?: string
          id?: string
          ingredient_a_id: string
          ingredient_b_id: string
          interaction_strength?: number
          interaction_type?: string
          notes?: string | null
        }
        Update: {
          accord_name?: string | null
          created_at?: string
          id?: string
          ingredient_a_id?: string
          ingredient_b_id?: string
          interaction_strength?: number
          interaction_type?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_interactions_ingredient_a_id_fkey"
            columns: ["ingredient_a_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_interactions_ingredient_b_id_fkey"
            columns: ["ingredient_b_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          boiling_point: number
          cas_number: string | null
          category: string
          created_at: string
          default_layer: string
          freshness: number
          functional_group: string
          id: string
          ifra_category: string
          ifra_max_concentration: number | null
          is_active: boolean
          is_fixative: boolean
          molecular_weight: number
          name: string
          odor_intensity: number
          odor_profile: string | null
          sweetness: number
          updated_at: string
          vapor_pressure: number
          volatility_index: number
          warmth: number
        }
        Insert: {
          boiling_point?: number
          cas_number?: string | null
          category?: string
          created_at?: string
          default_layer?: string
          freshness?: number
          functional_group?: string
          id?: string
          ifra_category?: string
          ifra_max_concentration?: number | null
          is_active?: boolean
          is_fixative?: boolean
          molecular_weight?: number
          name: string
          odor_intensity?: number
          odor_profile?: string | null
          sweetness?: number
          updated_at?: string
          vapor_pressure?: number
          volatility_index?: number
          warmth?: number
        }
        Update: {
          boiling_point?: number
          cas_number?: string | null
          category?: string
          created_at?: string
          default_layer?: string
          freshness?: number
          functional_group?: string
          id?: string
          ifra_category?: string
          ifra_max_concentration?: number | null
          is_active?: boolean
          is_fixative?: boolean
          molecular_weight?: number
          name?: string
          odor_intensity?: number
          odor_profile?: string | null
          sweetness?: number
          updated_at?: string
          vapor_pressure?: number
          volatility_index?: number
          warmth?: number
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
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          position: number
          reason: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          position?: never
          reason?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          position?: never
          reason?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_if_allowed: {
        Args: { _email: string; _user_id: string }
        Returns: boolean
      }
      get_alltime_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          blend_name: string
          blend_number: number
          concentration: string
          created_at: string
          harmony_score: number
          note_count: number
        }[]
      }
      get_gift_by_share_code: {
        Args: { _share_code: string }
        Returns: {
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
        }[]
        SetofOptions: {
          from: "*"
          to: "gifts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_waitlist_count: { Args: never; Returns: number }
      get_weekly_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          blend_name: string
          blend_number: number
          concentration: string
          created_at: string
          harmony_score: number
          note_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
