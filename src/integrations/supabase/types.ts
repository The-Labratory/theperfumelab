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
          scent_personality: string | null
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
          scent_personality?: string | null
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
          scent_personality?: string | null
          total_likes_received?: number | null
          updated_at?: string
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
      calculate_formula_cost: {
        Args: { _batch_size_ml?: number; _formula_id: string }
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
      lock_formula_version: { Args: { _formula_id: string }; Returns: Json }
      owns_pyramid_node: {
        Args: { _node_id: string; _user_id: string }
        Returns: boolean
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
