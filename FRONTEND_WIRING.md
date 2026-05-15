# Frontend ↔ Backend Wiring Reference

> **Status:** Build complete — all 47 pipeline tests + 8 user-flow tests pass, 2 new migrations pushed to Supabase
>
> **Base URL (Supabase Edge Functions):** `https://xtobbvffaxoiadserkbb.supabase.co/functions/v1`
> **Supabase REST:** `https://xtobbvffaxoiadserkbb.supabase.co/rest/v1`
> **Auth:** All edge functions require `Authorization: Bearer <supabase-access-token>` header, except `login` and `signup`

---

## 1. Authentication & Onboarding

### 1.1 Signup

| | |
|---|---|
| **Edge Function** | `POST /signup` |
| **Body** | `{ email, password, name?, company? }` |
| **On Success** | `{ success: true, message: "Account created! Please log in." }` |
| **Side Effects** | Creates Supabase auth user, creates `clients` row (id = user id), inserts `client_members` row with role `"owner"` |
| **After Signup** | User must call `login` to get session token |

### 1.2 Login

| | |
|---|---|
| **Edge Function** | `POST /login` |
| **Body** | `{ email, password }` |
| **On Success** | `{ token, user: { id, email, name, role, clientId, clientName } }` |
| **Storage** | Save `token` (Supabase access_token). Include in all subsequent requests as `Authorization: Bearer <token>` |
| **Member Resolution** | Tries `user_id` match first, then `email` match, then `clients.owner_email` |

### 1.3 Auth (alternative centralized auth)

| | |
|---|---|
| **Edge Function** | `POST /auth` |
| **Body** | `{ action: "login" | "signup", email, password, name?, company? }` |
| **Response** | Same as individual `/login` or `/signup` endpoints |

---

## 2. Brand (Company Profile) Management

### 2.1 List all brands for client

| | |
|---|---|
| **Function** | `GET /brands` |
| **Response** | `{ brands: BrandProfile[] }` |
| **Filtering** | Automatically scoped to the authenticated client via JWT → `client_members.client_id` |

### 2.2 Create a brand

| | |
|---|---|
| **Function** | `POST /brands` |
| **Body** | See BrandProfile fields below |
| **Required fields** | `brand_name` or `product`, `smtp_email` if `transport_mode: "mailbox"`, `provider_api_key` if `provider: "resend"` |
| **Defaults applied** | `discovery_enabled: false`, `outbound_enabled: false`, `manual_discovery_requested: false` |
| **Response** | `{ success: true, brand: BrandProfile }` |

### 2.3 Get single brand

| | |
|---|---|
| **Function** | `GET /brands/:id` |
| **Response** | `BrandProfile` object |

### 2.4 Update brand

| | |
|---|---|
| **Function** | `PATCH /brands/:id` |
| **Body** | Partial BrandProfile fields |
| **Gate check** | If toggling `discovery_enabled` or `outbound_enabled` to `true`, checks `system_flags.master_automation_enabled`. If master is off, returns 400: *"Automation is disabled"* |
| **Response** | `{ success: true, brand: BrandProfile }` |

### 2.5 Delete brand

| | |
|---|---|
| **Function** | `DELETE /brands/:id` |
| **Response** | `{ success: true }` |

### 2.6 Trigger manual discovery for a brand

| | |
|---|---|
| **Function** | `POST /brands/:id/trigger-discovery` |
| **Body** | (none) |
| **DB** | Calls `rpc_request_manual_discovery(p_brand_id)` which sets `manual_discovery_requested = true` on the brand |
| **Engine picks up** | Engine worker reads `manual_discovery_requested` flag, runs discovery, then resets it to `false` |

### BrandProfile table (key fields)

```typescript
interface BrandProfile {
  id: string                    // uuid, PK
  client_id: string             // FK → clients.id
  brand_name: string
  product: string
  positioning: string | null
  core_offer: string | null
  tone: string | null
  audience: string | null
  objection_guidelines: string | null
  negotiation_style: string | null

  // SMTP / Email Transport
  smtp_host: string | null
  smtp_port: number | null
  smtp_secure: boolean
  smtp_email: string
  smtp_password: string
  transport_mode: "mailbox" | "api"
  provider: "smtp" | "resend" | "ses"
  provider_api_key: string | null
  sending_domain: string | null
  daily_send_limit: number | null
  hourly_send_limit: number | null

  // IMAP (inbound reply detection)
  imap_host: string | null
  imap_port: number | null
  imap_secure: boolean
  imap_email: string
  imap_password: string
  imap_enabled: boolean
  reply_to_email: string | null
  signature_block: string | null

  // LLM config (per-brand override)
  llm_model_override: string | null
  llm_temperature: number | null

  // Discovery & Outbound toggles
  is_active: boolean
  is_paused: boolean | null
  auto_paused: boolean | null
  discovery_enabled: boolean
  discovery_daily_limit: number | null
  discovery_count_today: number | null
  last_discovery_date: string | null
  outbound_enabled: boolean
  manual_discovery_requested: boolean

  // Reputation
  bounce_count: number | null
  sent_count: number | null
  complaint_count: number | null
  deliverability_score: number | null
  last_deliverability_check: string | null

  send_enabled: boolean
  created_at: string
}
```

---

## 3. Brand Intents (what signals to hunt)

These define *what* a brand is looking for. Stored in `brand_intents` table.

### 3.1 CRUD

| Operation | Method | Endpoint |
|---|---|---|
| List intents for a brand | `GET /brands/:id` → read `brand_intents` with `brand_id` filter | Direct table read |
| Create intent | `POST /brands` → separate API or direct `supabase.from("brand_intents").insert(...)` | Direct table write |
| Update intent | `PATCH /brands` → direct table update | Direct table write |
| Delete intent | `DELETE /brands` → direct table delete | Direct table write |

### brand_intents table

```typescript
interface BrandIntent {
  id: string
  brand_id: string            // FK → brand_profiles.id
  intent: string              // e.g. "Companies struggling with cold email outreach"
  signals: SignalType[]       // array of signal types to detect
  priority: number            // lower = higher priority
  is_active: boolean
  created_at: string
}
```

### Available Signal Types
```
"hiring" | "funding" | "launch" | "pain" | "advertising"
| "partnership" | "tech_usage" | "growth_activity"
| "outbound_pain" | "automation_need"
```

---

## 4. Discovery Sources

Discovery sources control *where* the engine looks for signals. Stored in `brand_discovery_sources` table.

Although the `"jobs"` source has been removed from the engine (Phase 1 fix), the table still supports these source types for future expansion.

### 4.1 CRUD (via discovery edge function)

| Operation | Method | Endpoint |
|---|---|---|
| List sources | `GET /discovery/:brandId` | `{ sources: BrandDiscoverySource[] }` |
| Create source | `POST /discovery/:brandId` | `{ success: true, source: ... }` |
| Get single | `GET /discovery/:brandId/:sourceId` | Source object |
| Update | `PATCH /discovery/:brandId/:sourceId` | `{ success: true, source: ... }` |
| Delete | `DELETE /discovery/:brandId/:sourceId` | `{ success: true }` |

### 4.2 Trigger discovery for a brand

| | |
|---|---|
| **Function** | `POST /discovery/:brandId/trigger` |
| **Gate** | Checks `system_flags.automation_enabled`. If off → 400 *"Automation is disabled system-wide"* |
| **DB** | Calls `rpc_request_manual_discovery(p_brand_id)` |

### 4.3 View discovered companies

| | |
|---|---|
| **Function** | `GET /discovery/:brandId/companies` |
| **Response** | `{ companies: DiscoveredCompany[] }` (max 100, newest first) |

### 4.4 View discovered contacts

| | |
|---|---|
| **Function** | `GET /discovery/:brandId/contacts` |
| **Response** | `{ contacts: DiscoveredContact[] }` (max 100) |

### BrandDiscoverySource table

```typescript
interface BrandDiscoverySource {
  id: string
  brand_id: string
  client_id: string
  source_type: string        // e.g. "reddit", "google", "hackernews"
  is_active: boolean
  config: Record<string, any> | null   // JSON config for this source
  created_at: string
}
```

---

## 5. Pipeline (Companies & Status Management)

### 5.1 Overview counts

| | |
|---|---|
| **Function** | `GET /pipeline/overview` |
| **Response** | `{ stages: { researching, qualified, draft_ready, contacted } }` |
| **Scope** | Counts companies across ALL brands belonging to the client |

### 5.2 List companies for a brand

| | |
|---|---|
| **Function** | `GET /pipeline/:brandId` |
| **Query params** | `?status=qualified&page=1&limit=50` |
| **Response** | `{ companies: Company[], total, totalPages, page }` |

### 5.3 Get single company

| | |
|---|---|
| **Function** | `GET /pipeline/:brandId/:companyId` |
| **Response** | Company object |

### 5.4 Update company (manual status change)

| | |
|---|---|
| **Function** | `PATCH /pipeline/:brandId/:companyId` |
| **Body** | `{ status: "qualified" | "draft_ready" | "contacted" | "closed_won" | "rejected" | "negotiating" }` |
| **Permission** | Only `owner` or `admin` role can change status manually. Returns 403 otherwise |
| **Available statuses** | `researching`, `qualified`, `draft_ready`, `contacted`, `closed_won`, `rejected`, `negotiating` |

### 5.5 View outreach for a company

| | |
|---|---|
| **Function** | `GET /pipeline/:brandId/:companyId/outreach` |
| **Response** | `{ outreach: OutreachDraft[] }` |

### Companies table (key fields)

```typescript
interface Company {
  id: string
  brand_id: string
  name: string
  domain: string | null
  status: CompanyStatus
  enrichment_status: "pending" | "enriched" | "failed"
  enrichment_attempts: number
  lead_id: string | null
  relevance_score: number | null
  urgency_score: number | null
  fit_reason: string | null
  signal_type: string | null
  source: string | null
  created_at: string
  updated_at: string
}
```

---

## 6. Leads

### 6.1 List leads

| | |
|---|---|
| **Function** | `GET /leads` |
| **Query params** | `?status=new&search=john&page=1&limit=25` |
| **Response** | `{ leads: Lead[], total, totalPages, page }` |
| **Search** | `or(full_name.ilike.%search%,email.ilike.%search%,domain.ilike.%search%)` |

### 6.2 Create lead

| | |
|---|---|
| **Function** | `POST /leads` |
| **Body** | `{ email, full_name?, domain?, company_name?, brand_id?, ... }` |
| **Auto-fallback** | If `brand_id` not provided, uses first brand found for the client |
| **Response** | Created Lead object |

### 6.3 Bulk import leads

| | |
|---|---|
| **Function** | `POST /leads/import` |
| **Body** | `{ leads: Lead[] }` |
| **Source** | Automatically set to `"import"` |
| **Response** | `{ imported: number, leads: Lead[] }` |

### 6.4 Get / Update / Delete lead

| Operation | Method | Path |
|---|---|---|
| Get | `GET /leads/:id` | Lead object |
| Update | `PATCH /leads/:id` | `{ ...fields }` |
| Delete | `DELETE /leads/:id` | `{ success: true }` |

---

## 7. Campaigns (Outreach)

### 7.1 List all outreach across brands

| | |
|---|---|
| **Function** | `GET /campaigns` |
| **Permission** | `owner` or `admin` only |
| **Response** | Outreach records array |

### 7.2 Create outreach draft

| | |
|---|---|
| **Function** | `POST /campaigns` |
| **Body** | `{ brand_id, company_id?, lead_id?, subject, body, ... }` |
| **Response** | Created outreach record |

### 7.3 Update / Delete

| Operation | Method | Path |
|---|---|---|
| Get | `GET /campaigns/:id` | Outreach record |
| Update | `PATCH /campaigns/:id` | `{ ...fields }` |
| Delete | `DELETE /campaigns/:id` | `{ success: true }` |

### 7.4 Launch / Pause campaign

| | |
|---|---|
| **Launch** | `POST /campaigns/:id/launch` → sets `status: "sent"`, `sent_at: now()` |
| **Pause** | `POST /campaigns/:id/pause` → sets `status: "paused"` |

---

## 8. Email Templates

### 8.1 CRUD

| Operation | Method | Path |
|---|---|---|
| List | `GET /templates` | Array of `email_templates` (scoped to client) |
| Create | `POST /templates` | `{ name, subject, body, variables?, ... }` |
| Get | `GET /templates/:id` | Template object |
| Update | `PATCH /templates/:id` | `{ ...fields }` |
| Delete | `DELETE /templates/:id` | `{ success: true }` |

---

## 9. Settings (Client-level)

### 9.1 General Settings

| | |
|---|---|
| **Function** | `GET /settings` |
| **Response** | `client_settings` row for the client, or defaults `{ llm_provider: "ollama", llm_model: "llama3:8b" }` |
| **Update** | `PUT /settings` with any `client_settings` fields |

### 9.2 LLM Configuration

| | |
|---|---|
| **List providers** | `GET /settings/llm/providers` → `{ providers: ["ollama","groq","openai","anthropic","cloudflare"] }` |
| **List models** | `GET /settings/llm/models?provider=groq` → `{ provider, models: [...] }` |
| **Get current** | `GET /settings/llm` → current LLM config |
| **Update** | `PUT /settings/llm` | `{ llm_provider, llm_model, llm_base_url?, llm_api_key? }` |

### 9.3 Email Configuration

| | |
|---|---|
| **Get** | `GET /settings/email` | Returns SMTP/IMAP settings |
| **Update** | `PUT /settings/email` | Body (allowed fields): `smtp_host, smtp_port, smtp_secure, smtp_email, smtp_password, smtp_from_name, smtp_from_email, imap_host, imap_port, imap_secure, imap_email, imap_password, email_provider, provider_api_key, sending_domain, imap_enabled` |

### client_settings table

```typescript
interface ClientSettings {
  client_id: string             // PK
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
  llm_provider: string | null
  llm_model: string | null
  llm_temperature: number | null
  llm_base_url: string | null
  llm_api_key: string | null
  created_at: string
  updated_at: string
}
```

---

## 10. System Flags & Monitoring

### 10.1 Health Check (no auth required)

| | |
|---|---|
| **Function** | `GET /system/health` |
| **Response** | `{ status: "ok", timestamp }` |

### 10.2 System Flags

| | |
|---|---|
| **List** | `GET /system/flags` | Returns all `system_flags` for client |
| **Update** | `POST /system/flags/:key` | Body: `{ value: true/false }`. Only `owner`/`admin` can modify |

### 10.3 System Metrics

| | |
|---|---|
| **Function** | `GET /system/metrics` |
| **Response** | `{ leads: number, campaigns: number }` across all brands |

### 10.4 Activity Logs

| | |
|---|---|
| **Table** | `activity_logs` — written by dashboard toggle calls, readable directly |
| **Schema** | `{ client_id, brand_id, user_id, activity_type, description, created_at }` |

---

## 11. Worker Controls

### 11.1 Worker status

| | |
|---|---|
| **Function** | `GET /workers/status` |
| **Response** | `{ workers: [{ brand_id, brand_name, discovery: { is_running, is_paused, last_run }, outbound: { is_running, is_paused, state } }] }` |

### 11.2 Worker metrics

| | |
|---|---|
| **Function** | `GET /workers/metrics?brand_id=xxx` |
| **Response** | `{ metrics: [{ brand_id, brand_name, discovery_count_today, sent_count }] }` |

### 11.3 Trigger / Pause / Resume

| Action | Endpoint | Effect |
|---|---|---|
| Trigger | `POST /workers/discovery/trigger` | Sets `manual_discovery_requested=true`, `discovery_enabled=true` |
| Pause discovery | `POST /workers/discovery/pause` | Sets `discovery_enabled=false` |
| Resume discovery | `POST /workers/discovery/resume` | Sets `discovery_enabled=true`, `manual_discovery_requested=true` |
| Pause outbound | `POST /workers/outbound/pause` | Sets `outbound_enabled=false`, `execution_state="paused"` |
| Resume outbound | `POST /workers/outbound/resume` | Sets `outbound_enabled=true`, `execution_state="running"` |

---

## 12. Dashboard

### 12.1 Overview

| | |
|---|---|
| **Function** | `GET /dashboard/overview` |
| **Response** | Comprehensive dashboard payload (see below) |

```typescript
interface DashboardOverview {
  discovery_enabled: boolean
  outbound_enabled: boolean
  brand: { id, name, discovery_daily_limit, discovery_count_today, daily_send_limit, sent_today }
  discovery_stats: { companies_total, companies_pending, contacts_total, contacts_pending }
  send_stats: { sent_today, delivered, opened, bounced, daily_limit, hourly_limit }
  pipeline: { researching, qualified, draft_ready, contacted, closed_won }
  workers: {
    discovery: { status: "running" | "idle", last_run: string | null }
    enrichment: { status: "running" | "idle", pending: number }
    send: { status: "running" | "paused", reason: string | null }
    reply: { status: "running" | "idle" }
  }
  activity_feed: ActivityLog[]
}
```

### 12.2 Toggle workers

| | |
|---|---|
| **Function** | `PATCH /dashboard/:brandId/toggle` |
| **Body** | `{ discovery?: boolean, outbound?: boolean }` |
| **Permission** | Only `owner`/`admin` |
| **Side effects** | Inserts `activity_logs` entries. Sets `execution_state` on outbound toggle |
| **Response** | `{ success: true, brand, toggles: { discovery, outbound } }` |

---

## 13. Analytics

### 13.1 Overview stats

| | |
|---|---|
| **Function** | `GET /analytics/overview` |
| **Response** | `{ totalLeads, newLeads, contactedLeads, qualifiedLeads, totalCampaigns, activeCampaigns, sentCount, replyRate, bounceRate }` |
| **Reply/Bounce rates** | Calculated as `(replied / sent * 100).toFixed(1)` |

### 13.2 Activity timeline

| | |
|---|---|
| **Function** | `GET /analytics/activity?limit=20` |
| **Response** | `{ replies: Reply[], sends: SentMessage[] }` (most recent first) |

### 13.3 Chart data

| | |
|---|---|
| **Function** | `GET /analytics/chart?days=7` |
| **Response** | `[{ date: "2026-05-15", sent: 5, replied: 2 }, ...]` (last N days, grouped) |

### 13.4 Filtered views

| | |
|---|---|
| **Leads by status** | `GET /analytics/leads?status=contacted` |
| **Campaigns** | `GET /analytics/campaigns` |

---

## 14. Scoring Versions

### 14.1 Create scoring version

| | |
|---|---|
| **Function** | `POST /scoring` |
| **Body** | `{ product, version_name, scoring_config? }` |
| **Response** | Created scoring version |

### 14.2 Activate version

| | |
|---|---|
| **Function** | `POST /scoring/activate` |
| **Body** | `{ version_id }` |
| **DB** | Calls `rpc_activate_scoring_version(p_version_id)` |

### 14.3 Get active version

| | |
|---|---|
| **Function** | `GET /scoring/active/:product` |
| **Response** | Active scoring version for that product |

### 14.4 List versions

| | |
|---|---|
| **Function** | `GET /scoring/:product` |
| **Response** | Array of scoring versions |

---

## 15. Webhooks

### 15.1 CRUD

| Operation | Method | Path |
|---|---|---|
| List | `GET /webhooks` | All `client_webhooks` for client |
| Create | `POST /webhooks` | `{ url, events?, secret? }` |
| Get | `GET /webhooks/:id` | Webhook object |
| Update | `PATCH /webhooks/:id` | `{ ...fields }` |
| Delete | `DELETE /webhooks/:id` | `{ success: true }` |

### 15.2 Test webhook

| | |
|---|---|
| **Function** | `POST /webhooks/:id/test` |
| **Effect** | Sends test payload `{ event: "test", timestamp, message }` to the webhook URL with `X-Webhook-Secret` header |
| **Response** | `{ success, statusCode, message, responseBody }` |

---

## 16. Team Management

### 16.1 List members

| | |
|---|---|
| **Function** | `GET /team` |
| **Permission** | `owner` or `admin` |
| **Response** | Array of `client_members` for the client |

### 16.2 Invite member

| | |
|---|---|
| **Function** | `POST /team/invite` |
| **Body** | `{ email, role: "admin" | "member" }` |
| **Note** | Currently just inserts into `client_members` — no invitation email sent |

### 16.3 Update / Remove member

| Operation | Method | Path |
|---|---|---|
| Update role | `PATCH /team/:id` | `{ role }` |
| Remove | `DELETE /team/:id` | `{ success: true }` |

---

## 17. Client Profile

| | |
|---|---|
| **Get profile** | `GET /clients` | Returns `clients` row for the authenticated client |
| **Create** | `POST /clients` | Body: `{ name }`. Only works if user doesn't already have a client |
| **Get by ID** | `GET /clients/:id` | Must match authenticated client ID |
| **Update** | `PATCH /clients/:id` | `{ ...fields }` |

---

## 18. RAG-Based Discovery (NEW)

This replaces the old keyword-based query generation with vector search.

### How it works (no UI needed, fully automatic)

```
1. Brand created → brand_profiles row inserted
2. Brand intents configured → brand_intents rows inserted
3. Engine starts discovery cycle:
   a. syncAllBrandEmbeddings() → embeds all brand intents via Groq nomic-embed-text-v1.5
   b. Builds embedding query from brand context text
   c. Vector search discovery_embeddings table for similar intents (cosine similarity)
   d. Generates context-aware search queries from matched intents
4. Each query carries rag_context → injected into LLM extraction and scoring prompts
```

### DB tables (NEW)

**`discovery_embeddings`** — Created by migration `20260515000000_enable_pgvector.sql`

```sql
CREATE TABLE discovery_embeddings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id uuid REFERENCES brand_profiles(id) ON DELETE CASCADE,
  intent_id uuid,
  content_type text CHECK (content_type IN ('brand_intent', 'signal_pattern', 'reference_company')),
  content_text text NOT NULL,
  embedding vector(768) NOT NULL,
  metadata jsonb DEFAULT '{}',
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', content_text)) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**`match_discovery_embeddings`** RPC function — for vector similarity search:

```sql
SELECT * FROM match_discovery_embeddings(
  query_embedding := '[0.001, -0.002, ...]',  -- 768-dim array
  match_threshold := 0.65,
  match_count := 3,
  filter_brand_id := 'brand-uuid'
);
-- Returns: id, brand_id, intent_id, content_type, content_text, metadata, similarity
```

### What changed from user perspective

| Old behavior | New behavior |
|---|---|
| `"jobs"` source returned job portals | `"jobs"` source removed entirely |
| Keyword-only query generation | Vector search finds semantically similar intents |
| Generic search queries | Context-aware queries with RAG metadata |
| LLM had no context about search intent | LLM gets `rag_context` — explains WHY this search was done, so it can better identify real companies vs portals |
| Job portals frequently scored as leads | `AGGREGATOR_NAMES` + `AGGREGATOR_DOMAINS` filters + prompt rejections + post-extraction domain check |

---

## 19. End-to-End User Flow (for manual testing)

### Setup Phase
```
1. Signup (POST /signup)
   → Get account

2. Login (POST /login)
   → Save token

3. Configure LLM (PUT /settings/llm)
   → { llm_provider: "groq", llm_model: "llama-3.1-8b-instant", llm_api_key: "gsk_..." }

4. Configure Email (PUT /settings/email)
   → { smtp_host, smtp_port, smtp_email, smtp_password, smtp_from_name, email_provider: "smtp", transport_mode: "mailbox" }

5. Create Brand (POST /brands)
   → { brand_name: "YourBrand", product: "Your product", audience: "target audience", 
       core_offer: "what you sell", positioning: "how you position it",
       discovery_enabled: true, outbound_enabled: true }

6. Add Brand Intents (INSERT brand_intents directly)
   → { brand_id, intent: "Companies struggling with cold email", signals: ["outbound_pain", "automation_need"], priority: 1, is_active: true }
```

### Runtime Phase
```
7. Enable Automation (POST /system/flags/automation_enabled → { value: true })

8. Trigger Discovery (POST /discovery/:brandId/trigger)
   OR wait for scheduled cycle (every 6 hours)

9. View Discovered Companies (GET /discovery/:brandId/companies)
   → Verify NO job portals (FlexJobs, Zippia, apna, etc.)

10. Companies flow through pipeline automatically:
    discovered → researching (via db trigger)
    → qualified (via enrichment worker)
    → draft_ready (when lead exists + enriched)
    → contacted (via sendProcessor)
```

### Monitoring Phase
```
11. View Dashboard (GET /dashboard/overview)
    → Shows pipeline counts, worker status, send stats

12. View Pipeline (GET /pipeline/:brandId?status=draft_ready)
    → See companies ready for outreach

13. View Analytics (GET /analytics/overview)
    → See send rates, reply rates, bounce rates
```

---

## 20. DB Triggers & Automation

### Known DB triggers (from schema)

| Trigger | Event | Effect |
|---|---|---|
| `update_updated_at_column` | `BEFORE UPDATE` on most tables | Sets `updated_at = now()` |
| `set_company_status` | `ON INSERT` to `discovered_companies` | Creates corresponding row in `companies` with `status: "researching"` |
| `rpc_request_manual_discovery` | Called via edge functions | Sets `manual_discovery_requested = true` on brand |
| `rpc_activate_scoring_version` | Called via scoring edge function | Sets `is_active=false` on all versions, then `is_active=true` on specified version |

### Engine workers (Node.js sidecar, runs on the server)

| Worker | What it does | Cadence |
|---|---|---|
| **Discovery** | Reads brands with `discovery_enabled=true`, runs RAG-enhanced signal search (Reddit + Google), extracts companies, scores them, stores in `discovered_companies` | Every 6 hours or on-demand via trigger |
| **Enrichment** | Reads `discovered_companies` with `enrichment_status="pending"`, enriches (finds emails, company data), creates `leads` + `companies` rows | Every 5 minutes |
| **Send** | Reads `companies` with `status="draft_ready"`, claims outreach drafts, sends via provider, records results in `sent_messages` | Continuous |
| **Reply** | (IMAP) Reads inbox for replies, classifies (bounce/reply/complaint), updates reputation | Every 2 minutes |
