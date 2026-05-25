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
           discovery_api_key: string | null
           scraper_api_key: string | null
           apify_api_key: string | null
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
           contacted_at: string | null
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
       brand_intents: {
         Row: {
           id: string
           brand_id: string
           intent: string
           signals: string[]
           priority: number
           is_active: boolean
           created_at: string
         }
         Insert: Omit<Database['public']['Tables']['brand_intents']['Row'], 'id' | 'created_at'>
         Update: Partial<Database['public']['Tables']['brand_intents']['Insert']>
       }
        discovered_companies: {
          Row: {
            id: string
            brand_id: string
            source_id: string | null
            name: string | null
            website: string | null
            domain: string
            raw_payload: Record<string, unknown> | null
            processed: boolean
            ingested: boolean
            error: string | null
            discovered_at: string
            retry_count: number
            next_attempt_at: string | null
            risk: string | null
            confidence: number | null
            intent_score: number | null
            requires_enrichment: boolean
            enrichment_status: string
            enrichment_attempts: number
            last_enrichment_at: string | null
            enrichment_source: string | null
            enrichment_reasoning: Record<string, unknown> | null
            enrichment_error: string | null
            dead_letter: boolean
            updated_at: string
            client_id: string | null
            signal_type: string | null
            relevance_score: number | null
            urgency_score: number | null
            fit_reason: string | null
            summary: string | null
            source_name: string | null
          }
          Insert: Omit<Database['public']['Tables']['discovered_companies']['Row'], 'id' | 'discovered_at' | 'updated_at'>
          Update: Partial<Database['public']['Tables']['discovered_companies']['Insert']>
        }
        discovered_contacts: {
          Row: {
            id: string
            brand_id: string
            discovered_company_id: string | null
            first_name: string | null
            last_name: string | null
            full_name: string | null
            email: string | null
            title: string | null
            processed: boolean
            ingested: boolean
            error: string | null
            created_at: string
            retry_count: number
            next_attempt_at: string | null
            risk: string | null
            confidence: number | null
            intent_score: number | null
            requires_enrichment: boolean
            enrichment_status: string
            enrichment_attempts: number
            last_enrichment_at: string | null
            enrichment_source: string | null
            enrichment_reasoning: Record<string, unknown> | null
            enrichment_error: string | null
            linkedin_url: string | null
            raw_payload: Record<string, unknown> | null
            dead_letter: boolean
            source_id: string | null
            client_id: string | null
            domain: string | null
          }
          Insert: Omit<Database['public']['Tables']['discovered_contacts']['Row'], 'id' | 'created_at'>
          Update: Partial<Database['public']['Tables']['discovered_contacts']['Insert']>
        }
       system_flags: {
         Row: {
           id: string
           client_id: string
           smtp_enabled: boolean
           imap_enabled: boolean
           created_at: string
           updated_at: string
         }
         Insert: Omit<Database['public']['Tables']['system_flags']['Row'], 'id' | 'created_at'>
         Update: Partial<Database['public']['Tables']['system_flags']['Insert']>
       }
       replies: {
         Row: {
           id: string
           company_id: string
           message_id: string | null
           raw_message: string | null
           intent: string | null
           sentiment: string | null
           objection_detected: boolean | null
           meeting_requested: boolean | null
           summary: string | null
           created_at: string
           confidence: number | null
           analyzed_at: string | null
           brand_id: string
           client_id: string
         }
         Insert: Omit<Database['public']['Tables']['replies']['Row'], 'id' | 'created_at'>
         Update: Partial<Database['public']['Tables']['replies']['Insert']>
       }
       opportunities: {
         Row: {
           id: string
           brand_id: string
           intent_id: string | null
           entity_type: string
           name: string
           domain: string | null
           signal: string
           sub_signal: string | null
           source: string
           confidence: number | null
           score: number | null
           metadata: Record<string, unknown> | null
           ingested: boolean
           dead_letter: boolean
           qualification_status: string
           created_at: string
         }
         Insert: Omit<Database['public']['Tables']['opportunities']['Row'], 'id' | 'created_at'>
         Update: Partial<Database['public']['Tables']['opportunities']['Insert']>
       }
       outbound_events: {
         Row: {
           id: string
           brand_id: string
           company_id: string
           event_type: string
           message_id: string | null
           metadata: Record<string, unknown> | null
           created_at: string
         }
         Insert: Omit<Database['public']['Tables']['outbound_events']['Row'], 'id' | 'created_at'>
         Update: Partial<Database['public']['Tables']['outbound_events']['Insert']>
       }
       outreach: {
         Row: {
           id: string
           brand_id: string
           company_id: string
           subject: string | null
           body: string | null
           status: string
           sent_at: string | null
           message_id: string | null
           created_at: string
           updated_at: string
           client_id: string | null
           state_updated_at: string | null
         }
         Insert: Omit<Database['public']['Tables']['outreach']['Row'], 'id' | 'created_at'>
         Update: Partial<Database['public']['Tables']['outreach']['Insert']>
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
   api_quota_counters: {
     Row: {
       id: string
       client_id: string
       quota_type: string
       count: number
       reset_at: string
       created_at: string
       updated_at: string
     }
     Insert: Omit<Database['public']['Tables']['api_quota_counters']['Row'], 'id' | 'created_at' | 'updated_at'>
     Update: Partial<Database['public']['Tables']['api_quota_counters']['Insert']>
   }
   api_rate_limit: {
     Row: {
       id: string
       client_id: string
       endpoint: string
       requests_per_minute: number
       burst: number
       created_at: string
       updated_at: string
     }
     Insert: Omit<Database['public']['Tables']['api_rate_limit']['Row'], 'id' | 'created_at' | 'updated_at'>
     Update: Partial<Database['public']['Tables']['api_rate_limit']['Insert']>
   }
   api_usage_logs: {
     Row: {
       id: string
       client_id: string
       endpoint: string
       method: string
       status_code: number | null
       response_time_ms: number | null
       timestamp: string
     }
     Insert: Omit<Database['public']['Tables']['api_usage_logs']['Row'], 'id' | 'timestamp'>
     Update: Partial<Database['public']['Tables']['api_usage_logs']['Insert']>
   }
   audit_logs: {
     Row: {
       id: string
       user_id: string | null
       action: string
       table_name: string | null
       record_id: string | null
       changes: Record<string, unknown> | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
   }
   blacklist: {
     Row: {
       id: string
       client_id: string
       email: string
       reason: string | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['blacklist']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['blacklist']['Insert']>
   }
   brand_profiles_backup: {
     Row: {
       id: string
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
       discovery_api_key: string | null
       scraper_api_key: string | null
       apify_api_key: string | null
     }
     Insert: Omit<Database['public']['Tables']['brand_profiles_backup']['Row'], 'id' | 'created_at' | 'updated_at'>
     Update: Partial<Database['public']['Tables']['brand_profiles_backup']['Insert']>
   }
   campaign_analytics: {
     Row: {
       id: string
       brand_id: string
       date: string
       emails_sent: number
       emails_opened: number
       emails_clicked: number
       replies_received: number
       meetings_booked: number
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['campaign_analytics']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['campaign_analytics']['Insert']>
   }
   circuit_breaker_state: {
     Row: {
       id: string
       service_name: string
       failure_count: number
       last_failure_time: string | null
       state: string
       created_at: string
       updated_at: string
     }
     Insert: Omit<Database['public']['Tables']['circuit_breaker_state']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['circuit_breaker_state']['Insert']>
   }
   client_daily_send: {
     Row: {
       id: string
       client_id: string
       date: string
       count: number
     }
     Insert: Omit<Database['public']['Tables']['client_daily_send']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['client_daily_send']['Insert']>
   }
   client_hourly_send: {
     Row: {
       id: string
       client_id: string
       date: string
       hour: number
       count: number
     }
     Insert: Omit<Database['public']['Tables']['client_hourly_send']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['client_hourly_send']['Insert']>
   }
   daily_send_limits: {
     Row: {
       id: string
       client_id: string
       date: string
       max_emails: number
     }
     Insert: Omit<Database['public']['Tables']['daily_send_limits']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['daily_send_limits']['Insert']>
   }
   daily_send_tracker: {
     Row: {
       id: string
       client_id: string
       date: string
       sent_count: number
     }
     Insert: Omit<Database['public']['Tables']['daily_send_tracker']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['daily_send_tracker']['Insert']>
   }
   dead_letter_queue: {
     Row: {
       id: string
       failed_at: string
       payload: Record<string, unknown> | null
       error_message: string | null
       retries: number
     }
     Insert: Omit<Database['public']['Tables']['dead_letter_queue']['Row'], 'id' | 'failed_at'>
     Update: Partial<Database['public']['Tables']['dead_letter_queue']['Insert']>
   }
   dead_letters: {
     Row: {
       id: string
       original_table: string
       original_id: string
       attempted_at: string
       error_message: string | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['dead_letters']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['dead_letters']['Insert']>
   }
   discovery_dead_letters: {
     Row: {
       id: string
       source_id: string
       failed_at: string
       error_message: string | null
       raw_payload: Record<string, unknown> | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['discovery_dead_letters']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['discovery_dead_letters']['Insert']>
   }
   discovery_embeddings: {
     Row: {
       id: string
       source_id: string
       chunk_id: string
       embedding: string | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['discovery_embeddings']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['discovery_embeddings']['Insert']>
   }
   discovery_sources: {
     Row: {
       id: string
       name: string
       type: string
       is_active: boolean
       last_used_at: string | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['discovery_sources']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['discovery_sources']['Insert']>
   }
   edge_function_secrets: {
     Row: {
       id: string
       function_name: string
       key: string
       value: string | null
       created_at: string
       updated_at: string
     }
     Insert: Omit<Database['public']['Tables']['edge_function_secrets']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['edge_function_secrets']['Insert']>
   }
   email_events: {
     Row: {
       id: string
       client_id: string
       message_id: string | null
       event_type: string
       timestamp: string
     }
     Insert: Omit<Database['public']['Tables']['email_events']['Row'], 'id' | 'timestamp'>
     Update: Partial<Database['public']['Tables']['email_events']['Insert']>
   }
   enrichment_metrics: {
     Row: {
       id: string
       company_id: string
       enriched_at: string
       fields_enriched: number
       success: boolean
     }
     Insert: Omit<Database['public']['Tables']['enrichment_metrics']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['enrichment_metrics']['Insert']>
   }
   inbound_events: {
     Row: {
       id: string
       brand_id: string
       type: string
       payload: Record<string, unknown> | null
       processed_at: string | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['inbound_events']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['inbound_events']['Insert']>
   }
   inbound_message_claims: {
     Row: {
       id: string
       message_id: string
       claimed_by: string | null
       claimed_at: string | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['inbound_message_claims']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['inbound_message_claims']['Insert']>
   }
   lead_company_map: {
     Row: {
       id: string
       lead_id: string
       company_id: string
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['lead_company_map']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['lead_company_map']['Insert']>
   }
   messages: {
     Row: {
       id: string
       lead_id: string | null
       subject: string | null
       body: string | null
       message_id: string | null
       direction: string
       from_email: string | null
       to_email: string | null
       status: string
       sent_at: string | null
       error: string | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['messages']['Insert']>
   }
   negotiation_drafts: {
     Row: {
       id: string
       lead_id: string | null
       brand_id: string | null
       subject: string | null
       body: string | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['negotiation_drafts']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['negotiation_drafts']['Insert']>
   }
   notification_preferences: {
     Row: {
       id: string
       client_id: string
       email_notifications: boolean
       sms_notifications: boolean
       in_app_notifications: boolean
       created_at: string
       updated_at: string
     }
     Insert: Omit<Database['public']['Tables']['notification_preferences']['Row'], 'id' | 'created_at' | 'updated_at'>
     Update: Partial<Database['public']['Tables']['notification_preferences']['Insert']>
   }
   qualification: {
     Row: {
       id: string
       company_id: string
       fit_score: number | null
       recommended_product: string | null
       reasoning: string | null
       confidence: number | null
       created_at: string
       brand_id: string
       client_id: string
     }
     Insert: Omit<Database['public']['Tables']['qualification']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['qualification']['Insert']>
   }
   research: {
     Row: {
       id: string
       brand_id: string
       query: string
       result: Record<string, unknown> | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['research']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['research']['Insert']>
   }
   send_counters: {
     Row: {
       id: string
       product: string
       counter_type: string
       bucket_start: string
       send_count: number
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['send_counters']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['send_counters']['Insert']>
   }
   sending_domains: {
     Row: {
       id: string
       domain: string
       is_verified: boolean
       verification_token: string | null
       verification_expires_at: string | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['sending_domains']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['sending_domains']['Insert']>
   }
   signal_performance: {
     Row: {
       id: string
       signal_type: string
       success_rate: number | null
       total_used: number
       successful_uses: number
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['signal_performance']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['signal_performance']['Insert']>
   }
   signal_source_performance: {
     Row: {
       id: string
       signal_type: string
       source: string
       success_rate: number | null
       total_used: number
       successful_uses: number
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['signal_source_performance']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['signal_source_performance']['Insert']>
   }
   suppression_list: {
     Row: {
       id: string
       email: string
       reason: string | null
       created_at: string
     }
     Insert: Omit<Database['public']['Tables']['suppression_list']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['suppression_list']['Insert']>
   }
   system_health: {
     Row: {
       id: string
       check_name: string
       status: string
       message: string | null
       check_time: string
     }
     Insert: Omit<Database['public']['Tables']['system_health']['Row'], 'id' | 'created_at'>
     Update: Partial<Database['public']['Tables']['system_health']['Insert']>
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

export const ENRICHMENT_STATUSES = ['pending', 'processing', 'enriched', 'failed', 'dead'] as const

export const REJECTION_REASONS = [
  { value: 'enterprise_domain', label: 'Enterprise Domain', phase: 'P2', description: 'Domain in enterprise blocklist' },
  { value: 'media_domain', label: 'Media/Social Domain', phase: 'P2', description: 'Domain in media blocklist' },
  { value: 'job_board', label: 'Job Board', phase: 'P2', description: 'Recruiter pattern matched' },
  { value: 'aggregator_name', label: 'Listicle/Aggregator', phase: 'P2', description: 'Title contains list pattern' },
  { value: 'no_mx', label: 'No MX Records', phase: 'P2', description: 'Domain has no email infrastructure' },
  { value: 'no_dns', label: 'No DNS Resolution', phase: 'P2', description: 'Domain does not resolve' },
  { value: 'fake_name', label: 'Fake Company Name', phase: 'P2', description: 'Name does not look real' },
  { value: 'llm_non_company', label: 'Not a Real Company (LLM)', phase: 'P3', description: 'LLM classified as non-company' },
  { value: 'news_no_domain', label: 'News Article (no domain)', phase: 'P3', description: 'No explicit company domain' },
  { value: 'llm_no_name', label: 'No Company Name (LLM)', phase: 'P3', description: 'LLM could not extract name' },
  { value: 'listicle_name', label: 'Listicle Name Pattern', phase: 'P3', description: 'Name matches listicle pattern' },
  { value: 'low_score', label: 'Score Too Low', phase: 'P4', description: 'Composite score below threshold' },
  { value: 'enterprise_desc', label: 'Enterprise Description', phase: 'P4', description: 'Enterprise keywords in description' },
  { value: 'llm_zero_score', label: 'LLM Zero Relevance', phase: 'P4', description: 'LLM judged as 0 relevance' },
  { value: 'max_retries', label: 'Max Retries Reached', phase: 'Enrich', description: 'Enrichment exhausted retries' },
  { value: 'enrichment_failed', label: 'Enrichment Failed', phase: 'Enrich', description: 'No strategy found contacts' },
  { value: 'low_confidence', label: 'Low Confidence', phase: 'Enrich', description: 'Contact confidence below 0.3' },
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
