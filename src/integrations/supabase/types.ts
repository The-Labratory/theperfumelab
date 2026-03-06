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
      employee_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invite_code: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invite_code?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invite_code?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          department: string | null
          email: string
          hired_at: string | null
          id: string
          name: string
          rejection_note: string | null
          status: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          department?: string | null
          email: string
          hired_at?: string | null
          id?: string
          name: string
          rejection_note?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          department?: string | null
          email?: string
          hired_at?: string | null
          id?: string
          name?: string
          rejection_note?: string | null
          status?: string
          title?: string | null
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
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referee_email: string
          referee_user_id: string | null
          referral_code: string
          referrer_id: string
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referee_email: string
          referee_user_id?: string | null
          referral_code?: string
          referrer_id: string
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referee_email?: string
          referee_user_id?: string | null
          referral_code?: string
          referrer_id?: string
          status?: string
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
      accept_employee_invite: {
        Args: { _invite_code: string; _user_id: string }
        Returns: Json
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
      get_referral_tree: {
        Args: { _root_user_id: string; _max_depth?: number }
        Returns: {
          id: string
          referrer_id: string
          referee_user_id: string | null
          referee_email: string
          referral_code: string
          status: string
          depth: number
          created_at: string
        }[]
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
      register_referral: {
        Args: { _referral_code: string; _referee_user_id: string; _referee_email: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "superadmin" | "user"
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
      app_role: ["admin", "superadmin", "user"],
    },
  },
} as const
