import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function createAuthenticatedClient(token: string): SupabaseClient {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
}

export function getStoredToken(): string | null {
  return localStorage.getItem('outbound_token')
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          brand_id: string | null
          client_id: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          brand_id?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          brand_id?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_client_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      adapter_config: {
        Row: {
          adapter_name: string
          config: Json | null
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          rate_limit_per_min: number
          reliability: number
          requires_auth: boolean
        }
        Insert: {
          adapter_name: string
          config?: Json | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          rate_limit_per_min?: number
          reliability?: number
          requires_auth?: boolean
        }
        Update: {
          adapter_name?: string
          config?: Json | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          rate_limit_per_min?: number
          reliability?: number
          requires_auth?: boolean
        }
        Relationships: []
      }
      ai_templates: {
        Row: {
          body_template: string | null
          brand_id: string | null
          client_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          subject_template: string | null
          updated_at: string
        }
        Insert: {
          body_template?: string | null
          brand_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          subject_template?: string | null
          updated_at?: string
        }
        Update: {
          body_template?: string | null
          brand_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject_template?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_templates_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics: {
        Row: {
          bounced: number | null
          brand_id: string
          clicked: number | null
          created_at: string | null
          delivered: number | null
          id: string
          opened: number | null
          replied: number | null
          sent: number | null
          updated_at: string | null
        }
        Insert: {
          bounced?: number | null
          brand_id: string
          clicked?: number | null
          created_at?: string | null
          delivered?: number | null
          id?: string
          opened?: number | null
          replied?: number | null
          sent?: number | null
          updated_at?: string | null
        }
        Update: {
          bounced?: number | null
          brand_id?: string
          clicked?: number | null
          created_at?: string | null
          delivered?: number | null
          id?: string
          opened?: number | null
          replied?: number | null
          sent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          name: string
          rate_limit_per_day: number | null
          rate_limit_per_minute: number | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          name: string
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          name?: string
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          usage_count?: number | null
        }
        Relationships: []
      }
      auth_logs: {
        Row: {
          client_id: string | null
          created_at: string | null
          email: string
          error_message: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          email: string
          error_message?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          email?: string
          error_message?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      blacklist: {
        Row: {
          client_id: string | null
          created_at: string | null
          email: string
          id: string
          reason: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          reason?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      brand_discovery_sources: {
        Row: {
          brand_id: string
          client_id: string | null
          config: Json | null
          created_at: string
          execution_mode: string
          id: string
          is_active: boolean
          is_running: boolean
          last_error: string | null
          last_run_at: string | null
          last_status: string | null
          name: string
          next_attempt_at: string | null
          rate_limit_per_min: number
          retry_count: number
          schedule_cron: string | null
          type: string
        }
        Insert: {
          brand_id: string
          client_id?: string | null
          config?: Json | null
          created_at?: string
          execution_mode?: string
          id?: string
          is_active?: boolean
          is_running?: boolean
          last_error?: string | null
          last_run_at?: string | null
          last_status?: string | null
          name: string
          next_attempt_at?: string | null
          rate_limit_per_min?: number
          retry_count?: number
          schedule_cron?: string | null
          type: string
        }
        Update: {
          brand_id?: string
          client_id?: string | null
          config?: Json | null
          created_at?: string
          execution_mode?: string
          id?: string
          is_active?: boolean
          is_running?: boolean
          last_error?: string | null
          last_run_at?: string | null
          last_status?: string | null
          name?: string
          next_attempt_at?: string | null
          rate_limit_per_min?: number
          retry_count?: number
          schedule_cron?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_discovery_sources_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_intents: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          intent: string
          is_active: boolean | null
          priority: number
          signals: Json
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          intent: string
          is_active?: boolean | null
          priority?: number
          signals?: Json
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          intent?: string
          is_active?: boolean | null
          priority?: number
          signals?: Json
        }
        Relationships: [
          {
            foreignKeyName: "brand_intents_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          audience: string | null
          brand_name: string
          client_id: string | null
          core_offer: string | null
          created_at: string
          daily_send_limit: number | null
          id: string
          imap_email: string | null
          imap_host: string | null
          imap_password: string | null
          imap_port: number | null
          imap_secure: boolean | null
          imap_username: string | null
          is_active: boolean
          negotiation_style: string | null
          objection_guidelines: string | null
          positioning: string | null
          product: string
          provider: string | null
          provider_api_key: string | null
          reply_to_email: string | null
          sending_domain: string | null
          signature_block: string | null
          smtp_email: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_secure: boolean | null
          smtp_username: string | null
          tone: string | null
          transport_mode: string | null
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          audience?: string | null
          brand_name: string
          client_id?: string | null
          core_offer?: string | null
          created_at?: string
          daily_send_limit?: number | null
          id?: string
          imap_email?: string | null
          imap_host?: string | null
          imap_password?: string | null
          imap_port?: number | null
          imap_secure?: boolean | null
          imap_username?: string | null
          is_active?: boolean
          negotiation_style?: string | null
          objection_guidelines?: string | null
          positioning?: string | null
          product: string
          provider?: string | null
          provider_api_key?: string | null
          reply_to_email?: string | null
          sending_domain?: string | null
          signature_block?: string | null
          smtp_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          tone?: string | null
          transport_mode?: string | null
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          audience?: string | null
          brand_name?: string
          client_id?: string | null
          core_offer?: string | null
          created_at?: string
          daily_send_limit?: number | null
          id?: string
          imap_email?: string | null
          imap_host?: string | null
          imap_password?: string | null
          imap_port?: number | null
          imap_secure?: boolean | null
          imap_username?: string | null
          is_active?: boolean
          negotiation_style?: string | null
          objection_guidelines?: string | null
          positioning?: string | null
          product?: string
          provider?: string | null
          provider_api_key?: string | null
          reply_to_email?: string | null
          sending_domain?: string | null
          signature_block?: string | null
          smtp_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          tone?: string | null
          transport_mode?: string | null
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_analytics: {
        Row: {
          bounced_count: number | null
          campaign_id: string
          clicked_count: number | null
          created_at: string | null
          delivered_count: number | null
          id: string
          opened_count: number | null
          replied_count: number | null
          sent_count: number | null
          updated_at: string | null
        }
        Insert: {
          bounced_count?: number | null
          campaign_id: string
          clicked_count?: number | null
          created_at?: string | null
          delivered_count?: number | null
          id?: string
          opened_count?: number | null
          replied_count?: number | null
          sent_count?: number | null
          updated_at?: string | null
        }
        Update: {
          bounced_count?: number | null
          campaign_id?: string
          clicked_count?: number | null
          created_at?: string | null
          delivered_count?: number | null
          id?: string
          opened_count?: number | null
          replied_count?: number | null
          sent_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_replies: {
        Row: {
          campaign_id: string
          client_id: string | null
          company_id: string
          content: string
          created_at: string | null
          id: string
          lead_id: string
          replied_at: string | null
          subject: string | null
        }
        Insert: {
          campaign_id: string
          client_id?: string | null
          company_id: string
          content: string
          created_at?: string | null
          id?: string
          lead_id: string
          replied_at?: string | null
          subject?: string | null
        }
        Update: {
          campaign_id?: string
          client_id?: string | null
          company_id?: string
          content?: string
          created_at?: string | null
          id?: string
          lead_id?: string
          replied_at?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_replies_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_replies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string
          client_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_members: {
        Row: {
          client_id: string
          created_at: string | null
          email: string
          id: string
          invite_token: string | null
          invited_at: string | null
          is_active: boolean | null
          joined_at: string | null
          last_login_at: string | null
          name: string | null
          password_hash: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          email: string
          id?: string
          invite_token?: string | null
          invited_at?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          last_login_at?: string | null
          name?: string | null
          password_hash?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          email?: string
          id?: string
          invite_token?: string | null
          invited_at?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          last_login_at?: string | null
          name?: string | null
          password_hash?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_members_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_settings_base: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          llm_model: string | null
          llm_provider: string
          llm_temperature: number | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          llm_model?: string | null
          llm_provider?: string
          llm_temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          llm_model?: string | null
          llm_provider?: string
          llm_temperature?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_settings_base_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_settings_full: {
        Row: {
          client_id: string | null
          created_at: string | null
          email_provider: string
          id: string
          imap_email: string | null
          imap_enabled: boolean | null
          imap_host: string | null
          imap_password: string | null
          imap_port: number | null
          imap_secure: boolean | null
          imap_username: string | null
          llm_model: string | null
          llm_provider: string
          llm_temperature: number | null
          provider_api_key: string | null
          sending_domain: string | null
          smtp_email: string | null
          smtp_from_email: string | null
          smtp_from_name: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_secure: boolean | null
          smtp_username: string | null
          updated_at: string | null
          webhook_secret: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          email_provider?: string
          id?: string
          imap_email?: string | null
          imap_enabled?: boolean | null
          imap_host?: string | null
          imap_password?: string | null
          imap_port?: number | null
          imap_secure?: boolean | null
          imap_username?: string | null
          llm_model?: string | null
          llm_provider?: string
          llm_temperature?: number | null
          provider_api_key?: string | null
          sending_domain?: string | null
          smtp_email?: string | null
          smtp_from_email?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          email_provider?: string
          id?: string
          imap_email?: string | null
          imap_enabled?: boolean | null
          imap_host?: string | null
          imap_password?: string | null
          imap_port?: number | null
          imap_secure?: boolean | null
          imap_username?: string | null
          llm_model?: string | null
          llm_provider?: string
          llm_temperature?: number | null
          provider_api_key?: string | null
          sending_domain?: string | null
          smtp_email?: string | null
          smtp_from_email?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          ai_outreach_enabled: boolean | null
          auto_paused: boolean | null
          contacts_limit: number | null
          created_at: string
          custom_domain: string | null
          daily_send_limit: number | null
          discovery_enabled: boolean | null
          enrichment_enabled: boolean | null
          hourly_send_limit: number | null
          id: string
          is_active: boolean
          is_paused: boolean | null
          last_activity_at: string | null
          leads_limit: number | null
          logo_url: string | null
          name: string
          owner_email: string
          owner_name: string | null
          phone: string | null
          plan: string
          seats: number | null
          slug: string
          stripe_customer_id: string | null
          subscription_expires_at: string | null
          subscription_status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          ai_outreach_enabled?: boolean | null
          auto_paused?: boolean | null
          contacts_limit?: number | null
          created_at?: string
          custom_domain?: string | null
          daily_send_limit?: number | null
          discovery_enabled?: boolean | null
          enrichment_enabled?: boolean | null
          hourly_send_limit?: number | null
          id?: string
          is_active?: boolean
          is_paused?: boolean | null
          last_activity_at?: string | null
          leads_limit?: number | null
          logo_url?: string | null
          name: string
          owner_email: string
          owner_name?: string | null
          phone?: string | null
          plan?: string
          seats?: number | null
          slug: string
          stripe_customer_id?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          ai_outreach_enabled?: boolean | null
          auto_paused?: boolean | null
          contacts_limit?: number | null
          created_at?: string
          custom_domain?: string | null
          daily_send_limit?: number | null
          discovery_enabled?: boolean | null
          enrichment_enabled?: boolean | null
          hourly_send_limit?: number | null
          id?: string
          is_active?: boolean
          is_paused?: boolean | null
          last_activity_at?: string | null
          leads_limit?: number | null
          logo_url?: string | null
          name?: string
          owner_email?: string
          owner_name?: string | null
          phone?: string | null
          plan?: string
          seats?: number | null
          slug?: string
          stripe_customer_id?: string | null
          subscription_expires_at?: string | null
          subscription_status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          brand_id: string | null
          client_id: string | null
          created_at: string
          description: string | null
          domain: string
          enrichment_data: Json | null
          enrichment_error: string | null
          enrichment_source: string | null
          enrichment_status: string | null
          id: string
          industry: string | null
          last_contacted_at: string | null
          linkedin_url: string | null
          location: string | null
          name: string
          revenue_range: string | null
          size: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          brand_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          domain: string
          enrichment_data?: Json | null
          enrichment_error?: string | null
          enrichment_source?: string | null
          enrichment_status?: string | null
          id?: string
          industry?: string | null
          last_contacted_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          name: string
          revenue_range?: string | null
          size?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          brand_id?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          domain?: string
          enrichment_data?: Json | null
          enrichment_error?: string | null
          enrichment_source?: string | null
          enrichment_status?: string | null
          id?: string
          industry?: string | null
          last_contacted_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string
          revenue_range?: string | null
          size?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_events: {
        Row: {
          brand_id: string | null
          company_id: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
        }
        Insert: {
          brand_id?: string | null
          company_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
        }
        Update: {
          brand_id?: string | null
          company_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      discovered_companies: {
        Row: {
          brand_id: string
          client_id: string | null
          confidence: number | null
          dead_letter: boolean | null
          discovered_at: string
          domain: string
          enrichment_error: string | null
          enrichment_reasoning: Json | null
          enrichment_source: string | null
          enrichment_status: string | null
          enrichment_attempts: number | null
          error: string | null
          fit_reason: string | null
          id: string
          ingested: boolean | null
          intent_score: number | null
          name: string | null
          next_attempt_at: string | null
          processed: boolean | null
          raw_payload: Json | null
          relevance_score: number | null
          requires_enrichment: boolean | null
          retry_count: number | null
          risk: string | null
          signal_type: string | null
          source_id: string | null
          source_name: string | null
          summary: string | null
          updated_at: string | null
          urgency_score: number | null
          website: string | null
        }
        Insert: {
          brand_id: string
          client_id?: string | null
          confidence?: number | null
          dead_letter?: boolean | null
          discovered_at?: string
          domain: string
          enrichment_error?: string | null
          enrichment_reasoning?: Json | null
          enrichment_source?: string | null
          enrichment_status?: string | null
          enrichment_attempts?: number | null
          error?: string | null
          fit_reason?: string | null
          id?: string
          ingested?: boolean | null
          intent_score?: number | null
          name?: string | null
          next_attempt_at?: string | null
          processed?: boolean | null
          raw_payload?: Json | null
          relevance_score?: number | null
          requires_enrichment?: boolean | null
          retry_count?: number | null
          risk?: string | null
          signal_type?: string | null
          source_id?: string | null
          source_name?: string | null
          summary?: string | null
          updated_at?: string | null
          urgency_score?: number | null
          website?: string | null
        }
        Update: {
          brand_id?: string
          client_id?: string | null
          confidence?: number | null
          dead_letter?: boolean | null
          discovered_at?: string
          domain?: string
          enrichment_error?: string | null
          enrichment_reasoning?: Json | null
          enrichment_source?: string | null
          enrichment_status?: string | null
          enrichment_attempts?: number | null
          error?: string | null
          fit_reason?: string | null
          id?: string
          ingested?: boolean | null
          intent_score?: number | null
          name?: string | null
          next_attempt_at?: string | null
          processed?: boolean | null
          raw_payload?: Json | null
          relevance_score?: number | null
          requires_enrichment?: boolean | null
          retry_count?: number | null
          risk?: string | null
          signal_type?: string | null
          source_id?: string | null
          source_name?: string | null
          summary?: string | null
          updated_at?: string | null
          urgency_score?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discovered_companies_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovered_companies_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "brand_discovery_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      discovered_contacts: {
        Row: {
          brand_id: string
          client_id: string | null
          confidence: number | null
          created_at: string
          dead_letter: boolean | null
          discovered_company_id: string | null
          domain: string | null
          email: string | null
          enrichment_attempts: number | null
          enrichment_error: string | null
          enrichment_reasoning: Json | null
          enrichment_source: string | null
          enrichment_status: string | null
          error: string | null
          first_name: string | null
          full_name: string | null
          id: string
          ingested: boolean | null
          intent_score: number | null
          last_name: string | null
          linkedin_url: string | null
          next_attempt_at: string | null
          processed: boolean | null
          raw_payload: Json | null
          requires_enrichment: boolean | null
          retry_count: number | null
          risk: string | null
          source_id: string | null
          title: string | null
        }
        Insert: {
          brand_id: string
          client_id?: string | null
          confidence?: number | null
          created_at?: string
          dead_letter?: boolean | null
          discovered_company_id?: string | null
          domain?: string | null
          email?: string | null
          enrichment_attempts?: number | null
          enrichment_error?: string | null
          enrichment_reasoning?: Json | null
          enrichment_source?: string | null
          enrichment_status?: string | null
          error?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          ingested?: boolean | null
          intent_score?: number | null
          last_name?: string | null
          linkedin_url?: string | null
          next_attempt_at?: string | null
          processed?: boolean | null
          raw_payload?: Json | null
          requires_enrichment?: boolean | null
          retry_count?: number | null
          risk?: string | null
          source_id?: string | null
          title?: string | null
        }
        Update: {
          brand_id?: string
          client_id?: string | null
          confidence?: number | null
          created_at?: string
          dead_letter?: boolean | null
          discovered_company_id?: string | null
          domain?: string | null
          email?: string | null
          enrichment_attempts?: number | null
          enrichment_error?: string | null
          enrichment_reasoning?: Json | null
          enrichment_source?: string | null
          enrichment_status?: string | null
          error?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          ingested?: boolean | null
          intent_score?: number | null
          last_name?: string | null
          linkedin_url?: string | null
          next_attempt_at?: string | null
          processed?: boolean | null
          raw_payload?: Json | null
          requires_enrichment?: boolean | null
          retry_count?: number | null
          risk?: string | null
          source_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discovered_contacts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovered_contacts_discovered_company_id_fkey"
            columns: ["discovered_company_id"]
            isOneToOne: false
            referencedRelation: "discovered_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovered_contacts_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "brand_discovery_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          brand_id: string | null
          client_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          brand_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          brand_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_import_batches: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          imported_count: number
          product: string
          source: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          imported_count: number
          product: string
          source: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          imported_count?: number
          product?: string
          source?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          brand_id: string | null
          client_id: string
          company_id: string | null
          created_at: string
          email: string | null
          enrichment_data: Json | null
          first_name: string | null
          id: string
          last_name: string | null
          linkedin_url: string | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          client_id: string
          company_id?: string | null
          created_at?: string
          email?: string | null
          enrichment_data?: Json | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          client_id?: string
          company_id?: string | null
          created_at?: string
          email?: string | null
          enrichment_data?: Json | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          linkedin_url?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach: {
        Row: {
          body: string | null
          brand_id: string
          client_id: string | null
          company_id: string
          created_at: string
          id: string
          message_id: string | null
          sent_at: string | null
          state_updated_at: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          brand_id: string
          client_id?: string | null
          company_id: string
          created_at?: string
          id?: string
          message_id?: string | null
          sent_at?: string | null
          state_updated_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          brand_id?: string
          client_id?: string | null
          company_id?: string
          created_at?: string
          id?: string
          message_id?: string | null
          sent_at?: string | null
          state_updated_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          burst: number | null
          client_id: string | null
          created_at: string | null
          endpoint: string
          id: string
          requests_per_minute: number | null
          updated_at: string | null
        }
        Insert: {
          burst?: number | null
          client_id?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          requests_per_minute?: number | null
          updated_at?: string | null
        }
        Update: {
          burst?: number | null
          client_id?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          requests_per_minute?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      replies: {
        Row: {
          analyzed_at: string | null
          brand_id: string
          client_id: string | null
          company_id: string
          confidence: number | null
          created_at: string | null
          id: string
          intent: string | null
          meeting_requested: boolean | null
          message_id: string | null
          objection_detected: boolean | null
          raw_message: string | null
          sentiment: string | null
          summary: string | null
        }
        Insert: {
          analyzed_at?: string | null
          brand_id: string
          client_id?: string | null
          company_id: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          intent?: string | null
          meeting_requested?: boolean | null
          message_id?: string | null
          objection_detected?: boolean | null
          raw_message?: string | null
          sentiment?: string | null
          summary?: string | null
        }
        Update: {
          analyzed_at?: string | null
          brand_id?: string
          client_id?: string | null
          company_id?: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          intent?: string | null
          meeting_requested?: boolean | null
          message_id?: string | null
          objection_detected?: boolean | null
          raw_message?: string | null
          sentiment?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "replies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      research: {
        Row: {
          automation_maturity: string | null
          brand_id: string
          budget: string | null
          business_model: string | null
          company_id: string
          competitors: string | null
          content_strategy: string | null
          created_at: string
          current_tools: string | null
          decision_makers: Json | null
          funding: string | null
          growth_stage: string | null
          hiring_signals: Json | null
          id: string
          industry_trends: string | null
          key_pain_points: string | null
          leadership: Json | null
          recent_news: Json | null
          tech_stack: string | null
          updated_at: string
        }
        Insert: {
          automation_maturity?: string | null
          brand_id: string
          budget?: string | null
          business_model?: string | null
          company_id: string
          competitors?: string | null
          content_strategy?: string | null
          created_at?: string
          current_tools?: string | null
          decision_makers?: Json | null
          funding?: string | null
          growth_stage?: string | null
          hiring_signals?: Json | null
          id?: string
          industry_trends?: string | null
          key_pain_points?: string | null
          leadership?: Json | null
          recent_news?: Json | null
          tech_stack?: string | null
          updated_at?: string
        }
        Update: {
          automation_maturity?: string | null
          brand_id?: string
          budget?: string | null
          business_model?: string | null
          company_id?: string
          competitors?: string | null
          content_strategy?: string | null
          created_at?: string
          current_tools?: string | null
          decision_makers?: Json | null
          funding?: string | null
          growth_stage?: string | null
          hiring_signals?: Json | null
          id?: string
          industry_trends?: string | null
          key_pain_points?: string | null
          leadership?: Json | null
          recent_news?: Json | null
          tech_stack?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_messages: {
        Row: {
          body: string | null
          bounced_at: string | null
          brand_id: string | null
          clicked_at: string | null
          client_id: string | null
          company_id: string | null
          created_at: string
          delivered_at: string | null
          direction: string
          error_message: string | null
          failed_at: string | null
          from_email: string | null
          id: string
          lead_id: string | null
          message_key: string
          metadata: Json | null
          opened_at: string | null
          sent_at: string | null
          smtp_message_id: string | null
          status: string
          subject: string | null
          to_email: string | null
        }
        Insert: {
          body?: string | null
          bounced_at?: string | null
          brand_id?: string | null
          clicked_at?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction: string
          error_message?: string | null
          failed_at?: string | null
          from_email?: string | null
          id?: string
          lead_id?: string | null
          message_key: string
          metadata?: Json | null
          opened_at?: string | null
          sent_at?: string | null
          smtp_message_id?: string | null
          status?: string
          subject?: string | null
          to_email?: string | null
        }
        Update: {
          body?: string | null
          bounced_at?: string | null
          brand_id?: string | null
          clicked_at?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: string
          error_message?: string | null
          failed_at?: string | null
          from_email?: string | null
          id?: string
          lead_id?: string | null
          message_key?: string
          metadata?: Json | null
          opened_at?: string | null
          sent_at?: string | null
          smtp_message_id?: string | null
          status?: string
          subject?: string | null
          to_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sent_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sent_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          client_id: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          token: string
          user_agent: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          token: string
          user_agent?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          client_id: string
          created_at: string
          events: Json
          id: string
          is_active: boolean | null
          last_error: string | null
          last_triggered_at: string | null
          name: string
          retry_count: number | null
          retry_delay_seconds: number | null
          secret: string | null
          url: string
        }
        Insert: {
          client_id: string
          created_at?: string
          events: Json
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_triggered_at?: string | null
          name: string
          retry_count?: number | null
          retry_delay_seconds?: number | null
          secret?: string | null
          url: string
        }
        Update: {
          client_id?: string
          created_at?: string
          events?: Json
          id?: string
          is_active?: boolean | null
          last_error?: string | null
          last_triggered_at?: string | null
          name?: string
          retry_count?: number | null
          retry_delay_seconds?: number | null
          secret?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_client_id_fkey"
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
      archive_discovery_data: {
        Args: {
          p_brand_id: string
        }
        Returns: undefined
      }
      check_stale_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_dead_letters: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_claim: {
        Args: {
          p_claim_id: string
          p_company_id: string
          p_brand_id: string
          p_client_id: string
        }
        Returns: undefined
      }
      create_schema_backup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      dequeue_messages: {
        Args: Record<PropertyKey, never>
        Returns: {
          body: string
          brand_id: string
          client_id: string
          company_email: string
          company_id: string
          company_name: string
          id: string
          message_key: string
          subject: string
        }[]
      }
      detect_stuck_sending: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enqueue_draft: {
        Args: {
          p_draft_id: string
        }
        Returns: undefined
      }
      expire_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fail_delivery: {
        Args: {
          p_message_id: string
          p_error: string
        }
        Returns: undefined
      }
      get_messages_for_brand: {
        Args: {
          p_brand_id: string
        }
        Returns: {
          body: string
          created_at: string
          delivered_at: string
          direction: string
          error_message: string
          id: string
          opened_at: string
          sent_at: string
          status: string
          subject: string
          to_email: string
        }[]
      }
      health_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      mark_message_bounced: {
        Args: {
          p_message_id: string
        }
        Returns: undefined
      }
      mark_message_delivered: {
        Args: {
          p_message_id: string
        }
        Returns: undefined
      }
      mark_message_failed: {
        Args: {
          p_message_id: string
          p_error: string
        }
        Returns: undefined
      }
      mark_message_opened: {
        Args: {
          p_message_id: string
        }
        Returns: undefined
      }
      mark_message_sent: {
        Args: {
          p_message_id: string
          p_smtp_message_id: string
        }
        Returns: undefined
      }
      send_reply_notification: {
        Args: {
          p_message_key: string
          p_sender_email: string
          p_subject: string
          p_body: string
        }
        Returns: undefined
      }
      update_enrichment_progress: {
        Args: {
          p_brand_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      enrichment_state: "pending" | "locked" | "enriched" | "failed" | "dead"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      enrichment_state: ["pending", "locked", "enriched", "failed", "dead"],
    },
  },
} as const

export type Client = Database['public']['Tables']['clients']['Row']
export type ClientMember = Database['public']['Tables']['client_members']['Row']
export type ClientSettings = Database['public']['Tables']['client_settings_full']['Row'] & {
  llm_api_key?: string | null
  llm_base_url?: string | null
}
export type BrandProfile = Database['public']['Tables']['brand_profiles']['Row'] & {
  hourly_send_limit?: number | null
  llm_model_override?: string | null
  llm_temperature?: number | null
  discovery_enabled?: boolean | null
  outbound_enabled?: boolean | null
  send_enabled?: boolean | null
  is_paused?: boolean | null
  auto_paused?: boolean | null
  qualification_threshold?: number | null
  sent_count?: number | null
  bounce_count?: number | null
  complaint_count?: number | null
  deliverability_score?: number | null
  last_deliverability_check?: string | null
  imap_enabled?: boolean | null
}
export type Lead = Database['public']['Tables']['leads']['Row'] & {
  full_name?: string | null
  source?: string | null
  lead_score?: number | null
  confidence_score?: number | null
  tags?: string[] | null
  notes?: string | null
  raw_payload?: Record<string, unknown> | null
  domain?: string | null
}
export type Company = Database['public']['Tables']['companies']['Row'] & {
  employee_count?: number | null
  estimated_value?: number | null
  priority?: string | null
}
export type SentMessage = Database['public']['Tables']['sent_messages']['Row'] & {
  replied_at?: string | null
}
export type ClientWebhook = Database['public']['Tables']['webhooks']['Row'] & {
  last_status_code?: number | null
}
export type ClientApiKey = Database['public']['Tables']['api_keys']['Row']
export type BrandDiscoverySource = Database['public']['Tables']['brand_discovery_sources']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
export type DiscoveryMetric = Database['public']['Tables']['activity_logs']['Row']
export type LeadImportBatch = Database['public']['Tables']['lead_import_batches']['Row']
export type DiscoveredCompany = Database['public']['Tables']['discovered_companies']['Row']
export type DiscoveredContact = Database['public']['Tables']['discovered_contacts']['Row']

export interface BrandIntent {
  id: string
  brand_id: string
  intent: string
  signals: string[]
  priority: number
  is_active: boolean
  created_at: string
}

export const SIGNAL_TYPES = [
  'hiring',
  'funding',
  'launch',
  'pain',
  'advertising',
  'partnership',
  'tech_usage',
  'growth_activity',
  'outbound_pain',
  'automation_need',
] as const

export interface OutreachDraft {
  id: string
  brand_id: string
  company_id: string
  subject: string | null
  body: string | null
  status: 'draft' | 'draft_processing' | 'approved' | 'sent' | 'failed'
  created_at: string
  updated_at: string
}

export const LEAD_STATUSES = [
  'new',
  'researching',
  'qualified',
  'icp_passed',
  'contacted',
  'replied',
  'negotiating',
  'closed_won',
  'closed_lost'
] as const

export const ENRICHMENT_STATUSES = ['raw', 'rejected', 'approved'] as const

export const REJECTION_REASONS = [
  { value: 'Enterprise domain', label: 'Enterprise Domain', phase: 'P2', description: 'Domain in enterprise blocklist' },
  { value: 'Media/publisher domain', label: 'Media/Publisher Domain', phase: 'P2', description: 'Domain in media blocklist' },
  { value: 'Job board / recruiter domain', label: 'Job Board / Recruiter', phase: 'P2', description: 'Recruiter pattern matched' },
  { value: 'Aggregator name match', label: 'Aggregator by Name', phase: 'P2', description: 'Title contains list pattern' },
  { value: 'Aggregator domain match', label: 'Aggregator by Domain', phase: 'P2', description: 'Domain in aggregator blocklist' },
  { value: 'Not a likely real company name', label: 'Fake Company Name', phase: 'P2', description: 'Name does not look real' },
  { value: 'Keyword relevance too low', label: 'Keyword Relevance Too Low', phase: 'P2', description: 'Keyword score below 30' },
  { value: 'LLM classified as non-company', label: 'Not a Real Company (LLM)', phase: 'P3', description: 'LLM classified as non-company' },
  { value: 'News article without domain', label: 'News Article (no domain)', phase: 'P3', description: 'No explicit company domain' },
  { value: 'Enterprise description', label: 'Enterprise Description', phase: 'P4', description: 'Enterprise keywords in description' },
  { value: 'LLM scored 0 relevance', label: 'LLM Zero Relevance', phase: 'P4', description: 'LLM judged as 0 relevance' },
  { value: 'Composite score < 40', label: 'Score Too Low', phase: 'P4', description: 'Composite score below threshold' },
] as const

export const COMPANY_STATUSES = [
  'researching',
  'qualified',
  'icp_passed',
  'draft_ready',
  'contacted',
  'replied',
  'negotiating',
  'closed_won',
  'closed_lost'
] as const

export const PIPELINE_STAGES = [
  { id: 'researching', label: 'Researching', color: 'bg-blue-500' },
  { id: 'qualified', label: 'Qualified', color: 'bg-indigo-500' },
  { id: 'icp_passed', label: 'ICP Passed', color: 'bg-violet-500' },
  { id: 'draft_ready', label: 'Draft Ready', color: 'bg-purple-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-pink-500' },
  { id: 'replied', label: 'Replied', color: 'bg-orange-500' },
  { id: 'negotiating', label: 'Negotiating', color: 'bg-amber-500' },
  { id: 'closed_won', label: 'Won', color: 'bg-green-500' },
  { id: 'closed_lost', label: 'Lost', color: 'bg-red-500' }
] as const

export const MESSAGE_STATUSES = [
  'pending',
  'sent',
  'delivered',
  'opened',
  'clicked',
  'bounced',
  'failed'
] as const

export const LLM_PROVIDERS = [
  { id: 'ollama', label: 'Ollama (Local)' },
  { id: 'groq', label: 'Groq' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'cloudflare', label: 'Cloudflare Workers AI' }
] as const

export const DISCOVERY_SOURCE_TYPES = [
  { id: 'apollo', label: 'Apollo.io' },
  { id: 'apify', label: 'Apify' },
  { id: 'hunter', label: 'Hunter.io' },
  { id: 'github', label: 'GitHub' },
  { id: 'csv', label: 'CSV Import' },
  { id: 'url_scraper', label: 'URL Scraper' }
] as const

export const WEBHOOK_EVENTS = [
  { id: 'lead.created', label: 'Lead Created' },
  { id: 'lead.replied', label: 'Lead Replied' },
  { id: 'lead.bounced', label: 'Lead Bounced' },
  { id: 'lead.converted', label: 'Lead Converted' },
  { id: 'company.status_changed', label: 'Company Status Changed' },
  { id: 'discovery.completed', label: 'Discovery Completed' },
  { id: 'campaign.started', label: 'Campaign Started' }
] as const
