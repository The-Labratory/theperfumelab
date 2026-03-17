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
      admin_whitelist: {
        Row: {
          created_at: string
          email: string
          grants_super_admin: boolean
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          grants_super_admin?: boolean
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          grants_super_admin?: boolean
          id?: string
        }
        Relationships: []
      }
      affiliate_campaigns: {
        Row: {
          affiliate_id: string
          channel: string | null
          clicks: number | null
          conversions: number | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_id: string
          channel?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_id?: string
          channel?: string | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_campaigns_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_campaigns_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_campaigns_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_compliance: {
        Row: {
          affiliate_id: string
          checked_at: string | null
          commission_voided: boolean
          created_at: string
          id: string
          is_compliant: boolean
          sales_count: number
          user_id: string
          voided_amount: number
          week_end: string
          week_start: string
        }
        Insert: {
          affiliate_id: string
          checked_at?: string | null
          commission_voided?: boolean
          created_at?: string
          id?: string
          is_compliant?: boolean
          sales_count?: number
          user_id: string
          voided_amount?: number
          week_end: string
          week_start: string
        }
        Update: {
          affiliate_id?: string
          checked_at?: string | null
          commission_voided?: boolean
          created_at?: string
          id?: string
          is_compliant?: boolean
          sales_count?: number
          user_id?: string
          voided_amount?: number
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_compliance_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_compliance_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_compliance_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_onboarding_events: {
        Row: {
          affiliate_id: string
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_onboarding_events_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_onboarding_events_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_onboarding_events_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_onboarding_progress: {
        Row: {
          affiliate_id: string
          buyback_terms_accepted: boolean
          chosen_partner_level: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          current_step: number
          id: string
          microtasks: Json
          payout_details_saved: boolean
          pledge_signed: boolean
          pledge_text: string | null
          quiz_passed: boolean
          quiz_scores: Json
          roleplay_passed: boolean
          started_at: string | null
          starter_pack_claimed: boolean
          starter_pack_data: Json | null
          steps_completed: Json
          terms_accepted: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_id: string
          buyback_terms_accepted?: boolean
          chosen_partner_level?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          microtasks?: Json
          payout_details_saved?: boolean
          pledge_signed?: boolean
          pledge_text?: string | null
          quiz_passed?: boolean
          quiz_scores?: Json
          roleplay_passed?: boolean
          started_at?: string | null
          starter_pack_claimed?: boolean
          starter_pack_data?: Json | null
          steps_completed?: Json
          terms_accepted?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_id?: string
          buyback_terms_accepted?: boolean
          chosen_partner_level?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          microtasks?: Json
          payout_details_saved?: boolean
          pledge_signed?: boolean
          pledge_text?: string | null
          quiz_passed?: boolean
          quiz_scores?: Json
          roleplay_passed?: boolean
          started_at?: string | null
          starter_pack_claimed?: boolean
          starter_pack_data?: Json | null
          steps_completed?: Json
          terms_accepted?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_onboarding_progress_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: true
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_onboarding_progress_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: true
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_onboarding_progress_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: true
            referencedRelation: "affiliate_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_partners: {
        Row: {
          approved_at: string | null
          avatar_url: string | null
          badges: Json | null
          bio: string | null
          commission_rate: number
          company_name: string | null
          compliance_streak_days: number | null
          created_at: string
          display_name: string
          email: string
          id: string
          is_compliant: boolean | null
          landing_headline: string | null
          landing_tagline: string | null
          last_active_at: string | null
          onboarding_completed: boolean | null
          payout_details: Json | null
          payout_method: string | null
          phone: string | null
          points: number | null
          referral_code: string
          slug: string | null
          social_links: Json | null
          status: string
          tier: string
          total_earnings: number
          total_referrals: number
          total_sales: number
          updated_at: string
          user_id: string
          withdrawals_locked: boolean | null
        }
        Insert: {
          approved_at?: string | null
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          commission_rate?: number
          company_name?: string | null
          compliance_streak_days?: number | null
          created_at?: string
          display_name: string
          email: string
          id?: string
          is_compliant?: boolean | null
          landing_headline?: string | null
          landing_tagline?: string | null
          last_active_at?: string | null
          onboarding_completed?: boolean | null
          payout_details?: Json | null
          payout_method?: string | null
          phone?: string | null
          points?: number | null
          referral_code?: string
          slug?: string | null
          social_links?: Json | null
          status?: string
          tier?: string
          total_earnings?: number
          total_referrals?: number
          total_sales?: number
          updated_at?: string
          user_id: string
          withdrawals_locked?: boolean | null
        }
        Update: {
          approved_at?: string | null
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          commission_rate?: number
          company_name?: string | null
          compliance_streak_days?: number | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          is_compliant?: boolean | null
          landing_headline?: string | null
          landing_tagline?: string | null
          last_active_at?: string | null
          onboarding_completed?: boolean | null
          payout_details?: Json | null
          payout_method?: string | null
          phone?: string | null
          points?: number | null
          referral_code?: string
          slug?: string | null
          social_links?: Json | null
          status?: string
          tier?: string
          total_earnings?: number
          total_referrals?: number
          total_sales?: number
          updated_at?: string
          user_id?: string
          withdrawals_locked?: boolean | null
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
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_point_events: {
        Row: {
          action: string
          affiliate_id: string
          created_at: string
          id: string
          metadata: Json | null
          points: number
          user_id: string
        }
        Insert: {
          action: string
          affiliate_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points?: number
          user_id: string
        }
        Update: {
          action?: string
          affiliate_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_point_events_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_point_events_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_point_events_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
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
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_pyramid_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_pyramid_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
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
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
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
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_connections: {
        Row: {
          account_type: string
          acquisition_date: string
          checkout_link_code: string | null
          client_email: string
          company_name: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          discount_pct: number | null
          expected_volume: string | null
          id: string
          is_contact_cloaked: boolean | null
          last_order_at: string | null
          notes: string | null
          original_affiliate_id: string | null
          total_orders: number
          total_spent: number
          updated_at: string
        }
        Insert: {
          account_type?: string
          acquisition_date?: string
          checkout_link_code?: string | null
          client_email: string
          company_name?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          discount_pct?: number | null
          expected_volume?: string | null
          id?: string
          is_contact_cloaked?: boolean | null
          last_order_at?: string | null
          notes?: string | null
          original_affiliate_id?: string | null
          total_orders?: number
          total_spent?: number
          updated_at?: string
        }
        Update: {
          account_type?: string
          acquisition_date?: string
          checkout_link_code?: string | null
          client_email?: string
          company_name?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          discount_pct?: number | null
          expected_volume?: string | null
          id?: string
          is_contact_cloaked?: boolean | null
          last_order_at?: string | null
          notes?: string | null
          original_affiliate_id?: string | null
          total_orders?: number
          total_spent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_connections_original_affiliate_id_fkey"
            columns: ["original_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_connections_original_affiliate_id_fkey"
            columns: ["original_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_connections_original_affiliate_id_fkey"
            columns: ["original_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
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
            referencedRelation: "employee_public_profiles"
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
      favorites: {
        Row: {
          created_at: string
          id: string
          perfume_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          perfume_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          perfume_id?: string
          user_id?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "formula_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_public"
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
      growth_credits: {
        Row: {
          amount: number
          cash_amount: number
          created_at: string
          credit_type: string
          id: string
          multiplier: number
          notes: string | null
          source_commission_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          cash_amount?: number
          created_at?: string
          credit_type?: string
          id?: string
          multiplier?: number
          notes?: string | null
          source_commission_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          cash_amount?: number
          created_at?: string
          credit_type?: string
          id?: string
          multiplier?: number
          notes?: string | null
          source_commission_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_credits_source_commission_id_fkey"
            columns: ["source_commission_id"]
            isOneToOne: false
            referencedRelation: "commission_ledger"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "ifra_restrictions_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients_public"
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
            foreignKeyName: "ingredient_interactions_ingredient_a_id_fkey"
            columns: ["ingredient_a_id"]
            isOneToOne: false
            referencedRelation: "ingredients_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_interactions_ingredient_b_id_fkey"
            columns: ["ingredient_b_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredient_interactions_ingredient_b_id_fkey"
            columns: ["ingredient_b_id"]
            isOneToOne: false
            referencedRelation: "ingredients_public"
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
      partner_customers: {
        Row: {
          affiliate_partner_id: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          customer_type: string
          id: string
          last_purchase_at: string | null
          notes: string | null
          tags: string[] | null
          total_orders: number
          total_purchases: number
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_partner_id: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          customer_type?: string
          id?: string
          last_purchase_at?: string | null
          notes?: string | null
          tags?: string[] | null
          total_orders?: number
          total_purchases?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_partner_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          customer_type?: string
          id?: string
          last_purchase_at?: string | null
          notes?: string | null
          tags?: string[] | null
          total_orders?: number
          total_purchases?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_customers_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_customers_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_customers_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_goals: {
        Row: {
          affiliate_partner_id: string
          created_at: string
          current_value: number
          goal_type: string
          id: string
          notes: string | null
          period: string
          period_end: string
          period_start: string
          set_by: string | null
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_partner_id: string
          created_at?: string
          current_value?: number
          goal_type?: string
          id?: string
          notes?: string | null
          period?: string
          period_end?: string
          period_start?: string
          set_by?: string | null
          target_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_partner_id?: string
          created_at?: string
          current_value?: number
          goal_type?: string
          id?: string
          notes?: string | null
          period?: string
          period_end?: string
          period_start?: string
          set_by?: string | null
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_goals_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_goals_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_goals_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_inventory: {
        Row: {
          affiliate_partner_id: string
          cost_price: number
          created_at: string
          id: string
          low_stock_threshold: number
          notes: string | null
          product_name: string
          quantity_in_stock: number
          quantity_sold: number
          sku: string | null
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_partner_id: string
          cost_price?: number
          created_at?: string
          id?: string
          low_stock_threshold?: number
          notes?: string | null
          product_name: string
          quantity_in_stock?: number
          quantity_sold?: number
          sku?: string | null
          unit_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_partner_id?: string
          cost_price?: number
          created_at?: string
          id?: string
          low_stock_threshold?: number
          notes?: string | null
          product_name?: string
          quantity_in_stock?: number
          quantity_sold?: number
          sku?: string | null
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_inventory_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_inventory_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_inventory_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_leads: {
        Row: {
          client_name: string | null
          created_at: string | null
          event_type: string | null
          id: string
          partner_id: string | null
          scent_profile_id: string | null
          status: string | null
        }
        Insert: {
          client_name?: string | null
          created_at?: string | null
          event_type?: string | null
          id?: string
          partner_id?: string | null
          scent_profile_id?: string | null
          status?: string | null
        }
        Update: {
          client_name?: string | null
          created_at?: string | null
          event_type?: string | null
          id?: string
          partner_id?: string | null
          scent_profile_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_leads_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_profiles: {
        Row: {
          commission_rate: number | null
          company_name: string
          created_at: string | null
          id: string
          partner_code: string
          total_earned: number | null
          user_id: string
        }
        Insert: {
          commission_rate?: number | null
          company_name: string
          created_at?: string | null
          id?: string
          partner_code: string
          total_earned?: number | null
          user_id: string
        }
        Update: {
          commission_rate?: number | null
          company_name?: string
          created_at?: string | null
          id?: string
          partner_code?: string
          total_earned?: number | null
          user_id?: string
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
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_sales_reports_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_sales_reports_affiliate_partner_id_fkey"
            columns: ["affiliate_partner_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
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
      portfolio_auctions: {
        Row: {
          claimed_by_user_id: string | null
          client_count: number
          created_at: string
          credit_cost: number
          id: string
          resolved_at: string | null
          source_affiliate_id: string
          status: string
          total_portfolio_value: number
        }
        Insert: {
          claimed_by_user_id?: string | null
          client_count?: number
          created_at?: string
          credit_cost?: number
          id?: string
          resolved_at?: string | null
          source_affiliate_id: string
          status?: string
          total_portfolio_value?: number
        }
        Update: {
          claimed_by_user_id?: string | null
          client_count?: number
          created_at?: string
          credit_cost?: number
          id?: string
          resolved_at?: string | null
          source_affiliate_id?: string
          status?: string
          total_portfolio_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_auctions_source_affiliate_id_fkey"
            columns: ["source_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_auctions_source_affiliate_id_fkey"
            columns: ["source_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_auctions_source_affiliate_id_fkey"
            columns: ["source_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
            referencedColumns: ["id"]
          },
        ]
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
          onboarding_completed: boolean
          referral_code: string | null
          scent_personality: string | null
          team_id: string | null
          total_likes_received: number | null
          training_completed: boolean
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
          onboarding_completed?: boolean
          referral_code?: string | null
          scent_personality?: string | null
          team_id?: string | null
          total_likes_received?: number | null
          training_completed?: boolean
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
          onboarding_completed?: boolean
          referral_code?: string | null
          scent_personality?: string | null
          team_id?: string | null
          total_likes_received?: number | null
          training_completed?: boolean
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
      referrals: {
        Row: {
          created_at: string
          credits_awarded: number
          id: string
          referred_email: string | null
          referred_user_id: string | null
          referrer_user_id: string
          status: string
        }
        Insert: {
          created_at?: string
          credits_awarded?: number
          id?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_user_id: string
          status?: string
        }
        Update: {
          created_at?: string
          credits_awarded?: number
          id?: string
          referred_email?: string | null
          referred_user_id?: string | null
          referrer_user_id?: string
          status?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          perfume_id: string
          rating: number
          review_text: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          perfume_id: string
          rating: number
          review_text?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          perfume_id?: string
          rating?: number
          review_text?: string | null
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
      scent_stations: {
        Row: {
          address: string | null
          affiliate_id: string
          business_name: string
          business_type: string
          commission_split_pct: number
          created_at: string
          id: string
          is_active: boolean
          qr_code_data: string
          total_conversions: number
          total_scans: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          affiliate_id: string
          business_name: string
          business_type?: string
          commission_split_pct?: number
          created_at?: string
          id?: string
          is_active?: boolean
          qr_code_data?: string
          total_conversions?: number
          total_scans?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          affiliate_id?: string
          business_name?: string
          business_type?: string
          commission_split_pct?: number
          created_at?: string
          id?: string
          is_active?: boolean
          qr_code_data?: string
          total_conversions?: number
          total_scans?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scent_stations_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scent_stations_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scent_stations_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
            referencedColumns: ["id"]
          },
        ]
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
      session_fingerprints: {
        Row: {
          created_at: string
          fingerprint_hash: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          fingerprint_hash?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          fingerprint_hash?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sub_affiliate_margins: {
        Row: {
          created_at: string
          id: string
          manager_spread_pct: number | null
          manager_user_id: string
          margin_pct: number
          promoted_at: string | null
          sub_affiliate_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_spread_pct?: number | null
          manager_user_id: string
          margin_pct?: number
          promoted_at?: string | null
          sub_affiliate_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          manager_spread_pct?: number | null
          manager_user_id?: string
          margin_pct?: number
          promoted_at?: string | null
          sub_affiliate_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_affiliate_margins_sub_affiliate_id_fkey"
            columns: ["sub_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sub_affiliate_margins_sub_affiliate_id_fkey"
            columns: ["sub_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sub_affiliate_margins_sub_affiliate_id_fkey"
            columns: ["sub_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_partners_public"
            referencedColumns: ["id"]
          },
        ]
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
      affiliate_leaderboard: {
        Row: {
          display_name: string | null
          id: string | null
          tier: string | null
          total_referrals: number | null
          total_sales: number | null
        }
        Insert: {
          display_name?: string | null
          id?: string | null
          tier?: string | null
          total_referrals?: number | null
          total_sales?: number | null
        }
        Update: {
          display_name?: string | null
          id?: string | null
          tier?: string | null
          total_referrals?: number | null
          total_sales?: number | null
        }
        Relationships: []
      }
      affiliate_partners_public: {
        Row: {
          avatar_url: string | null
          badges: Json | null
          bio: string | null
          company_name: string | null
          display_name: string | null
          id: string | null
          landing_headline: string | null
          landing_tagline: string | null
          slug: string | null
          social_links: Json | null
          status: string | null
          tier: string | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          company_name?: string | null
          display_name?: string | null
          id?: string | null
          landing_headline?: string | null
          landing_tagline?: string | null
          slug?: string | null
          social_links?: Json | null
          status?: string | null
          tier?: string | null
        }
        Update: {
          avatar_url?: string | null
          badges?: Json | null
          bio?: string | null
          company_name?: string | null
          display_name?: string | null
          id?: string | null
          landing_headline?: string | null
          landing_tagline?: string | null
          slug?: string | null
          social_links?: Json | null
          status?: string | null
          tier?: string | null
        }
        Relationships: []
      }
      employee_public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          department_id: string | null
          full_name: string | null
          hierarchy_level: number | null
          id: string | null
          is_active: boolean | null
          job_title: string | null
          manager_id: string | null
          sort_order: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          department_id?: string | null
          full_name?: string | null
          hierarchy_level?: number | null
          id?: string | null
          is_active?: boolean | null
          job_title?: string | null
          manager_id?: string | null
          sort_order?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          department_id?: string | null
          full_name?: string | null
          hierarchy_level?: number | null
          id?: string | null
          is_active?: boolean | null
          job_title?: string | null
          manager_id?: string | null
          sort_order?: number | null
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
            referencedRelation: "employee_public_profiles"
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
      ingredients_public: {
        Row: {
          allergen_flags: string[] | null
          boiling_point: number | null
          cas_number: string | null
          category: string | null
          default_layer: string | null
          freshness: number | null
          functional_group: string | null
          id: string | null
          ifra_category: string | null
          ifra_max_concentration: number | null
          is_active: boolean | null
          is_fixative: boolean | null
          molecular_weight: number | null
          name: string | null
          odor_intensity: number | null
          odor_profile: string | null
          regulatory_notes: string | null
          sweetness: number | null
          vapor_pressure: number | null
          volatility_index: number | null
          warmth: number | null
        }
        Insert: {
          allergen_flags?: string[] | null
          boiling_point?: number | null
          cas_number?: string | null
          category?: string | null
          default_layer?: string | null
          freshness?: number | null
          functional_group?: string | null
          id?: string | null
          ifra_category?: string | null
          ifra_max_concentration?: number | null
          is_active?: boolean | null
          is_fixative?: boolean | null
          molecular_weight?: number | null
          name?: string | null
          odor_intensity?: number | null
          odor_profile?: string | null
          regulatory_notes?: string | null
          sweetness?: number | null
          vapor_pressure?: number | null
          volatility_index?: number | null
          warmth?: number | null
        }
        Update: {
          allergen_flags?: string[] | null
          boiling_point?: number | null
          cas_number?: string | null
          category?: string | null
          default_layer?: string | null
          freshness?: number | null
          functional_group?: string | null
          id?: string | null
          ifra_category?: string | null
          ifra_max_concentration?: number | null
          is_active?: boolean | null
          is_fixative?: boolean | null
          molecular_weight?: number | null
          name?: string | null
          odor_intensity?: number | null
          odor_profile?: string | null
          regulatory_notes?: string | null
          sweetness?: number | null
          vapor_pressure?: number | null
          volatility_index?: number | null
          warmth?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_referral_signup: {
        Args: {
          _new_user_id: string
          _referral_code: string
          _referred_email?: string
        }
        Returns: Json
      }
      assign_admin_if_allowed: { Args: never; Returns: boolean }
      award_growth_credit: {
        Args: { _credit_type: string }
        Returns: undefined
      }
      calculate_formula_cost: {
        Args: { _batch_size_ml?: number; _formula_id: string }
        Returns: Json
      }
      check_invite_rate_limit: { Args: { _user_id: string }; Returns: boolean }
      count_direct_referrals: { Args: { _user_id: string }; Returns: number }
      count_total_downline: { Args: { _user_id: string }; Returns: number }
      generate_affiliate_slug: { Args: { _name: string }; Returns: string }
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
        Args: { _max_depth?: number; _root_user_id: string }
        Returns: {
          depth: number
          display_name: string
          parent_user_id: string
          referee_email: string
          referral_code: string
          user_id: string
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
      increment_affiliate_points: {
        Args: { _affiliate_id: string; _points: number }
        Returns: undefined
      }
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
