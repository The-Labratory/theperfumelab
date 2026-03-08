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
      affiliate_partners: {
        Row: {
          approved_at: string | null
          commission_rate: number
          company_name: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          payout_details: Json | null
          payout_method: string | null
          phone: string | null
          referral_code: string
          status: string
          tier: string
          total_earnings: number
          total_referrals: number
          total_sales: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          commission_rate?: number
          company_name?: string | null
          created_at?: string
          display_name: string
          email: string
          id?: string
          payout_details?: Json | null
          payout_method?: string | null
          phone?: string | null
          referral_code?: string
          status?: string
          tier?: string
          total_earnings?: number
          total_referrals?: number
          total_sales?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          commission_rate?: number
          company_name?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          payout_details?: Json | null
          payout_method?: string | null
          phone?: string | null
          referral_code?: string
          status?: string
          tier?: string
          total_earnings?: number
          total_referrals?: number
          total_sales?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_payouts: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          payout_method: string | null
          processed_at: string | null
          reference: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payout_method?: string | null
          processed_at?: string | null
          reference?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payout_method?: string | null
          processed_at?: string | null
          reference?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_pyramid: {
        Row: {
          affiliate_partner_id: string | null
          avatar_url: string | null
          created_at: string
          earnings: number
          id: string
          is_placeholder: boolean
          level: number
          name: string
          parent_id: string | null
          position: number
          title: string | null
          total_transactions: number
          updated_at: string
        }
        Insert: {
          affiliate_partner_id?: string | null
          avatar_url?: string | null
          created_at?: string
          earnings?: number
          id?: string
          is_placeholder?: boolean
          level?: number
          name: string
          parent_id?: string | null
          position?: number
          title?: string | null
          total_transactions?: number
          updated_at?: string
        }
        Update: {
          affiliate_partner_id?: string | null
          avatar_url?: string | null
          created_at?: string
          earnings?: number
          id?: string
          is_placeholder?: boolean
          level?: number
          name?: string
          parent_id?: string | null
          position?: number
          title?: string | null
          total_transactions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_pyramid_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_pyramid_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "affiliate_pyramid"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          commission_amount: number | null
          commission_paid: boolean | null
          converted_at: string | null
          created_at: string
          id: string
          order_id: string | null
          referral_type: string
          referred_email: string | null
          referred_user_id: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          commission_amount?: number | null
          commission_paid?: boolean | null
          converted_at?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          referral_type?: string
          referred_email?: string | null
          referred_user_id?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number | null
          commission_paid?: boolean | null
          converted_at?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          referral_type?: string
          referred_email?: string | null
          referred_user_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_sales: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          pyramid_node_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          pyramid_node_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          pyramid_node_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_sales_pyramid_node_id_fkey"
            columns: ["pyramid_node_id"]
            isOneToOne: false
            referencedRelation: "affiliate_pyramid"
            referencedColumns: ["id"]
          },
        ]
      }
      blend_comments: {
        Row: {
          blend_id: string
          content: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blend_id: string
          content: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blend_id?: string
          content?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blend_comments_blend_id_fkey"
            columns: ["blend_id"]
            isOneToOne: false
            referencedRelation: "saved_blends"
            referencedColumns: ["id"]
          },
        ]
      }
      blend_likes: {
        Row: {
          blend_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          blend_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          blend_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blend_likes_blend_id_fkey"
            columns: ["blend_id"]
            isOneToOne: false
            referencedRelation: "saved_blends"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_ledger: {
        Row: {
          commission_amount: number
          commission_pct: number
          created_at: string
          id: string
          level: number
          paid_at: string | null
          rule_id: string | null
          sale_amount: number
          source_order_id: string | null
          source_user_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          commission_amount?: number
          commission_pct?: number
          created_at?: string
          id?: string
          level?: number
          paid_at?: string | null
          rule_id?: string | null
          sale_amount?: number
          source_order_id?: string | null
          source_user_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          commission_amount?: number
          commission_pct?: number
          created_at?: string
          id?: string
          level?: number
          paid_at?: string | null
          rule_id?: string | null
          sale_amount?: number
          source_order_id?: string | null
          source_user_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_ledger_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "commission_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          commission_pct: number
          created_at: string
          id: string
          is_active: boolean
          level: number
          max_depth: number | null
          min_personal_sales: number | null
          min_qualified_referrals: number | null
          min_team_volume: number | null
          rule_name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          commission_pct?: number
          created_at?: string
          id?: string
          is_active?: boolean
          level?: number
          max_depth?: number | null
          min_personal_sales?: number | null
          min_qualified_referrals?: number | null
          min_team_volume?: number | null
          rule_name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          commission_pct?: number
          created_at?: string
          id?: string
          is_active?: boolean
          level?: number
          max_depth?: number | null
          min_personal_sales?: number | null
          min_qualified_referrals?: number | null
          min_team_volume?: number | null
          rule_name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      employee_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assigned_department_id: string | null
          assigned_role: Database["public"]["Enums"]["app_role"] | null
          bank_card_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          id_document_url: string | null
          notes: string | null
          phone: string | null
          rejection_reason: string | null
          requested_by: string
          status: string
          updated_at: string
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
          assigned_department_id?: string | null
          assigned_role?: Database["public"]["Enums"]["app_role"] | null
          bank_card_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          id_document_url?: string | null
          notes?: string | null
          phone?: string | null
          rejection_reason?: string | null
          requested_by: string
          status?: string
          updated_at?: string
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
          assigned_department_id?: string | null
          assigned_role?: Database["public"]["Enums"]["app_role"] | null
          bank_card_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          id_document_url?: string | null
          notes?: string | null
          phone?: string | null
          rejection_reason?: string | null
          requested_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_requests_assigned_department_id_fkey"
            columns: ["assigned_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          department_id: string | null
          email: string | null
          full_name: string
          hierarchy_level: number
          id: string
          is_active: boolean
          job_title: string
          joined_at: string | null
          manager_id: string | null
          phone: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          full_name: string
          hierarchy_level?: number
          id?: string
          is_active?: boolean
          job_title: string
          joined_at?: string | null
          manager_id?: string | null
          phone?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          full_name?: string
          hierarchy_level?: number
          id?: string
          is_active?: boolean
          job_title?: string
          joined_at?: string | null
          manager_id?: string | null
          phone?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      formula_costs: {
        Row: {
          batch_size_ml: number | null
          bottle_cost: number
          calculated_at: string
          currency: string | null
          formula_id: string
          id: string
          labor_cost: number
          margin_pct: number | null
          overhead_cost: number
          packaging_cost: number
          raw_material_cost: number
          recommended_price: number | null
          total_cost: number
        }
        Insert: {
          batch_size_ml?: number | null
          bottle_cost?: number
          calculated_at?: string
          currency?: string | null
          formula_id: string
          id?: string
          labor_cost?: number
          margin_pct?: number | null
          overhead_cost?: number
          packaging_cost?: number
          raw_material_cost?: number
          recommended_price?: number | null
          total_cost?: number
        }
        Update: {
          batch_size_ml?: number | null
          bottle_cost?: number
          calculated_at?: string
          currency?: string | null
          formula_id?: string
          id?: string
          labor_cost?: number
          margin_pct?: number | null
          overhead_cost?: number
          packaging_cost?: number
          raw_material_cost?: number
          recommended_price?: number | null
          total_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "formula_costs_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: true
            referencedRelation: "formulas"
            referencedColumns: ["id"]
          },
        ]
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
      formula_snapshots: {
        Row: {
          created_at: string
          created_by: string | null
          estimated_cost: number | null
          formula_id: string
          harmony_score: number | null
          id: string
          ingredient_snapshot: Json
          notes: string | null
          snapshot_data: Json
          stability_score: number | null
          total_concentration: number
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          estimated_cost?: number | null
          formula_id: string
          harmony_score?: number | null
          id?: string
          ingredient_snapshot: Json
          notes?: string | null
          snapshot_data: Json
          stability_score?: number | null
          total_concentration: number
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          estimated_cost?: number | null
          formula_id?: string
          harmony_score?: number | null
          id?: string
          ingredient_snapshot?: Json
          notes?: string | null
          snapshot_data?: Json
          stability_score?: number | null
          total_concentration?: number
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "formula_snapshots_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "formulas"
            referencedColumns: ["id"]
          },
        ]
      }
      formulas: {
        Row: {
          batch_size_ml: number | null
          compliance_notes: string | null
          compliance_status: string
          concentration_type: string
          created_at: string
          description: string | null
          estimated_cost: number | null
          estimated_margin_pct: number | null
          evolution_summary: string | null
          formula_number: number
          harmony_score: number | null
          id: string
          is_locked: boolean | null
          locked_at: string | null
          locked_by: string | null
          name: string
          parent_formula_id: string | null
          production_notes: string | null
          stability_score: number | null
          status: string
          total_concentration: number
          updated_at: string
          user_id: string | null
          version: number | null
        }
        Insert: {
          batch_size_ml?: number | null
          compliance_notes?: string | null
          compliance_status?: string
          concentration_type?: string
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          estimated_margin_pct?: number | null
          evolution_summary?: string | null
          formula_number?: number
          harmony_score?: number | null
          id?: string
          is_locked?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          name: string
          parent_formula_id?: string | null
          production_notes?: string | null
          stability_score?: number | null
          status?: string
          total_concentration?: number
          updated_at?: string
          user_id?: string | null
          version?: number | null
        }
        Update: {
          batch_size_ml?: number | null
          compliance_notes?: string | null
          compliance_status?: string
          concentration_type?: string
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          estimated_margin_pct?: number | null
          evolution_summary?: string | null
          formula_number?: number
          harmony_score?: number | null
          id?: string
          is_locked?: boolean | null
          locked_at?: string | null
          locked_by?: string | null
          name?: string
          parent_formula_id?: string | null
          production_notes?: string | null
          stability_score?: number | null
          status?: string
          total_concentration?: number
          updated_at?: string
          user_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "formulas_parent_formula_id_fkey"
            columns: ["parent_formula_id"]
            isOneToOne: false
            referencedRelation: "formulas"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_flags: {
        Row: {
          created_at: string
          details: Json | null
          flag_type: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          flag_type: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          flag_type?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      game_progress: {
        Row: {
          completed_challenges: Json
          created_at: string
          current_chapter: number
          id: string
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          completed_challenges?: Json
          created_at?: string
          current_chapter?: number
          id?: string
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          completed_challenges?: Json
          created_at?: string
          current_chapter?: number
          id?: string
          updated_at?: string
          user_id?: string
          xp?: number
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
          allergen_flags: string[] | null
          boiling_point: number
          cas_number: string | null
          category: string
          cost_currency: string | null
          cost_per_kg: number | null
          created_at: string
          default_layer: string
          freshness: number
          functional_group: string
          id: string
          ifra_category: string
          ifra_max_concentration: number | null
          is_active: boolean
          is_fixative: boolean
          min_order_qty_kg: number | null
          molecular_weight: number
          name: string
          odor_intensity: number
          odor_profile: string | null
          origin_country: string | null
          regulatory_notes: string | null
          shelf_life_months: number | null
          storage_conditions: string | null
          supplier_code: string | null
          supplier_name: string | null
          sweetness: number
          updated_at: string
          vapor_pressure: number
          volatility_index: number
          warmth: number
        }
        Insert: {
          allergen_flags?: string[] | null
          boiling_point?: number
          cas_number?: string | null
          category?: string
          cost_currency?: string | null
          cost_per_kg?: number | null
          created_at?: string
          default_layer?: string
          freshness?: number
          functional_group?: string
          id?: string
          ifra_category?: string
          ifra_max_concentration?: number | null
          is_active?: boolean
          is_fixative?: boolean
          min_order_qty_kg?: number | null
          molecular_weight?: number
          name: string
          odor_intensity?: number
          odor_profile?: string | null
          origin_country?: string | null
          regulatory_notes?: string | null
          shelf_life_months?: number | null
          storage_conditions?: string | null
          supplier_code?: string | null
          supplier_name?: string | null
          sweetness?: number
          updated_at?: string
          vapor_pressure?: number
          volatility_index?: number
          warmth?: number
        }
        Update: {
          allergen_flags?: string[] | null
          boiling_point?: number
          cas_number?: string | null
          category?: string
          cost_currency?: string | null
          cost_per_kg?: number | null
          created_at?: string
          default_layer?: string
          freshness?: number
          functional_group?: string
          id?: string
          ifra_category?: string
          ifra_max_concentration?: number | null
          is_active?: boolean
          is_fixative?: boolean
          min_order_qty_kg?: number | null
          molecular_weight?: number
          name?: string
          odor_intensity?: number
          odor_profile?: string | null
          origin_country?: string | null
          regulatory_notes?: string | null
          shelf_life_months?: number | null
          storage_conditions?: string | null
          supplier_code?: string | null
          supplier_name?: string | null
          sweetness?: number
          updated_at?: string
          vapor_pressure?: number
          volatility_index?: number
          warmth?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          discount_amount: number | null
          id: string
          items: Json
          notes: string | null
          order_number: number
          payment_provider: string | null
          payment_reference: string | null
          payment_status: string
          shipping_address: Json | null
          shipping_cost: number | null
          status: string
          subtotal: number
          tax_amount: number | null
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          discount_amount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: number
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          discount_amount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: number
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total?: number
          updated_at?: string
          user_id?: string | null
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
      partner_sales_reports: {
        Row: {
          affiliate_partner_id: string
          created_at: string
          customer_email: string | null
          customer_name: string | null
          id: string
          notes: string | null
          product_name: string
          quantity: number
          reviewed_at: string | null
          reviewed_by: string | null
          sale_amount: number
          sale_date: string
          status: string
          user_id: string
        }
        Insert: {
          affiliate_partner_id: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          product_name: string
          quantity?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          sale_amount?: number
          sale_date?: string
          status?: string
          user_id: string
        }
        Update: {
          affiliate_partner_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          notes?: string | null
          product_name?: string
          quantity?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          sale_amount?: number
          sale_date?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_sales_reports_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      platinum_rewards: {
        Row: {
          claimed_at: string
          discount_code: string
          id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          discount_code: string
          id?: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          discount_code?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      production_orders: {
        Row: {
          batch_id: string | null
          completed_at: string | null
          compliance_doc_url: string | null
          concentration_type: string
          created_at: string
          estimated_completion: string | null
          formula_id: string
          formula_snapshot_id: string | null
          id: string
          mixing_instructions: Json | null
          order_number: number
          priority: string | null
          production_notes: string | null
          quantity: number
          sale_price: number | null
          shipped_at: string | null
          shipping_tracking: string | null
          shipping_weight_g: number | null
          started_at: string | null
          status: string
          total_cost: number | null
          updated_at: string
          user_id: string | null
          volume_ml: number
        }
        Insert: {
          batch_id?: string | null
          completed_at?: string | null
          compliance_doc_url?: string | null
          concentration_type?: string
          created_at?: string
          estimated_completion?: string | null
          formula_id: string
          formula_snapshot_id?: string | null
          id?: string
          mixing_instructions?: Json | null
          order_number?: number
          priority?: string | null
          production_notes?: string | null
          quantity?: number
          sale_price?: number | null
          shipped_at?: string | null
          shipping_tracking?: string | null
          shipping_weight_g?: number | null
          started_at?: string | null
          status?: string
          total_cost?: number | null
          updated_at?: string
          user_id?: string | null
          volume_ml?: number
        }
        Update: {
          batch_id?: string | null
          completed_at?: string | null
          compliance_doc_url?: string | null
          concentration_type?: string
          created_at?: string
          estimated_completion?: string | null
          formula_id?: string
          formula_snapshot_id?: string | null
          id?: string
          mixing_instructions?: Json | null
          order_number?: number
          priority?: string | null
          production_notes?: string | null
          quantity?: number
          sale_price?: number | null
          shipped_at?: string | null
          shipping_tracking?: string | null
          shipping_weight_g?: number | null
          started_at?: string | null
          status?: string
          total_cost?: number | null
          updated_at?: string
          user_id?: string | null
          volume_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_formula_snapshot_id_fkey"
            columns: ["formula_snapshot_id"]
            isOneToOne: false
            referencedRelation: "formula_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          blends_created: number | null
          created_at: string
          display_name: string | null
          experience_level: string | null
          favorite_families: string[] | null
          id: string
          is_public: boolean | null
          referral_code: string | null
          scent_personality: string | null
          team_id: string | null
          total_likes_received: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          blends_created?: number | null
          created_at?: string
          display_name?: string | null
          experience_level?: string | null
          favorite_families?: string[] | null
          id?: string
          is_public?: boolean | null
          referral_code?: string | null
          scent_personality?: string | null
          team_id?: string | null
          total_likes_received?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          blends_created?: number | null
          created_at?: string
          display_name?: string | null
          experience_level?: string | null
          favorite_families?: string[] | null
          id?: string
          is_public?: boolean | null
          referral_code?: string | null
          scent_personality?: string | null
          team_id?: string | null
          total_likes_received?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      pyramid_chart_config_versions: {
        Row: {
          config_id: string
          config_snapshot: Json
          id: string
          notes: string | null
          published_at: string
          published_by: string | null
          version: number
        }
        Insert: {
          config_id: string
          config_snapshot: Json
          id?: string
          notes?: string | null
          published_at?: string
          published_by?: string | null
          version: number
        }
        Update: {
          config_id?: string
          config_snapshot?: Json
          id?: string
          notes?: string | null
          published_at?: string
          published_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "pyramid_chart_config_versions_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "pyramid_chart_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      pyramid_chart_configs: {
        Row: {
          colors: Json | null
          config: Json
          created_at: string
          created_by: string | null
          data_source_mode: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          visibility_rules: Json | null
        }
        Insert: {
          colors?: Json | null
          config?: Json
          created_at?: string
          created_by?: string | null
          data_source_mode?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          visibility_rules?: Json | null
        }
        Update: {
          colors?: Json | null
          config?: Json
          created_at?: string
          created_by?: string | null
          data_source_mode?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          visibility_rules?: Json | null
        }
        Relationships: []
      }
      rank_rules: {
        Row: {
          badge_color: string | null
          created_at: string
          id: string
          is_active: boolean
          min_direct_referrals: number | null
          min_personal_sales: number | null
          min_qualified_downline: number | null
          min_team_sales: number | null
          rank_level: number
          rank_name: string
        }
        Insert: {
          badge_color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          min_direct_referrals?: number | null
          min_personal_sales?: number | null
          min_qualified_downline?: number | null
          min_team_sales?: number | null
          rank_level?: number
          rank_name: string
        }
        Update: {
          badge_color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          min_direct_referrals?: number | null
          min_personal_sales?: number | null
          min_qualified_downline?: number | null
          min_team_sales?: number | null
          rank_level?: number
          rank_name?: string
        }
        Relationships: []
      }
      referral_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      referral_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          invite_code: string
          invited_email: string | null
          invited_user_id: string | null
          inviter_user_id: string
          ip_address: string | null
          status: string
          user_agent: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          invite_code?: string
          invited_email?: string | null
          invited_user_id?: string | null
          inviter_user_id: string
          ip_address?: string | null
          status?: string
          user_agent?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          invite_code?: string
          invited_email?: string | null
          invited_user_id?: string | null
          inviter_user_id?: string
          ip_address?: string | null
          status?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      referral_relationships: {
        Row: {
          confirmed_at: string | null
          created_at: string
          depth: number
          id: string
          parent_user_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          depth?: number
          id?: string
          parent_user_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          depth?: number
          id?: string
          parent_user_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_blends: {
        Row: {
          blend_number: number
          comment_count: number | null
          concentration: string
          created_at: string
          harmony_score: number | null
          id: string
          is_public: boolean | null
          like_count: number | null
          name: string | null
          scent_notes: Json
          story_text: string | null
          total_price: number | null
          user_id: string | null
          volume: number
        }
        Insert: {
          blend_number?: number
          comment_count?: number | null
          concentration: string
          created_at?: string
          harmony_score?: number | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          name?: string | null
          scent_notes?: Json
          story_text?: string | null
          total_price?: number | null
          user_id?: string | null
          volume: number
        }
        Update: {
          blend_number?: number
          comment_count?: number | null
          concentration?: string
          created_at?: string
          harmony_score?: number | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          name?: string | null
          scent_notes?: Json
          story_text?: string | null
          total_price?: number | null
          user_id?: string | null
          volume?: number
        }
        Relationships: []
      }
      security_events: {
        Row: {
          correlation_id: string | null
          created_at: string
          details: Json | null
          endpoint: string | null
          event_type: string
          id: string
          ip_address: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          details?: Json | null
          endpoint?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          details?: Json | null
          endpoint?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          page_path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_rank_history: {
        Row: {
          achieved_at: string
          id: string
          qualification_snapshot: Json | null
          rank_level: number
          rank_name: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          id?: string
          qualification_snapshot?: Json | null
          rank_level?: number
          rank_name: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          id?: string
          qualification_snapshot?: Json | null
          rank_level?: number
          rank_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          authority_level: number
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          authority_level?: number
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          authority_level?: number
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
      assign_admin_if_allowed:
        | { Args: never; Returns: boolean }
        | { Args: { _email: string; _user_id: string }; Returns: boolean }
      calculate_formula_cost: {
        Args: { _batch_size_ml?: number; _formula_id: string }
        Returns: Json
      }
      check_invite_rate_limit: { Args: { _user_id: string }; Returns: boolean }
      count_direct_referrals: { Args: { _user_id: string }; Returns: number }
      count_total_downline: { Args: { _user_id: string }; Returns: number }
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
      get_downline: {
        Args: { _max_depth?: number; _user_id: string }
        Returns: {
          depth: number
          display_name: string
          parent_user_id: string
          referral_code: string
          user_id: string
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
      get_user_authority_level: { Args: { _user_id: string }; Returns: number }
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
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      lock_formula_version: { Args: { _formula_id: string }; Returns: Json }
      log_security_event: {
        Args: {
          _details?: Json
          _endpoint?: string
          _event_type: string
          _severity?: string
          _user_id?: string
        }
        Returns: undefined
      }
      owns_pyramid_node: {
        Args: { _node_id: string; _user_id: string }
        Returns: boolean
      }
      process_referral_signup: {
        Args: { _new_user_id: string; _referral_code: string }
        Returns: Json
      }
      validate_formula: { Args: { _formula_id: string }; Returns: Json }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "super_admin"
        | "team_admin"
        | "agent"
        | "viewer"
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
      app_role: [
        "admin",
        "user",
        "super_admin",
        "team_admin",
        "agent",
        "viewer",
      ],
    },
  },
} as const
