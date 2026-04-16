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

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          slug: string
          plan: string
          owner_email: string
          owner_name: string | null
          phone: string | null
          logo_url: string | null
          website: string | null
          seats: number
          daily_send_limit: number
          hourly_send_limit: number
          leads_limit: number
          contacts_limit: number
          discovery_enabled: boolean
          enrichment_enabled: boolean
          ai_outreach_enabled: boolean
          custom_domain: string | null
          stripe_customer_id: string | null
          subscription_status: string
          subscription_expires_at: string | null
          is_active: boolean
          is_paused: boolean
          auto_paused: boolean
          created_at: string
          updated_at: string
          last_activity_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      client_members: {
        Row: {
          id: string
          client_id: string
          email: string
          name: string | null
          role: 'owner' | 'admin' | 'member'
          password_hash: string | null
          invite_token: string | null
          invited_at: string | null
          joined_at: string | null
          last_login_at: string | null
          is_active: boolean
          created_at: string
          user_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['client_members']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['client_members']['Insert']>
      }
      client_settings: {
        Row: {
          id: string
          client_id: string
          smtp_host: string | null
          smtp_port: number | null
          smtp_secure: boolean
          smtp_email: string | null
          smtp_password: string | null
          smtp_from_name: string | null
          smtp_from_email: string | null
          imap_host: string | null
          imap_port: number | null
          imap_secure: boolean
          imap_email: string | null
          imap_password: string | null
          imap_enabled: boolean
          email_provider: string
          provider_api_key: string | null
          sending_domain: string | null
          webhook_secret: string | null
          llm_provider: string
          llm_model: string | null
          llm_temperature: number
          llm_base_url: string | null
          llm_api_key: string | null
          config: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['client_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['client_settings']['Insert']>
      }
      brand_profiles: {
        Row: {
          id: string
          client_id: string | null
          product: string
          brand_name: string
          positioning: string | null
          core_offer: string | null
          tone: string | null
          audience: string | null
          objection_guidelines: string | null
          negotiation_style: string | null
          smtp_host: string | null
          smtp_port: number | null
          smtp_secure: boolean
          smtp_email: string | null
          smtp_password: string | null
          imap_host: string | null
          imap_port: number | null
          imap_secure: boolean
          imap_email: string | null
          imap_password: string | null
          provider: string
          provider_api_key: string | null
          sending_domain: string | null
          webhook_secret: string | null
          transport_mode: string
          reply_to_email: string | null
          signature_block: string | null
          daily_send_limit: number | null
          hourly_send_limit: number | null
          llm_model_override: string | null
          llm_temperature: number | null
          is_active: boolean
          is_paused: boolean
          auto_paused: boolean
          imap_enabled: boolean
          send_enabled: boolean
          bounce_count: number
          sent_count: number
          complaint_count: number
          deliverability_score: number | null
          last_deliverability_check: string | null
          discovery_enabled: boolean
          discovery_daily_limit: number
          discovery_count_today: number
          last_discovery_date: string | null
          outbound_enabled: boolean
          manual_discovery_requested: boolean
          qualification_threshold: number
          created_at: string
          updated_at: string
          email_signature: string | null
          auto_reply_enabled: boolean
          warmup_enabled: boolean
        }
        Insert: Omit<Database['public']['Tables']['brand_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['brand_profiles']['Insert']>
      }
      leads: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          full_name: string | null
          email: string | null
          domain: string | null
          title: string | null
          linkedin_url: string | null
          source: string
          source_id: string | null
          raw_payload: Record<string, unknown> | null
          status: string
          created_at: string
          updated_at: string
          lead_score: number | null
          confidence_score: number | null
          rejection_reason: string | null
          score_breakdown: Record<string, unknown> | null
          conversion_value: number
          deal_value: number | null
          closed_at: string | null
          icp_version: string | null
          scoring_version: string | null
          company_id: string | null
          scoring_version_id: string | null
          brand_id: string
          retry_count: number
          next_attempt_at: string | null
          last_error: string | null
          next_retry_at: string | null
          state_updated_at: string
          bounce_count: number
          reply_count: number
          last_outcome_at: string | null
          client_id: string | null
          notes: string | null
          tags: string[]
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      companies: {
        Row: {
          id: string
          name: string
          website: string | null
          domain: string | null
          status: string
          created_at: string
          updated_at: string
          source: string | null
          source_id: string | null
          linkedin_url: string | null
          employee_count: number | null
          industry: string | null
          enrichment: Record<string, unknown> | null
          confidence_score: number | null
          lead_score: number | null
          deal_value: number | null
          currency: string
          contract_length_months: number | null
          payment_model: string | null
          gross_margin: number | null
          closed_at: string | null
          lifetime_value: number | null
          brand_id: string
          retry_count: number
          next_attempt_at: string | null
          last_error: string | null
          state_updated_at: string
          client_id: string | null
          notes: string | null
          tags: string[]
          priority: string
          estimated_value: number | null
        }
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
      sent_messages: {
        Row: {
          id: string
          client_id: string | null
          brand_id: string | null
          lead_id: string | null
          company_id: string | null
          message_key: string
          smtp_message_id: string | null
          subject: string | null
          body: string | null
          direction: string
          from_email: string | null
          to_email: string | null
          status: string
          sent_at: string | null
          delivered_at: string | null
          opened_at: string | null
          clicked_at: string | null
          bounced_at: string | null
          failed_at: string | null
          error_message: string | null
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['sent_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sent_messages']['Insert']>
      }
      client_webhooks: {
        Row: {
          id: string
          client_id: string
          name: string
          url: string
          secret: string | null
          events: string[]
          is_active: boolean
          retry_count: number
          retry_delay_seconds: number
          last_triggered_at: string | null
          last_status_code: number | null
          last_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['client_webhooks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['client_webhooks']['Insert']>
      }
      client_api_keys: {
        Row: {
          id: string
          client_id: string
          name: string
          key_hash: string
          rate_limit_per_minute: number
          rate_limit_per_day: number
          last_used_at: string | null
          usage_count: number
          is_active: boolean
          expires_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['client_api_keys']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['client_api_keys']['Insert']>
      }
      brand_discovery_sources: {
        Row: {
          id: string
          brand_id: string
          name: string
          type: string
          config: Record<string, unknown> | null
          is_active: boolean
          rate_limit_per_min: number
          last_run_at: string | null
          last_status: string | null
          created_at: string
          execution_mode: string
          schedule_cron: string | null
          retry_count: number
          next_attempt_at: string | null
          is_running: boolean
          last_error: string | null
          client_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['brand_discovery_sources']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['brand_discovery_sources']['Insert']>
      }
      activity_logs: {
        Row: {
          id: string
          client_id: string | null
          brand_id: string | null
          lead_id: string | null
          company_id: string | null
          user_id: string | null
          activity_type: string
          description: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>
      }
      discovery_metrics: {
        Row: {
          id: string
          source_id: string
          executed_at: string
          companies_discovered: number
          contacts_discovered: number
          duration_ms: number | null
          success: boolean | null
          error: string | null
        }
        Insert: Omit<Database['public']['Tables']['discovery_metrics']['Row'], 'id' | 'executed_at'>
        Update: Partial<Database['public']['Tables']['discovery_metrics']['Insert']>
      }
      lead_import_batches: {
        Row: {
          id: string
          source: string
          product: string
          imported_count: number
          created_at: string
          client_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['lead_import_batches']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['lead_import_batches']['Insert']>
      }
    }
  }
}

export type Client = Database['public']['Tables']['clients']['Row']
export type ClientMember = Database['public']['Tables']['client_members']['Row']
export type ClientSettings = Database['public']['Tables']['client_settings']['Row']
export type BrandProfile = Database['public']['Tables']['brand_profiles']['Row']
export type Lead = Database['public']['Tables']['leads']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type SentMessage = Database['public']['Tables']['sent_messages']['Row']
export type ClientWebhook = Database['public']['Tables']['client_webhooks']['Row']
export type ClientApiKey = Database['public']['Tables']['client_api_keys']['Row']
export type BrandDiscoverySource = Database['public']['Tables']['brand_discovery_sources']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
export type DiscoveryMetric = Database['public']['Tables']['discovery_metrics']['Row']
export type LeadImportBatch = Database['public']['Tables']['lead_import_batches']['Row']

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
