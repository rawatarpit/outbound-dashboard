create extension if not exists "hypopg" with schema "extensions";

create extension if not exists "index_advisor" with schema "extensions";

drop extension if exists "pg_net";

create extension if not exists "citext" with schema "public";

create extension if not exists "vector" with schema "public";

create type "public"."enrichment_state" as enum ('pending', 'locked', 'enriched', 'failed', 'dead');


  create table "public"."activity_logs" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "brand_id" uuid,
    "lead_id" uuid,
    "company_id" uuid,
    "user_id" uuid,
    "activity_type" text not null,
    "description" text,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."activity_logs" enable row level security;


  create table "public"."api_quota_counters" (
    "id" uuid not null default gen_random_uuid(),
    "source_id" uuid not null,
    "window_start" timestamp with time zone not null,
    "request_count" integer not null default 0
      );


alter table "public"."api_quota_counters" enable row level security;


  create table "public"."api_rate_limit" (
    "id" uuid not null default gen_random_uuid(),
    "api_key_id" uuid not null,
    "window_start" timestamp with time zone not null default date_trunc('minute'::text, now()),
    "request_count" integer not null default 0
      );


alter table "public"."api_rate_limit" enable row level security;


  create table "public"."api_usage_logs" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "api_key_id" uuid,
    "endpoint" text not null,
    "method" text not null,
    "status_code" integer,
    "response_time_ms" integer,
    "rate_limited" boolean default false,
    "ip_address" inet,
    "user_agent" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."api_usage_logs" enable row level security;


  create table "public"."audit_logs" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "actor_id" text,
    "actor_email" text,
    "actor_type" text default 'system'::text,
    "action" text not null,
    "resource_type" text,
    "resource_id" text,
    "changes" jsonb,
    "metadata" jsonb,
    "ip_address" inet,
    "user_agent" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."audit_logs" enable row level security;


  create table "public"."blacklist" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "domain" text,
    "email" public.citext,
    "reason" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."blacklist" enable row level security;


  create table "public"."brand_discovery_sources" (
    "id" uuid not null default gen_random_uuid(),
    "brand_id" uuid not null,
    "name" text not null,
    "type" text not null,
    "config" jsonb,
    "is_active" boolean default true,
    "rate_limit_per_min" integer default 10,
    "last_run_at" timestamp with time zone,
    "last_status" text,
    "created_at" timestamp with time zone default now(),
    "execution_mode" text default 'pull'::text,
    "schedule_cron" text,
    "retry_count" integer not null default 0,
    "next_attempt_at" timestamp with time zone,
    "is_running" boolean not null default false,
    "last_error" text,
    "client_id" uuid
      );


alter table "public"."brand_discovery_sources" enable row level security;


  create table "public"."brand_intents" (
    "id" uuid not null default gen_random_uuid(),
    "brand_id" uuid not null,
    "intent" text not null,
    "signals" jsonb not null default '[]'::jsonb,
    "priority" integer default 1,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."brand_intents" enable row level security;


  create table "public"."brand_profiles" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "product" text not null,
    "brand_name" text not null,
    "positioning" text,
    "core_offer" text,
    "tone" text,
    "audience" text,
    "objection_guidelines" text,
    "negotiation_style" text,
    "smtp_host" text,
    "smtp_port" integer,
    "smtp_secure" boolean default false,
    "smtp_email" text,
    "smtp_password" text,
    "imap_host" text,
    "imap_port" integer,
    "imap_secure" boolean default false,
    "imap_email" text,
    "imap_password" text,
    "provider" text default 'smtp'::text,
    "provider_api_key" text,
    "sending_domain" text,
    "webhook_secret" text,
    "transport_mode" text default 'mailbox'::text,
    "reply_to_email" text,
    "signature_block" text,
    "daily_send_limit" integer,
    "hourly_send_limit" integer,
    "llm_model_override" text,
    "llm_temperature" numeric,
    "is_active" boolean default true,
    "is_paused" boolean default false,
    "auto_paused" boolean default false,
    "imap_enabled" boolean default false,
    "send_enabled" boolean default true,
    "bounce_count" integer default 0,
    "sent_count" integer default 0,
    "complaint_count" integer default 0,
    "deliverability_score" numeric,
    "last_deliverability_check" timestamp with time zone,
    "discovery_enabled" boolean default false,
    "discovery_daily_limit" integer default 100,
    "discovery_count_today" integer default 0,
    "last_discovery_date" date,
    "outbound_enabled" boolean default false,
    "manual_discovery_requested" boolean default false,
    "qualification_threshold" integer default 60,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "email_signature" text,
    "auto_reply_enabled" boolean default false,
    "warmup_enabled" boolean default false,
    "discovery_api_key" text,
    "scraper_api_key" text,
    "apify_api_key" text
      );


alter table "public"."brand_profiles" enable row level security;


  create table "public"."brand_profiles_backup" (
    "id" uuid,
    "product" text,
    "brand_name" text,
    "positioning" text,
    "core_offer" text,
    "tone" text,
    "audience" text,
    "objection_guidelines" text,
    "negotiation_style" text,
    "smtp_host" text,
    "smtp_port" integer,
    "smtp_secure" boolean,
    "smtp_email" text,
    "smtp_password" text,
    "imap_host" text,
    "imap_port" integer,
    "imap_secure" boolean,
    "imap_email" text,
    "imap_password" text,
    "reply_to_email" text,
    "signature_block" text,
    "daily_send_limit" integer,
    "hourly_send_limit" integer,
    "llm_model_override" text,
    "llm_temperature" numeric,
    "is_active" boolean,
    "created_at" timestamp with time zone,
    "imap_enabled" boolean,
    "send_enabled" boolean,
    "bounce_count" integer,
    "sent_count" integer,
    "complaint_count" integer,
    "is_paused" boolean,
    "deliverability_score" numeric,
    "auto_paused" boolean,
    "last_deliverability_check" timestamp with time zone,
    "provider" text,
    "provider_api_key" text,
    "sending_domain" text,
    "webhook_secret" text,
    "transport_mode" text,
    "execution_state" text,
    "discovery_enabled" boolean,
    "outbound_enabled" boolean,
    "manual_discovery_requested" boolean,
    "client_id" uuid,
    "updated_at" timestamp with time zone
      );


alter table "public"."brand_profiles_backup" enable row level security;


  create table "public"."campaign_analytics" (
    "id" uuid not null default gen_random_uuid(),
    "brand_id" uuid,
    "campaign_name" text,
    "date" date not null,
    "sent_count" integer default 0,
    "delivered_count" integer default 0,
    "opened_count" integer default 0,
    "clicked_count" integer default 0,
    "replied_count" integer default 0,
    "bounced_count" integer default 0,
    "unsubscribed_count" integer default 0,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."campaign_analytics" enable row level security;


  create table "public"."circuit_breaker_state" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "entity_type" text not null,
    "entity_id" text not null,
    "failure_count" integer default 0,
    "last_failure_at" timestamp with time zone,
    "last_failure_reason" text,
    "state" text not null default 'closed'::text,
    "reset_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "brand_id" uuid
      );


alter table "public"."circuit_breaker_state" enable row level security;


  create table "public"."client_api_keys" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null,
    "name" text not null,
    "key_hash" text not null,
    "rate_limit_per_minute" integer not null default 60,
    "rate_limit_per_day" integer not null default 1000,
    "last_used_at" timestamp with time zone,
    "usage_count" integer not null default 0,
    "is_active" boolean not null default true,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."client_api_keys" enable row level security;


  create table "public"."client_daily_send" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null,
    "send_date" date not null default CURRENT_DATE,
    "send_count" integer not null default 0,
    "bounce_count" integer not null default 0,
    "complaint_count" integer not null default 0
      );


alter table "public"."client_daily_send" enable row level security;


  create table "public"."client_hourly_send" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null,
    "hour_bucket" timestamp with time zone not null default date_trunc('hour'::text, now()),
    "send_count" integer not null default 0
      );


alter table "public"."client_hourly_send" enable row level security;


  create table "public"."client_members" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null default auth.uid(),
    "email" text not null,
    "name" text,
    "role" text not null default 'member'::text,
    "password_hash" text,
    "invite_token" text,
    "invited_at" timestamp with time zone,
    "joined_at" timestamp with time zone,
    "last_login_at" timestamp with time zone,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid
      );


alter table "public"."client_members" enable row level security;


  create table "public"."client_settings" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null,
    "smtp_host" text,
    "smtp_port" integer,
    "smtp_secure" boolean default false,
    "smtp_email" text,
    "smtp_password" text,
    "smtp_from_name" text,
    "smtp_from_email" text,
    "imap_host" text,
    "imap_port" integer,
    "imap_secure" boolean default true,
    "imap_email" text,
    "imap_password" text,
    "imap_enabled" boolean default false,
    "email_provider" text default 'smtp'::text,
    "provider_api_key" text,
    "sending_domain" text,
    "webhook_secret" text,
    "llm_provider" text default 'ollama'::text,
    "llm_model" text,
    "llm_temperature" numeric default 0.7,
    "llm_base_url" text,
    "config" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "llm_api_key" text
      );


alter table "public"."client_settings" enable row level security;


  create table "public"."client_webhooks" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null,
    "name" text not null,
    "url" text not null,
    "secret" text,
    "events" text[] not null default ARRAY['lead.created'::text, 'lead.replied'::text, 'lead.bounced'::text, 'lead.converted'::text],
    "is_active" boolean not null default true,
    "retry_count" integer default 3,
    "retry_delay_seconds" integer default 60,
    "last_triggered_at" timestamp with time zone,
    "last_status_code" integer,
    "last_error" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."client_webhooks" enable row level security;


  create table "public"."clients" (
    "id" uuid not null default auth.uid(),
    "name" text not null,
    "slug" text not null,
    "plan" text not null default 'starter'::text,
    "owner_email" text not null,
    "owner_name" text,
    "phone" text,
    "logo_url" text,
    "website" text,
    "seats" integer not null default 1,
    "daily_send_limit" integer not null default 50,
    "hourly_send_limit" integer not null default 20,
    "leads_limit" integer not null default 1000,
    "contacts_limit" integer not null default 5000,
    "discovery_enabled" boolean not null default true,
    "enrichment_enabled" boolean not null default true,
    "ai_outreach_enabled" boolean not null default true,
    "custom_domain" text,
    "stripe_customer_id" text,
    "subscription_status" text default 'active'::text,
    "subscription_expires_at" timestamp with time zone,
    "is_active" boolean not null default true,
    "is_paused" boolean not null default false,
    "auto_paused" boolean not null default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "last_activity_at" timestamp with time zone
      );


alter table "public"."clients" enable row level security;


  create table "public"."companies" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "name" text not null,
    "website" text,
    "domain" text,
    "status" text not null default 'researching'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "source" text,
    "source_id" text,
    "linkedin_url" text,
    "employee_count" integer,
    "industry" text,
    "enrichment" jsonb,
    "confidence_score" numeric,
    "lead_score" numeric,
    "deal_value" numeric,
    "currency" text default 'INR'::text,
    "contract_length_months" integer,
    "payment_model" text,
    "gross_margin" numeric,
    "closed_at" timestamp with time zone,
    "lifetime_value" numeric,
    "brand_id" uuid not null,
    "retry_count" integer default 0,
    "next_attempt_at" timestamp with time zone default now(),
    "last_error" text,
    "state_updated_at" timestamp with time zone not null default now(),
    "client_id" uuid,
    "notes" text,
    "tags" text[] default '{}'::text[],
    "priority" text default 'medium'::text,
    "estimated_value" numeric,
    "enrichment_attempts" integer default 0
      );


alter table "public"."companies" enable row level security;


  create table "public"."daily_send_limits" (
    "product" text not null,
    "send_date" date not null,
    "sent_count" integer default 0
      );


alter table "public"."daily_send_limits" enable row level security;


  create table "public"."daily_send_tracker" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "product" text not null,
    "send_date" date not null default CURRENT_DATE,
    "send_count" integer default 0,
    "created_at" timestamp with time zone default now(),
    "brand_id" uuid not null
      );


alter table "public"."daily_send_tracker" enable row level security;


  create table "public"."dead_letter_queue" (
    "id" uuid not null default gen_random_uuid(),
    "entity_type" text not null,
    "entity_id" uuid not null,
    "reason" text,
    "payload" jsonb,
    "created_at" timestamp with time zone default now(),
    "client_id" uuid
      );


alter table "public"."dead_letter_queue" enable row level security;


  create table "public"."dead_letters" (
    "id" uuid not null default gen_random_uuid(),
    "brand_id" uuid,
    "entity_type" text not null,
    "entity_id" uuid not null,
    "failure_stage" text,
    "error_message" text,
    "error_payload" jsonb,
    "retry_count" integer not null default 0,
    "last_attempt_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "resolved" boolean not null default false,
    "client_id" uuid,
    "failed_at" timestamp with time zone default now()
      );


alter table "public"."dead_letters" enable row level security;


  create table "public"."discovered_companies" (
    "id" uuid not null default gen_random_uuid(),
    "brand_id" uuid not null,
    "source_id" uuid,
    "name" text,
    "website" text,
    "domain" text not null,
    "raw_payload" jsonb,
    "processed" boolean default false,
    "ingested" boolean default false,
    "error" text,
    "discovered_at" timestamp with time zone default now(),
    "retry_count" integer not null default 0,
    "next_attempt_at" timestamp with time zone,
    "risk" text,
    "confidence" numeric(4,3),
    "intent_score" numeric(4,3),
    "requires_enrichment" boolean default false,
    "enrichment_status" text default 'pending'::text,
    "enrichment_attempts" integer default 0,
    "last_enrichment_at" timestamp with time zone,
    "enrichment_source" text,
    "enrichment_reasoning" jsonb,
    "enrichment_error" text,
    "dead_letter" boolean default false,
    "updated_at" timestamp with time zone default now(),
    "client_id" uuid,
    "signal_type" text,
    "relevance_score" numeric,
    "urgency_score" numeric,
    "fit_reason" text,
    "summary" text,
    "source_name" text
      );


alter table "public"."discovered_companies" enable row level security;


  create table "public"."discovered_contacts" (
    "id" uuid not null default gen_random_uuid(),
    "brand_id" uuid not null,
    "discovered_company_id" uuid,
    "first_name" text,
    "last_name" text,
    "full_name" text,
    "email" text,
    "title" text,
    "processed" boolean default false,
    "ingested" boolean default false,
    "error" text,
    "created_at" timestamp with time zone default now(),
    "retry_count" integer not null default 0,
    "next_attempt_at" timestamp with time zone,
    "risk" text,
    "confidence" numeric(4,3),
    "intent_score" numeric(4,3),
    "requires_enrichment" boolean default false,
    "enrichment_status" text default 'pending'::text,
    "enrichment_attempts" integer default 0,
    "last_enrichment_at" timestamp with time zone,
    "enrichment_source" text,
    "enrichment_reasoning" jsonb,
    "enrichment_error" text,
    "linkedin_url" text,
    "raw_payload" jsonb,
    "dead_letter" boolean default false,
    "source_id" uuid,
    "client_id" uuid,
    "domain" text
      );


alter table "public"."discovered_contacts" enable row level security;


  create table "public"."discovery_dead_letters" (
    "id" uuid not null default gen_random_uuid(),
    "entity_type" text not null,
    "entity_id" uuid not null,
    "source_id" uuid,
    "payload" jsonb,
    "error" text,
    "created_at" timestamp with time zone default now(),
    "client_id" uuid
      );


alter table "public"."discovery_dead_letters" enable row level security;


  create table "public"."discovery_embeddings" (
    "id" uuid not null default gen_random_uuid(),
    "brand_id" uuid,
    "intent_id" uuid,
    "content_type" text not null,
    "content_text" text not null,
    "embedding" public.vector(768) not null,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "search_vector" tsvector generated always as (to_tsvector('english'::regconfig, content_text)) stored
      );


alter table "public"."discovery_embeddings" enable row level security;


  create table "public"."discovery_metrics" (
    "id" uuid not null default gen_random_uuid(),
    "source_id" uuid not null,
    "executed_at" timestamp with time zone not null default now(),
    "companies_discovered" integer default 0,
    "contacts_discovered" integer default 0,
    "duration_ms" integer,
    "success" boolean,
    "error" text
      );


alter table "public"."discovery_metrics" enable row level security;


  create table "public"."discovery_sources" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "name" text not null,
    "provider" text not null,
    "config" jsonb,
    "rate_limit_per_hour" integer,
    "rate_limit_per_day" integer,
    "is_active" boolean default true,
    "last_run_at" timestamp with time zone,
    "next_run_at" timestamp with time zone,
    "retry_count" integer default 0,
    "error_message" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."discovery_sources" enable row level security;


  create table "public"."edge_function_secrets" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "key_name" text not null,
    "key_value" text not null,
    "description" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."edge_function_secrets" enable row level security;


  create table "public"."email_events" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "message_id" uuid,
    "event_type" text not null,
    "timestamp" timestamp with time zone not null default now(),
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."email_events" enable row level security;


  create table "public"."enrichment_metrics" (
    "id" uuid not null default gen_random_uuid(),
    "brand_id" uuid not null,
    "contact_id" uuid not null,
    "strategy" text not null,
    "llm_used" boolean default false,
    "api_used" boolean default false,
    "success" boolean not null,
    "confidence_before" numeric,
    "confidence_after" numeric,
    "duration_ms" integer,
    "error" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."enrichment_metrics" enable row level security;


  create table "public"."inbound_events" (
    "id" uuid not null default gen_random_uuid(),
    "event_id" text not null,
    "event_type" text not null,
    "brand_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."inbound_events" enable row level security;


  create table "public"."inbound_message_claims" (
    "message_id" text not null,
    "brand_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."inbound_message_claims" enable row level security;


  create table "public"."lead_company_map" (
    "lead_id" uuid not null,
    "company_id" uuid not null,
    "brand_id" uuid not null
      );


alter table "public"."lead_company_map" enable row level security;


  create table "public"."lead_import_batches" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "source" text not null,
    "product" text not null,
    "imported_count" integer default 0,
    "created_at" timestamp with time zone default now(),
    "client_id" uuid
      );


alter table "public"."lead_import_batches" enable row level security;


  create table "public"."leads" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "first_name" text,
    "last_name" text,
    "full_name" text,
    "email" text,
    "domain" text,
    "title" text,
    "linkedin_url" text,
    "source" text not null,
    "source_id" text,
    "raw_payload" jsonb,
    "status" text not null default 'new'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "lead_score" numeric,
    "confidence_score" numeric,
    "rejection_reason" text,
    "score_breakdown" jsonb,
    "conversion_value" numeric default 0,
    "deal_value" numeric,
    "closed_at" timestamp with time zone,
    "icp_version" text,
    "scoring_version" text,
    "company_id" uuid,
    "scoring_version_id" uuid,
    "brand_id" uuid not null,
    "retry_count" integer default 0,
    "next_attempt_at" timestamp with time zone default now(),
    "last_error" text,
    "next_retry_at" timestamp with time zone,
    "state_updated_at" timestamp with time zone not null default now(),
    "bounce_count" integer default 0,
    "reply_count" integer default 0,
    "last_outcome_at" timestamp with time zone,
    "client_id" uuid,
    "notes" text,
    "tags" text[] default '{}'::text[],
    "contacted_at" timestamp with time zone
      );


alter table "public"."leads" enable row level security;


  create table "public"."messages" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "lead_id" uuid,
    "subject" text,
    "body" text,
    "message_id" text,
    "direction" text,
    "created_at" timestamp with time zone default now(),
    "message_key" text,
    "retry_count" integer default 0,
    "last_error" text,
    "status" text default 'pending'::text,
    "brand_id" uuid not null,
    "client_id" uuid
      );


alter table "public"."messages" enable row level security;


  create table "public"."negotiation_drafts" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "company_id" uuid not null,
    "draft" text not null,
    "approved" boolean default false,
    "created_at" timestamp with time zone default now(),
    "brand_id" uuid not null,
    "client_id" uuid
      );


alter table "public"."negotiation_drafts" enable row level security;


  create table "public"."notification_preferences" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "client_id" uuid,
    "email_leads" boolean default true,
    "email_replies" boolean default true,
    "email_campaigns" boolean default true,
    "email_digest" boolean default true,
    "push_leads" boolean default false,
    "push_replies" boolean default true,
    "push_campaigns" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."notification_preferences" enable row level security;


  create table "public"."opportunities" (
    "id" uuid not null default gen_random_uuid(),
    "brand_id" uuid not null,
    "intent_id" uuid,
    "entity_type" text not null,
    "name" text not null,
    "domain" text,
    "signal" text not null,
    "sub_signal" text,
    "source" text not null,
    "confidence" integer default 50,
    "score" integer default 0,
    "qualification_status" text default 'new'::text,
    "metadata" jsonb default '{}'::jsonb,
    "ingested" boolean default false,
    "dead_letter" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."opportunities" enable row level security;


  create table "public"."outbound_events" (
    "id" uuid not null default gen_random_uuid(),
    "company_id" uuid not null,
    "product" text not null,
    "event_type" text not null,
    "message_id" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone default now(),
    "brand_id" uuid not null
      );


alter table "public"."outbound_events" enable row level security;


  create table "public"."outreach" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "company_id" uuid not null,
    "subject" text,
    "body" text,
    "status" text default 'draft'::text,
    "sent_at" timestamp with time zone,
    "message_id" text,
    "created_at" timestamp with time zone default now(),
    "brand_id" uuid not null,
    "client_id" uuid,
    "updated_at" timestamp with time zone default now(),
    "state_updated_at" timestamp with time zone default now()
      );


alter table "public"."outreach" enable row level security;


  create table "public"."qualification" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "company_id" uuid not null,
    "fit_score" integer,
    "recommended_product" text,
    "reasoning" text,
    "confidence" integer,
    "created_at" timestamp with time zone default now(),
    "brand_id" uuid not null,
    "client_id" uuid
      );


alter table "public"."qualification" enable row level security;


  create table "public"."replies" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "company_id" uuid not null,
    "message_id" text,
    "raw_message" text,
    "intent" text,
    "sentiment" text,
    "objection_detected" boolean default false,
    "meeting_requested" boolean default false,
    "summary" text,
    "created_at" timestamp with time zone default now(),
    "confidence" numeric,
    "analyzed_at" timestamp with time zone,
    "brand_id" uuid not null,
    "client_id" uuid
      );


alter table "public"."replies" enable row level security;


  create table "public"."research" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "company_id" uuid not null,
    "industry" text,
    "size_estimate" text,
    "pain_points" text,
    "buying_signals" text,
    "automation_maturity" text,
    "sponsorship_potential" boolean,
    "summary" text,
    "raw_content" text,
    "created_at" timestamp with time zone default now(),
    "brand_id" uuid not null,
    "client_id" uuid
      );


alter table "public"."research" enable row level security;


  create table "public"."scoring_versions" (
    "id" uuid not null default gen_random_uuid(),
    "version_name" text not null,
    "scoring_config" jsonb not null,
    "is_active" boolean default false,
    "created_at" timestamp with time zone default now(),
    "brand_id" uuid not null
      );


alter table "public"."scoring_versions" enable row level security;


  create table "public"."send_counters" (
    "id" uuid not null default gen_random_uuid(),
    "product" text not null,
    "counter_type" text not null,
    "bucket_start" timestamp with time zone not null,
    "send_count" integer not null default 0,
    "created_at" timestamp with time zone default now(),
    "brand_id" uuid not null,
    "domain" text,
    "bounce_count" integer default 0
      );


alter table "public"."send_counters" enable row level security;


  create table "public"."sending_domains" (
    "id" uuid not null default gen_random_uuid(),
    "brand_id" uuid not null,
    "domain" text not null,
    "daily_limit" integer not null default 50,
    "sent_today" integer not null default 0,
    "total_sent" integer not null default 0,
    "bounce_count" integer not null default 0,
    "last_reset_at" timestamp with time zone not null default now(),
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "disabled_reason" text,
    "disabled_at" timestamp with time zone
      );


alter table "public"."sending_domains" enable row level security;


  create table "public"."sent_messages" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "brand_id" uuid,
    "lead_id" uuid,
    "company_id" uuid,
    "message_key" text not null,
    "smtp_message_id" text,
    "subject" text,
    "body" text,
    "direction" text not null,
    "from_email" text,
    "to_email" text,
    "status" text not null default 'pending'::text,
    "sent_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "opened_at" timestamp with time zone,
    "clicked_at" timestamp with time zone,
    "bounced_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "error_message" text,
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."sent_messages" enable row level security;


  create table "public"."signal_performance" (
    "product" text not null,
    "signal" text not null,
    "total_leads" integer default 0,
    "total_closed" integer default 0,
    "total_revenue" numeric default 0,
    "brand_id" uuid not null
      );


alter table "public"."signal_performance" enable row level security;


  create table "public"."signal_source_performance" (
    "id" uuid not null default gen_random_uuid(),
    "source_id" uuid not null,
    "brand_id" uuid not null,
    "sends" integer default 0,
    "replies" integer default 0,
    "bounces" integer default 0,
    "last_updated" timestamp with time zone default now()
      );


alter table "public"."signal_source_performance" enable row level security;


  create table "public"."suppression_list" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid,
    "email" text,
    "domain" text,
    "reason" text,
    "source" text,
    "is_hard" boolean default false,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."suppression_list" enable row level security;


  create table "public"."system_flags" (
    "key" text not null,
    "value" boolean not null,
    "client_id" uuid
      );


alter table "public"."system_flags" enable row level security;


  create table "public"."system_health" (
    "id" uuid not null default gen_random_uuid(),
    "check_type" text not null,
    "result" text not null,
    "metadata" jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."system_health" enable row level security;


  create table "public"."webhook_deliveries" (
    "id" uuid not null default gen_random_uuid(),
    "webhook_id" uuid not null,
    "payload" jsonb not null,
    "status_code" integer,
    "response_body" text,
    "attempt_number" integer not null default 1,
    "success" boolean not null default false,
    "error_message" text,
    "created_at" timestamp with time zone not null default now(),
    "delivered_at" timestamp with time zone
      );


alter table "public"."webhook_deliveries" enable row level security;

CREATE UNIQUE INDEX activity_logs_pkey ON public.activity_logs USING btree (id);

CREATE UNIQUE INDEX api_quota_counters_pkey ON public.api_quota_counters USING btree (id);

CREATE UNIQUE INDEX api_rate_limit_api_key_id_window_start_key ON public.api_rate_limit USING btree (api_key_id, window_start);

CREATE UNIQUE INDEX api_rate_limit_pkey ON public.api_rate_limit USING btree (id);

CREATE UNIQUE INDEX api_usage_logs_pkey ON public.api_usage_logs USING btree (id);

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE UNIQUE INDEX blacklist_domain_unique ON public.blacklist USING btree (domain);

CREATE UNIQUE INDEX blacklist_email_unique ON public.blacklist USING btree (email);

CREATE UNIQUE INDEX blacklist_pkey ON public.blacklist USING btree (id);

CREATE UNIQUE INDEX brand_discovery_sources_pkey ON public.brand_discovery_sources USING btree (id);

CREATE UNIQUE INDEX brand_intent_unique ON public.brand_intents USING btree (brand_id, intent);

CREATE UNIQUE INDEX brand_intents_pkey ON public.brand_intents USING btree (id);

CREATE UNIQUE INDEX brand_profiles_pkey ON public.brand_profiles USING btree (id);

CREATE UNIQUE INDEX campaign_analytics_pkey ON public.campaign_analytics USING btree (id);

CREATE UNIQUE INDEX circuit_breaker_brand_unique ON public.circuit_breaker_state USING btree (brand_id) WHERE (brand_id IS NOT NULL);

CREATE UNIQUE INDEX circuit_breaker_state_client_id_entity_type_entity_id_key ON public.circuit_breaker_state USING btree (client_id, entity_type, entity_id);

CREATE UNIQUE INDEX circuit_breaker_state_pkey ON public.circuit_breaker_state USING btree (id);

CREATE UNIQUE INDEX client_api_keys_key_hash_key ON public.client_api_keys USING btree (key_hash);

CREATE UNIQUE INDEX client_api_keys_pkey ON public.client_api_keys USING btree (id);

CREATE UNIQUE INDEX client_daily_send_client_id_send_date_key ON public.client_daily_send USING btree (client_id, send_date);

CREATE UNIQUE INDEX client_daily_send_pkey ON public.client_daily_send USING btree (id);

CREATE UNIQUE INDEX client_hourly_send_client_id_hour_bucket_key ON public.client_hourly_send USING btree (client_id, hour_bucket);

CREATE UNIQUE INDEX client_hourly_send_pkey ON public.client_hourly_send USING btree (id);

CREATE UNIQUE INDEX client_members_pkey ON public.client_members USING btree (id);

CREATE UNIQUE INDEX client_members_user_id_key ON public.client_members USING btree (user_id);

CREATE UNIQUE INDEX client_settings_client_id_key ON public.client_settings USING btree (client_id);

CREATE UNIQUE INDEX client_settings_pkey ON public.client_settings USING btree (id);

CREATE UNIQUE INDEX client_webhooks_pkey ON public.client_webhooks USING btree (id);

CREATE UNIQUE INDEX clients_pkey ON public.clients USING btree (id);

CREATE UNIQUE INDEX clients_slug_key ON public.clients USING btree (slug);

CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE UNIQUE INDEX daily_send_limits_pkey ON public.daily_send_limits USING btree (product, send_date);

CREATE UNIQUE INDEX daily_send_tracker_pkey ON public.daily_send_tracker USING btree (id);

CREATE UNIQUE INDEX daily_send_tracker_product_send_date_key ON public.daily_send_tracker USING btree (product, send_date);

CREATE UNIQUE INDEX dead_letter_queue_pkey ON public.dead_letter_queue USING btree (id);

CREATE INDEX dead_letters_brand_idx ON public.dead_letters USING btree (brand_id);

CREATE INDEX dead_letters_entity_idx ON public.dead_letters USING btree (entity_type, entity_id);

CREATE UNIQUE INDEX dead_letters_pkey ON public.dead_letters USING btree (id);

CREATE UNIQUE INDEX discovered_companies_pkey ON public.discovered_companies USING btree (id);

CREATE UNIQUE INDEX discovered_contacts_pkey ON public.discovered_contacts USING btree (id);

CREATE UNIQUE INDEX discovery_dead_letters_pkey ON public.discovery_dead_letters USING btree (id);

CREATE UNIQUE INDEX discovery_embeddings_pkey ON public.discovery_embeddings USING btree (id);

CREATE UNIQUE INDEX discovery_metrics_pkey ON public.discovery_metrics USING btree (id);

CREATE UNIQUE INDEX discovery_sources_pkey ON public.discovery_sources USING btree (id);

CREATE UNIQUE INDEX edge_function_secrets_key_name_key ON public.edge_function_secrets USING btree (key_name);

CREATE UNIQUE INDEX edge_function_secrets_pkey ON public.edge_function_secrets USING btree (id);

CREATE UNIQUE INDEX email_events_pkey ON public.email_events USING btree (id);

CREATE UNIQUE INDEX enrichment_metrics_pkey ON public.enrichment_metrics USING btree (id);

CREATE INDEX idx_activity_logs_client ON public.activity_logs USING btree (client_id, created_at);

CREATE INDEX idx_api_quota_window ON public.api_quota_counters USING btree (source_id, window_start);

CREATE INDEX idx_api_rate_limit_key ON public.api_rate_limit USING btree (api_key_id, window_start);

CREATE INDEX idx_api_usage_logs_client ON public.api_usage_logs USING btree (client_id);

CREATE INDEX idx_api_usage_logs_created ON public.api_usage_logs USING btree (created_at DESC);

CREATE INDEX idx_api_usage_logs_endpoint ON public.api_usage_logs USING btree (endpoint);

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);

CREATE INDEX idx_audit_logs_client ON public.audit_logs USING btree (client_id);

CREATE INDEX idx_audit_logs_created ON public.audit_logs USING btree (created_at DESC);

CREATE INDEX idx_bds_active ON public.brand_discovery_sources USING btree (brand_id) WHERE (is_active = true);

CREATE INDEX idx_bds_brand ON public.brand_discovery_sources USING btree (brand_id);

CREATE UNIQUE INDEX idx_bds_unique ON public.brand_discovery_sources USING btree (brand_id, name);

CREATE INDEX idx_blacklist_domain ON public.blacklist USING btree (domain);

CREATE UNIQUE INDEX idx_blacklist_email ON public.blacklist USING btree (email);

CREATE INDEX idx_brand_intents_active ON public.brand_intents USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_brand_intents_brand_id ON public.brand_intents USING btree (brand_id);

CREATE INDEX idx_brand_profiles_client ON public.brand_profiles USING btree (client_id);

CREATE INDEX idx_brand_profiles_discovery_api_key ON public.brand_profiles USING btree (discovery_api_key) WHERE (discovery_api_key IS NOT NULL);

CREATE INDEX idx_brand_profiles_discovery_enabled ON public.brand_profiles USING btree (discovery_enabled);

CREATE INDEX idx_brand_profiles_is_active ON public.brand_profiles USING btree (is_active);

CREATE INDEX idx_brand_profiles_is_paused ON public.brand_profiles USING btree (is_paused);

CREATE INDEX idx_brand_profiles_outbound_enabled ON public.brand_profiles USING btree (outbound_enabled);

CREATE INDEX idx_circuit_breaker_client ON public.circuit_breaker_state USING btree (client_id);

CREATE INDEX idx_circuit_breaker_state ON public.circuit_breaker_state USING btree (state);

CREATE INDEX idx_client_api_keys_client ON public.client_api_keys USING btree (client_id) WHERE (is_active = true);

CREATE INDEX idx_client_daily_send_client ON public.client_daily_send USING btree (client_id, send_date);

CREATE INDEX idx_client_daily_send_client_date ON public.client_daily_send USING btree (client_id, send_date);

CREATE INDEX idx_client_hourly_send_client ON public.client_hourly_send USING btree (client_id, hour_bucket);

CREATE INDEX idx_client_members_client ON public.client_members USING btree (client_id);

CREATE INDEX idx_client_members_email ON public.client_members USING btree (email);

CREATE INDEX idx_client_members_user_id ON public.client_members USING btree (user_id);

CREATE INDEX idx_client_settings_llm_provider ON public.client_settings USING btree (llm_provider) WHERE (llm_provider IS NOT NULL);

CREATE INDEX idx_client_webhooks_client ON public.client_webhooks USING btree (client_id) WHERE (is_active = true);

CREATE INDEX idx_clients_is_active ON public.clients USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_clients_owner_email ON public.clients USING btree (owner_email);

CREATE INDEX idx_clients_slug ON public.clients USING btree (slug);

CREATE INDEX idx_companies_brand ON public.companies USING btree (brand_id);

CREATE INDEX idx_companies_brand_status ON public.companies USING btree (brand_id, status);

CREATE INDEX idx_companies_client_status ON public.companies USING btree (client_id, status);

CREATE INDEX idx_companies_domain ON public.companies USING btree (domain);

CREATE UNIQUE INDEX idx_companies_domain_unique ON public.companies USING btree (domain) WHERE (domain IS NOT NULL);

CREATE INDEX idx_companies_state_updated_at ON public.companies USING btree (state_updated_at);

CREATE INDEX idx_companies_status ON public.companies USING btree (status);

CREATE INDEX idx_daily_send_tracker_brand ON public.daily_send_tracker USING btree (brand_id);

CREATE INDEX idx_discovered_companies_brand ON public.discovered_companies USING btree (brand_id);

CREATE INDEX idx_discovered_companies_confidence ON public.discovered_companies USING btree (confidence);

CREATE INDEX idx_discovered_companies_relevance ON public.discovered_companies USING btree (relevance_score) WHERE (relevance_score >= (70)::numeric);

CREATE INDEX idx_discovered_companies_signal_type ON public.discovered_companies USING btree (signal_type);

CREATE INDEX idx_discovered_companies_unprocessed ON public.discovered_companies USING btree (brand_id) WHERE (processed = false);

CREATE INDEX idx_discovered_contacts_brand ON public.discovered_contacts USING btree (brand_id);

CREATE INDEX idx_discovered_contacts_confidence ON public.discovered_contacts USING btree (confidence);

CREATE INDEX idx_discovered_contacts_enrichment ON public.discovered_contacts USING btree (requires_enrichment, processed);

CREATE INDEX idx_discovered_contacts_enrichment_queue ON public.discovered_contacts USING btree (requires_enrichment, next_attempt_at);

CREATE INDEX idx_discovered_contacts_retry_queue ON public.discovered_contacts USING btree (brand_id, next_attempt_at) WHERE (processed = false);

CREATE INDEX idx_discovered_contacts_unprocessed ON public.discovered_contacts USING btree (brand_id) WHERE (processed = false);

CREATE INDEX idx_discovered_retry_queue ON public.discovered_companies USING btree (brand_id, next_attempt_at) WHERE (processed = false);

CREATE INDEX idx_discovered_unprocessed_order ON public.discovered_companies USING btree (discovered_at) WHERE (processed = false);

CREATE INDEX idx_discovery_embeddings_brand ON public.discovery_embeddings USING btree (brand_id);

CREATE INDEX idx_discovery_embeddings_fts ON public.discovery_embeddings USING gin (search_vector);

CREATE INDEX idx_discovery_embeddings_type ON public.discovery_embeddings USING btree (content_type);

CREATE INDEX idx_discovery_embeddings_vector ON public.discovery_embeddings USING ivfflat (embedding public.vector_cosine_ops) WITH (lists='100');

CREATE INDEX idx_discovery_sources_ready ON public.brand_discovery_sources USING btree (brand_id, is_active, next_attempt_at) WHERE (is_active = true);

CREATE INDEX idx_email_events_client ON public.email_events USING btree (client_id);

CREATE INDEX idx_email_events_message ON public.email_events USING btree (message_id);

CREATE INDEX idx_email_events_type ON public.email_events USING btree (event_type);

CREATE INDEX idx_inbound_events_brand ON public.inbound_events USING btree (brand_id);

CREATE INDEX idx_inbound_events_event_id ON public.inbound_events USING btree (event_id);

CREATE INDEX idx_lcm_brand ON public.lead_company_map USING btree (brand_id);

CREATE INDEX idx_leads_brand ON public.leads USING btree (brand_id);

CREATE INDEX idx_leads_brand_status ON public.leads USING btree (brand_id, status);

CREATE INDEX idx_leads_client_status ON public.leads USING btree (client_id, status);

CREATE INDEX idx_leads_company_id ON public.leads USING btree (company_id);

CREATE INDEX idx_leads_conversion ON public.leads USING btree (conversion_value DESC);

CREATE INDEX idx_leads_domain ON public.leads USING btree (domain);

CREATE INDEX idx_leads_email ON public.leads USING btree (email);

CREATE INDEX idx_leads_score ON public.leads USING btree (lead_score DESC);

CREATE INDEX idx_leads_status ON public.leads USING btree (status);

CREATE INDEX idx_messages_brand ON public.messages USING btree (brand_id);

CREATE INDEX idx_negotiation_company ON public.negotiation_drafts USING btree (company_id);

CREATE INDEX idx_negotiation_drafts_brand ON public.negotiation_drafts USING btree (brand_id);

CREATE UNIQUE INDEX idx_one_active_scoring_per_brand ON public.scoring_versions USING btree (brand_id) WHERE (is_active = true);

CREATE INDEX idx_opportunities_brand_id ON public.opportunities USING btree (brand_id);

CREATE INDEX idx_opportunities_domain ON public.opportunities USING btree (domain) WHERE (domain IS NOT NULL);

CREATE INDEX idx_opportunities_qualification ON public.opportunities USING btree (qualification_status) WHERE (qualification_status = 'new'::text);

CREATE INDEX idx_opportunities_score ON public.opportunities USING btree (score DESC);

CREATE INDEX idx_opportunities_signal ON public.opportunities USING btree (signal);

CREATE INDEX idx_outbound_events_brand ON public.outbound_events USING btree (brand_id);

CREATE INDEX idx_outbound_events_company ON public.outbound_events USING btree (company_id);

CREATE INDEX idx_outbound_events_product ON public.outbound_events USING btree (product);

CREATE INDEX idx_outreach_brand ON public.outreach USING btree (brand_id);

CREATE INDEX idx_outreach_company ON public.outreach USING btree (company_id);

CREATE INDEX idx_outreach_status ON public.outreach USING btree (status);

CREATE INDEX idx_qualification_brand ON public.qualification USING btree (brand_id);

CREATE INDEX idx_qualification_company ON public.qualification USING btree (company_id);

CREATE INDEX idx_qualification_score ON public.qualification USING btree (fit_score);

CREATE INDEX idx_replies_brand ON public.replies USING btree (brand_id);

CREATE INDEX idx_replies_company ON public.replies USING btree (company_id);

CREATE INDEX idx_replies_intent ON public.replies USING btree (intent);

CREATE INDEX idx_research_brand ON public.research USING btree (brand_id);

CREATE INDEX idx_research_company ON public.research USING btree (company_id);

CREATE INDEX idx_scoring_versions_brand ON public.scoring_versions USING btree (brand_id);

CREATE INDEX idx_scoring_versions_brand_active ON public.scoring_versions USING btree (brand_id, is_active);

CREATE INDEX idx_send_counters_brand ON public.send_counters USING btree (brand_id);

CREATE INDEX idx_send_counters_brand_date ON public.send_counters USING btree (brand_id, bucket_start);

CREATE INDEX idx_send_counters_bucket ON public.send_counters USING btree (bucket_start);

CREATE INDEX idx_send_counters_product ON public.send_counters USING btree (product);

CREATE INDEX idx_sent_messages_brand ON public.sent_messages USING btree (brand_id);

CREATE INDEX idx_sent_messages_client ON public.sent_messages USING btree (client_id);

CREATE INDEX idx_sent_messages_lead ON public.sent_messages USING btree (lead_id);

CREATE UNIQUE INDEX idx_sent_messages_message_key ON public.sent_messages USING btree (message_key);

CREATE INDEX idx_sent_messages_status_client ON public.sent_messages USING btree (client_id, status) WHERE (status = 'pending'::text);

CREATE INDEX idx_signal_performance_brand ON public.signal_performance USING btree (brand_id);

CREATE INDEX idx_suppression_list_client ON public.suppression_list USING btree (client_id);

CREATE INDEX idx_suppression_list_domain ON public.suppression_list USING btree (domain);

CREATE INDEX idx_suppression_list_email ON public.suppression_list USING btree (email);

CREATE UNIQUE INDEX idx_unique_brand_domain ON public.companies USING btree (brand_id, domain);

CREATE UNIQUE INDEX idx_unique_company_brand_domain ON public.companies USING btree (brand_id, domain);

CREATE UNIQUE INDEX idx_unique_daily_send ON public.daily_send_tracker USING btree (brand_id, send_date);

CREATE UNIQUE INDEX idx_unique_discovered_email_per_brand ON public.discovered_contacts USING btree (brand_id, email) WHERE (email IS NOT NULL);

CREATE UNIQUE INDEX idx_unique_leads_brand_email ON public.leads USING btree (brand_id, email) WHERE (email IS NOT NULL);

CREATE UNIQUE INDEX idx_unique_send_hour ON public.send_counters USING btree (brand_id, counter_type, bucket_start);

CREATE UNIQUE INDEX idx_unique_signal_brand ON public.signal_performance USING btree (brand_id, signal);

CREATE UNIQUE INDEX inbound_events_event_id_key ON public.inbound_events USING btree (event_id);

CREATE UNIQUE INDEX inbound_events_pkey ON public.inbound_events USING btree (id);

CREATE UNIQUE INDEX inbound_message_claims_pkey ON public.inbound_message_claims USING btree (message_id, brand_id);

CREATE UNIQUE INDEX lead_company_map_pkey ON public.lead_company_map USING btree (lead_id, company_id);

CREATE UNIQUE INDEX lead_import_batches_pkey ON public.lead_import_batches USING btree (id);

CREATE UNIQUE INDEX leads_pkey ON public.leads USING btree (id);

CREATE INDEX leads_retry_idx ON public.leads USING btree (status, next_retry_at);

CREATE INDEX leads_state_updated_idx ON public.leads USING btree (state_updated_at);

CREATE UNIQUE INDEX messages_message_id_unique ON public.messages USING btree (message_id);

CREATE UNIQUE INDEX messages_message_key_unique ON public.messages USING btree (message_key);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX negotiation_drafts_pkey ON public.negotiation_drafts USING btree (id);

CREATE UNIQUE INDEX notification_preferences_pkey ON public.notification_preferences USING btree (id);

CREATE UNIQUE INDEX notification_preferences_user_id_client_id_key ON public.notification_preferences USING btree (user_id, client_id);

CREATE UNIQUE INDEX opportunities_pkey ON public.opportunities USING btree (id);

CREATE UNIQUE INDEX opportunity_unique ON public.opportunities USING btree (brand_id, domain, source, signal);

CREATE UNIQUE INDEX outbound_events_pkey ON public.outbound_events USING btree (id);

CREATE UNIQUE INDEX outreach_pkey ON public.outreach USING btree (id);

CREATE UNIQUE INDEX qualification_pkey ON public.qualification USING btree (id);

CREATE UNIQUE INDEX replies_pkey ON public.replies USING btree (id);

CREATE UNIQUE INDEX research_pkey ON public.research USING btree (id);

CREATE UNIQUE INDEX scoring_versions_pkey ON public.scoring_versions USING btree (id);

CREATE UNIQUE INDEX send_counters_pkey ON public.send_counters USING btree (id);

CREATE INDEX sending_domains_active_idx ON public.sending_domains USING btree (is_active);

CREATE UNIQUE INDEX sending_domains_brand_id_domain_key ON public.sending_domains USING btree (brand_id, domain);

CREATE INDEX sending_domains_brand_idx ON public.sending_domains USING btree (brand_id);

CREATE UNIQUE INDEX sending_domains_pkey ON public.sending_domains USING btree (id);

CREATE UNIQUE INDEX sent_messages_message_key_key ON public.sent_messages USING btree (message_key);

CREATE UNIQUE INDEX sent_messages_pkey ON public.sent_messages USING btree (id);

CREATE UNIQUE INDEX signal_performance_pkey ON public.signal_performance USING btree (product, signal);

CREATE UNIQUE INDEX signal_source_performance_pkey ON public.signal_source_performance USING btree (id);

CREATE UNIQUE INDEX suppression_list_pkey ON public.suppression_list USING btree (id);

CREATE UNIQUE INDEX system_flags_client_id_key ON public.system_flags USING btree (client_id);

CREATE UNIQUE INDEX system_flags_pkey ON public.system_flags USING btree (key);

CREATE UNIQUE INDEX system_health_pkey ON public.system_health USING btree (id);

CREATE UNIQUE INDEX unique_brand_domain ON public.discovered_companies USING btree (brand_id, domain);

CREATE UNIQUE INDEX unique_message_id ON public.replies USING btree (message_id);

CREATE UNIQUE INDEX unique_product_bucket ON public.send_counters USING btree (product, counter_type, bucket_start);

CREATE UNIQUE INDEX unique_source_window ON public.api_quota_counters USING btree (source_id, window_start);

CREATE UNIQUE INDEX webhook_deliveries_pkey ON public.webhook_deliveries USING btree (id);

alter table "public"."activity_logs" add constraint "activity_logs_pkey" PRIMARY KEY using index "activity_logs_pkey";

alter table "public"."api_quota_counters" add constraint "api_quota_counters_pkey" PRIMARY KEY using index "api_quota_counters_pkey";

alter table "public"."api_rate_limit" add constraint "api_rate_limit_pkey" PRIMARY KEY using index "api_rate_limit_pkey";

alter table "public"."api_usage_logs" add constraint "api_usage_logs_pkey" PRIMARY KEY using index "api_usage_logs_pkey";

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."blacklist" add constraint "blacklist_pkey" PRIMARY KEY using index "blacklist_pkey";

alter table "public"."brand_discovery_sources" add constraint "brand_discovery_sources_pkey" PRIMARY KEY using index "brand_discovery_sources_pkey";

alter table "public"."brand_intents" add constraint "brand_intents_pkey" PRIMARY KEY using index "brand_intents_pkey";

alter table "public"."brand_profiles" add constraint "brand_profiles_pkey" PRIMARY KEY using index "brand_profiles_pkey";

alter table "public"."campaign_analytics" add constraint "campaign_analytics_pkey" PRIMARY KEY using index "campaign_analytics_pkey";

alter table "public"."circuit_breaker_state" add constraint "circuit_breaker_state_pkey" PRIMARY KEY using index "circuit_breaker_state_pkey";

alter table "public"."client_api_keys" add constraint "client_api_keys_pkey" PRIMARY KEY using index "client_api_keys_pkey";

alter table "public"."client_daily_send" add constraint "client_daily_send_pkey" PRIMARY KEY using index "client_daily_send_pkey";

alter table "public"."client_hourly_send" add constraint "client_hourly_send_pkey" PRIMARY KEY using index "client_hourly_send_pkey";

alter table "public"."client_members" add constraint "client_members_pkey" PRIMARY KEY using index "client_members_pkey";

alter table "public"."client_settings" add constraint "client_settings_pkey" PRIMARY KEY using index "client_settings_pkey";

alter table "public"."client_webhooks" add constraint "client_webhooks_pkey" PRIMARY KEY using index "client_webhooks_pkey";

alter table "public"."clients" add constraint "clients_pkey" PRIMARY KEY using index "clients_pkey";

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."daily_send_limits" add constraint "daily_send_limits_pkey" PRIMARY KEY using index "daily_send_limits_pkey";

alter table "public"."daily_send_tracker" add constraint "daily_send_tracker_pkey" PRIMARY KEY using index "daily_send_tracker_pkey";

alter table "public"."dead_letter_queue" add constraint "dead_letter_queue_pkey" PRIMARY KEY using index "dead_letter_queue_pkey";

alter table "public"."dead_letters" add constraint "dead_letters_pkey" PRIMARY KEY using index "dead_letters_pkey";

alter table "public"."discovered_companies" add constraint "discovered_companies_pkey" PRIMARY KEY using index "discovered_companies_pkey";

alter table "public"."discovered_contacts" add constraint "discovered_contacts_pkey" PRIMARY KEY using index "discovered_contacts_pkey";

alter table "public"."discovery_dead_letters" add constraint "discovery_dead_letters_pkey" PRIMARY KEY using index "discovery_dead_letters_pkey";

alter table "public"."discovery_embeddings" add constraint "discovery_embeddings_pkey" PRIMARY KEY using index "discovery_embeddings_pkey";

alter table "public"."discovery_metrics" add constraint "discovery_metrics_pkey" PRIMARY KEY using index "discovery_metrics_pkey";

alter table "public"."discovery_sources" add constraint "discovery_sources_pkey" PRIMARY KEY using index "discovery_sources_pkey";

alter table "public"."edge_function_secrets" add constraint "edge_function_secrets_pkey" PRIMARY KEY using index "edge_function_secrets_pkey";

alter table "public"."email_events" add constraint "email_events_pkey" PRIMARY KEY using index "email_events_pkey";

alter table "public"."enrichment_metrics" add constraint "enrichment_metrics_pkey" PRIMARY KEY using index "enrichment_metrics_pkey";

alter table "public"."inbound_events" add constraint "inbound_events_pkey" PRIMARY KEY using index "inbound_events_pkey";

alter table "public"."inbound_message_claims" add constraint "inbound_message_claims_pkey" PRIMARY KEY using index "inbound_message_claims_pkey";

alter table "public"."lead_company_map" add constraint "lead_company_map_pkey" PRIMARY KEY using index "lead_company_map_pkey";

alter table "public"."lead_import_batches" add constraint "lead_import_batches_pkey" PRIMARY KEY using index "lead_import_batches_pkey";

alter table "public"."leads" add constraint "leads_pkey" PRIMARY KEY using index "leads_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."negotiation_drafts" add constraint "negotiation_drafts_pkey" PRIMARY KEY using index "negotiation_drafts_pkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_pkey" PRIMARY KEY using index "notification_preferences_pkey";

alter table "public"."opportunities" add constraint "opportunities_pkey" PRIMARY KEY using index "opportunities_pkey";

alter table "public"."outbound_events" add constraint "outbound_events_pkey" PRIMARY KEY using index "outbound_events_pkey";

alter table "public"."outreach" add constraint "outreach_pkey" PRIMARY KEY using index "outreach_pkey";

alter table "public"."qualification" add constraint "qualification_pkey" PRIMARY KEY using index "qualification_pkey";

alter table "public"."replies" add constraint "replies_pkey" PRIMARY KEY using index "replies_pkey";

alter table "public"."research" add constraint "research_pkey" PRIMARY KEY using index "research_pkey";

alter table "public"."scoring_versions" add constraint "scoring_versions_pkey" PRIMARY KEY using index "scoring_versions_pkey";

alter table "public"."send_counters" add constraint "send_counters_pkey" PRIMARY KEY using index "send_counters_pkey";

alter table "public"."sending_domains" add constraint "sending_domains_pkey" PRIMARY KEY using index "sending_domains_pkey";

alter table "public"."sent_messages" add constraint "sent_messages_pkey" PRIMARY KEY using index "sent_messages_pkey";

alter table "public"."signal_performance" add constraint "signal_performance_pkey" PRIMARY KEY using index "signal_performance_pkey";

alter table "public"."signal_source_performance" add constraint "signal_source_performance_pkey" PRIMARY KEY using index "signal_source_performance_pkey";

alter table "public"."suppression_list" add constraint "suppression_list_pkey" PRIMARY KEY using index "suppression_list_pkey";

alter table "public"."system_flags" add constraint "system_flags_pkey" PRIMARY KEY using index "system_flags_pkey";

alter table "public"."system_health" add constraint "system_health_pkey" PRIMARY KEY using index "system_health_pkey";

alter table "public"."webhook_deliveries" add constraint "webhook_deliveries_pkey" PRIMARY KEY using index "webhook_deliveries_pkey";

alter table "public"."activity_logs" add constraint "activity_logs_client_fk" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."activity_logs" validate constraint "activity_logs_client_fk";

alter table "public"."api_quota_counters" add constraint "api_quota_counters_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.brand_discovery_sources(id) ON DELETE CASCADE not valid;

alter table "public"."api_quota_counters" validate constraint "api_quota_counters_source_id_fkey";

alter table "public"."api_quota_counters" add constraint "unique_source_window" UNIQUE using index "unique_source_window";

alter table "public"."api_rate_limit" add constraint "api_rate_limit_api_key_id_fkey" FOREIGN KEY (api_key_id) REFERENCES public.client_api_keys(id) ON DELETE CASCADE not valid;

alter table "public"."api_rate_limit" validate constraint "api_rate_limit_api_key_id_fkey";

alter table "public"."api_rate_limit" add constraint "api_rate_limit_api_key_id_window_start_key" UNIQUE using index "api_rate_limit_api_key_id_window_start_key";

alter table "public"."api_usage_logs" add constraint "api_usage_logs_api_key_id_fkey" FOREIGN KEY (api_key_id) REFERENCES public.client_api_keys(id) ON DELETE SET NULL not valid;

alter table "public"."api_usage_logs" validate constraint "api_usage_logs_api_key_id_fkey";

alter table "public"."api_usage_logs" add constraint "api_usage_logs_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."api_usage_logs" validate constraint "api_usage_logs_client_id_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_client_fk" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_client_fk";

alter table "public"."audit_logs" add constraint "audit_logs_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_client_id_fkey";

alter table "public"."blacklist" add constraint "blacklist_domain_unique" UNIQUE using index "blacklist_domain_unique";

alter table "public"."blacklist" add constraint "blacklist_email_unique" UNIQUE using index "blacklist_email_unique";

alter table "public"."brand_discovery_sources" add constraint "brand_discovery_sources_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."brand_discovery_sources" validate constraint "brand_discovery_sources_client_id_fkey";

alter table "public"."brand_intents" add constraint "brand_intent_unique" UNIQUE using index "brand_intent_unique";

alter table "public"."brand_intents" add constraint "brand_intents_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES public.brand_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."brand_intents" validate constraint "brand_intents_brand_id_fkey";

alter table "public"."brand_intents" add constraint "brand_intents_priority_check" CHECK (((priority >= 1) AND (priority <= 10))) not valid;

alter table "public"."brand_intents" validate constraint "brand_intents_priority_check";

alter table "public"."brand_profiles" add constraint "brand_profiles_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."brand_profiles" validate constraint "brand_profiles_client_id_fkey";

alter table "public"."brand_profiles" add constraint "brand_profiles_provider_check" CHECK ((provider = ANY (ARRAY['smtp'::text, 'resend'::text, 'ses'::text]))) not valid;

alter table "public"."brand_profiles" validate constraint "brand_profiles_provider_check";

alter table "public"."brand_profiles" add constraint "brand_profiles_transport_mode_check" CHECK ((transport_mode = ANY (ARRAY['mailbox'::text, 'api'::text]))) not valid;

alter table "public"."brand_profiles" validate constraint "brand_profiles_transport_mode_check";

alter table "public"."circuit_breaker_state" add constraint "circuit_breaker_state_client_id_entity_type_entity_id_key" UNIQUE using index "circuit_breaker_state_client_id_entity_type_entity_id_key";

alter table "public"."circuit_breaker_state" add constraint "circuit_breaker_state_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."circuit_breaker_state" validate constraint "circuit_breaker_state_client_id_fkey";

alter table "public"."circuit_breaker_state" add constraint "circuit_breaker_state_state_check" CHECK ((state = ANY (ARRAY['closed'::text, 'open'::text, 'half_open'::text]))) not valid;

alter table "public"."circuit_breaker_state" validate constraint "circuit_breaker_state_state_check";

alter table "public"."client_api_keys" add constraint "client_api_keys_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."client_api_keys" validate constraint "client_api_keys_client_id_fkey";

alter table "public"."client_api_keys" add constraint "client_api_keys_key_hash_key" UNIQUE using index "client_api_keys_key_hash_key";

alter table "public"."client_daily_send" add constraint "client_daily_send_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."client_daily_send" validate constraint "client_daily_send_client_id_fkey";

alter table "public"."client_daily_send" add constraint "client_daily_send_client_id_send_date_key" UNIQUE using index "client_daily_send_client_id_send_date_key";

alter table "public"."client_hourly_send" add constraint "client_hourly_send_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."client_hourly_send" validate constraint "client_hourly_send_client_id_fkey";

alter table "public"."client_hourly_send" add constraint "client_hourly_send_client_id_hour_bucket_key" UNIQUE using index "client_hourly_send_client_id_hour_bucket_key";

alter table "public"."client_members" add constraint "client_members_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."client_members" validate constraint "client_members_client_id_fkey";

alter table "public"."client_members" add constraint "client_members_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text, 'viewer'::text]))) not valid;

alter table "public"."client_members" validate constraint "client_members_role_check";

alter table "public"."client_members" add constraint "client_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."client_members" validate constraint "client_members_user_id_fkey";

alter table "public"."client_members" add constraint "client_members_user_id_key" UNIQUE using index "client_members_user_id_key";

alter table "public"."client_settings" add constraint "client_settings_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."client_settings" validate constraint "client_settings_client_id_fkey";

alter table "public"."client_settings" add constraint "client_settings_client_id_key" UNIQUE using index "client_settings_client_id_key";

alter table "public"."client_webhooks" add constraint "client_webhooks_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."client_webhooks" validate constraint "client_webhooks_client_id_fkey";

alter table "public"."clients" add constraint "clients_plan_check" CHECK ((plan = ANY (ARRAY['starter'::text, 'pro'::text, 'enterprise'::text]))) not valid;

alter table "public"."clients" validate constraint "clients_plan_check";

alter table "public"."clients" add constraint "clients_slug_key" UNIQUE using index "clients_slug_key";

alter table "public"."companies" add constraint "companies_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."companies" validate constraint "companies_client_id_fkey";

alter table "public"."companies" add constraint "companies_status_check" CHECK ((status = ANY (ARRAY['researching'::text, 'researching_processing'::text, 'qualified'::text, 'qualified_processing'::text, 'rejected'::text, 'draft_ready'::text, 'draft_ready_processing'::text, 'contacted'::text, 'replied'::text, 'replied_processing'::text, 'negotiating'::text, 'negotiating_processing'::text, 'meeting_booked'::text, 'closed_won'::text, 'closed_lost'::text, 'dead_letter'::text]))) not valid;

alter table "public"."companies" validate constraint "companies_status_check";

alter table "public"."daily_send_tracker" add constraint "daily_send_tracker_product_check" CHECK ((product = ANY (ARRAY['kickin'::text, 'relayforge'::text, 'sentrazero'::text]))) not valid;

alter table "public"."daily_send_tracker" validate constraint "daily_send_tracker_product_check";

alter table "public"."daily_send_tracker" add constraint "daily_send_tracker_product_send_date_key" UNIQUE using index "daily_send_tracker_product_send_date_key";

alter table "public"."dead_letter_queue" add constraint "dead_letter_queue_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."dead_letter_queue" validate constraint "dead_letter_queue_client_id_fkey";

alter table "public"."dead_letters" add constraint "dead_letters_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."dead_letters" validate constraint "dead_letters_client_id_fkey";

alter table "public"."discovered_companies" add constraint "discovered_companies_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."discovered_companies" validate constraint "discovered_companies_client_id_fkey";

alter table "public"."discovered_companies" add constraint "discovered_companies_risk_check" CHECK ((risk = ANY (ARRAY['SAFE_API'::text, 'MODERATE_PUBLIC'::text, 'HIGH_SCRAPE'::text]))) not valid;

alter table "public"."discovered_companies" validate constraint "discovered_companies_risk_check";

alter table "public"."discovered_companies" add constraint "discovered_companies_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.brand_discovery_sources(id) ON DELETE SET NULL not valid;

alter table "public"."discovered_companies" validate constraint "discovered_companies_source_id_fkey";

alter table "public"."discovered_companies" add constraint "unique_brand_domain" UNIQUE using index "unique_brand_domain";

alter table "public"."discovered_contacts" add constraint "discovered_contacts_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."discovered_contacts" validate constraint "discovered_contacts_client_id_fkey";

alter table "public"."discovered_contacts" add constraint "discovered_contacts_discovered_company_id_fkey" FOREIGN KEY (discovered_company_id) REFERENCES public.discovered_companies(id) ON DELETE CASCADE not valid;

alter table "public"."discovered_contacts" validate constraint "discovered_contacts_discovered_company_id_fkey";

alter table "public"."discovered_contacts" add constraint "discovered_contacts_risk_check" CHECK ((risk = ANY (ARRAY['SAFE_API'::text, 'MODERATE_PUBLIC'::text, 'HIGH_SCRAPE'::text]))) not valid;

alter table "public"."discovered_contacts" validate constraint "discovered_contacts_risk_check";

alter table "public"."discovered_contacts" add constraint "discovered_contacts_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.brand_discovery_sources(id) ON DELETE SET NULL not valid;

alter table "public"."discovered_contacts" validate constraint "discovered_contacts_source_id_fkey";

alter table "public"."discovery_dead_letters" add constraint "discovery_dead_letters_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."discovery_dead_letters" validate constraint "discovery_dead_letters_client_id_fkey";

alter table "public"."discovery_embeddings" add constraint "discovery_embeddings_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES public.brand_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."discovery_embeddings" validate constraint "discovery_embeddings_brand_id_fkey";

alter table "public"."discovery_embeddings" add constraint "discovery_embeddings_content_type_check" CHECK ((content_type = ANY (ARRAY['brand_intent'::text, 'signal_pattern'::text, 'reference_company'::text]))) not valid;

alter table "public"."discovery_embeddings" validate constraint "discovery_embeddings_content_type_check";

alter table "public"."discovery_metrics" add constraint "discovery_metrics_source_id_fkey" FOREIGN KEY (source_id) REFERENCES public.brand_discovery_sources(id) ON DELETE CASCADE not valid;

alter table "public"."discovery_metrics" validate constraint "discovery_metrics_source_id_fkey";

alter table "public"."discovery_sources" add constraint "discovery_sources_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."discovery_sources" validate constraint "discovery_sources_client_id_fkey";

alter table "public"."edge_function_secrets" add constraint "edge_function_secrets_key_name_key" UNIQUE using index "edge_function_secrets_key_name_key";

alter table "public"."email_events" add constraint "email_events_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."email_events" validate constraint "email_events_client_id_fkey";

alter table "public"."email_events" add constraint "email_events_event_type_check" CHECK ((event_type = ANY (ARRAY['sent'::text, 'delivered'::text, 'opened'::text, 'clicked'::text, 'bounced'::text, 'complained'::text, 'failed'::text]))) not valid;

alter table "public"."email_events" validate constraint "email_events_event_type_check";

alter table "public"."email_events" add constraint "email_events_message_id_fkey" FOREIGN KEY (message_id) REFERENCES public.sent_messages(id) ON DELETE SET NULL not valid;

alter table "public"."email_events" validate constraint "email_events_message_id_fkey";

alter table "public"."inbound_events" add constraint "inbound_events_event_id_key" UNIQUE using index "inbound_events_event_id_key";

alter table "public"."lead_company_map" add constraint "lead_company_map_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."lead_company_map" validate constraint "lead_company_map_company_id_fkey";

alter table "public"."lead_company_map" add constraint "lead_company_map_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE not valid;

alter table "public"."lead_company_map" validate constraint "lead_company_map_lead_id_fkey";

alter table "public"."lead_import_batches" add constraint "import_product_check" CHECK ((product = ANY (ARRAY['kickin'::text, 'relayforge'::text, 'sentrazero'::text]))) not valid;

alter table "public"."lead_import_batches" validate constraint "import_product_check";

alter table "public"."lead_import_batches" add constraint "lead_import_batches_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."lead_import_batches" validate constraint "lead_import_batches_client_id_fkey";

alter table "public"."leads" add constraint "leads_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."leads" validate constraint "leads_client_id_fkey";

alter table "public"."leads" add constraint "leads_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL not valid;

alter table "public"."leads" validate constraint "leads_company_id_fkey";

alter table "public"."leads" add constraint "leads_scoring_version_id_fkey" FOREIGN KEY (scoring_version_id) REFERENCES public.scoring_versions(id) not valid;

alter table "public"."leads" validate constraint "leads_scoring_version_id_fkey";

alter table "public"."leads" add constraint "leads_status_check" CHECK ((status = ANY (ARRAY['new'::text, 'filtered_out'::text, 'icp_passed'::text]))) not valid;

alter table "public"."leads" validate constraint "leads_status_check";

alter table "public"."messages" add constraint "messages_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."messages" validate constraint "messages_client_id_fkey";

alter table "public"."messages" add constraint "messages_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_lead_id_fkey";

alter table "public"."messages" add constraint "messages_message_id_unique" UNIQUE using index "messages_message_id_unique";

alter table "public"."negotiation_drafts" add constraint "negotiation_drafts_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."negotiation_drafts" validate constraint "negotiation_drafts_client_id_fkey";

alter table "public"."negotiation_drafts" add constraint "negotiation_drafts_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."negotiation_drafts" validate constraint "negotiation_drafts_company_id_fkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_user_id_client_id_key" UNIQUE using index "notification_preferences_user_id_client_id_key";

alter table "public"."opportunities" add constraint "opportunities_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES public.brand_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."opportunities" validate constraint "opportunities_brand_id_fkey";

alter table "public"."opportunities" add constraint "opportunities_confidence_check" CHECK (((confidence >= 0) AND (confidence <= 100))) not valid;

alter table "public"."opportunities" validate constraint "opportunities_confidence_check";

alter table "public"."opportunities" add constraint "opportunities_entity_type_check" CHECK ((entity_type = ANY (ARRAY['company'::text, 'person'::text]))) not valid;

alter table "public"."opportunities" validate constraint "opportunities_entity_type_check";

alter table "public"."opportunities" add constraint "opportunities_intent_id_fkey" FOREIGN KEY (intent_id) REFERENCES public.brand_intents(id) ON DELETE SET NULL not valid;

alter table "public"."opportunities" validate constraint "opportunities_intent_id_fkey";

alter table "public"."opportunities" add constraint "opportunities_qualification_status_check" CHECK ((qualification_status = ANY (ARRAY['new'::text, 'qualified'::text, 'contacted'::text, 'replied'::text, 'converted'::text, 'disqualified'::text]))) not valid;

alter table "public"."opportunities" validate constraint "opportunities_qualification_status_check";

alter table "public"."opportunities" add constraint "opportunities_score_check" CHECK (((score >= 0) AND (score <= 100))) not valid;

alter table "public"."opportunities" validate constraint "opportunities_score_check";

alter table "public"."opportunities" add constraint "opportunity_unique" UNIQUE using index "opportunity_unique";

alter table "public"."outreach" add constraint "outreach_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."outreach" validate constraint "outreach_client_id_fkey";

alter table "public"."outreach" add constraint "outreach_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."outreach" validate constraint "outreach_company_id_fkey";

alter table "public"."outreach" add constraint "outreach_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'draft_processing'::text, 'approved'::text, 'sent'::text, 'failed'::text]))) not valid;

alter table "public"."outreach" validate constraint "outreach_status_check";

alter table "public"."qualification" add constraint "qualification_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."qualification" validate constraint "qualification_client_id_fkey";

alter table "public"."qualification" add constraint "qualification_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."qualification" validate constraint "qualification_company_id_fkey";

alter table "public"."qualification" add constraint "qualification_confidence_check" CHECK (((confidence >= 0) AND (confidence <= 100))) not valid;

alter table "public"."qualification" validate constraint "qualification_confidence_check";

alter table "public"."qualification" add constraint "qualification_fit_score_check" CHECK (((fit_score >= 0) AND (fit_score <= 100))) not valid;

alter table "public"."qualification" validate constraint "qualification_fit_score_check";

alter table "public"."qualification" add constraint "qualification_recommended_product_check" CHECK ((recommended_product = ANY (ARRAY['kickin'::text, 'relayforge'::text, 'sentrazero'::text]))) not valid;

alter table "public"."qualification" validate constraint "qualification_recommended_product_check";

alter table "public"."replies" add constraint "replies_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."replies" validate constraint "replies_client_id_fkey";

alter table "public"."replies" add constraint "replies_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."replies" validate constraint "replies_company_id_fkey";

alter table "public"."replies" add constraint "replies_intent_check" CHECK ((intent = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text, 'negative'::text, 'unsubscribe'::text]))) not valid;

alter table "public"."replies" validate constraint "replies_intent_check";

alter table "public"."replies" add constraint "unique_message_id" UNIQUE using index "unique_message_id";

alter table "public"."research" add constraint "research_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."research" validate constraint "research_client_id_fkey";

alter table "public"."research" add constraint "research_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."research" validate constraint "research_company_id_fkey";

alter table "public"."send_counters" add constraint "send_counters_counter_type_check" CHECK ((counter_type = ANY (ARRAY['hourly'::text, 'daily'::text]))) not valid;

alter table "public"."send_counters" validate constraint "send_counters_counter_type_check";

alter table "public"."send_counters" add constraint "unique_product_bucket" UNIQUE using index "unique_product_bucket";

alter table "public"."sending_domains" add constraint "sending_domains_brand_id_domain_key" UNIQUE using index "sending_domains_brand_id_domain_key";

alter table "public"."sent_messages" add constraint "sent_messages_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL not valid;

alter table "public"."sent_messages" validate constraint "sent_messages_client_id_fkey";

alter table "public"."sent_messages" add constraint "sent_messages_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL not valid;

alter table "public"."sent_messages" validate constraint "sent_messages_company_id_fkey";

alter table "public"."sent_messages" add constraint "sent_messages_direction_check" CHECK ((direction = ANY (ARRAY['outbound'::text, 'inbound'::text]))) not valid;

alter table "public"."sent_messages" validate constraint "sent_messages_direction_check";

alter table "public"."sent_messages" add constraint "sent_messages_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL not valid;

alter table "public"."sent_messages" validate constraint "sent_messages_lead_id_fkey";

alter table "public"."sent_messages" add constraint "sent_messages_message_key_key" UNIQUE using index "sent_messages_message_key_key";

alter table "public"."sent_messages" add constraint "sent_messages_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'delivered'::text, 'opened'::text, 'clicked'::text, 'bounced'::text, 'failed'::text]))) not valid;

alter table "public"."sent_messages" validate constraint "sent_messages_status_check";

alter table "public"."suppression_list" add constraint "suppression_list_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE not valid;

alter table "public"."suppression_list" validate constraint "suppression_list_client_id_fkey";

alter table "public"."system_flags" add constraint "system_flags_client_id_key" UNIQUE using index "system_flags_client_id_key";

alter table "public"."webhook_deliveries" add constraint "webhook_deliveries_webhook_id_fkey" FOREIGN KEY (webhook_id) REFERENCES public.client_webhooks(id) ON DELETE CASCADE not valid;

alter table "public"."webhook_deliveries" validate constraint "webhook_deliveries_webhook_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_api_key_rate_limit(p_api_key_id uuid, p_limit integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_window timestamptz;
    v_count integer;
BEGIN
    v_window := date_trunc('minute', now());

    INSERT INTO api_rate_limit (api_key_id, window_start, request_count)
    VALUES (p_api_key_id, v_window, 1)
    ON CONFLICT (api_key_id, window_start)
    DO UPDATE SET request_count = api_rate_limit.request_count + 1
    RETURNING request_count INTO v_count;

    IF v_count > p_limit THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_client_send_quota(p_client_id uuid)
 RETURNS TABLE(allowed boolean, daily_remaining integer, hourly_remaining integer, reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_limit integer;
    v_count integer;
    v_hourly_limit integer;
    v_hourly_count integer;
    v_client record;
BEGIN
    SELECT * INTO v_client
    FROM clients
    WHERE id = p_client_id
    FOR UPDATE;

    IF NOT FOUND OR v_client.is_active = false OR v_client.is_paused = true THEN
        RETURN QUERY SELECT false, 0, 0, 'client_inactive';
    END IF;

    v_limit := v_client.daily_send_limit;
    v_hourly_limit := v_client.hourly_send_limit;

    -- Check daily
    INSERT INTO client_daily_send (client_id, send_date, send_count)
    VALUES (p_client_id, CURRENT_DATE, 0)
    ON CONFLICT (client_id, send_date)
    DO UPDATE SET send_count = client_daily_send.send_count;

    SELECT send_count INTO v_count
    FROM client_daily_send
    WHERE client_id = p_client_id AND send_date = CURRENT_DATE;

    IF v_count >= v_limit THEN
        RETURN QUERY SELECT false, 0, 0, 'daily_limit_exceeded';
    END IF;

    -- Check hourly
    INSERT INTO client_hourly_send (client_id, hour_bucket, send_count)
    VALUES (p_client_id, date_trunc('hour', now()), 0)
    ON CONFLICT (client_id, hour_bucket)
    DO UPDATE SET send_count = client_hourly_send.send_count;

    SELECT send_count INTO v_hourly_count
    FROM client_hourly_send
    WHERE client_id = p_client_id AND hour_bucket = date_trunc('hour', now());

    IF v_hourly_count >= v_hourly_limit THEN
        RETURN QUERY SELECT false, v_limit - v_count, 0, 'hourly_limit_exceeded';
    END IF;

    RETURN QUERY SELECT true, v_limit - v_count, v_hourly_limit - v_hourly_count, 'ok';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.claim_companies_for_enrichment(p_brand_id uuid, p_batch_size integer)
 RETURNS SETOF public.discovered_companies
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.discovered_companies
    SET enrichment_status = 'locked', enrichment_attempts = enrichment_attempts + 1, last_enrichment_at = now()
    WHERE id IN (
        SELECT id FROM public.discovered_companies
        WHERE brand_id = p_brand_id
          AND requires_enrichment = true
          AND enrichment_status = 'pending'
          AND enrichment_attempts < 3
          AND (next_attempt_at IS NULL OR next_attempt_at <= now())
        ORDER BY confidence ASC
        LIMIT p_batch_size
        FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.claim_contacts_for_enrichment(p_brand_id uuid, p_limit integer)
 RETURNS SETOF public.discovered_contacts
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE public.discovered_contacts dc
    SET
        enrichment_status = 'locked',
        enrichment_attempts = dc.enrichment_attempts + 1,
        last_enrichment_at = now()
    WHERE dc.id IN (
        SELECT id
        FROM public.discovered_contacts
        WHERE brand_id = p_brand_id
          AND requires_enrichment = true
          AND enrichment_status = 'pending'
          AND enrichment_attempts < 3
          AND (next_attempt_at IS NULL OR next_attempt_at <= now())
        ORDER BY confidence ASC
        LIMIT p_limit
        FOR UPDATE SKIP LOCKED
    )
    RETURNING dc.*;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM audit_logs
    WHERE created_at < now() - interval '90 days';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.client_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  SELECT client_id 
  FROM client_members 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.consume_client_send_quota(p_client_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_allowed boolean;
BEGIN
    UPDATE client_daily_send
    SET send_count = send_count + 1
    WHERE client_id = p_client_id AND send_date = CURRENT_DATE
    RETURNING true INTO v_allowed;

    UPDATE client_hourly_send
    SET send_count = send_count + 1
    WHERE client_id = p_client_id AND hour_bucket = date_trunc('hour', now());

    RETURN coalesce(v_allowed, false);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.consume_send_quota(p_brand_id uuid, p_domain text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    allowed BOOLEAN := FALSE;
    brand_record RECORD;
BEGIN
    SELECT * INTO brand_record
    FROM brand_profiles
    WHERE id = p_brand_id AND is_active = TRUE;

    IF brand_record IS NULL THEN
        RETURN FALSE;
    END IF;

    IF brand_record.daily_send_limit IS NOT NULL AND brand_record.sent_count >= brand_record.daily_send_limit THEN
        RETURN FALSE;
    END IF;

    IF brand_record.hourly_send_limit IS NOT NULL THEN
        DECLARE
            hourly_sent INT;
        BEGIN
            SELECT COUNT(*)::INT INTO hourly_sent
            FROM sent_messages
            WHERE brand_id = p_brand_id
                AND status = 'sent'
                AND created_at >= NOW() - INTERVAL '1 hour';

            IF hourly_sent >= brand_record.hourly_send_limit THEN
                RETURN FALSE;
            END IF;
        END;
    END IF;

    UPDATE brand_profiles 
    SET sent_count = COALESCE(sent_count, 0) + 1,
        updated_at = NOW()
    WHERE id = p_brand_id;

    RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.detect_stuck_leads()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
declare
  v_count int;
begin

  update public.leads
  set status = 'error',
      last_error = 'Stuck state detected',
      state_updated_at = now()
  where
    (
      status = 'researching'
      and state_updated_at < now() - interval '1 hour'
    )
    or
    (
      status = 'sending'
      and state_updated_at < now() - interval '10 minutes'
    );

  get diagnostics v_count = row_count;

  insert into public.system_health (check_type, result, metadata)
  values (
    'stuck_leads_check',
    'completed',
    jsonb_build_object('affected_rows', v_count)
  );

  return v_count;

end;
$function$
;

CREATE OR REPLACE FUNCTION public.fix_client_member_user_id(p_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.client_members
  SET user_id = auth.uid()
  WHERE email = p_email AND user_id IS NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_outreach_from_leads()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into outreach from leads
  INSERT INTO public.outreach (
    brand_id,
    company_id,
    subject,
    body,
    status,
    created_at,
    updated_at
  )
  SELECT 
    l.brand_id,
    l.company_id,
    'Personalized outreach'::text,
    'Draft generated by AI'::text,
    'draft'::text,
    now(),
    now()
  FROM public.leads l
  WHERE l.status = 'qualified'
    AND l.lead_score >= 70
    AND NOT EXISTS (
      SELECT 1 FROM public.outreach o
      WHERE o.brand_id = l.brand_id
        AND o.company_id = l.company_id
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_brand_credentials(p_brand_id uuid)
 RETURNS TABLE(brand_id uuid, smtp_host text, smtp_port integer, smtp_secure boolean, smtp_email text, smtp_password text, imap_host text, imap_port integer, imap_secure boolean, imap_email text, imap_password text, reply_to_email text, daily_send_limit integer, hourly_send_limit integer, llm_model_override text, llm_temperature numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.smtp_host,
    b.smtp_port,
    b.smtp_secure,
    b.smtp_email,
    b.smtp_password,
    b.imap_host,
    b.imap_port,
    b.imap_secure,
    b.imap_email,
    b.imap_password,
    b.reply_to_email,
    b.daily_send_limit,
    b.hourly_send_limit,
    b.llm_model_override,
    b.llm_temperature
  FROM public.brand_profiles b
  WHERE b.id = p_brand_id
    AND b.is_active = true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_client_credentials(p_client_id uuid)
 RETURNS TABLE(client_id uuid, smtp_host text, smtp_port integer, smtp_secure boolean, smtp_email text, smtp_password text, smtp_from_name text, smtp_from_email text, imap_host text, imap_port integer, imap_secure boolean, imap_email text, imap_password text, email_provider text, provider_api_key text, sending_domain text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        cs.smtp_host,
        cs.smtp_port,
        cs.smtp_secure,
        cs.smtp_email,
        cs.smtp_password,
        cs.smtp_from_name,
        cs.smtp_from_email,
        cs.imap_host,
        cs.imap_port,
        cs.imap_secure,
        cs.imap_email,
        cs.imap_password,
        cs.email_provider,
        cs.provider_api_key,
        cs.sending_domain
    FROM public.clients c
    JOIN public.client_settings cs ON cs.client_id = c.id
    WHERE c.id = p_client_id
      AND c.is_active = true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_cors_headers()
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN jsonb_build_object(
        'Access-Control-Allow-Origin', '*',
        'Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Client-Info',
        'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_domain_health(p_brand_id uuid, p_domain text)
 RETURNS TABLE(bounce_rate numeric, complaint_rate numeric, daily_sent bigint, daily_limit bigint, hourly_sent bigint, hourly_limit bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN COALESCE(sd.sent_today, 0) > 0 
         THEN sd.bounce_count::numeric / sd.sent_today 
         ELSE 0 END,
    0::numeric,
    COALESCE(sd.sent_today, 0)::bigint,
    COALESCE(sd.daily_limit, 1000)::bigint,
    0::bigint,
    0::bigint
  FROM sending_domains sd
  WHERE sd.brand_id = p_brand_id AND sd.domain = p_domain AND sd.is_active = true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_edge_secret(p_key_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_send_quota_status(p_brand_id uuid, p_domain text)
 RETURNS TABLE(daily_sent bigint, daily_limit bigint, hourly_sent bigint, hourly_limit bigint, bounce_rate numeric, complaint_rate numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(dst.send_count, 0)::bigint,
    COALESCE(bp.daily_send_limit, 1000)::bigint,
    COALESCE(dst.send_count, 0)::bigint,
    COALESCE(bp.hourly_send_limit, 100)::bigint,
    CASE WHEN COALESCE(dst.send_count, 0) > 0 
         THEN COALESCE(dst.bounce_count, 0)::numeric / dst.send_count 
         ELSE 0 END,
    0::numeric
  FROM brand_profiles bp
  LEFT JOIN LATERAL (
    SELECT send_count, bounce_count
    FROM send_counters 
    WHERE brand_id = p_brand_id
    ORDER BY created_at DESC
    LIMIT 1
  ) dst ON true
  WHERE bp.id = p_brand_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_client()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO system_flags (client_id, key, value)
  VALUES 
    (NEW.id, 'automation_enabled', true),
    (NEW.id, 'send_enabled', true),
    (NEW.id, 'imap_enabled', false),
    (NEW.id, 'discovery_enabled', true)
  ON CONFLICT (client_id, key) DO NOTHING;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_discovery_counter(p_brand_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE public.brand_profiles
    SET discovery_count_today = COALESCE(discovery_count_today, 0) + 1
    WHERE id = p_brand_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_api_usage(p_client_id uuid, p_api_key_id uuid, p_endpoint text, p_method text, p_status_code integer, p_response_time_ms integer, p_rate_limited boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO api_usage_logs (
        client_id,
        api_key_id,
        endpoint,
        method,
        status_code,
        response_time_ms,
        rate_limited
    )
    VALUES (
        p_client_id,
        p_api_key_id,
        p_endpoint,
        p_method,
        p_status_code,
        p_response_time_ms,
        p_rate_limited
    );

    UPDATE client_api_keys
    SET usage_count = usage_count + 1,
        last_used_at = now()
    WHERE id = p_api_key_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.log_audit(p_client_id uuid, p_actor_id text, p_actor_email text, p_action text, p_resource_type text, p_resource_id text, p_changes jsonb DEFAULT '{}'::jsonb, p_metadata jsonb DEFAULT '{}'::jsonb, p_ip_address inet DEFAULT NULL::inet)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO audit_logs (
        client_id,
        actor_id,
        actor_email,
        actor_type,
        action,
        resource_type,
        resource_id,
        changes,
        metadata,
        ip_address
    )
    VALUES (
        p_client_id,
        p_actor_id,
        p_actor_email,
        coalesce(p_actor_id, 'system'),
        p_action,
        p_resource_type,
        p_resource_id,
        p_changes,
        p_metadata,
        p_ip_address
    );

    UPDATE clients
    SET last_activity_at = now()
    WHERE id = p_client_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.match_discovery_embeddings(query_embedding public.vector, match_threshold double precision DEFAULT 0.65, match_count integer DEFAULT 5, filter_brand_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, brand_id uuid, intent_id uuid, content_type text, content_text text, metadata jsonb, similarity double precision)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    de.id,
    de.brand_id,
    de.intent_id,
    de.content_type,
    de.content_text,
    de.metadata,
    1 - (de.embedding <=> query_embedding) AS similarity
  FROM discovery_embeddings de
  WHERE
    (filter_brand_id IS NULL OR de.brand_id = filter_brand_id)
    AND 1 - (de.embedding <=> query_embedding) > match_threshold
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.move_enriched_to_companies()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into companies from discovered_companies where enrichment is successful
  INSERT INTO public.companies (
    brand_id,
    name,
    domain,
    website,
    status,
    source,
    source_id,
    confidence,
    created_at,
    updated_at
  )
  SELECT 
    dc.brand_id,
    dc.name,
    dc.domain,
    dc.website,
    'researching'::text,
    'discovered'::text,
    dc.id::text,
    dc.confidence,
    dc.discovered_at,
    now()
  FROM public.discovered_companies dc
  WHERE dc.enrichment_status IN ('success', 'PARTIAL', 'enriched')
    AND dc.processed = false
    AND NOT EXISTS (
      SELECT 1 FROM public.companies c 
      WHERE c.brand_id = dc.brand_id 
        AND c.domain = dc.domain
    );

  -- Mark as processed in discovered_companies
  UPDATE public.discovered_companies
  SET processed = true,
      enrichment_status = 'moved',
      updated_at = now()
  WHERE enrichment_status IN ('success', 'PARTIAL', 'enriched')
    AND processed = false;

  -- Log activity
  INSERT INTO public.activity_logs (brand_id, activity_type, description)
  SELECT 
    brand_id,
    'company_created'::text,
    'Moved ' || COUNT(*) || ' enriched companies to main table'
  FROM public.companies
  WHERE created_at > now() - interval '5 minutes'
  GROUP BY brand_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.register_bounce(p_brand_id uuid, p_domain text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  update brand_profiles
  set bounce_count = bounce_count + 1
  where id = p_brand_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.register_client_bounce(p_client_id uuid, p_is_hard boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE client_daily_send
    SET bounce_count = bounce_count + 1
    WHERE client_id = p_client_id AND send_date = CURRENT_DATE;

    IF p_is_hard THEN
        UPDATE clients
        SET auto_paused = true,
            last_activity_at = now()
        WHERE id = p_client_id;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.register_domain_bounce(p_brand_id uuid, p_domain text, p_is_hard boolean DEFAULT true)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE sending_domains
  SET bounce_count = bounce_count + 1,
      last_reset_at = CASE WHEN last_reset_at IS NULL OR last_reset_at < NOW() - INTERVAL '24 hours' THEN NOW() ELSE last_reset_at END
  WHERE brand_id = p_brand_id AND domain = p_domain;

  IF FOUND AND p_is_hard THEN
    UPDATE sending_domains
    SET is_active = false,
        disabled_reason = 'hard_bounce',
        disabled_at = NOW()
    WHERE brand_id = p_brand_id AND domain = p_domain
    AND (bounce_count::numeric / NULLIF(sent_today, 0)) > 0.02;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.reserve_send_quota(p_brand_id uuid, p_domain text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_daily_ok boolean;
  v_hourly_ok boolean;
BEGIN
  SELECT allowed INTO v_daily_ok 
  FROM rpc_reserve_daily_send(p_brand_id);
  
  SELECT allowed INTO v_hourly_ok 
  FROM rpc_reserve_hourly_send(p_brand_id);
  
  RETURN v_daily_ok AND v_hourly_ok;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.reset_discovery_counters()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  update public.brand_profiles
  set discovery_count_today = 0;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_activate_scoring_version(p_version_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE scoring_versions
  SET is_active = false
  WHERE brand_id = (SELECT brand_id FROM scoring_versions WHERE id = p_version_id);
  
  UPDATE scoring_versions
  SET is_active = true
  WHERE id = p_version_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_adjust_scoring_weights()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_config jsonb;
  v_row RECORD;
BEGIN
  FOR v_row IN SELECT brand_id FROM public.scoring_versions WHERE is_active = true LOOP
    SELECT scoring_config INTO v_config 
    FROM public.scoring_versions 
    WHERE brand_id = v_row.brand_id AND is_active = true
    LIMIT 1;

    IF v_config IS NOT NULL THEN
      UPDATE public.scoring_versions 
      SET scoring_config = v_config 
      WHERE brand_id = v_row.brand_id AND is_active = true;
    END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_backfill_member_user_id()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_member record;
BEGIN
  FOR v_member IN
    SELECT cm.id, cm.email, au.id as auth_id
    FROM public.client_members cm
    JOIN auth.users au ON au.email = cm.email
    WHERE cm.user_id IS NULL
  LOOP
    UPDATE public.client_members
    SET user_id = v_member.auth_id
    WHERE id = v_member.id;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_claim_companies(p_brand_id uuid, p_status text, p_limit integer)
 RETURNS SETOF public.companies
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT c.id
    FROM public.companies c
    WHERE
      c.brand_id = p_brand_id
      AND c.status = p_status
      AND (
        c.next_attempt_at IS NULL
        OR c.next_attempt_at <= now()
      )
    ORDER BY
      c.next_attempt_at NULLS FIRST,
      c.created_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.companies c
  SET
    status = p_status || '_processing',
    updated_at = now(),
    state_updated_at = now()
  FROM candidates
  WHERE c.id = candidates.id
  RETURNING c.*;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_claim_discovered_companies(p_limit integer)
 RETURNS SETOF public.discovered_companies
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH cte AS (
        SELECT id FROM public.discovered_companies
        WHERE processed = false
          AND (next_attempt_at IS NULL OR next_attempt_at <= now())
        ORDER BY discovered_at ASC
        LIMIT p_limit
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.discovered_companies d
    SET retry_count = d.retry_count
    FROM cte
    WHERE d.id = cte.id
    RETURNING d.*;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_claim_discovered_contacts(p_limit integer)
 RETURNS SETOF public.discovered_contacts
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH cte AS (
        SELECT dc.id FROM public.discovered_contacts dc
        WHERE dc.processed = false
          AND (dc.next_attempt_at IS NULL OR dc.next_attempt_at <= now())
        ORDER BY dc.created_at ASC
        LIMIT p_limit
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.discovered_contacts dc2
    SET
        retry_count = dc2.retry_count + 1,
        next_attempt_at = now() + interval '5 minutes'
    FROM cte
    WHERE dc2.id = cte.id
    RETURNING dc2.*;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_claim_discovery_sources(p_limit integer)
 RETURNS SETOF public.brand_discovery_sources
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE brand_discovery_sources s
    SET is_running = true, last_run_at = now()
    WHERE s.id IN (
        SELECT s2.id
        FROM brand_discovery_sources s2
        JOIN brand_profiles b ON b.id = s2.brand_id
        WHERE s2.is_active = true
          AND s2.is_running = false
          AND b.discovery_enabled = true
          AND b.manual_discovery_requested = true
          AND (s2.next_attempt_at IS NULL OR s2.next_attempt_at <= now())
        ORDER BY s2.last_run_at NULLS FIRST, s2.created_at ASC
        LIMIT p_limit
        FOR UPDATE SKIP LOCKED
    )
    RETURNING *;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_claim_inbound_message(p_message_id text, p_brand_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
begin
  insert into inbound_message_claims(message_id, brand_id)
  values (p_message_id, p_brand_id)
  on conflict do nothing;

  return found;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_claim_outreach_draft(p_company_id uuid)
 RETURNS public.outreach
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_row public.outreach;
BEGIN
  WITH cte AS (
    SELECT id
    FROM public.outreach
    WHERE company_id = p_company_id
      AND status = 'draft'
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.outreach o
  SET
    status = 'draft_processing',
    updated_at = now(),
    state_updated_at = now()
  FROM cte
  WHERE o.id = cte.id
  RETURNING o.* INTO v_row;

  RETURN v_row;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_close_company(p_company_id uuid, p_deal_value numeric, p_currency text, p_contract_length integer, p_payment_model text, p_gross_margin numeric)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_ltv NUMERIC;
BEGIN
    v_ltv := CASE
        WHEN p_payment_model = 'monthly' THEN p_deal_value * p_contract_length
        WHEN p_payment_model = 'annual' THEN p_deal_value * (p_contract_length / 12)
        ELSE p_deal_value
    END;

    UPDATE public.companies
    SET status = 'closed_won', deal_value = p_deal_value, lifetime_value = v_ltv,
        currency = p_currency, contract_length_months = p_contract_length,
        payment_model = p_payment_model, gross_margin = p_gross_margin,
        closed_at = now(), updated_at = now()
    WHERE id = p_company_id;

    UPDATE public.leads
    SET status = 'closed_won', deal_value = v_ltv, closed_at = now(), updated_at = now()
    WHERE company_id = p_company_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_complete_discovered_company(p_id uuid, p_success boolean, p_error text DEFAULT NULL::text, p_requires_enrichment boolean DEFAULT NULL::boolean)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_retry_count INT;
    v_source_id UUID;
    v_payload JSONB;
BEGIN
    SELECT retry_count, source_id, raw_payload
    INTO v_retry_count, v_source_id, v_payload
    FROM public.discovered_companies
    WHERE id = p_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    IF p_success THEN
        UPDATE public.discovered_companies
        SET
            processed = true,
            retry_count = 0,
            next_attempt_at = NULL,
            error = NULL,
            requires_enrichment = COALESCE(p_requires_enrichment, requires_enrichment)
        WHERE id = p_id;
        RETURN;
    END IF;

    v_retry_count := v_retry_count + 1;

    IF v_retry_count > 5 THEN
        INSERT INTO discovery_dead_letters (entity_type, entity_id, source_id, payload, error)
        VALUES ('company', p_id, v_source_id, v_payload, p_error);
        DELETE FROM public.discovered_companies WHERE id = p_id;
        RETURN;
    END IF;

    UPDATE public.discovered_companies
    SET
        retry_count = v_retry_count,
        next_attempt_at = now() + (interval '5 minutes' * v_retry_count),
        error = p_error
    WHERE id = p_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_complete_discovered_contact(p_id uuid, p_success boolean, p_error text DEFAULT NULL::text, p_requires_enrichment boolean DEFAULT NULL::boolean)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_retry_count INT;
    v_source_id UUID;
    v_payload JSONB;
BEGIN
    SELECT retry_count,
           (SELECT source_id FROM public.discovered_companies dc WHERE dc.id = discovered_company_id),
           raw_payload
    INTO v_retry_count, v_source_id, v_payload
    FROM public.discovered_contacts
    WHERE id = p_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    IF p_success THEN
        UPDATE public.discovered_contacts
        SET
            processed = true,
            retry_count = 0,
            next_attempt_at = NULL,
            error = NULL,
            requires_enrichment = COALESCE(p_requires_enrichment, requires_enrichment)
        WHERE id = p_id;
        RETURN;
    END IF;

    v_retry_count := v_retry_count + 1;

    IF v_retry_count > 5 THEN
        INSERT INTO discovery_dead_letters (entity_type, entity_id, source_id, payload, error)
        VALUES ('contact', p_id, v_source_id, v_payload, p_error);
        DELETE FROM public.discovered_contacts WHERE id = p_id;
        RETURN;
    END IF;

    UPDATE public.discovered_contacts
    SET
        retry_count = v_retry_count,
        next_attempt_at = now() + (interval '5 minutes' * v_retry_count),
        error = p_error
    WHERE id = p_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_consume_api_quota(p_source_id uuid, p_limit integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_window timestamptz;
  v_count int;
begin
  v_window := date_trunc('minute', now());

  insert into public.api_quota_counters(source_id, window_start, request_count)
  values (p_source_id, v_window, 1)
  on conflict (source_id, window_start)
  do update
    set request_count = api_quota_counters.request_count + 1
  returning request_count into v_count;

  if v_count > p_limit then
    return false;
  end if;

  return true;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_create_company_from_lead(p_lead_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_lead record;
  v_company_id uuid;
BEGIN
  SELECT * INTO v_lead
  FROM public.leads
  WHERE id = p_lead_id;

  IF v_lead.status <> 'icp_passed' THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_company_id
  FROM public.companies
  WHERE brand_id = v_lead.brand_id
    AND domain = v_lead.domain
  LIMIT 1;

  IF v_company_id IS NULL THEN
    INSERT INTO public.companies (
      brand_id,
      name,
      domain,
      status,
      source
    )
    VALUES (
      v_lead.brand_id,
      COALESCE(v_lead.domain, 'unknown'),
      v_lead.domain,
      'researching',
      v_lead.source
    )
    RETURNING id INTO v_company_id;
  END IF;

  UPDATE public.leads
  SET company_id = v_company_id
  WHERE id = p_lead_id;

  RETURN v_company_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_get_active_brands()
 RETURNS TABLE(id uuid)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select id
  from public.brand_profiles
  where is_active = true;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_get_imap_brands()
 RETURNS TABLE(id uuid, imap_email text, imap_password text, imap_host text, imap_port integer, imap_secure boolean)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  select
    id,
    imap_email,
    imap_password,
    imap_host,
    imap_port,
    imap_secure
  from public.brand_profiles
  where is_active = true
    and imap_enabled = true;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_increment_company_retry(p_id uuid, p_error text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO dead_letters (brand_id, entity_id, entity_type, failure_stage, error_message, retry_count)
  SELECT brand_id, id, 'company', status, p_error, retry_count
  FROM discovered_companies WHERE id = p_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_increment_domain_metric(p_product uuid, p_metric text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF p_metric = 'bounce' THEN
        UPDATE brand_profiles 
        SET bounce_count = COALESCE(bounce_count, 0) + 1 
        WHERE id = p_product;
    ELSIF p_metric = 'complaint' THEN
        UPDATE brand_profiles 
        SET complaint_count = COALESCE(complaint_count, 0) + 1 
        WHERE id = p_product;
    ELSIF p_metric = 'sent' THEN
        UPDATE brand_profiles 
        SET sent_count = COALESCE(sent_count, 0) + 1 
        WHERE id = p_product;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_ingest_lead(p_brand_id uuid, p_first_name text, p_last_name text, p_full_name text, p_email text, p_title text, p_company_name text, p_domain text, p_linkedin_url text, p_source text, p_source_id text, p_raw_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_lead_id UUID;
    v_company_id UUID;
BEGIN
    IF p_email IS NULL THEN
        RETURN NULL;
    END IF;

    IF public.rpc_is_blacklisted(p_email, p_domain) THEN
        RETURN NULL;
    END IF;

    SELECT id INTO v_lead_id
    FROM public.leads
    WHERE brand_id = p_brand_id AND email = p_email
    LIMIT 1;

    IF v_lead_id IS NOT NULL THEN
        RETURN v_lead_id;
    END IF;

    INSERT INTO public.leads (
        brand_id, first_name, last_name, full_name, email, domain,
        title, linkedin_url, source, source_id, raw_payload
    ) VALUES (
        p_brand_id, p_first_name, p_last_name, p_full_name, p_email, p_domain,
        p_title, p_linkedin_url, p_source, p_source_id, p_raw_payload
    )
    RETURNING id INTO v_lead_id;

    IF p_domain IS NOT NULL THEN
        SELECT id INTO v_company_id
        FROM public.companies
        WHERE brand_id = p_brand_id AND domain = p_domain
        LIMIT 1;

        IF v_company_id IS NULL THEN
            INSERT INTO public.companies (brand_id, name, domain, status, source)
            VALUES (p_brand_id, COALESCE(p_company_name, p_domain), p_domain, 'researching', p_source)
            RETURNING id INTO v_company_id;
        END IF;

        INSERT INTO lead_company_map (brand_id, lead_id, company_id)
        VALUES (p_brand_id, v_lead_id, v_company_id)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN v_lead_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_insert_negotiation_draft(p_company_id uuid, p_draft text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_brand_id uuid;
  v_lead_id uuid;
BEGIN
  SELECT brand_id INTO v_brand_id FROM public.companies WHERE id = p_company_id;
  
  SELECT lead_id INTO v_lead_id 
  FROM public.lead_company_map 
  WHERE company_id = p_company_id 
  LIMIT 1;

  INSERT INTO public.messages (brand_id, lead_id, body, direction, status)
  VALUES (v_brand_id, v_lead_id, p_draft, 'outbound', 'pending');
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_insert_reply(p_company_id uuid, p_lead_id uuid, p_message_id text, p_body text, p_subject text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO replies (company_id, message_id, raw_message, brand_id)
    SELECT p_company_id, p_message_id, p_body, brand_id
    FROM companies WHERE id = p_company_id
    ON CONFLICT (message_id) DO NOTHING;
    RETURN FOUND;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_is_blacklisted(p_email text, p_domain text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT true INTO v_exists
    FROM public.blacklist
    WHERE (email = p_email AND p_email IS NOT NULL)
       OR (domain = p_domain AND p_domain IS NOT NULL)
    LIMIT 1;
    RETURN COALESCE(v_exists, FALSE);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_mark_lead_contacted(p_lead_id uuid, p_subject text, p_body text, p_message_id text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.messages (lead_id, message_id, subject, body, direction, created_at)
    VALUES (p_lead_id, p_message_id, p_subject, p_body, 'outbound', now())
    ON CONFLICT (message_id) DO NOTHING;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    UPDATE public.leads
    SET status = 'contacted', contacted_at = now(), updated_at = now()
    WHERE id = p_lead_id;

    RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_recalibrate_lead_confidence(p_lead_id uuid, p_new_confidence numeric)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.leads
  SET confidence_score = p_new_confidence, last_outcome_at = now()
  WHERE id = p_lead_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_reclaim_stale_companies(p_brand_id uuid, p_processing_status text, p_timeout_seconds integer)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.companies
  SET
    status = replace(p_processing_status, '_processing', ''),
    updated_at = now(),
    state_updated_at = now()
  WHERE
    brand_id = p_brand_id
    AND status = p_processing_status
    AND state_updated_at < now() - make_interval(secs => p_timeout_seconds);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_register_failure(p_entity_type text, p_entity_id uuid, p_error text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_retry INT;
    v_delay INTERVAL;
BEGIN
    IF p_entity_type = 'company' THEN
        UPDATE public.companies
        SET retry_count = retry_count + 1, last_error = p_error
        WHERE id = p_entity_id
        RETURNING retry_count INTO v_retry;

        IF v_retry >= 5 THEN
            INSERT INTO dead_letter_queue (entity_type, entity_id, reason)
            VALUES ('company', p_entity_id, p_error);
            RETURN FALSE;
        END IF;

        v_delay := (POWER(2, v_retry) || ' minutes')::interval;
        UPDATE public.companies SET next_attempt_at = now() + v_delay WHERE id = p_entity_id;
        RETURN TRUE;

    ELSIF p_entity_type = 'lead' THEN
        UPDATE public.leads
        SET retry_count = retry_count + 1, last_error = p_error
        WHERE id = p_entity_id
        RETURNING retry_count INTO v_retry;

        IF v_retry >= 5 THEN
            INSERT INTO dead_letter_queue (entity_type, entity_id, reason)
            VALUES ('lead', p_entity_id, p_error);
            RETURN FALSE;
        END IF;

        v_delay := (POWER(2, v_retry) || ' minutes')::interval;
        UPDATE public.leads SET next_attempt_at = now() + v_delay WHERE id = p_entity_id;
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_release_discovery_source(p_source_id uuid, p_success boolean, p_error text DEFAULT NULL::text, p_companies integer DEFAULT 0, p_contacts integer DEFAULT 0, p_duration_ms integer DEFAULT NULL::integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_brand_id UUID;
BEGIN
    SELECT brand_id INTO v_brand_id
    FROM brand_discovery_sources
    WHERE id = p_source_id;

    UPDATE brand_discovery_sources
    SET
        is_running = false,
        last_status = CASE WHEN p_success THEN 'success' ELSE 'failed' END,
        last_error = p_error,
        retry_count = CASE WHEN p_success THEN 0 ELSE retry_count + 1 END,
        next_attempt_at = CASE
            WHEN p_success THEN NULL
            ELSE now() + (interval '1 minute' * (retry_count + 1))
        END
    WHERE id = p_source_id;

    IF p_success AND v_brand_id IS NOT NULL THEN
        UPDATE brand_profiles
        SET manual_discovery_requested = false
        WHERE id = v_brand_id;
    END IF;

    INSERT INTO discovery_metrics (
        source_id,
        companies_discovered,
        contacts_discovered,
        duration_ms,
        success,
        error
    ) VALUES (
        p_source_id,
        p_companies,
        p_contacts,
        p_duration_ms,
        p_success,
        p_error
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_request_manual_discovery(p_brand_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE brand_profiles
    SET manual_discovery_requested = true
    WHERE id = p_brand_id AND discovery_enabled = true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_reserve_daily_send(p_brand_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_limit integer;
  v_current integer;
BEGIN

  SELECT daily_send_limit
  INTO v_limit
  FROM public.brand_profiles
  WHERE id = p_brand_id;

  INSERT INTO public.daily_send_tracker (
    brand_id,
    send_date,
    send_count
  )
  VALUES (
    p_brand_id,
    current_date,
    0
  )
  ON CONFLICT (brand_id, send_date)
  DO NOTHING;

  SELECT send_count
  INTO v_current
  FROM public.daily_send_tracker
  WHERE brand_id = p_brand_id
    AND send_date = current_date
  FOR UPDATE;

  IF v_current >= v_limit THEN
    RETURN false;
  END IF;

  UPDATE public.daily_send_tracker
  SET send_count = send_count + 1
  WHERE brand_id = p_brand_id
    AND send_date = current_date;

  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_reserve_hourly_send(p_brand_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_bucket timestamptz := date_trunc('hour', now());
  current_count integer;
  hourly_limit integer;
BEGIN

  SELECT hourly_send_limit
  INTO hourly_limit
  FROM public.brand_profiles
  WHERE id = p_brand_id
    AND send_enabled = true;

  IF hourly_limit IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO public.send_counters (
    brand_id,
    counter_type,
    bucket_start,
    send_count
  )
  VALUES (
    p_brand_id,
    'hourly',
    current_bucket,
    0
  )
  ON CONFLICT (brand_id, counter_type, bucket_start)
  DO NOTHING;

  UPDATE public.send_counters
  SET send_count = send_count + 1
  WHERE brand_id = p_brand_id
    AND counter_type = 'hourly'
    AND bucket_start = current_bucket
    AND send_count < hourly_limit
  RETURNING send_count INTO current_count;

  RETURN current_count IS NOT NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_score_lead(p_lead_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  v_lead record;
  v_config jsonb;
  v_version_id uuid;
  v_score numeric := 0;
  v_threshold numeric := 0;
  v_breakdown jsonb := '{}'::jsonb;
  v_key text;
  v_value jsonb;
BEGIN

  -- 1️⃣ Load lead
  SELECT * INTO v_lead
  FROM public.leads
  WHERE id = p_lead_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- 2️⃣ Load active scoring config for brand
  SELECT scoring_config, id
  INTO v_config, v_version_id
  FROM public.scoring_versions
  WHERE brand_id = v_lead.brand_id
    AND is_active = true
  LIMIT 1;

  IF v_config IS NULL THEN
    RETURN;
  END IF;

  v_threshold := COALESCE((v_config->>'threshold')::numeric, 0);

  -- =====================================================
  -- TITLE MATCH SCORING
  -- =====================================================

  IF v_config->'weights' ? 'title_contains'
     AND v_lead.title IS NOT NULL
  THEN
    FOR v_key, v_value IN
      SELECT key, value
      FROM jsonb_each(v_config->'weights'->'title_contains')
    LOOP
      IF lower(v_lead.title) LIKE '%' || lower(v_key) || '%' THEN
        v_score := v_score + (v_value::numeric);
        v_breakdown := v_breakdown || jsonb_build_object(v_key, v_value);
      END IF;
    END LOOP;
  END IF;

  -- =====================================================
  -- GEO MATCH (DOMAIN BASED)
  -- =====================================================

  IF v_config->'weights' ? 'geo_contains'
     AND v_lead.domain IS NOT NULL
  THEN
    FOR v_key, v_value IN
      SELECT key, value
      FROM jsonb_each(v_config->'weights'->'geo_contains')
    LOOP
      IF lower(v_lead.domain) LIKE '%' || lower(v_key) || '%' THEN
        v_score := v_score + (v_value::numeric);
        v_breakdown := v_breakdown || jsonb_build_object(v_key, v_value);
      END IF;
    END LOOP;
  END IF;

  -- =====================================================
  -- FINAL DECISION
  -- =====================================================

  UPDATE public.leads
  SET lead_score = v_score,
      score_breakdown = v_breakdown,
      scoring_version_id = v_version_id,
      status = CASE
        WHEN v_score >= v_threshold THEN 'icp_passed'
        ELSE 'filtered_out'
      END,
      updated_at = now()
  WHERE id = p_lead_id;

END;$function$
;

CREATE OR REPLACE FUNCTION public.rpc_update_brand_deliverability(p_brand_id uuid, p_score numeric, p_auto_pause boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  update public.brand_profiles
  set
    deliverability_score = p_score,
    auto_paused = p_auto_pause,
    last_deliverability_check = now()
  where id = p_brand_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_update_company_status(p_brand_id uuid, p_company_id uuid, p_expected_status text, p_new_status text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_updated boolean;
BEGIN
  UPDATE public.companies
  SET status = p_new_status,
      updated_at = now()
  WHERE id = p_company_id
    AND brand_id = p_brand_id
    AND status = p_expected_status;

  v_updated := FOUND;
  RETURN v_updated;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_update_lead_status(p_lead_id uuid, p_new_status text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.leads
  SET status = p_new_status,
      updated_at = now()
  WHERE id = p_lead_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_update_signal_performance_for_company(p_company_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_lead record;
  v_key text;
  v_value jsonb;
  v_ltv numeric;
BEGIN

  SELECT lifetime_value INTO v_ltv
  FROM public.companies
  WHERE id = p_company_id;

  IF v_ltv IS NULL THEN
    RETURN;
  END IF;

  FOR v_lead IN
    SELECT *
    FROM public.leads
    WHERE company_id = p_company_id
      AND status = 'closed_won'
  LOOP

    FOR v_key, v_value IN
      SELECT key, value
      FROM jsonb_each(v_lead.score_breakdown)
    LOOP

      INSERT INTO public.signal_performance (
        brand_id,
        signal,
        total_leads,
        total_closed,
        total_revenue
      )
      VALUES (
        v_lead.brand_id,
        v_key,
        1,
        1,
        v_ltv
      )
      ON CONFLICT (brand_id, signal)
      DO UPDATE SET
        total_leads = signal_performance.total_leads + 1,
        total_closed = signal_performance.total_closed + 1,
        total_revenue = signal_performance.total_revenue + v_ltv;

    END LOOP;

  END LOOP;

END;
$function$
;

CREATE OR REPLACE FUNCTION public.rpc_update_signal_source_performance(p_brand_id uuid, p_source_id uuid, p_send_delta integer DEFAULT 0, p_reply_delta integer DEFAULT 0, p_bounce_delta integer DEFAULT 0)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO signal_source_performance (source_id, brand_id, sends, replies, bounces, last_updated)
  VALUES (p_source_id, p_brand_id, p_send_delta, p_reply_delta, p_bounce_delta, now())
  ON CONFLICT (source_id, brand_id) DO UPDATE SET
    sends = signal_source_performance.sends + p_send_delta,
    replies = signal_source_performance.replies + p_reply_delta,
    bounces = signal_source_performance.bounces + p_bounce_delta,
    last_updated = now();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.schedule_retry(p_lead_id uuid, p_error text, p_max_attempts integer DEFAULT 5)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
  v_retry int;
  v_delay interval;
begin
  select retry_count into v_retry
  from public.leads
  where id = p_lead_id
  for update;

  if v_retry is null then
    raise exception 'Lead not found';
  end if;

  v_retry := v_retry + 1;

  -- Exponential backoff
  if v_retry = 1 then
    v_delay := interval '5 minutes';
  elsif v_retry = 2 then
    v_delay := interval '15 minutes';
  elsif v_retry = 3 then
    v_delay := interval '1 hour';
  elsif v_retry = 4 then
    v_delay := interval '6 hours';
  else
    v_delay := interval '24 hours';
  end if;

  if v_retry >= p_max_attempts then
    -- Move to dead letter
    insert into public.dead_letters (
      brand_id,
      entity_type,
      entity_id,
      failure_stage,
      error_message,
      retry_count,
      last_attempt_at
    )
    select brand_id,
           'lead',
           id,
           status,
           p_error,
           v_retry,
           now()
    from public.leads
    where id = p_lead_id;

    update public.leads
    set status = 'error',
        last_error = p_error,
        retry_count = v_retry,
        state_updated_at = now()
    where id = p_lead_id;

  else
    update public.leads
    set retry_count = v_retry,
        next_retry_at = now() + v_delay,
        last_error = p_error,
        state_updated_at = now()
    where id = p_lead_id;
  end if;

end;
$function$
;

CREATE OR REPLACE FUNCTION public.score_leads_after_enrichment()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into leads from companies that are ready
  INSERT INTO public.leads (
    brand_id,
    first_name,
    last_name,
    full_name,
    email,
    domain,
    title,
    linkedin_url,
    source,
    source_id,
    status,
    created_at,
    updated_at
  )
  SELECT 
    c.brand_id,
    NULL,
    NULL,
    c.name,
    NULL,
    c.domain,
    NULL,
    c.linkedin_url,
    c.source,
    c.id::text,
    'new'::text,
    now(),
    now()
  FROM public.companies c
  WHERE c.status = 'researching'
    AND c.lead_score IS NULL
    AND EXISTS (
      SELECT 1 FROM public.discovered_companies dc
      WHERE dc.brand_id = c.brand_id
        AND dc.domain = c.domain
        AND dc.relevance_score >= 70
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.brand_id = c.brand_id
        AND l.domain = c.domain
    );

  -- Update company status
  UPDATE public.companies
  SET status = 'qualified',
      updated_at = now()
  WHERE id IN (
    SELECT c.id FROM public.companies c
    WHERE c.status = 'researching'
    AND EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.brand_id = c.brand_id
        AND l.domain = c.domain
    )
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_discovered_companies_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.trigger_create_company_from_lead()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_company_id uuid;
BEGIN

  -- Only trigger when status changes to icp_passed
  IF NEW.status = 'icp_passed'
     AND (OLD.status IS DISTINCT FROM 'icp_passed')
  THEN

    -- Skip if no domain
    IF NEW.domain IS NULL THEN
      RETURN NEW;
    END IF;

    -- Check existing company (brand-scoped)
    SELECT id INTO v_company_id
    FROM public.companies
    WHERE brand_id = NEW.brand_id
      AND domain = NEW.domain
    LIMIT 1;

    -- Create company if not exists
    IF v_company_id IS NULL THEN
      INSERT INTO public.companies (
        brand_id,
        name,
        domain,
        status,
        source,
        source_id
      )
      VALUES (
        NEW.brand_id,
        COALESCE(NEW.domain, 'unknown'),
        NEW.domain,
        'researching',
        NEW.source,
        NEW.source_id
      )
      RETURNING id INTO v_company_id;
    END IF;

    -- Link lead to company
    UPDATE public.leads
    SET company_id = v_company_id
    WHERE id = NEW.id;

    INSERT INTO public.lead_company_map (
      brand_id,
      lead_id,
      company_id
    )
    VALUES (
      NEW.brand_id,
      NEW.id,
      v_company_id
    )
    ON CONFLICT DO NOTHING;

  END IF;

  RETURN NEW;

END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_company_enrichment(p_company_id uuid, p_confidence numeric, p_company_name text, p_website text, p_domain text, p_status text, p_error text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.discovered_companies
    SET
        name = COALESCE(p_company_name, name),
        website = COALESCE(p_website, website),
        domain = COALESCE(p_domain, domain),
        confidence = p_confidence,
        enrichment_status = p_status,
        enrichment_error = p_error,
        requires_enrichment =
            CASE
                WHEN p_status IN ('SUCCESS', 'SKIPPED') THEN false
                WHEN enrichment_attempts >= 3 THEN false
                ELSE true
            END,
        next_attempt_at =
            CASE
                WHEN p_status = 'FAILED'
                THEN now() + interval '15 minutes'
                ELSE NULL
            END,
        updated_at = now()
    WHERE id = p_company_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_company_enrichment(p_company_id uuid, p_status text, p_enrichment_data jsonb DEFAULT NULL::jsonb, p_error text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE discovered_companies
    SET 
        enrichment_status = LOWER(p_status),
        enrichment_attempts = enrichment_attempts + 1,
        last_enrichment_at = NOW(),
        enrichment_data = COALESCE(p_enrichment_data, enrichment_data),
        enrichment_error = p_error,
        requires_enrichment = CASE 
            WHEN LOWER(p_status) IN ('success', 'enriched') THEN false 
            ELSE requires_enrichment 
        END
    WHERE id = p_company_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_contact_enrichment(p_contact_id uuid, p_confidence numeric, p_email text DEFAULT NULL::text, p_title text DEFAULT NULL::text, p_linkedin_url text DEFAULT NULL::text, p_intent_score numeric DEFAULT NULL::numeric, p_status text DEFAULT NULL::text, p_error text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE discovered_contacts
    SET 
        confidence = p_confidence,
        email = COALESCE(p_email, email),
        title = COALESCE(p_title, title),
        linkedin_url = COALESCE(p_linkedin_url, linkedin_url),
        intent_score = COALESCE(p_intent_score, intent_score),
        enrichment_status = CASE 
            WHEN p_status IS NOT NULL THEN LOWER(p_status)
            ELSE enrichment_status 
        END,
        enrichment_attempts = enrichment_attempts + 1,
        last_enrichment_at = NOW(),
        enrichment_error = p_error,
        requires_enrichment = CASE 
            WHEN LOWER(p_status) IN ('success', 'enriched') THEN false 
            ELSE requires_enrichment 
        END
    WHERE id = p_contact_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_contact_enrichment(p_contact_id uuid, p_email text, p_confidence numeric, p_status text, p_requires_enrichment boolean, p_source text, p_reasoning jsonb, p_error text, p_intent_score numeric, p_linkedin_url text, p_title text, p_attempts integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.discovered_contacts
    SET
        email = p_email,
        confidence = p_confidence,
        enrichment_status = p_status,
        requires_enrichment = p_requires_enrichment,
        enrichment_source = p_source,
        enrichment_reasoning = p_reasoning,
        enrichment_error = p_error,
        intent_score = p_intent_score,
        linkedin_url = p_linkedin_url,
        title = p_title,
        enrichment_attempts = p_attempts,
        updated_at = now()
    WHERE id = p_contact_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

create or replace view "public"."v_product_revenue_summary" as  SELECT product,
    sum(total_revenue) AS total_revenue,
    sum(total_closed) AS total_closed,
        CASE
            WHEN (sum(total_closed) > 0) THEN (sum(total_revenue) / (sum(total_closed))::numeric)
            ELSE (0)::numeric
        END AS avg_ticket
   FROM public.signal_performance
  GROUP BY product;


create or replace view "public"."v_signal_revenue_analytics" as  SELECT product,
    signal,
    total_leads,
    total_closed,
        CASE
            WHEN (total_closed > 0) THEN (total_revenue / (total_closed)::numeric)
            ELSE (0)::numeric
        END AS avg_revenue_per_close,
        CASE
            WHEN (total_leads > 0) THEN ((total_closed)::numeric / (total_leads)::numeric)
            ELSE (0)::numeric
        END AS close_rate,
    total_revenue
   FROM public.signal_performance sp
  ORDER BY
        CASE
            WHEN (total_closed > 0) THEN (total_revenue / (total_closed)::numeric)
            ELSE (0)::numeric
        END DESC;


grant delete on table "public"."activity_logs" to "anon";

grant insert on table "public"."activity_logs" to "anon";

grant references on table "public"."activity_logs" to "anon";

grant select on table "public"."activity_logs" to "anon";

grant trigger on table "public"."activity_logs" to "anon";

grant truncate on table "public"."activity_logs" to "anon";

grant update on table "public"."activity_logs" to "anon";

grant delete on table "public"."activity_logs" to "authenticated";

grant insert on table "public"."activity_logs" to "authenticated";

grant references on table "public"."activity_logs" to "authenticated";

grant select on table "public"."activity_logs" to "authenticated";

grant trigger on table "public"."activity_logs" to "authenticated";

grant truncate on table "public"."activity_logs" to "authenticated";

grant update on table "public"."activity_logs" to "authenticated";

grant delete on table "public"."activity_logs" to "service_role";

grant insert on table "public"."activity_logs" to "service_role";

grant references on table "public"."activity_logs" to "service_role";

grant select on table "public"."activity_logs" to "service_role";

grant trigger on table "public"."activity_logs" to "service_role";

grant truncate on table "public"."activity_logs" to "service_role";

grant update on table "public"."activity_logs" to "service_role";

grant delete on table "public"."api_quota_counters" to "anon";

grant insert on table "public"."api_quota_counters" to "anon";

grant references on table "public"."api_quota_counters" to "anon";

grant select on table "public"."api_quota_counters" to "anon";

grant trigger on table "public"."api_quota_counters" to "anon";

grant truncate on table "public"."api_quota_counters" to "anon";

grant update on table "public"."api_quota_counters" to "anon";

grant delete on table "public"."api_quota_counters" to "authenticated";

grant insert on table "public"."api_quota_counters" to "authenticated";

grant references on table "public"."api_quota_counters" to "authenticated";

grant select on table "public"."api_quota_counters" to "authenticated";

grant trigger on table "public"."api_quota_counters" to "authenticated";

grant truncate on table "public"."api_quota_counters" to "authenticated";

grant update on table "public"."api_quota_counters" to "authenticated";

grant delete on table "public"."api_quota_counters" to "service_role";

grant insert on table "public"."api_quota_counters" to "service_role";

grant references on table "public"."api_quota_counters" to "service_role";

grant select on table "public"."api_quota_counters" to "service_role";

grant trigger on table "public"."api_quota_counters" to "service_role";

grant truncate on table "public"."api_quota_counters" to "service_role";

grant update on table "public"."api_quota_counters" to "service_role";

grant delete on table "public"."api_rate_limit" to "anon";

grant insert on table "public"."api_rate_limit" to "anon";

grant references on table "public"."api_rate_limit" to "anon";

grant select on table "public"."api_rate_limit" to "anon";

grant trigger on table "public"."api_rate_limit" to "anon";

grant truncate on table "public"."api_rate_limit" to "anon";

grant update on table "public"."api_rate_limit" to "anon";

grant delete on table "public"."api_rate_limit" to "authenticated";

grant insert on table "public"."api_rate_limit" to "authenticated";

grant references on table "public"."api_rate_limit" to "authenticated";

grant select on table "public"."api_rate_limit" to "authenticated";

grant trigger on table "public"."api_rate_limit" to "authenticated";

grant truncate on table "public"."api_rate_limit" to "authenticated";

grant update on table "public"."api_rate_limit" to "authenticated";

grant delete on table "public"."api_rate_limit" to "service_role";

grant insert on table "public"."api_rate_limit" to "service_role";

grant references on table "public"."api_rate_limit" to "service_role";

grant select on table "public"."api_rate_limit" to "service_role";

grant trigger on table "public"."api_rate_limit" to "service_role";

grant truncate on table "public"."api_rate_limit" to "service_role";

grant update on table "public"."api_rate_limit" to "service_role";

grant delete on table "public"."api_usage_logs" to "anon";

grant insert on table "public"."api_usage_logs" to "anon";

grant references on table "public"."api_usage_logs" to "anon";

grant select on table "public"."api_usage_logs" to "anon";

grant trigger on table "public"."api_usage_logs" to "anon";

grant truncate on table "public"."api_usage_logs" to "anon";

grant update on table "public"."api_usage_logs" to "anon";

grant delete on table "public"."api_usage_logs" to "authenticated";

grant insert on table "public"."api_usage_logs" to "authenticated";

grant references on table "public"."api_usage_logs" to "authenticated";

grant select on table "public"."api_usage_logs" to "authenticated";

grant trigger on table "public"."api_usage_logs" to "authenticated";

grant truncate on table "public"."api_usage_logs" to "authenticated";

grant update on table "public"."api_usage_logs" to "authenticated";

grant delete on table "public"."api_usage_logs" to "service_role";

grant insert on table "public"."api_usage_logs" to "service_role";

grant references on table "public"."api_usage_logs" to "service_role";

grant select on table "public"."api_usage_logs" to "service_role";

grant trigger on table "public"."api_usage_logs" to "service_role";

grant truncate on table "public"."api_usage_logs" to "service_role";

grant update on table "public"."api_usage_logs" to "service_role";

grant delete on table "public"."audit_logs" to "anon";

grant insert on table "public"."audit_logs" to "anon";

grant references on table "public"."audit_logs" to "anon";

grant select on table "public"."audit_logs" to "anon";

grant trigger on table "public"."audit_logs" to "anon";

grant truncate on table "public"."audit_logs" to "anon";

grant update on table "public"."audit_logs" to "anon";

grant delete on table "public"."audit_logs" to "authenticated";

grant insert on table "public"."audit_logs" to "authenticated";

grant references on table "public"."audit_logs" to "authenticated";

grant select on table "public"."audit_logs" to "authenticated";

grant trigger on table "public"."audit_logs" to "authenticated";

grant truncate on table "public"."audit_logs" to "authenticated";

grant update on table "public"."audit_logs" to "authenticated";

grant delete on table "public"."audit_logs" to "service_role";

grant insert on table "public"."audit_logs" to "service_role";

grant references on table "public"."audit_logs" to "service_role";

grant select on table "public"."audit_logs" to "service_role";

grant trigger on table "public"."audit_logs" to "service_role";

grant truncate on table "public"."audit_logs" to "service_role";

grant update on table "public"."audit_logs" to "service_role";

grant delete on table "public"."blacklist" to "anon";

grant insert on table "public"."blacklist" to "anon";

grant references on table "public"."blacklist" to "anon";

grant select on table "public"."blacklist" to "anon";

grant trigger on table "public"."blacklist" to "anon";

grant truncate on table "public"."blacklist" to "anon";

grant update on table "public"."blacklist" to "anon";

grant delete on table "public"."blacklist" to "authenticated";

grant insert on table "public"."blacklist" to "authenticated";

grant references on table "public"."blacklist" to "authenticated";

grant select on table "public"."blacklist" to "authenticated";

grant trigger on table "public"."blacklist" to "authenticated";

grant truncate on table "public"."blacklist" to "authenticated";

grant update on table "public"."blacklist" to "authenticated";

grant delete on table "public"."blacklist" to "service_role";

grant insert on table "public"."blacklist" to "service_role";

grant references on table "public"."blacklist" to "service_role";

grant select on table "public"."blacklist" to "service_role";

grant trigger on table "public"."blacklist" to "service_role";

grant truncate on table "public"."blacklist" to "service_role";

grant update on table "public"."blacklist" to "service_role";

grant delete on table "public"."brand_discovery_sources" to "anon";

grant insert on table "public"."brand_discovery_sources" to "anon";

grant references on table "public"."brand_discovery_sources" to "anon";

grant select on table "public"."brand_discovery_sources" to "anon";

grant trigger on table "public"."brand_discovery_sources" to "anon";

grant truncate on table "public"."brand_discovery_sources" to "anon";

grant update on table "public"."brand_discovery_sources" to "anon";

grant delete on table "public"."brand_discovery_sources" to "authenticated";

grant insert on table "public"."brand_discovery_sources" to "authenticated";

grant references on table "public"."brand_discovery_sources" to "authenticated";

grant select on table "public"."brand_discovery_sources" to "authenticated";

grant trigger on table "public"."brand_discovery_sources" to "authenticated";

grant truncate on table "public"."brand_discovery_sources" to "authenticated";

grant update on table "public"."brand_discovery_sources" to "authenticated";

grant delete on table "public"."brand_discovery_sources" to "service_role";

grant insert on table "public"."brand_discovery_sources" to "service_role";

grant references on table "public"."brand_discovery_sources" to "service_role";

grant select on table "public"."brand_discovery_sources" to "service_role";

grant trigger on table "public"."brand_discovery_sources" to "service_role";

grant truncate on table "public"."brand_discovery_sources" to "service_role";

grant update on table "public"."brand_discovery_sources" to "service_role";

grant delete on table "public"."brand_intents" to "anon";

grant insert on table "public"."brand_intents" to "anon";

grant references on table "public"."brand_intents" to "anon";

grant select on table "public"."brand_intents" to "anon";

grant trigger on table "public"."brand_intents" to "anon";

grant truncate on table "public"."brand_intents" to "anon";

grant update on table "public"."brand_intents" to "anon";

grant delete on table "public"."brand_intents" to "authenticated";

grant insert on table "public"."brand_intents" to "authenticated";

grant references on table "public"."brand_intents" to "authenticated";

grant select on table "public"."brand_intents" to "authenticated";

grant trigger on table "public"."brand_intents" to "authenticated";

grant truncate on table "public"."brand_intents" to "authenticated";

grant update on table "public"."brand_intents" to "authenticated";

grant delete on table "public"."brand_intents" to "service_role";

grant insert on table "public"."brand_intents" to "service_role";

grant references on table "public"."brand_intents" to "service_role";

grant select on table "public"."brand_intents" to "service_role";

grant trigger on table "public"."brand_intents" to "service_role";

grant truncate on table "public"."brand_intents" to "service_role";

grant update on table "public"."brand_intents" to "service_role";

grant delete on table "public"."brand_profiles" to "anon";

grant insert on table "public"."brand_profiles" to "anon";

grant references on table "public"."brand_profiles" to "anon";

grant select on table "public"."brand_profiles" to "anon";

grant trigger on table "public"."brand_profiles" to "anon";

grant truncate on table "public"."brand_profiles" to "anon";

grant update on table "public"."brand_profiles" to "anon";

grant delete on table "public"."brand_profiles" to "authenticated";

grant insert on table "public"."brand_profiles" to "authenticated";

grant references on table "public"."brand_profiles" to "authenticated";

grant select on table "public"."brand_profiles" to "authenticated";

grant trigger on table "public"."brand_profiles" to "authenticated";

grant truncate on table "public"."brand_profiles" to "authenticated";

grant update on table "public"."brand_profiles" to "authenticated";

grant delete on table "public"."brand_profiles" to "service_role";

grant insert on table "public"."brand_profiles" to "service_role";

grant references on table "public"."brand_profiles" to "service_role";

grant select on table "public"."brand_profiles" to "service_role";

grant trigger on table "public"."brand_profiles" to "service_role";

grant truncate on table "public"."brand_profiles" to "service_role";

grant update on table "public"."brand_profiles" to "service_role";

grant delete on table "public"."brand_profiles_backup" to "anon";

grant insert on table "public"."brand_profiles_backup" to "anon";

grant references on table "public"."brand_profiles_backup" to "anon";

grant select on table "public"."brand_profiles_backup" to "anon";

grant trigger on table "public"."brand_profiles_backup" to "anon";

grant truncate on table "public"."brand_profiles_backup" to "anon";

grant update on table "public"."brand_profiles_backup" to "anon";

grant delete on table "public"."brand_profiles_backup" to "authenticated";

grant insert on table "public"."brand_profiles_backup" to "authenticated";

grant references on table "public"."brand_profiles_backup" to "authenticated";

grant select on table "public"."brand_profiles_backup" to "authenticated";

grant trigger on table "public"."brand_profiles_backup" to "authenticated";

grant truncate on table "public"."brand_profiles_backup" to "authenticated";

grant update on table "public"."brand_profiles_backup" to "authenticated";

grant delete on table "public"."brand_profiles_backup" to "service_role";

grant insert on table "public"."brand_profiles_backup" to "service_role";

grant references on table "public"."brand_profiles_backup" to "service_role";

grant select on table "public"."brand_profiles_backup" to "service_role";

grant trigger on table "public"."brand_profiles_backup" to "service_role";

grant truncate on table "public"."brand_profiles_backup" to "service_role";

grant update on table "public"."brand_profiles_backup" to "service_role";

grant delete on table "public"."campaign_analytics" to "anon";

grant insert on table "public"."campaign_analytics" to "anon";

grant references on table "public"."campaign_analytics" to "anon";

grant select on table "public"."campaign_analytics" to "anon";

grant trigger on table "public"."campaign_analytics" to "anon";

grant truncate on table "public"."campaign_analytics" to "anon";

grant update on table "public"."campaign_analytics" to "anon";

grant delete on table "public"."campaign_analytics" to "authenticated";

grant insert on table "public"."campaign_analytics" to "authenticated";

grant references on table "public"."campaign_analytics" to "authenticated";

grant select on table "public"."campaign_analytics" to "authenticated";

grant trigger on table "public"."campaign_analytics" to "authenticated";

grant truncate on table "public"."campaign_analytics" to "authenticated";

grant update on table "public"."campaign_analytics" to "authenticated";

grant delete on table "public"."campaign_analytics" to "service_role";

grant insert on table "public"."campaign_analytics" to "service_role";

grant references on table "public"."campaign_analytics" to "service_role";

grant select on table "public"."campaign_analytics" to "service_role";

grant trigger on table "public"."campaign_analytics" to "service_role";

grant truncate on table "public"."campaign_analytics" to "service_role";

grant update on table "public"."campaign_analytics" to "service_role";

grant delete on table "public"."circuit_breaker_state" to "anon";

grant insert on table "public"."circuit_breaker_state" to "anon";

grant references on table "public"."circuit_breaker_state" to "anon";

grant select on table "public"."circuit_breaker_state" to "anon";

grant trigger on table "public"."circuit_breaker_state" to "anon";

grant truncate on table "public"."circuit_breaker_state" to "anon";

grant update on table "public"."circuit_breaker_state" to "anon";

grant delete on table "public"."circuit_breaker_state" to "authenticated";

grant insert on table "public"."circuit_breaker_state" to "authenticated";

grant references on table "public"."circuit_breaker_state" to "authenticated";

grant select on table "public"."circuit_breaker_state" to "authenticated";

grant trigger on table "public"."circuit_breaker_state" to "authenticated";

grant truncate on table "public"."circuit_breaker_state" to "authenticated";

grant update on table "public"."circuit_breaker_state" to "authenticated";

grant delete on table "public"."circuit_breaker_state" to "service_role";

grant insert on table "public"."circuit_breaker_state" to "service_role";

grant references on table "public"."circuit_breaker_state" to "service_role";

grant select on table "public"."circuit_breaker_state" to "service_role";

grant trigger on table "public"."circuit_breaker_state" to "service_role";

grant truncate on table "public"."circuit_breaker_state" to "service_role";

grant update on table "public"."circuit_breaker_state" to "service_role";

grant delete on table "public"."client_api_keys" to "anon";

grant insert on table "public"."client_api_keys" to "anon";

grant references on table "public"."client_api_keys" to "anon";

grant select on table "public"."client_api_keys" to "anon";

grant trigger on table "public"."client_api_keys" to "anon";

grant truncate on table "public"."client_api_keys" to "anon";

grant update on table "public"."client_api_keys" to "anon";

grant delete on table "public"."client_api_keys" to "authenticated";

grant insert on table "public"."client_api_keys" to "authenticated";

grant references on table "public"."client_api_keys" to "authenticated";

grant select on table "public"."client_api_keys" to "authenticated";

grant trigger on table "public"."client_api_keys" to "authenticated";

grant truncate on table "public"."client_api_keys" to "authenticated";

grant update on table "public"."client_api_keys" to "authenticated";

grant delete on table "public"."client_api_keys" to "service_role";

grant insert on table "public"."client_api_keys" to "service_role";

grant references on table "public"."client_api_keys" to "service_role";

grant select on table "public"."client_api_keys" to "service_role";

grant trigger on table "public"."client_api_keys" to "service_role";

grant truncate on table "public"."client_api_keys" to "service_role";

grant update on table "public"."client_api_keys" to "service_role";

grant delete on table "public"."client_daily_send" to "anon";

grant insert on table "public"."client_daily_send" to "anon";

grant references on table "public"."client_daily_send" to "anon";

grant select on table "public"."client_daily_send" to "anon";

grant trigger on table "public"."client_daily_send" to "anon";

grant truncate on table "public"."client_daily_send" to "anon";

grant update on table "public"."client_daily_send" to "anon";

grant delete on table "public"."client_daily_send" to "authenticated";

grant insert on table "public"."client_daily_send" to "authenticated";

grant references on table "public"."client_daily_send" to "authenticated";

grant select on table "public"."client_daily_send" to "authenticated";

grant trigger on table "public"."client_daily_send" to "authenticated";

grant truncate on table "public"."client_daily_send" to "authenticated";

grant update on table "public"."client_daily_send" to "authenticated";

grant delete on table "public"."client_daily_send" to "service_role";

grant insert on table "public"."client_daily_send" to "service_role";

grant references on table "public"."client_daily_send" to "service_role";

grant select on table "public"."client_daily_send" to "service_role";

grant trigger on table "public"."client_daily_send" to "service_role";

grant truncate on table "public"."client_daily_send" to "service_role";

grant update on table "public"."client_daily_send" to "service_role";

grant delete on table "public"."client_hourly_send" to "anon";

grant insert on table "public"."client_hourly_send" to "anon";

grant references on table "public"."client_hourly_send" to "anon";

grant select on table "public"."client_hourly_send" to "anon";

grant trigger on table "public"."client_hourly_send" to "anon";

grant truncate on table "public"."client_hourly_send" to "anon";

grant update on table "public"."client_hourly_send" to "anon";

grant delete on table "public"."client_hourly_send" to "authenticated";

grant insert on table "public"."client_hourly_send" to "authenticated";

grant references on table "public"."client_hourly_send" to "authenticated";

grant select on table "public"."client_hourly_send" to "authenticated";

grant trigger on table "public"."client_hourly_send" to "authenticated";

grant truncate on table "public"."client_hourly_send" to "authenticated";

grant update on table "public"."client_hourly_send" to "authenticated";

grant delete on table "public"."client_hourly_send" to "service_role";

grant insert on table "public"."client_hourly_send" to "service_role";

grant references on table "public"."client_hourly_send" to "service_role";

grant select on table "public"."client_hourly_send" to "service_role";

grant trigger on table "public"."client_hourly_send" to "service_role";

grant truncate on table "public"."client_hourly_send" to "service_role";

grant update on table "public"."client_hourly_send" to "service_role";

grant delete on table "public"."client_members" to "anon";

grant insert on table "public"."client_members" to "anon";

grant references on table "public"."client_members" to "anon";

grant select on table "public"."client_members" to "anon";

grant trigger on table "public"."client_members" to "anon";

grant truncate on table "public"."client_members" to "anon";

grant update on table "public"."client_members" to "anon";

grant delete on table "public"."client_members" to "authenticated";

grant insert on table "public"."client_members" to "authenticated";

grant references on table "public"."client_members" to "authenticated";

grant select on table "public"."client_members" to "authenticated";

grant trigger on table "public"."client_members" to "authenticated";

grant truncate on table "public"."client_members" to "authenticated";

grant update on table "public"."client_members" to "authenticated";

grant delete on table "public"."client_members" to "service_role";

grant insert on table "public"."client_members" to "service_role";

grant references on table "public"."client_members" to "service_role";

grant select on table "public"."client_members" to "service_role";

grant trigger on table "public"."client_members" to "service_role";

grant truncate on table "public"."client_members" to "service_role";

grant update on table "public"."client_members" to "service_role";

grant delete on table "public"."client_settings" to "anon";

grant insert on table "public"."client_settings" to "anon";

grant references on table "public"."client_settings" to "anon";

grant select on table "public"."client_settings" to "anon";

grant trigger on table "public"."client_settings" to "anon";

grant truncate on table "public"."client_settings" to "anon";

grant update on table "public"."client_settings" to "anon";

grant delete on table "public"."client_settings" to "authenticated";

grant insert on table "public"."client_settings" to "authenticated";

grant references on table "public"."client_settings" to "authenticated";

grant select on table "public"."client_settings" to "authenticated";

grant trigger on table "public"."client_settings" to "authenticated";

grant truncate on table "public"."client_settings" to "authenticated";

grant update on table "public"."client_settings" to "authenticated";

grant delete on table "public"."client_settings" to "service_role";

grant insert on table "public"."client_settings" to "service_role";

grant references on table "public"."client_settings" to "service_role";

grant select on table "public"."client_settings" to "service_role";

grant trigger on table "public"."client_settings" to "service_role";

grant truncate on table "public"."client_settings" to "service_role";

grant update on table "public"."client_settings" to "service_role";

grant delete on table "public"."client_webhooks" to "anon";

grant insert on table "public"."client_webhooks" to "anon";

grant references on table "public"."client_webhooks" to "anon";

grant select on table "public"."client_webhooks" to "anon";

grant trigger on table "public"."client_webhooks" to "anon";

grant truncate on table "public"."client_webhooks" to "anon";

grant update on table "public"."client_webhooks" to "anon";

grant delete on table "public"."client_webhooks" to "authenticated";

grant insert on table "public"."client_webhooks" to "authenticated";

grant references on table "public"."client_webhooks" to "authenticated";

grant select on table "public"."client_webhooks" to "authenticated";

grant trigger on table "public"."client_webhooks" to "authenticated";

grant truncate on table "public"."client_webhooks" to "authenticated";

grant update on table "public"."client_webhooks" to "authenticated";

grant delete on table "public"."client_webhooks" to "service_role";

grant insert on table "public"."client_webhooks" to "service_role";

grant references on table "public"."client_webhooks" to "service_role";

grant select on table "public"."client_webhooks" to "service_role";

grant trigger on table "public"."client_webhooks" to "service_role";

grant truncate on table "public"."client_webhooks" to "service_role";

grant update on table "public"."client_webhooks" to "service_role";

grant delete on table "public"."clients" to "anon";

grant insert on table "public"."clients" to "anon";

grant references on table "public"."clients" to "anon";

grant select on table "public"."clients" to "anon";

grant trigger on table "public"."clients" to "anon";

grant truncate on table "public"."clients" to "anon";

grant update on table "public"."clients" to "anon";

grant delete on table "public"."clients" to "authenticated";

grant insert on table "public"."clients" to "authenticated";

grant references on table "public"."clients" to "authenticated";

grant select on table "public"."clients" to "authenticated";

grant trigger on table "public"."clients" to "authenticated";

grant truncate on table "public"."clients" to "authenticated";

grant update on table "public"."clients" to "authenticated";

grant delete on table "public"."clients" to "service_role";

grant insert on table "public"."clients" to "service_role";

grant references on table "public"."clients" to "service_role";

grant select on table "public"."clients" to "service_role";

grant trigger on table "public"."clients" to "service_role";

grant truncate on table "public"."clients" to "service_role";

grant update on table "public"."clients" to "service_role";

grant delete on table "public"."companies" to "anon";

grant insert on table "public"."companies" to "anon";

grant references on table "public"."companies" to "anon";

grant select on table "public"."companies" to "anon";

grant trigger on table "public"."companies" to "anon";

grant truncate on table "public"."companies" to "anon";

grant update on table "public"."companies" to "anon";

grant delete on table "public"."companies" to "authenticated";

grant insert on table "public"."companies" to "authenticated";

grant references on table "public"."companies" to "authenticated";

grant select on table "public"."companies" to "authenticated";

grant trigger on table "public"."companies" to "authenticated";

grant truncate on table "public"."companies" to "authenticated";

grant update on table "public"."companies" to "authenticated";

grant delete on table "public"."companies" to "service_role";

grant insert on table "public"."companies" to "service_role";

grant references on table "public"."companies" to "service_role";

grant select on table "public"."companies" to "service_role";

grant trigger on table "public"."companies" to "service_role";

grant truncate on table "public"."companies" to "service_role";

grant update on table "public"."companies" to "service_role";

grant delete on table "public"."daily_send_limits" to "anon";

grant insert on table "public"."daily_send_limits" to "anon";

grant references on table "public"."daily_send_limits" to "anon";

grant select on table "public"."daily_send_limits" to "anon";

grant trigger on table "public"."daily_send_limits" to "anon";

grant truncate on table "public"."daily_send_limits" to "anon";

grant update on table "public"."daily_send_limits" to "anon";

grant delete on table "public"."daily_send_limits" to "authenticated";

grant insert on table "public"."daily_send_limits" to "authenticated";

grant references on table "public"."daily_send_limits" to "authenticated";

grant select on table "public"."daily_send_limits" to "authenticated";

grant trigger on table "public"."daily_send_limits" to "authenticated";

grant truncate on table "public"."daily_send_limits" to "authenticated";

grant update on table "public"."daily_send_limits" to "authenticated";

grant delete on table "public"."daily_send_limits" to "service_role";

grant insert on table "public"."daily_send_limits" to "service_role";

grant references on table "public"."daily_send_limits" to "service_role";

grant select on table "public"."daily_send_limits" to "service_role";

grant trigger on table "public"."daily_send_limits" to "service_role";

grant truncate on table "public"."daily_send_limits" to "service_role";

grant update on table "public"."daily_send_limits" to "service_role";

grant delete on table "public"."daily_send_tracker" to "anon";

grant insert on table "public"."daily_send_tracker" to "anon";

grant references on table "public"."daily_send_tracker" to "anon";

grant select on table "public"."daily_send_tracker" to "anon";

grant trigger on table "public"."daily_send_tracker" to "anon";

grant truncate on table "public"."daily_send_tracker" to "anon";

grant update on table "public"."daily_send_tracker" to "anon";

grant delete on table "public"."daily_send_tracker" to "authenticated";

grant insert on table "public"."daily_send_tracker" to "authenticated";

grant references on table "public"."daily_send_tracker" to "authenticated";

grant select on table "public"."daily_send_tracker" to "authenticated";

grant trigger on table "public"."daily_send_tracker" to "authenticated";

grant truncate on table "public"."daily_send_tracker" to "authenticated";

grant update on table "public"."daily_send_tracker" to "authenticated";

grant delete on table "public"."daily_send_tracker" to "service_role";

grant insert on table "public"."daily_send_tracker" to "service_role";

grant references on table "public"."daily_send_tracker" to "service_role";

grant select on table "public"."daily_send_tracker" to "service_role";

grant trigger on table "public"."daily_send_tracker" to "service_role";

grant truncate on table "public"."daily_send_tracker" to "service_role";

grant update on table "public"."daily_send_tracker" to "service_role";

grant delete on table "public"."dead_letter_queue" to "anon";

grant insert on table "public"."dead_letter_queue" to "anon";

grant references on table "public"."dead_letter_queue" to "anon";

grant select on table "public"."dead_letter_queue" to "anon";

grant trigger on table "public"."dead_letter_queue" to "anon";

grant truncate on table "public"."dead_letter_queue" to "anon";

grant update on table "public"."dead_letter_queue" to "anon";

grant delete on table "public"."dead_letter_queue" to "authenticated";

grant insert on table "public"."dead_letter_queue" to "authenticated";

grant references on table "public"."dead_letter_queue" to "authenticated";

grant select on table "public"."dead_letter_queue" to "authenticated";

grant trigger on table "public"."dead_letter_queue" to "authenticated";

grant truncate on table "public"."dead_letter_queue" to "authenticated";

grant update on table "public"."dead_letter_queue" to "authenticated";

grant delete on table "public"."dead_letter_queue" to "service_role";

grant insert on table "public"."dead_letter_queue" to "service_role";

grant references on table "public"."dead_letter_queue" to "service_role";

grant select on table "public"."dead_letter_queue" to "service_role";

grant trigger on table "public"."dead_letter_queue" to "service_role";

grant truncate on table "public"."dead_letter_queue" to "service_role";

grant update on table "public"."dead_letter_queue" to "service_role";

grant delete on table "public"."dead_letters" to "anon";

grant insert on table "public"."dead_letters" to "anon";

grant references on table "public"."dead_letters" to "anon";

grant select on table "public"."dead_letters" to "anon";

grant trigger on table "public"."dead_letters" to "anon";

grant truncate on table "public"."dead_letters" to "anon";

grant update on table "public"."dead_letters" to "anon";

grant delete on table "public"."dead_letters" to "authenticated";

grant insert on table "public"."dead_letters" to "authenticated";

grant references on table "public"."dead_letters" to "authenticated";

grant select on table "public"."dead_letters" to "authenticated";

grant trigger on table "public"."dead_letters" to "authenticated";

grant truncate on table "public"."dead_letters" to "authenticated";

grant update on table "public"."dead_letters" to "authenticated";

grant delete on table "public"."dead_letters" to "service_role";

grant insert on table "public"."dead_letters" to "service_role";

grant references on table "public"."dead_letters" to "service_role";

grant select on table "public"."dead_letters" to "service_role";

grant trigger on table "public"."dead_letters" to "service_role";

grant truncate on table "public"."dead_letters" to "service_role";

grant update on table "public"."dead_letters" to "service_role";

grant delete on table "public"."discovered_companies" to "anon";

grant insert on table "public"."discovered_companies" to "anon";

grant references on table "public"."discovered_companies" to "anon";

grant select on table "public"."discovered_companies" to "anon";

grant trigger on table "public"."discovered_companies" to "anon";

grant truncate on table "public"."discovered_companies" to "anon";

grant update on table "public"."discovered_companies" to "anon";

grant delete on table "public"."discovered_companies" to "authenticated";

grant insert on table "public"."discovered_companies" to "authenticated";

grant references on table "public"."discovered_companies" to "authenticated";

grant select on table "public"."discovered_companies" to "authenticated";

grant trigger on table "public"."discovered_companies" to "authenticated";

grant truncate on table "public"."discovered_companies" to "authenticated";

grant update on table "public"."discovered_companies" to "authenticated";

grant delete on table "public"."discovered_companies" to "service_role";

grant insert on table "public"."discovered_companies" to "service_role";

grant references on table "public"."discovered_companies" to "service_role";

grant select on table "public"."discovered_companies" to "service_role";

grant trigger on table "public"."discovered_companies" to "service_role";

grant truncate on table "public"."discovered_companies" to "service_role";

grant update on table "public"."discovered_companies" to "service_role";

grant delete on table "public"."discovered_contacts" to "anon";

grant insert on table "public"."discovered_contacts" to "anon";

grant references on table "public"."discovered_contacts" to "anon";

grant select on table "public"."discovered_contacts" to "anon";

grant trigger on table "public"."discovered_contacts" to "anon";

grant truncate on table "public"."discovered_contacts" to "anon";

grant update on table "public"."discovered_contacts" to "anon";

grant delete on table "public"."discovered_contacts" to "authenticated";

grant insert on table "public"."discovered_contacts" to "authenticated";

grant references on table "public"."discovered_contacts" to "authenticated";

grant select on table "public"."discovered_contacts" to "authenticated";

grant trigger on table "public"."discovered_contacts" to "authenticated";

grant truncate on table "public"."discovered_contacts" to "authenticated";

grant update on table "public"."discovered_contacts" to "authenticated";

grant delete on table "public"."discovered_contacts" to "service_role";

grant insert on table "public"."discovered_contacts" to "service_role";

grant references on table "public"."discovered_contacts" to "service_role";

grant select on table "public"."discovered_contacts" to "service_role";

grant trigger on table "public"."discovered_contacts" to "service_role";

grant truncate on table "public"."discovered_contacts" to "service_role";

grant update on table "public"."discovered_contacts" to "service_role";

grant delete on table "public"."discovery_dead_letters" to "anon";

grant insert on table "public"."discovery_dead_letters" to "anon";

grant references on table "public"."discovery_dead_letters" to "anon";

grant select on table "public"."discovery_dead_letters" to "anon";

grant trigger on table "public"."discovery_dead_letters" to "anon";

grant truncate on table "public"."discovery_dead_letters" to "anon";

grant update on table "public"."discovery_dead_letters" to "anon";

grant delete on table "public"."discovery_dead_letters" to "authenticated";

grant insert on table "public"."discovery_dead_letters" to "authenticated";

grant references on table "public"."discovery_dead_letters" to "authenticated";

grant select on table "public"."discovery_dead_letters" to "authenticated";

grant trigger on table "public"."discovery_dead_letters" to "authenticated";

grant truncate on table "public"."discovery_dead_letters" to "authenticated";

grant update on table "public"."discovery_dead_letters" to "authenticated";

grant delete on table "public"."discovery_dead_letters" to "service_role";

grant insert on table "public"."discovery_dead_letters" to "service_role";

grant references on table "public"."discovery_dead_letters" to "service_role";

grant select on table "public"."discovery_dead_letters" to "service_role";

grant trigger on table "public"."discovery_dead_letters" to "service_role";

grant truncate on table "public"."discovery_dead_letters" to "service_role";

grant update on table "public"."discovery_dead_letters" to "service_role";

grant delete on table "public"."discovery_embeddings" to "anon";

grant insert on table "public"."discovery_embeddings" to "anon";

grant references on table "public"."discovery_embeddings" to "anon";

grant select on table "public"."discovery_embeddings" to "anon";

grant trigger on table "public"."discovery_embeddings" to "anon";

grant truncate on table "public"."discovery_embeddings" to "anon";

grant update on table "public"."discovery_embeddings" to "anon";

grant delete on table "public"."discovery_embeddings" to "authenticated";

grant insert on table "public"."discovery_embeddings" to "authenticated";

grant references on table "public"."discovery_embeddings" to "authenticated";

grant select on table "public"."discovery_embeddings" to "authenticated";

grant trigger on table "public"."discovery_embeddings" to "authenticated";

grant truncate on table "public"."discovery_embeddings" to "authenticated";

grant update on table "public"."discovery_embeddings" to "authenticated";

grant delete on table "public"."discovery_embeddings" to "service_role";

grant insert on table "public"."discovery_embeddings" to "service_role";

grant references on table "public"."discovery_embeddings" to "service_role";

grant select on table "public"."discovery_embeddings" to "service_role";

grant trigger on table "public"."discovery_embeddings" to "service_role";

grant truncate on table "public"."discovery_embeddings" to "service_role";

grant update on table "public"."discovery_embeddings" to "service_role";

grant delete on table "public"."discovery_metrics" to "anon";

grant insert on table "public"."discovery_metrics" to "anon";

grant references on table "public"."discovery_metrics" to "anon";

grant select on table "public"."discovery_metrics" to "anon";

grant trigger on table "public"."discovery_metrics" to "anon";

grant truncate on table "public"."discovery_metrics" to "anon";

grant update on table "public"."discovery_metrics" to "anon";

grant delete on table "public"."discovery_metrics" to "authenticated";

grant insert on table "public"."discovery_metrics" to "authenticated";

grant references on table "public"."discovery_metrics" to "authenticated";

grant select on table "public"."discovery_metrics" to "authenticated";

grant trigger on table "public"."discovery_metrics" to "authenticated";

grant truncate on table "public"."discovery_metrics" to "authenticated";

grant update on table "public"."discovery_metrics" to "authenticated";

grant delete on table "public"."discovery_metrics" to "service_role";

grant insert on table "public"."discovery_metrics" to "service_role";

grant references on table "public"."discovery_metrics" to "service_role";

grant select on table "public"."discovery_metrics" to "service_role";

grant trigger on table "public"."discovery_metrics" to "service_role";

grant truncate on table "public"."discovery_metrics" to "service_role";

grant update on table "public"."discovery_metrics" to "service_role";

grant delete on table "public"."discovery_sources" to "anon";

grant insert on table "public"."discovery_sources" to "anon";

grant references on table "public"."discovery_sources" to "anon";

grant select on table "public"."discovery_sources" to "anon";

grant trigger on table "public"."discovery_sources" to "anon";

grant truncate on table "public"."discovery_sources" to "anon";

grant update on table "public"."discovery_sources" to "anon";

grant delete on table "public"."discovery_sources" to "authenticated";

grant insert on table "public"."discovery_sources" to "authenticated";

grant references on table "public"."discovery_sources" to "authenticated";

grant select on table "public"."discovery_sources" to "authenticated";

grant trigger on table "public"."discovery_sources" to "authenticated";

grant truncate on table "public"."discovery_sources" to "authenticated";

grant update on table "public"."discovery_sources" to "authenticated";

grant delete on table "public"."discovery_sources" to "service_role";

grant insert on table "public"."discovery_sources" to "service_role";

grant references on table "public"."discovery_sources" to "service_role";

grant select on table "public"."discovery_sources" to "service_role";

grant trigger on table "public"."discovery_sources" to "service_role";

grant truncate on table "public"."discovery_sources" to "service_role";

grant update on table "public"."discovery_sources" to "service_role";

grant delete on table "public"."edge_function_secrets" to "anon";

grant insert on table "public"."edge_function_secrets" to "anon";

grant references on table "public"."edge_function_secrets" to "anon";

grant select on table "public"."edge_function_secrets" to "anon";

grant trigger on table "public"."edge_function_secrets" to "anon";

grant truncate on table "public"."edge_function_secrets" to "anon";

grant update on table "public"."edge_function_secrets" to "anon";

grant delete on table "public"."edge_function_secrets" to "authenticated";

grant insert on table "public"."edge_function_secrets" to "authenticated";

grant references on table "public"."edge_function_secrets" to "authenticated";

grant select on table "public"."edge_function_secrets" to "authenticated";

grant trigger on table "public"."edge_function_secrets" to "authenticated";

grant truncate on table "public"."edge_function_secrets" to "authenticated";

grant update on table "public"."edge_function_secrets" to "authenticated";

grant delete on table "public"."edge_function_secrets" to "service_role";

grant insert on table "public"."edge_function_secrets" to "service_role";

grant references on table "public"."edge_function_secrets" to "service_role";

grant select on table "public"."edge_function_secrets" to "service_role";

grant trigger on table "public"."edge_function_secrets" to "service_role";

grant truncate on table "public"."edge_function_secrets" to "service_role";

grant update on table "public"."edge_function_secrets" to "service_role";

grant delete on table "public"."email_events" to "anon";

grant insert on table "public"."email_events" to "anon";

grant references on table "public"."email_events" to "anon";

grant select on table "public"."email_events" to "anon";

grant trigger on table "public"."email_events" to "anon";

grant truncate on table "public"."email_events" to "anon";

grant update on table "public"."email_events" to "anon";

grant delete on table "public"."email_events" to "authenticated";

grant insert on table "public"."email_events" to "authenticated";

grant references on table "public"."email_events" to "authenticated";

grant select on table "public"."email_events" to "authenticated";

grant trigger on table "public"."email_events" to "authenticated";

grant truncate on table "public"."email_events" to "authenticated";

grant update on table "public"."email_events" to "authenticated";

grant delete on table "public"."email_events" to "service_role";

grant insert on table "public"."email_events" to "service_role";

grant references on table "public"."email_events" to "service_role";

grant select on table "public"."email_events" to "service_role";

grant trigger on table "public"."email_events" to "service_role";

grant truncate on table "public"."email_events" to "service_role";

grant update on table "public"."email_events" to "service_role";

grant delete on table "public"."enrichment_metrics" to "anon";

grant insert on table "public"."enrichment_metrics" to "anon";

grant references on table "public"."enrichment_metrics" to "anon";

grant select on table "public"."enrichment_metrics" to "anon";

grant trigger on table "public"."enrichment_metrics" to "anon";

grant truncate on table "public"."enrichment_metrics" to "anon";

grant update on table "public"."enrichment_metrics" to "anon";

grant delete on table "public"."enrichment_metrics" to "authenticated";

grant insert on table "public"."enrichment_metrics" to "authenticated";

grant references on table "public"."enrichment_metrics" to "authenticated";

grant select on table "public"."enrichment_metrics" to "authenticated";

grant trigger on table "public"."enrichment_metrics" to "authenticated";

grant truncate on table "public"."enrichment_metrics" to "authenticated";

grant update on table "public"."enrichment_metrics" to "authenticated";

grant delete on table "public"."enrichment_metrics" to "service_role";

grant insert on table "public"."enrichment_metrics" to "service_role";

grant references on table "public"."enrichment_metrics" to "service_role";

grant select on table "public"."enrichment_metrics" to "service_role";

grant trigger on table "public"."enrichment_metrics" to "service_role";

grant truncate on table "public"."enrichment_metrics" to "service_role";

grant update on table "public"."enrichment_metrics" to "service_role";

grant delete on table "public"."inbound_events" to "anon";

grant insert on table "public"."inbound_events" to "anon";

grant references on table "public"."inbound_events" to "anon";

grant select on table "public"."inbound_events" to "anon";

grant trigger on table "public"."inbound_events" to "anon";

grant truncate on table "public"."inbound_events" to "anon";

grant update on table "public"."inbound_events" to "anon";

grant delete on table "public"."inbound_events" to "authenticated";

grant insert on table "public"."inbound_events" to "authenticated";

grant references on table "public"."inbound_events" to "authenticated";

grant select on table "public"."inbound_events" to "authenticated";

grant trigger on table "public"."inbound_events" to "authenticated";

grant truncate on table "public"."inbound_events" to "authenticated";

grant update on table "public"."inbound_events" to "authenticated";

grant delete on table "public"."inbound_events" to "service_role";

grant insert on table "public"."inbound_events" to "service_role";

grant references on table "public"."inbound_events" to "service_role";

grant select on table "public"."inbound_events" to "service_role";

grant trigger on table "public"."inbound_events" to "service_role";

grant truncate on table "public"."inbound_events" to "service_role";

grant update on table "public"."inbound_events" to "service_role";

grant delete on table "public"."inbound_message_claims" to "anon";

grant insert on table "public"."inbound_message_claims" to "anon";

grant references on table "public"."inbound_message_claims" to "anon";

grant select on table "public"."inbound_message_claims" to "anon";

grant trigger on table "public"."inbound_message_claims" to "anon";

grant truncate on table "public"."inbound_message_claims" to "anon";

grant update on table "public"."inbound_message_claims" to "anon";

grant delete on table "public"."inbound_message_claims" to "authenticated";

grant insert on table "public"."inbound_message_claims" to "authenticated";

grant references on table "public"."inbound_message_claims" to "authenticated";

grant select on table "public"."inbound_message_claims" to "authenticated";

grant trigger on table "public"."inbound_message_claims" to "authenticated";

grant truncate on table "public"."inbound_message_claims" to "authenticated";

grant update on table "public"."inbound_message_claims" to "authenticated";

grant delete on table "public"."inbound_message_claims" to "service_role";

grant insert on table "public"."inbound_message_claims" to "service_role";

grant references on table "public"."inbound_message_claims" to "service_role";

grant select on table "public"."inbound_message_claims" to "service_role";

grant trigger on table "public"."inbound_message_claims" to "service_role";

grant truncate on table "public"."inbound_message_claims" to "service_role";

grant update on table "public"."inbound_message_claims" to "service_role";

grant delete on table "public"."lead_company_map" to "anon";

grant insert on table "public"."lead_company_map" to "anon";

grant references on table "public"."lead_company_map" to "anon";

grant select on table "public"."lead_company_map" to "anon";

grant trigger on table "public"."lead_company_map" to "anon";

grant truncate on table "public"."lead_company_map" to "anon";

grant update on table "public"."lead_company_map" to "anon";

grant delete on table "public"."lead_company_map" to "authenticated";

grant insert on table "public"."lead_company_map" to "authenticated";

grant references on table "public"."lead_company_map" to "authenticated";

grant select on table "public"."lead_company_map" to "authenticated";

grant trigger on table "public"."lead_company_map" to "authenticated";

grant truncate on table "public"."lead_company_map" to "authenticated";

grant update on table "public"."lead_company_map" to "authenticated";

grant delete on table "public"."lead_company_map" to "service_role";

grant insert on table "public"."lead_company_map" to "service_role";

grant references on table "public"."lead_company_map" to "service_role";

grant select on table "public"."lead_company_map" to "service_role";

grant trigger on table "public"."lead_company_map" to "service_role";

grant truncate on table "public"."lead_company_map" to "service_role";

grant update on table "public"."lead_company_map" to "service_role";

grant delete on table "public"."lead_import_batches" to "anon";

grant insert on table "public"."lead_import_batches" to "anon";

grant references on table "public"."lead_import_batches" to "anon";

grant select on table "public"."lead_import_batches" to "anon";

grant trigger on table "public"."lead_import_batches" to "anon";

grant truncate on table "public"."lead_import_batches" to "anon";

grant update on table "public"."lead_import_batches" to "anon";

grant delete on table "public"."lead_import_batches" to "authenticated";

grant insert on table "public"."lead_import_batches" to "authenticated";

grant references on table "public"."lead_import_batches" to "authenticated";

grant select on table "public"."lead_import_batches" to "authenticated";

grant trigger on table "public"."lead_import_batches" to "authenticated";

grant truncate on table "public"."lead_import_batches" to "authenticated";

grant update on table "public"."lead_import_batches" to "authenticated";

grant delete on table "public"."lead_import_batches" to "service_role";

grant insert on table "public"."lead_import_batches" to "service_role";

grant references on table "public"."lead_import_batches" to "service_role";

grant select on table "public"."lead_import_batches" to "service_role";

grant trigger on table "public"."lead_import_batches" to "service_role";

grant truncate on table "public"."lead_import_batches" to "service_role";

grant update on table "public"."lead_import_batches" to "service_role";

grant delete on table "public"."leads" to "anon";

grant insert on table "public"."leads" to "anon";

grant references on table "public"."leads" to "anon";

grant select on table "public"."leads" to "anon";

grant trigger on table "public"."leads" to "anon";

grant truncate on table "public"."leads" to "anon";

grant update on table "public"."leads" to "anon";

grant delete on table "public"."leads" to "authenticated";

grant insert on table "public"."leads" to "authenticated";

grant references on table "public"."leads" to "authenticated";

grant select on table "public"."leads" to "authenticated";

grant trigger on table "public"."leads" to "authenticated";

grant truncate on table "public"."leads" to "authenticated";

grant update on table "public"."leads" to "authenticated";

grant delete on table "public"."leads" to "service_role";

grant insert on table "public"."leads" to "service_role";

grant references on table "public"."leads" to "service_role";

grant select on table "public"."leads" to "service_role";

grant trigger on table "public"."leads" to "service_role";

grant truncate on table "public"."leads" to "service_role";

grant update on table "public"."leads" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."negotiation_drafts" to "anon";

grant insert on table "public"."negotiation_drafts" to "anon";

grant references on table "public"."negotiation_drafts" to "anon";

grant select on table "public"."negotiation_drafts" to "anon";

grant trigger on table "public"."negotiation_drafts" to "anon";

grant truncate on table "public"."negotiation_drafts" to "anon";

grant update on table "public"."negotiation_drafts" to "anon";

grant delete on table "public"."negotiation_drafts" to "authenticated";

grant insert on table "public"."negotiation_drafts" to "authenticated";

grant references on table "public"."negotiation_drafts" to "authenticated";

grant select on table "public"."negotiation_drafts" to "authenticated";

grant trigger on table "public"."negotiation_drafts" to "authenticated";

grant truncate on table "public"."negotiation_drafts" to "authenticated";

grant update on table "public"."negotiation_drafts" to "authenticated";

grant delete on table "public"."negotiation_drafts" to "service_role";

grant insert on table "public"."negotiation_drafts" to "service_role";

grant references on table "public"."negotiation_drafts" to "service_role";

grant select on table "public"."negotiation_drafts" to "service_role";

grant trigger on table "public"."negotiation_drafts" to "service_role";

grant truncate on table "public"."negotiation_drafts" to "service_role";

grant update on table "public"."negotiation_drafts" to "service_role";

grant delete on table "public"."notification_preferences" to "anon";

grant insert on table "public"."notification_preferences" to "anon";

grant references on table "public"."notification_preferences" to "anon";

grant select on table "public"."notification_preferences" to "anon";

grant trigger on table "public"."notification_preferences" to "anon";

grant truncate on table "public"."notification_preferences" to "anon";

grant update on table "public"."notification_preferences" to "anon";

grant delete on table "public"."notification_preferences" to "authenticated";

grant insert on table "public"."notification_preferences" to "authenticated";

grant references on table "public"."notification_preferences" to "authenticated";

grant select on table "public"."notification_preferences" to "authenticated";

grant trigger on table "public"."notification_preferences" to "authenticated";

grant truncate on table "public"."notification_preferences" to "authenticated";

grant update on table "public"."notification_preferences" to "authenticated";

grant delete on table "public"."notification_preferences" to "service_role";

grant insert on table "public"."notification_preferences" to "service_role";

grant references on table "public"."notification_preferences" to "service_role";

grant select on table "public"."notification_preferences" to "service_role";

grant trigger on table "public"."notification_preferences" to "service_role";

grant truncate on table "public"."notification_preferences" to "service_role";

grant update on table "public"."notification_preferences" to "service_role";

grant delete on table "public"."opportunities" to "anon";

grant insert on table "public"."opportunities" to "anon";

grant references on table "public"."opportunities" to "anon";

grant select on table "public"."opportunities" to "anon";

grant trigger on table "public"."opportunities" to "anon";

grant truncate on table "public"."opportunities" to "anon";

grant update on table "public"."opportunities" to "anon";

grant delete on table "public"."opportunities" to "authenticated";

grant insert on table "public"."opportunities" to "authenticated";

grant references on table "public"."opportunities" to "authenticated";

grant select on table "public"."opportunities" to "authenticated";

grant trigger on table "public"."opportunities" to "authenticated";

grant truncate on table "public"."opportunities" to "authenticated";

grant update on table "public"."opportunities" to "authenticated";

grant delete on table "public"."opportunities" to "service_role";

grant insert on table "public"."opportunities" to "service_role";

grant references on table "public"."opportunities" to "service_role";

grant select on table "public"."opportunities" to "service_role";

grant trigger on table "public"."opportunities" to "service_role";

grant truncate on table "public"."opportunities" to "service_role";

grant update on table "public"."opportunities" to "service_role";

grant delete on table "public"."outbound_events" to "anon";

grant insert on table "public"."outbound_events" to "anon";

grant references on table "public"."outbound_events" to "anon";

grant select on table "public"."outbound_events" to "anon";

grant trigger on table "public"."outbound_events" to "anon";

grant truncate on table "public"."outbound_events" to "anon";

grant update on table "public"."outbound_events" to "anon";

grant delete on table "public"."outbound_events" to "authenticated";

grant insert on table "public"."outbound_events" to "authenticated";

grant references on table "public"."outbound_events" to "authenticated";

grant select on table "public"."outbound_events" to "authenticated";

grant trigger on table "public"."outbound_events" to "authenticated";

grant truncate on table "public"."outbound_events" to "authenticated";

grant update on table "public"."outbound_events" to "authenticated";

grant delete on table "public"."outbound_events" to "service_role";

grant insert on table "public"."outbound_events" to "service_role";

grant references on table "public"."outbound_events" to "service_role";

grant select on table "public"."outbound_events" to "service_role";

grant trigger on table "public"."outbound_events" to "service_role";

grant truncate on table "public"."outbound_events" to "service_role";

grant update on table "public"."outbound_events" to "service_role";

grant delete on table "public"."outreach" to "anon";

grant insert on table "public"."outreach" to "anon";

grant references on table "public"."outreach" to "anon";

grant select on table "public"."outreach" to "anon";

grant trigger on table "public"."outreach" to "anon";

grant truncate on table "public"."outreach" to "anon";

grant update on table "public"."outreach" to "anon";

grant delete on table "public"."outreach" to "authenticated";

grant insert on table "public"."outreach" to "authenticated";

grant references on table "public"."outreach" to "authenticated";

grant select on table "public"."outreach" to "authenticated";

grant trigger on table "public"."outreach" to "authenticated";

grant truncate on table "public"."outreach" to "authenticated";

grant update on table "public"."outreach" to "authenticated";

grant delete on table "public"."outreach" to "service_role";

grant insert on table "public"."outreach" to "service_role";

grant references on table "public"."outreach" to "service_role";

grant select on table "public"."outreach" to "service_role";

grant trigger on table "public"."outreach" to "service_role";

grant truncate on table "public"."outreach" to "service_role";

grant update on table "public"."outreach" to "service_role";

grant delete on table "public"."qualification" to "anon";

grant insert on table "public"."qualification" to "anon";

grant references on table "public"."qualification" to "anon";

grant select on table "public"."qualification" to "anon";

grant trigger on table "public"."qualification" to "anon";

grant truncate on table "public"."qualification" to "anon";

grant update on table "public"."qualification" to "anon";

grant delete on table "public"."qualification" to "authenticated";

grant insert on table "public"."qualification" to "authenticated";

grant references on table "public"."qualification" to "authenticated";

grant select on table "public"."qualification" to "authenticated";

grant trigger on table "public"."qualification" to "authenticated";

grant truncate on table "public"."qualification" to "authenticated";

grant update on table "public"."qualification" to "authenticated";

grant delete on table "public"."qualification" to "service_role";

grant insert on table "public"."qualification" to "service_role";

grant references on table "public"."qualification" to "service_role";

grant select on table "public"."qualification" to "service_role";

grant trigger on table "public"."qualification" to "service_role";

grant truncate on table "public"."qualification" to "service_role";

grant update on table "public"."qualification" to "service_role";

grant delete on table "public"."replies" to "anon";

grant insert on table "public"."replies" to "anon";

grant references on table "public"."replies" to "anon";

grant select on table "public"."replies" to "anon";

grant trigger on table "public"."replies" to "anon";

grant truncate on table "public"."replies" to "anon";

grant update on table "public"."replies" to "anon";

grant delete on table "public"."replies" to "authenticated";

grant insert on table "public"."replies" to "authenticated";

grant references on table "public"."replies" to "authenticated";

grant select on table "public"."replies" to "authenticated";

grant trigger on table "public"."replies" to "authenticated";

grant truncate on table "public"."replies" to "authenticated";

grant update on table "public"."replies" to "authenticated";

grant delete on table "public"."replies" to "service_role";

grant insert on table "public"."replies" to "service_role";

grant references on table "public"."replies" to "service_role";

grant select on table "public"."replies" to "service_role";

grant trigger on table "public"."replies" to "service_role";

grant truncate on table "public"."replies" to "service_role";

grant update on table "public"."replies" to "service_role";

grant delete on table "public"."research" to "anon";

grant insert on table "public"."research" to "anon";

grant references on table "public"."research" to "anon";

grant select on table "public"."research" to "anon";

grant trigger on table "public"."research" to "anon";

grant truncate on table "public"."research" to "anon";

grant update on table "public"."research" to "anon";

grant delete on table "public"."research" to "authenticated";

grant insert on table "public"."research" to "authenticated";

grant references on table "public"."research" to "authenticated";

grant select on table "public"."research" to "authenticated";

grant trigger on table "public"."research" to "authenticated";

grant truncate on table "public"."research" to "authenticated";

grant update on table "public"."research" to "authenticated";

grant delete on table "public"."research" to "service_role";

grant insert on table "public"."research" to "service_role";

grant references on table "public"."research" to "service_role";

grant select on table "public"."research" to "service_role";

grant trigger on table "public"."research" to "service_role";

grant truncate on table "public"."research" to "service_role";

grant update on table "public"."research" to "service_role";

grant delete on table "public"."scoring_versions" to "anon";

grant insert on table "public"."scoring_versions" to "anon";

grant references on table "public"."scoring_versions" to "anon";

grant select on table "public"."scoring_versions" to "anon";

grant trigger on table "public"."scoring_versions" to "anon";

grant truncate on table "public"."scoring_versions" to "anon";

grant update on table "public"."scoring_versions" to "anon";

grant delete on table "public"."scoring_versions" to "authenticated";

grant insert on table "public"."scoring_versions" to "authenticated";

grant references on table "public"."scoring_versions" to "authenticated";

grant select on table "public"."scoring_versions" to "authenticated";

grant trigger on table "public"."scoring_versions" to "authenticated";

grant truncate on table "public"."scoring_versions" to "authenticated";

grant update on table "public"."scoring_versions" to "authenticated";

grant delete on table "public"."scoring_versions" to "service_role";

grant insert on table "public"."scoring_versions" to "service_role";

grant references on table "public"."scoring_versions" to "service_role";

grant select on table "public"."scoring_versions" to "service_role";

grant trigger on table "public"."scoring_versions" to "service_role";

grant truncate on table "public"."scoring_versions" to "service_role";

grant update on table "public"."scoring_versions" to "service_role";

grant delete on table "public"."send_counters" to "anon";

grant insert on table "public"."send_counters" to "anon";

grant references on table "public"."send_counters" to "anon";

grant select on table "public"."send_counters" to "anon";

grant trigger on table "public"."send_counters" to "anon";

grant truncate on table "public"."send_counters" to "anon";

grant update on table "public"."send_counters" to "anon";

grant delete on table "public"."send_counters" to "authenticated";

grant insert on table "public"."send_counters" to "authenticated";

grant references on table "public"."send_counters" to "authenticated";

grant select on table "public"."send_counters" to "authenticated";

grant trigger on table "public"."send_counters" to "authenticated";

grant truncate on table "public"."send_counters" to "authenticated";

grant update on table "public"."send_counters" to "authenticated";

grant delete on table "public"."send_counters" to "service_role";

grant insert on table "public"."send_counters" to "service_role";

grant references on table "public"."send_counters" to "service_role";

grant select on table "public"."send_counters" to "service_role";

grant trigger on table "public"."send_counters" to "service_role";

grant truncate on table "public"."send_counters" to "service_role";

grant update on table "public"."send_counters" to "service_role";

grant delete on table "public"."sending_domains" to "anon";

grant insert on table "public"."sending_domains" to "anon";

grant references on table "public"."sending_domains" to "anon";

grant select on table "public"."sending_domains" to "anon";

grant trigger on table "public"."sending_domains" to "anon";

grant truncate on table "public"."sending_domains" to "anon";

grant update on table "public"."sending_domains" to "anon";

grant delete on table "public"."sending_domains" to "authenticated";

grant insert on table "public"."sending_domains" to "authenticated";

grant references on table "public"."sending_domains" to "authenticated";

grant select on table "public"."sending_domains" to "authenticated";

grant trigger on table "public"."sending_domains" to "authenticated";

grant truncate on table "public"."sending_domains" to "authenticated";

grant update on table "public"."sending_domains" to "authenticated";

grant delete on table "public"."sending_domains" to "service_role";

grant insert on table "public"."sending_domains" to "service_role";

grant references on table "public"."sending_domains" to "service_role";

grant select on table "public"."sending_domains" to "service_role";

grant trigger on table "public"."sending_domains" to "service_role";

grant truncate on table "public"."sending_domains" to "service_role";

grant update on table "public"."sending_domains" to "service_role";

grant delete on table "public"."sent_messages" to "anon";

grant insert on table "public"."sent_messages" to "anon";

grant references on table "public"."sent_messages" to "anon";

grant select on table "public"."sent_messages" to "anon";

grant trigger on table "public"."sent_messages" to "anon";

grant truncate on table "public"."sent_messages" to "anon";

grant update on table "public"."sent_messages" to "anon";

grant delete on table "public"."sent_messages" to "authenticated";

grant insert on table "public"."sent_messages" to "authenticated";

grant references on table "public"."sent_messages" to "authenticated";

grant select on table "public"."sent_messages" to "authenticated";

grant trigger on table "public"."sent_messages" to "authenticated";

grant truncate on table "public"."sent_messages" to "authenticated";

grant update on table "public"."sent_messages" to "authenticated";

grant delete on table "public"."sent_messages" to "service_role";

grant insert on table "public"."sent_messages" to "service_role";

grant references on table "public"."sent_messages" to "service_role";

grant select on table "public"."sent_messages" to "service_role";

grant trigger on table "public"."sent_messages" to "service_role";

grant truncate on table "public"."sent_messages" to "service_role";

grant update on table "public"."sent_messages" to "service_role";

grant delete on table "public"."signal_performance" to "anon";

grant insert on table "public"."signal_performance" to "anon";

grant references on table "public"."signal_performance" to "anon";

grant select on table "public"."signal_performance" to "anon";

grant trigger on table "public"."signal_performance" to "anon";

grant truncate on table "public"."signal_performance" to "anon";

grant update on table "public"."signal_performance" to "anon";

grant delete on table "public"."signal_performance" to "authenticated";

grant insert on table "public"."signal_performance" to "authenticated";

grant references on table "public"."signal_performance" to "authenticated";

grant select on table "public"."signal_performance" to "authenticated";

grant trigger on table "public"."signal_performance" to "authenticated";

grant truncate on table "public"."signal_performance" to "authenticated";

grant update on table "public"."signal_performance" to "authenticated";

grant delete on table "public"."signal_performance" to "service_role";

grant insert on table "public"."signal_performance" to "service_role";

grant references on table "public"."signal_performance" to "service_role";

grant select on table "public"."signal_performance" to "service_role";

grant trigger on table "public"."signal_performance" to "service_role";

grant truncate on table "public"."signal_performance" to "service_role";

grant update on table "public"."signal_performance" to "service_role";

grant delete on table "public"."signal_source_performance" to "anon";

grant insert on table "public"."signal_source_performance" to "anon";

grant references on table "public"."signal_source_performance" to "anon";

grant select on table "public"."signal_source_performance" to "anon";

grant trigger on table "public"."signal_source_performance" to "anon";

grant truncate on table "public"."signal_source_performance" to "anon";

grant update on table "public"."signal_source_performance" to "anon";

grant delete on table "public"."signal_source_performance" to "authenticated";

grant insert on table "public"."signal_source_performance" to "authenticated";

grant references on table "public"."signal_source_performance" to "authenticated";

grant select on table "public"."signal_source_performance" to "authenticated";

grant trigger on table "public"."signal_source_performance" to "authenticated";

grant truncate on table "public"."signal_source_performance" to "authenticated";

grant update on table "public"."signal_source_performance" to "authenticated";

grant delete on table "public"."signal_source_performance" to "service_role";

grant insert on table "public"."signal_source_performance" to "service_role";

grant references on table "public"."signal_source_performance" to "service_role";

grant select on table "public"."signal_source_performance" to "service_role";

grant trigger on table "public"."signal_source_performance" to "service_role";

grant truncate on table "public"."signal_source_performance" to "service_role";

grant update on table "public"."signal_source_performance" to "service_role";

grant delete on table "public"."suppression_list" to "anon";

grant insert on table "public"."suppression_list" to "anon";

grant references on table "public"."suppression_list" to "anon";

grant select on table "public"."suppression_list" to "anon";

grant trigger on table "public"."suppression_list" to "anon";

grant truncate on table "public"."suppression_list" to "anon";

grant update on table "public"."suppression_list" to "anon";

grant delete on table "public"."suppression_list" to "authenticated";

grant insert on table "public"."suppression_list" to "authenticated";

grant references on table "public"."suppression_list" to "authenticated";

grant select on table "public"."suppression_list" to "authenticated";

grant trigger on table "public"."suppression_list" to "authenticated";

grant truncate on table "public"."suppression_list" to "authenticated";

grant update on table "public"."suppression_list" to "authenticated";

grant delete on table "public"."suppression_list" to "service_role";

grant insert on table "public"."suppression_list" to "service_role";

grant references on table "public"."suppression_list" to "service_role";

grant select on table "public"."suppression_list" to "service_role";

grant trigger on table "public"."suppression_list" to "service_role";

grant truncate on table "public"."suppression_list" to "service_role";

grant update on table "public"."suppression_list" to "service_role";

grant delete on table "public"."system_flags" to "anon";

grant insert on table "public"."system_flags" to "anon";

grant references on table "public"."system_flags" to "anon";

grant select on table "public"."system_flags" to "anon";

grant trigger on table "public"."system_flags" to "anon";

grant truncate on table "public"."system_flags" to "anon";

grant update on table "public"."system_flags" to "anon";

grant delete on table "public"."system_flags" to "authenticated";

grant insert on table "public"."system_flags" to "authenticated";

grant references on table "public"."system_flags" to "authenticated";

grant select on table "public"."system_flags" to "authenticated";

grant trigger on table "public"."system_flags" to "authenticated";

grant truncate on table "public"."system_flags" to "authenticated";

grant update on table "public"."system_flags" to "authenticated";

grant delete on table "public"."system_flags" to "service_role";

grant insert on table "public"."system_flags" to "service_role";

grant references on table "public"."system_flags" to "service_role";

grant select on table "public"."system_flags" to "service_role";

grant trigger on table "public"."system_flags" to "service_role";

grant truncate on table "public"."system_flags" to "service_role";

grant update on table "public"."system_flags" to "service_role";

grant delete on table "public"."system_health" to "anon";

grant insert on table "public"."system_health" to "anon";

grant references on table "public"."system_health" to "anon";

grant select on table "public"."system_health" to "anon";

grant trigger on table "public"."system_health" to "anon";

grant truncate on table "public"."system_health" to "anon";

grant update on table "public"."system_health" to "anon";

grant delete on table "public"."system_health" to "authenticated";

grant insert on table "public"."system_health" to "authenticated";

grant references on table "public"."system_health" to "authenticated";

grant select on table "public"."system_health" to "authenticated";

grant trigger on table "public"."system_health" to "authenticated";

grant truncate on table "public"."system_health" to "authenticated";

grant update on table "public"."system_health" to "authenticated";

grant delete on table "public"."system_health" to "service_role";

grant insert on table "public"."system_health" to "service_role";

grant references on table "public"."system_health" to "service_role";

grant select on table "public"."system_health" to "service_role";

grant trigger on table "public"."system_health" to "service_role";

grant truncate on table "public"."system_health" to "service_role";

grant update on table "public"."system_health" to "service_role";

grant delete on table "public"."webhook_deliveries" to "anon";

grant insert on table "public"."webhook_deliveries" to "anon";

grant references on table "public"."webhook_deliveries" to "anon";

grant select on table "public"."webhook_deliveries" to "anon";

grant trigger on table "public"."webhook_deliveries" to "anon";

grant truncate on table "public"."webhook_deliveries" to "anon";

grant update on table "public"."webhook_deliveries" to "anon";

grant delete on table "public"."webhook_deliveries" to "authenticated";

grant insert on table "public"."webhook_deliveries" to "authenticated";

grant references on table "public"."webhook_deliveries" to "authenticated";

grant select on table "public"."webhook_deliveries" to "authenticated";

grant trigger on table "public"."webhook_deliveries" to "authenticated";

grant truncate on table "public"."webhook_deliveries" to "authenticated";

grant update on table "public"."webhook_deliveries" to "authenticated";

grant delete on table "public"."webhook_deliveries" to "service_role";

grant insert on table "public"."webhook_deliveries" to "service_role";

grant references on table "public"."webhook_deliveries" to "service_role";

grant select on table "public"."webhook_deliveries" to "service_role";

grant trigger on table "public"."webhook_deliveries" to "service_role";

grant truncate on table "public"."webhook_deliveries" to "service_role";

grant update on table "public"."webhook_deliveries" to "service_role";


  create policy "Activity logs viewable by client members"
  on "public"."activity_logs"
  as permissive
  for select
  to public
using ((client_id = public.client_id()));



  create policy "activity_logs_can_view_own"
  on "public"."activity_logs"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "activity_logs_insert"
  on "public"."activity_logs"
  as permissive
  for insert
  to public
with check (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "activity_logs_service_role"
  on "public"."activity_logs"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_api_quota_counters"
  on "public"."api_quota_counters"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "api_rate_limit_service_role"
  on "public"."api_rate_limit"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_full_access"
  on "public"."api_rate_limit"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "api_usage_logs_service_role"
  on "public"."api_usage_logs"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_full_access"
  on "public"."api_usage_logs"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "Audit logs viewable by client members"
  on "public"."audit_logs"
  as permissive
  for select
  to public
using ((client_id = public.client_id()));



  create policy "audit_logs_can_view_own"
  on "public"."audit_logs"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "audit_logs_service_role"
  on "public"."audit_logs"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_full_access"
  on "public"."audit_logs"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "blacklist_all"
  on "public"."blacklist"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "auth to all"
  on "public"."brand_discovery_sources"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "brand_discovery_sources_all_authenticated"
  on "public"."brand_discovery_sources"
  as permissive
  for all
  to public
using ((auth.role() = 'authenticated'::text))
with check ((auth.role() = 'authenticated'::text));



  create policy "brand_discovery_sources_can_view_own"
  on "public"."brand_discovery_sources"
  as permissive
  for all
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT brand_profiles.id
   FROM public.brand_profiles
  WHERE (brand_profiles.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "brand_discovery_sources_delete_own"
  on "public"."brand_discovery_sources"
  as permissive
  for delete
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "brand_discovery_sources_insert_own"
  on "public"."brand_discovery_sources"
  as permissive
  for insert
  to public
with check (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "brand_discovery_sources_select_own"
  on "public"."brand_discovery_sources"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "brand_discovery_sources_service_role"
  on "public"."brand_discovery_sources"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "brand_discovery_sources_update_own"
  on "public"."brand_discovery_sources"
  as permissive
  for update
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "Service role can manage brand_intents"
  on "public"."brand_intents"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Brand profiles are viewable by client members"
  on "public"."brand_profiles"
  as permissive
  for all
  to public
using ((client_id = public.client_id()));



  create policy "Users can access their client brands"
  on "public"."brand_profiles"
  as permissive
  for all
  to public
using ((client_id IN ( SELECT client_members.client_id
   FROM public.client_members
  WHERE (client_members.user_id = auth.uid()))));



  create policy "brand_profiles_can_view_own"
  on "public"."brand_profiles"
  as permissive
  for all
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "brand_profiles_service_role"
  on "public"."brand_profiles"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service role full access"
  on "public"."brand_profiles"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_brand_profiles_backup"
  on "public"."brand_profiles_backup"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "campaign_analytics_can_view_own"
  on "public"."campaign_analytics"
  as permissive
  for all
  to public
using (((brand_id IN ( SELECT brand_profiles.id
   FROM public.brand_profiles
  WHERE (brand_profiles.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "campaign_analytics_service_role"
  on "public"."campaign_analytics"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "circuit_breaker_all_authenticated"
  on "public"."circuit_breaker_state"
  as permissive
  for all
  to public
using ((auth.role() = 'authenticated'::text))
with check ((auth.role() = 'authenticated'::text));



  create policy "circuit_breaker_select_own"
  on "public"."circuit_breaker_state"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "service_role_full_access"
  on "public"."circuit_breaker_state"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "client_api_keys_can_view_own"
  on "public"."client_api_keys"
  as permissive
  for all
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "client_api_keys_service_role"
  on "public"."client_api_keys"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_full_access"
  on "public"."client_api_keys"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "client_daily_send_all_authenticated"
  on "public"."client_daily_send"
  as permissive
  for all
  to public
using ((auth.role() = 'authenticated'::text))
with check ((auth.role() = 'authenticated'::text));



  create policy "client_daily_send_can_view_own"
  on "public"."client_daily_send"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "client_daily_send_select_own"
  on "public"."client_daily_send"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "client_daily_send_service_role"
  on "public"."client_daily_send"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_full_access"
  on "public"."client_daily_send"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_full_access"
  on "public"."client_hourly_send"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "Members can insert own client members"
  on "public"."client_members"
  as permissive
  for insert
  to public
with check (((client_id = public.client_id()) OR (EXISTS ( SELECT 1
   FROM public.client_members cm
  WHERE ((cm.client_id = client_members.client_id) AND (cm.user_id = auth.uid()) AND (cm.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));



  create policy "Members can update own client members"
  on "public"."client_members"
  as permissive
  for update
  to public
using (((client_id = public.client_id()) OR (EXISTS ( SELECT 1
   FROM public.client_members cm
  WHERE ((cm.client_id = client_members.client_id) AND (cm.user_id = auth.uid()) AND (cm.role = ANY (ARRAY['owner'::text, 'admin'::text])))))));



  create policy "Members can view own client"
  on "public"."client_members"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (user_id = auth.uid())));



  create policy "client_members_can_insert"
  on "public"."client_members"
  as permissive
  for insert
  to public
with check (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "client_members_can_update"
  on "public"."client_members"
  as permissive
  for update
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "client_members_can_view_own"
  on "public"."client_members"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (user_id = auth.uid())));



  create policy "client_members_select_own"
  on "public"."client_members"
  as permissive
  for select
  to public
using (((user_id = auth.uid()) OR (email = (auth.jwt() ->> 'email'::text)) OR (auth.role() = 'service_role'::text)));



  create policy "client_members_service_role"
  on "public"."client_members"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "client_members_update_own"
  on "public"."client_members"
  as permissive
  for update
  to public
using ((auth.role() = 'service_role'::text));



  create policy "client_settings_can_view_own"
  on "public"."client_settings"
  as permissive
  for all
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "client_settings_insert_own"
  on "public"."client_settings"
  as permissive
  for insert
  to public
with check (((client_id IN ( SELECT client_members.client_id
   FROM public.client_members
  WHERE (client_members.user_id = auth.uid()))) OR (auth.role() = 'service_role'::text)));



  create policy "client_settings_select_own"
  on "public"."client_settings"
  as permissive
  for select
  to public
using (((client_id IN ( SELECT client_members.client_id
   FROM public.client_members
  WHERE (client_members.user_id = auth.uid()))) OR (auth.role() = 'service_role'::text)));



  create policy "client_settings_service_role"
  on "public"."client_settings"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "client_settings_update_own"
  on "public"."client_settings"
  as permissive
  for update
  to public
using (((client_id IN ( SELECT client_members.client_id
   FROM public.client_members
  WHERE (client_members.user_id = auth.uid()))) OR (auth.role() = 'service_role'::text)));



  create policy "client_webhooks_all_authenticated"
  on "public"."client_webhooks"
  as permissive
  for all
  to public
using ((auth.role() = 'authenticated'::text))
with check ((auth.role() = 'authenticated'::text));



  create policy "client_webhooks_can_view_own"
  on "public"."client_webhooks"
  as permissive
  for all
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "client_webhooks_delete_own"
  on "public"."client_webhooks"
  as permissive
  for delete
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "client_webhooks_insert_own"
  on "public"."client_webhooks"
  as permissive
  for insert
  to public
with check (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "client_webhooks_select_own"
  on "public"."client_webhooks"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "client_webhooks_service_role"
  on "public"."client_webhooks"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "client_webhooks_update_own"
  on "public"."client_webhooks"
  as permissive
  for update
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "service_role_full_access"
  on "public"."client_webhooks"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "Clients can view own client"
  on "public"."clients"
  as permissive
  for select
  to public
using ((id = public.client_id()));



  create policy "clients_can_view_own"
  on "public"."clients"
  as permissive
  for select
  to public
using ((id = public.client_id()));



  create policy "clients_select_own"
  on "public"."clients"
  as permissive
  for select
  to public
using (((id = auth.uid()) OR (owner_email = (auth.jwt() ->> 'email'::text)) OR (auth.role() = 'service_role'::text)));



  create policy "clients_service_role"
  on "public"."clients"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "Companies are viewable by client members"
  on "public"."companies"
  as permissive
  for all
  to public
using ((client_id = public.client_id()));



  create policy "companies_can_view_own"
  on "public"."companies"
  as permissive
  for all
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT brand_profiles.id
   FROM public.brand_profiles
  WHERE (brand_profiles.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "companies_service_role"
  on "public"."companies"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service role full access"
  on "public"."companies"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text))
with check ((auth.role() = 'service_role'::text));



  create policy "service_role_all_daily_send_limits"
  on "public"."daily_send_limits"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_daily_send_tracker"
  on "public"."daily_send_tracker"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "dead_letter_queue_all_authenticated"
  on "public"."dead_letter_queue"
  as permissive
  for all
  to public
using ((auth.role() = 'authenticated'::text))
with check ((auth.role() = 'authenticated'::text));



  create policy "dead_letter_queue_can_view_own"
  on "public"."dead_letter_queue"
  as permissive
  for all
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "dead_letter_queue_select_own"
  on "public"."dead_letter_queue"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (auth.role() = 'service_role'::text)));



  create policy "dead_letter_queue_service_role"
  on "public"."dead_letter_queue"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_dead_letters"
  on "public"."dead_letters"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "discovered_companies_all_authenticated"
  on "public"."discovered_companies"
  as permissive
  for all
  to public
using ((auth.role() = 'authenticated'::text))
with check ((auth.role() = 'authenticated'::text));



  create policy "discovered_companies_can_view_own"
  on "public"."discovered_companies"
  as permissive
  for all
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT brand_profiles.id
   FROM public.brand_profiles
  WHERE (brand_profiles.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "discovered_companies_insert_own"
  on "public"."discovered_companies"
  as permissive
  for insert
  to public
with check (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "discovered_companies_select_own"
  on "public"."discovered_companies"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "discovered_companies_service_role"
  on "public"."discovered_companies"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "discovered_companies_update_own"
  on "public"."discovered_companies"
  as permissive
  for update
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "discovered_contacts_all_authenticated"
  on "public"."discovered_contacts"
  as permissive
  for all
  to public
using ((auth.role() = 'authenticated'::text))
with check ((auth.role() = 'authenticated'::text));



  create policy "discovered_contacts_can_view_own"
  on "public"."discovered_contacts"
  as permissive
  for all
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT brand_profiles.id
   FROM public.brand_profiles
  WHERE (brand_profiles.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "discovered_contacts_insert_own"
  on "public"."discovered_contacts"
  as permissive
  for insert
  to public
with check (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "discovered_contacts_select_own"
  on "public"."discovered_contacts"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "discovered_contacts_service_role"
  on "public"."discovered_contacts"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "discovered_contacts_update_own"
  on "public"."discovered_contacts"
  as permissive
  for update
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "service_role_all_discovery_dead_letters"
  on "public"."discovery_dead_letters"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_discovery_metrics"
  on "public"."discovery_metrics"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_discovery_sources"
  on "public"."discovery_sources"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_edge_function_secrets"
  on "public"."edge_function_secrets"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "email_events_service_role"
  on "public"."email_events"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_full_access"
  on "public"."email_events"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_enrichment_metrics"
  on "public"."enrichment_metrics"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_inbound_events"
  on "public"."inbound_events"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_inbound_message_claims"
  on "public"."inbound_message_claims"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_lead_company_map"
  on "public"."lead_company_map"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_lead_import_batches"
  on "public"."lead_import_batches"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "Leads are viewable by client members"
  on "public"."leads"
  as permissive
  for all
  to public
using ((client_id = public.client_id()));



  create policy "leads_can_view_own"
  on "public"."leads"
  as permissive
  for all
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT brand_profiles.id
   FROM public.brand_profiles
  WHERE (brand_profiles.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "leads_delete_own"
  on "public"."leads"
  as permissive
  for delete
  to public
using (((client_id IN ( SELECT client_members.client_id
   FROM public.client_members
  WHERE (client_members.user_id = auth.uid()))) OR (auth.role() = 'service_role'::text)));



  create policy "leads_insert_own"
  on "public"."leads"
  as permissive
  for insert
  to public
with check (((client_id IN ( SELECT client_members.client_id
   FROM public.client_members
  WHERE (client_members.user_id = auth.uid()))) OR (auth.role() = 'service_role'::text)));



  create policy "leads_select_own"
  on "public"."leads"
  as permissive
  for select
  to public
using (((client_id IN ( SELECT client_members.client_id
   FROM public.client_members
  WHERE (client_members.user_id = auth.uid()))) OR (auth.role() = 'service_role'::text)));



  create policy "leads_service_role"
  on "public"."leads"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "leads_update_own"
  on "public"."leads"
  as permissive
  for update
  to public
using (((client_id IN ( SELECT client_members.client_id
   FROM public.client_members
  WHERE (client_members.user_id = auth.uid()))) OR (auth.role() = 'service_role'::text)));



  create policy "service_role_all_messages"
  on "public"."messages"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_negotiation_drafts"
  on "public"."negotiation_drafts"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "Users can manage own notifications"
  on "public"."notification_preferences"
  as permissive
  for all
  to public
using ((user_id = auth.uid()));



  create policy "notification_preferences_own_user"
  on "public"."notification_preferences"
  as permissive
  for all
  to public
using ((user_id = auth.uid()));



  create policy "Service role can manage opportunities"
  on "public"."opportunities"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "service_role_all_outbound_events"
  on "public"."outbound_events"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_outreach"
  on "public"."outreach"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_qualification"
  on "public"."qualification"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "replies_all_authenticated"
  on "public"."replies"
  as permissive
  for all
  to public
using ((auth.role() = 'authenticated'::text))
with check ((auth.role() = 'authenticated'::text));



  create policy "replies_can_view_own"
  on "public"."replies"
  as permissive
  for all
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT brand_profiles.id
   FROM public.brand_profiles
  WHERE (brand_profiles.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "replies_insert_own"
  on "public"."replies"
  as permissive
  for insert
  to public
with check (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "replies_select_own"
  on "public"."replies"
  as permissive
  for select
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "replies_service_role"
  on "public"."replies"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "replies_update_own"
  on "public"."replies"
  as permissive
  for update
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "service_role_all_research"
  on "public"."research"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_scoring_versions"
  on "public"."scoring_versions"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "send_counters_all_authenticated"
  on "public"."send_counters"
  as permissive
  for all
  to public
using ((auth.role() = 'authenticated'::text))
with check ((auth.role() = 'authenticated'::text));



  create policy "send_counters_can_view_own"
  on "public"."send_counters"
  as permissive
  for select
  to public
using (((brand_id IN ( SELECT brand_profiles.id
   FROM public.brand_profiles
  WHERE (brand_profiles.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "send_counters_select_own"
  on "public"."send_counters"
  as permissive
  for select
  to public
using (((brand_id IN ( SELECT bp.id
   FROM public.brand_profiles bp
  WHERE (bp.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "send_counters_service_role"
  on "public"."send_counters"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_sending_domains"
  on "public"."sending_domains"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "sent_messages_can_view_own"
  on "public"."sent_messages"
  as permissive
  for all
  to public
using (((client_id = public.client_id()) OR (brand_id IN ( SELECT brand_profiles.id
   FROM public.brand_profiles
  WHERE (brand_profiles.client_id = public.client_id()))) OR (auth.role() = 'service_role'::text)));



  create policy "sent_messages_service_role"
  on "public"."sent_messages"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_full_access"
  on "public"."sent_messages"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_signal_performance"
  on "public"."signal_performance"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_signal_source_performance"
  on "public"."signal_source_performance"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_full_access"
  on "public"."suppression_list"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "suppression_list_all"
  on "public"."suppression_list"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_all_system_flags"
  on "public"."system_flags"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "system_flags_all_authenticated"
  on "public"."system_flags"
  as permissive
  for all
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "service_role_all_system_health"
  on "public"."system_health"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "service_role_full_access"
  on "public"."webhook_deliveries"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "webhook_deliveries_service_role"
  on "public"."webhook_deliveries"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));


CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON public.brand_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_settings_updated_at BEFORE UPDATE ON public.client_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_webhooks_updated_at BEFORE UPDATE ON public.client_webhooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_handle_new_client AFTER INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_new_client();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_set_discovered_companies_updated_at BEFORE UPDATE ON public.discovered_companies FOR EACH ROW EXECUTE FUNCTION public.set_discovered_companies_updated_at();

CREATE TRIGGER trg_create_company_from_lead AFTER UPDATE OF status ON public.leads FOR EACH ROW EXECUTE FUNCTION public.trigger_create_company_from_lead();


