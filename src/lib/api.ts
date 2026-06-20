import { getStoredToken } from '@/lib/supabase'
import type {
  BrandProfile,
  Lead,
  Company,
  SentMessage,
  ClientWebhook,
  ClientApiKey,
  BrandDiscoverySource,
  ActivityLog,
  ClientSettings,
  ClientMember,
  Client,
  LeadImportBatch,
  OutreachDraft,
  BrandIntent,
  DiscoveredCompany
} from '@/lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`

async function callEdgeFunction<T = any>(
  endpoint: string,
  options: {
    method?: string
    body?: any
    params?: Record<string, string>
  } = {}
): Promise<{ data: T; error: any }> {
  const token = getStoredToken()

  if (!token) {
    return { data: null as any, error: { message: 'No token' } }
  }

  let url = `${FUNCTIONS_URL}/${endpoint}`

  if (options.params) {
    const queryString = new URLSearchParams(options.params).toString()
    url += `?${queryString}`
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      if (data?.message?.includes('JWT expired')) {
        localStorage.removeItem('outbound_token')
        localStorage.removeItem('outbound_user')
        window.location.href = '/login'
      }
      return { data: null as any, error: data }
    }

    return { data, error: null }
  } catch (err: any) {
    return { data: null as any, error: { message: err.message || 'Network error' } }
  }
}

async function fetchAPI(
  table: string,
  options: {
    method?: string
    params?: Record<string, string>
    body?: any
    count?: boolean
    range?: [number, number]
  } = {}
) {
  const token = getStoredToken()

  if (!token) {
    return { data: [], error: { message: 'No token' }, count: '0' }
  }

  let url = `${SUPABASE_URL}/rest/v1/${table}`

  if (options.params) {
    const queryString = new URLSearchParams(options.params).toString()
    url += `?${queryString}`
  }

  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  if (options.count) {
    headers['Prefer'] = 'count=exact'
  }

  if (options.range) {
    headers['Range'] = `${options.range[0]}-${options.range[1]}`
    headers['Prefer'] = 'count=exact'
  }

  let data: any
  const method = options.method || 'GET'

  console.log(`[API] ${method} ${url}`, { headers: Object.keys(headers) })

  try {
    const response = await fetch(url, { method, headers, body: options.body ? JSON.stringify(options.body) : undefined })

    const text = await response.text()
    data = text ? JSON.parse(text) : {}

    if (!response.ok) {
      console.error(`API Error [${table}] [${response.status}] [${method} ${url}]:`, data)

      if (data?.code === 'PGRST303' || data?.message?.includes('JWT expired')) {
        localStorage.removeItem('outbound_token')
        localStorage.removeItem('outbound_user')
        window.location.href = '/login'
      }
    }

    return {
      data: Array.isArray(data) ? data : data ? [data] : [],
      error: response.ok ? null : { ...data, status: response.status },
      count: response.headers.get('content-range')?.split('/')[1]
    }
  } catch (err: any) {
    console.error(`API Error [${table}] [fetch] [${method} ${url}]:`, err)
    return {
      data: [],
      error: { message: err.message || 'Network error', status: 0 },
      count: '0'
    }
  }
}

async function insertAPI(table: string, data: any) {
  const token = getStoredToken()

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()
  return { data: Array.isArray(result) ? result : [result], error: response.ok ? null : result }
}

async function updateAPI(table: string, id: string, data: any) {
  const token = getStoredToken()

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()
  return { data: result, error: response.ok ? null : result }
}

async function deleteAPI(table: string, id: string) {
  const token = getStoredToken()

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  })

  return { error: response.ok ? null : await response.json() }
}

// ─────────────────────────────────────────────
// Brand Profiles
// ─────────────────────────────────────────────
export const brandsAPI = {
  list: async (_clientId?: string): Promise<{ data: BrandProfile[], error: any }> => {
    const { data, error } = await callEdgeFunction<{ brands: BrandProfile[] }>('brands')
    if (error) return { data: [], error }
    return { data: data.brands || [], error: null }
  },

  get: async (id: string): Promise<{ data: BrandProfile | null, error: any }> => {
    const { data, error } = await callEdgeFunction<BrandProfile>(`brands/${id}`)
    if (error) return { data: null, error }
    return { data, error: null }
  },

  create: async (data: Partial<BrandProfile>): Promise<{ data: BrandProfile[], error: any }> => {
    const { data: res, error } = await callEdgeFunction<{ success: boolean; brand: BrandProfile }>('brands', {
      method: 'POST',
      body: data,
    })
    if (error) return { data: [], error }
    return { data: [res.brand], error: null }
  },

  update: async (id: string, data: Partial<BrandProfile>): Promise<{ data: any, error: any }> => {
    const { data: res, error } = await callEdgeFunction<{ success: boolean; brand: BrandProfile }>(`brands/${id}`, {
      method: 'PATCH',
      body: data,
    })
    if (error) return { data: null, error }
    return { data: res.brand, error: null }
  },

  delete: async (id: string): Promise<{ error: any }> => {
    const { error } = await callEdgeFunction(`brands/${id}`, { method: 'DELETE' })
    return { error }
  },

  triggerDiscovery: async (id: string): Promise<{ error: any }> => {
    const { error } = await callEdgeFunction(`brands/${id}/trigger-discovery`, { method: 'POST' })
    return { error }
  }
}

// ─────────────────────────────────────────────
// Leads
// ─────────────────────────────────────────────
export const leadsAPI = {
  list: async (options: {
    brandId?: string
    clientId?: string
    status?: string
    search?: string
    page?: number
    perPage?: number
  } = {}): Promise<{ data: Lead[], total: number, error: any }> => {
    const params: Record<string, string> = {}
    if (options.brandId) params['brand_id'] = options.brandId
    if (options.status) params['status'] = options.status
    if (options.search) params['search'] = options.search
    if (options.page) params['page'] = String(options.page)
    if (options.perPage) params['limit'] = String(options.perPage)

    const { data, error } = await callEdgeFunction<{ leads: Lead[]; total: number; totalPages: number; page: number }>('leads', { params })
    if (error) return { data: [], total: 0, error }
    return { data: data.leads || [], total: data.total || 0, error: null }
  },

  get: async (id: string): Promise<{ data: Lead | null, error: any }> => {
    const { data, error } = await callEdgeFunction<Lead>(`leads/${id}`)
    if (error) return { data: null, error }
    return { data, error: null }
  },

  create: async (data: Partial<Lead>): Promise<{ data: Lead[], error: any }> => {
    const { data: res, error } = await callEdgeFunction<Lead>('leads', {
      method: 'POST',
      body: data,
    })
    if (error) return { data: [], error }
    return { data: [res], error: null }
  },

  createMany: async (data: Partial<Lead>[]): Promise<{ data: any[], error: any }> => {
    const { data: res, error } = await callEdgeFunction<{ imported: number; leads: Lead[] }>('leads/import', {
      method: 'POST',
      body: { leads: data },
    })
    if (error) return { data: [], error }
    return { data: res.leads || [], error: null }
  },

  update: async (id: string, data: Partial<Lead>): Promise<{ data: any, error: any }> => {
    const { data: res, error } = await callEdgeFunction<Lead>(`leads/${id}`, {
      method: 'PATCH',
      body: data,
    })
    if (error) return { data: null, error }
    return { data: res, error: null }
  },

  delete: async (id: string): Promise<{ error: any }> => {
    const { error } = await callEdgeFunction(`leads/${id}`, { method: 'DELETE' })
    return { error }
  }
}

// ─────────────────────────────────────────────
// Companies / Pipeline
// ─────────────────────────────────────────────
export const companiesAPI = {
  list: async (options: { brandId?: string; clientId?: string; status?: string; page?: number; perPage?: number } = {}): Promise<{ data: Company[], error: any }> => {
    const params: Record<string, string> = {}
    if (options.status) params['status'] = options.status
    if (options.page) params['page'] = String(options.page)
    if (options.perPage) params['limit'] = String(options.perPage)
    const endpoint = options.brandId ? `pipeline/${options.brandId}` : 'pipeline/companies'
    const { data, error } = await callEdgeFunction<{ companies: Company[]; total: number }>(endpoint, { params })
    if (error) return { data: [], error }
    return { data: data.companies || [], error: null }
  },

  get: async (id: string): Promise<{ data: Company | null, error: any }> => {
    const { data, error } = await callEdgeFunction<Company>(`pipeline/companies/${id}`)
    if (error) return { data: null, error }
    return { data, error: null }
  },

  create: async (data: Partial<Company>): Promise<{ data: Company[], error: any }> => {
    return insertAPI('companies', data)
  },

  update: async (brandId: string, id: string, data: Partial<Company>): Promise<{ data: any, error: any }> => {
    const { data: res, error } = await callEdgeFunction<{ success: boolean; company: Company }>(`pipeline/${brandId}/${id}`, {
      method: 'PATCH',
      body: data,
    })
    if (error) return { data: null, error }
    return { data: res.company, error: null }
  },

  delete: async (id: string): Promise<{ error: any }> => {
    return deleteAPI('companies', id)
  }
}

// ─────────────────────────────────────────────
// Pipeline Overview
// ─────────────────────────────────────────────
export const pipelineAPI = {
  overview: async (): Promise<{ data: { stages: Record<string, number> }; error: any }> => {
    return callEdgeFunction('pipeline/overview')
  }
}

// ─────────────────────────────────────────────
// Sent Messages
// ─────────────────────────────────────────────
export const messagesAPI = {
  list: async (options: { brandId?: string; clientId?: string; leadId?: string } = {}): Promise<{ data: SentMessage[], error: any }> => {
    const params: Record<string, string> = { 'order': 'created_at.desc' }
    if (options.clientId) params['client_id'] = `eq.${options.clientId}`
    if (options.brandId) params['brand_id'] = `eq.${options.brandId}`
    if (options.leadId) params['lead_id'] = `eq.${options.leadId}`
    params['select'] = 'id,brand_id,lead_id,status,subject,to_email,from_email,created_at,sent_at,opened_at,bounced_at'
    return fetchAPI('sent_messages', { params })
  }
}

// ─────────────────────────────────────────────
// Discovery Sources
// ─────────────────────────────────────────────
export const discoverySourcesAPI = {
  list: async (brandId?: string): Promise<{ data: BrandDiscoverySource[], error: any }> => {
    if (!brandId) return { data: [], error: { message: 'Brand ID required' } }
    const { data, error } = await callEdgeFunction<{ sources: BrandDiscoverySource[] }>(`discovery/${brandId}`)
    if (error) return { data: [], error }
    return { data: data.sources || [], error: null }
  },

  create: async (data: Partial<BrandDiscoverySource>): Promise<{ data: BrandDiscoverySource[], error: any }> => {
    const brandId = data.brand_id
    if (!brandId) return { data: [], error: { message: 'Brand ID required' } }
    const { data: res, error } = await callEdgeFunction<{ success: boolean; source: BrandDiscoverySource }>(`discovery/${brandId}`, {
      method: 'POST',
      body: data,
    })
    if (error) return { data: [], error }
    return { data: [res.source], error: null }
  },

  update: async (id: string, data: Partial<BrandDiscoverySource>): Promise<{ data: any, error: any }> => {
    const brandId = (data as any).brand_id
    if (!brandId) return updateAPI('brand_discovery_sources', id, data)
    const { data: res, error } = await callEdgeFunction<{ success: boolean; source: BrandDiscoverySource }>(`discovery/${brandId}/${id}`, {
      method: 'PATCH',
      body: data,
    })
    if (error) return { data: null, error }
    return { data: res.source, error: null }
  },

  delete: async (id: string): Promise<{ error: any }> => {
    return deleteAPI('brand_discovery_sources', id)
  }
}

// ─────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────
export const settingsAPI = {
  get: async (_clientId: string): Promise<{ data: ClientSettings | null, error: any }> => {
    const { data, error } = await callEdgeFunction<ClientSettings>('settings')
    if (error) return { data: null, error }
    return { data, error: null }
  },

  upsert: async (_clientId: string, data: Partial<ClientSettings>): Promise<{ data: any, error: any }> => {
    const { data: res, error } = await callEdgeFunction<{ success: boolean; settings: ClientSettings }>('settings', {
      method: 'PUT',
      body: data,
    })
    if (error) return { data: null, error }
    return { data: res.settings, error: null }
  },

  getLLMProviders: async (): Promise<{ data: { providers: string[] }; error: any }> => {
    return callEdgeFunction('settings/llm/providers')
  },

  getLLMModels: async (provider: string): Promise<{ data: { provider: string; models: string[] }; error: any }> => {
    return callEdgeFunction(`settings/llm/models?provider=${provider}`)
  },

  getLLM: async (): Promise<{ data: any; error: any }> => {
    return callEdgeFunction('settings/llm')
  },

  updateLLM: async (data: any): Promise<{ data: any; error: any }> => {
    return callEdgeFunction('settings/llm', { method: 'PUT', body: data })
  },

  getEmail: async (): Promise<{ data: any; error: any }> => {
    return callEdgeFunction('settings/email')
  },

  updateEmail: async (data: any): Promise<{ data: any; error: any }> => {
    return callEdgeFunction('settings/email', { method: 'PUT', body: data })
  }
}

// ─────────────────────────────────────────────
// Team Members
// ─────────────────────────────────────────────
export const teamAPI = {
  list: async (_clientId: string): Promise<{ data: ClientMember[], error: any }> => {
    const { data, error } = await callEdgeFunction<ClientMember[]>('team')
    if (error) return { data: [], error }
    return { data: Array.isArray(data) ? data : [], error: null }
  },

  invite: async (data: { clientId: string; email: string; role: string }): Promise<{ data: any, error: any }> => {
    const { data: res, error } = await callEdgeFunction<{ success: boolean; member: ClientMember }>('team/invite', {
      method: 'POST',
      body: { email: data.email, role: data.role },
    })
    if (error) return { data: null, error }
    return { data: res.member, error: null }
  },

  updateRole: async (id: string, role: string): Promise<{ data: any, error: any }> => {
    const { data, error } = await callEdgeFunction<ClientMember>(`team/${id}`, {
      method: 'PATCH',
      body: { role },
    })
    if (error) return { data: null, error }
    return { data, error: null }
  },

  delete: async (id: string): Promise<{ error: any }> => {
    const { error } = await callEdgeFunction(`team/${id}`, { method: 'DELETE' })
    return { error }
  }
}

// ─────────────────────────────────────────────
// Webhooks
// ─────────────────────────────────────────────
export const webhooksAPI = {
  list: async (_clientId: string): Promise<{ data: ClientWebhook[], error: any }> => {
    const { data, error } = await callEdgeFunction<ClientWebhook[]>('webhooks')
    if (error) return { data: [], error }
    return { data: Array.isArray(data) ? data : [], error: null }
  },

  create: async (data: Partial<ClientWebhook>): Promise<{ data: ClientWebhook[], error: any }> => {
    const { data: res, error } = await callEdgeFunction<ClientWebhook>('webhooks', {
      method: 'POST',
      body: data,
    })
    if (error) return { data: [], error }
    return { data: [res], error: null }
  },

  update: async (id: string, data: Partial<ClientWebhook>): Promise<{ data: any, error: any }> => {
    const { data: res, error } = await callEdgeFunction<ClientWebhook>(`webhooks/${id}`, {
      method: 'PATCH',
      body: data,
    })
    if (error) return { data: null, error }
    return { data: res, error: null }
  },

  delete: async (id: string): Promise<{ error: any }> => {
    const { error } = await callEdgeFunction(`webhooks/${id}`, { method: 'DELETE' })
    return { error }
  },

  test: async (id: string): Promise<{ data: any; error: any }> => {
    return callEdgeFunction(`webhooks/${id}/test`, { method: 'POST' })
  }
}

// ─────────────────────────────────────────────
// API Keys
// ─────────────────────────────────────────────
export const apiKeysAPI = {
  list: async (_clientId: string): Promise<{ data: ClientApiKey[], error: any }> => {
    const { data, error } = await callEdgeFunction<ClientApiKey[]>('keys')
    if (error) return { data: [], error }
    return { data: Array.isArray(data) ? data : [], error: null }
  },

  create: async (data: Partial<ClientApiKey>): Promise<{ data: ClientApiKey[], error: any }> => {
    const { data: res, error } = await callEdgeFunction<any>('keys', {
      method: 'POST',
      body: { name: data.name },
    })
    if (error) return { data: [], error }
    const rawKey = res.raw_key
    return { data: [{ ...res, _rawKey: rawKey }], error: null }
  },

  delete: async (id: string): Promise<{ error: any }> => {
    const { error } = await callEdgeFunction(`keys/${id}`, { method: 'DELETE' })
    return { error }
  }
}

// ─────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────
export const analyticsAPI = {
  overview: async (): Promise<{ data: any; error: any }> => {
    return callEdgeFunction('analytics/overview')
  },

  activity: async (limit = 20): Promise<{ data: any; error: any }> => {
    return callEdgeFunction(`analytics/activity?limit=${limit}`)
  },

  chart: async (days = 7): Promise<{ data: any; error: any }> => {
    return callEdgeFunction(`analytics/chart?days=${days}`)
  },

  leads: async (status?: string): Promise<{ data: any; error: any }> => {
    const params = status ? `?status=${status}` : ''
    return callEdgeFunction(`analytics/leads${params}`)
  },

  campaigns: async (): Promise<{ data: any; error: any }> => {
    return callEdgeFunction('analytics/campaigns')
  },

  getMessages: async (clientId?: string, brandId?: string): Promise<{ data: SentMessage[], error: any }> => {
    const params: Record<string, string> = {}
    if (clientId) params['client_id'] = `eq.${clientId}`
    if (brandId) params['brand_id'] = `eq.${brandId}`
    params['select'] = 'id,brand_id,lead_id,status,subject,to_email,from_email,created_at,sent_at,opened_at,bounced_at'
    return fetchAPI('sent_messages', { params })
  }
}

// ─────────────────────────────────────────────
// Activity Logs
// ─────────────────────────────────────────────
export const activityAPI = {
  list: async (clientId?: string, limit = 10): Promise<{ data: ActivityLog[], error: any }> => {
    const params: Record<string, string> = { 'order': 'created_at.desc', 'limit': limit.toString() }
    if (clientId) params['client_id'] = `eq.${clientId}`
    params['select'] = 'id,client_id,brand_id,activity_type,description,company_id,lead_id,user_id,created_at'
    return fetchAPI('activity_logs', { params })
  }
}

// ─────────────────────────────────────────────
// Clients
// ─────────────────────────────────────────────
export const clientAPI = {
  get: async (_clientId: string): Promise<{ data: Client | null, error: any }> => {
    const { data, error } = await callEdgeFunction<Client>('clients')
    if (error) return { data: null, error }
    return { data, error: null }
  },

  getById: async (id: string): Promise<{ data: Client | null, error: any }> => {
    const { data, error } = await callEdgeFunction<Client>(`clients/${id}`)
    if (error) return { data: null, error }
    return { data, error: null }
  },

  update: async (id: string, data: Partial<Client>): Promise<{ data: any, error: any }> => {
    const { data: res, error } = await callEdgeFunction<Client>(`clients/${id}`, {
      method: 'PATCH',
      body: data,
    })
    if (error) return { data: null, error }
    return { data: res, error: null }
  }
}

// ─────────────────────────────────────────────
// Auth / Me (client + member)
// ─────────────────────────────────────────────
export const authAPI = {
  me: async (): Promise<{ data: { client: Client; member: ClientMember } | null; error: any }> => {
    return callEdgeFunction('me')
  }
}

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
export const dashboardAPI = {
  overview: async (): Promise<{ data: any; error: any }> => {
    return callEdgeFunction('dashboard/overview')
  },

  toggle: async (brandId: string, toggles: { discovery?: boolean; outbound?: boolean }): Promise<{ data: any; error: any }> => {
    return callEdgeFunction(`dashboard/${brandId}/toggle`, {
      method: 'PATCH',
      body: toggles,
    })
  }
}

// ─────────────────────────────────────────────
// System
// ─────────────────────────────────────────────
export const systemAPI = {
  health: async (): Promise<{ data: any; error: any }> => {
    return callEdgeFunction('system/health')
  },

  flags: async (): Promise<{ data: any; error: any }> => {
    return callEdgeFunction('system/flags')
  },

  updateFlag: async (key: string, value: boolean): Promise<{ data: any; error: any }> => {
    return callEdgeFunction(`system/flags/${key}`, {
      method: 'POST',
      body: { value },
    })
  },

  metrics: async (): Promise<{ data: any; error: any }> => {
    return callEdgeFunction('system/metrics')
  }
}

// ─────────────────────────────────────────────
// Workers
// ─────────────────────────────────────────────
export const workersAPI = {
  status: async (): Promise<{ data: any; error: any }> => {
    return callEdgeFunction('workers/status')
  },

  metrics: async (brandId?: string): Promise<{ data: any; error: any }> => {
    const params = brandId ? `?brand_id=${brandId}` : ''
    return callEdgeFunction(`workers/metrics${params}`)
  },

  trigger: async (workerName: string): Promise<{ data: any; error: any }> => {
    return callEdgeFunction(`workers/${workerName}/trigger`, { method: 'POST' })
  },

  pause: async (workerName: string): Promise<{ data: any; error: any }> => {
    return callEdgeFunction(`workers/${workerName}/pause`, { method: 'POST' })
  },

  resume: async (workerName: string): Promise<{ data: any; error: any }> => {
    return callEdgeFunction(`workers/${workerName}/resume`, { method: 'POST' })
  }
}

// ─────────────────────────────────────────────
// Outreach Drafts
// ─────────────────────────────────────────────
export const outreachAPI = {
  listByCompany: async (brandId: string, companyId: string): Promise<{ data: OutreachDraft[], error: any }> => {
    const { data, error } = await callEdgeFunction<{ outreach: OutreachDraft[] }>(`pipeline/${brandId}/${companyId}/outreach`)
    if (error) return { data: [], error }
    return { data: data.outreach || [], error: null }
  },
}

// ─────────────────────────────────────────────
// Campaigns
// ─────────────────────────────────────────────
export const campaignsAPI = {
  list: async (): Promise<{ data: any[], error: any }> => {
    return callEdgeFunction('campaigns')
  },

  get: async (id: string): Promise<{ data: any, error: any }> => {
    return callEdgeFunction(`campaigns/${id}`)
  },

  create: async (data: any): Promise<{ data: any, error: any }> => {
    return callEdgeFunction('campaigns', { method: 'POST', body: data })
  },

  update: async (id: string, data: any): Promise<{ data: any, error: any }> => {
    return callEdgeFunction(`campaigns/${id}`, { method: 'PATCH', body: data })
  },

  delete: async (id: string): Promise<{ error: any }> => {
    const { error } = await callEdgeFunction(`campaigns/${id}`, { method: 'DELETE' })
    return { error }
  },

  launch: async (id: string): Promise<{ data: any, error: any }> => {
    return callEdgeFunction(`campaigns/${id}/launch`, { method: 'POST' })
  },

  pause: async (id: string): Promise<{ data: any, error: any }> => {
    return callEdgeFunction(`campaigns/${id}/pause`, { method: 'POST' })
  }
}

// ─────────────────────────────────────────────
// Sidebar Counts (lightweight summary)
// ─────────────────────────────────────────────
export const sidebarAPI = {
  counts: async (): Promise<{ data: { leads: number; pipeline: number; outreach: number } | null; error: any }> => {
    return callEdgeFunction('sidebar-counts')
  }
}

// ─────────────────────────────────────────────
// Import Batches (REST fallback)
// ─────────────────────────────────────────────
export const importBatchesAPI = {
  create: async (data: Partial<LeadImportBatch>): Promise<{ data: LeadImportBatch[], error: any }> => {
    return insertAPI('lead_import_batches', data)
  }
}

// ─────────────────────────────────────────────
// Chat
// ─────────────────────────────────────────────
export const chatAPI = {
  send: async (message: string, sessionId?: string | null): Promise<{ data: any; error: any }> => {
    const token = getStoredToken()
    if (!token) return { data: null, error: { message: 'No token' } }

    try {
      const response = await fetch(`${FUNCTIONS_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: sessionId || null,
        }),
      })

      if (!response.ok) {
        return { data: null, error: { message: `Chat API returned ${response.status}` } }
      }

      return { data: response.body, error: null }
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Network error' } }
    }
  },
}

// ─────────────────────────────────────────────
// Inbox / Messages
// ─────────────────────────────────────────────
export const inboxAPI = {
  list: async (options: { brandId?: string; clientId?: string; status?: string; search?: string; page?: number; perPage?: number } = {}): Promise<{ data: any[]; total: number; error: any }> => {
    const params: Record<string, string> = { 'order': 'created_at.desc' }
    if (options.clientId) params['client_id'] = `eq.${options.clientId}`
    if (options.brandId) params['brand_id'] = `eq.${options.brandId}`
    params['select'] = 'id,brand_id,lead_id,from_email,from_name,subject,body,status,is_read,is_starred,created_at'
    const limit = options.perPage || 50
    params['limit'] = String(limit)
    if (options.page) params['offset'] = String((options.page - 1) * limit)
    const result = await fetchAPI('inbound_messages', { params, count: true })
    return {
      data: Array.isArray(result.data) ? result.data : [],
      total: parseInt(result.count || '0'),
      error: result.error,
    }
  },

  update: async (id: string, data: any): Promise<{ data: any; error: any }> => {
    return updateAPI('inbound_messages', id, data)
  },

  delete: async (id: string): Promise<{ error: any }> => {
    return deleteAPI('inbound_messages', id)
  },
}

// ─────────────────────────────────────────────
// Brand Intents
// ─────────────────────────────────────────────
export const brandIntentsAPI = {
  list: async (brandId: string): Promise<{ data: BrandIntent[], error: any }> => {
    const params: Record<string, string> = { 'brand_id': `eq.${brandId}`, 'order': 'priority.asc' }
    params['select'] = 'id,brand_id,intent,priority,is_active,created_at'
    return fetchAPI('brand_intents', { params })
  },

  create: async (data: Partial<BrandIntent>): Promise<{ data: BrandIntent[], error: any }> => {
    return insertAPI('brand_intents', data)
  },

  update: async (id: string, data: Partial<BrandIntent>): Promise<{ data: any, error: any }> => {
    return updateAPI('brand_intents', id, data)
  },

  delete: async (id: string): Promise<{ error: any }> => {
    return deleteAPI('brand_intents', id)
  }
}

// ─────────────────────────────────────────────
// Discovered Companies
// ─────────────────────────────────────────────
export const discoveredCompaniesAPI = {
  list: async (options: {
    clientId?: string
    brandId?: string
    status?: string
    sourceName?: string
    signalType?: string
    scoreMin?: number
    scoreMax?: number
    search?: string
    page?: number
    perPage?: number
  } = {}): Promise<{ data: DiscoveredCompany[], total: number, error: any }> => {
    const params: Record<string, string> = { 'order': 'discovered_at.desc' }
    if (options.brandId) params['brand_id'] = `eq.${options.brandId}`
    if (options.status) {
      if (options.status === 'raw') params['enrichment_status'] = `eq.raw`
      else if (options.status === 'rejected') params['enrichment_status'] = `eq.rejected`
      else if (options.status === 'approved') params['enrichment_status'] = `eq.approved`
    }
    if (options.sourceName) params['source_name'] = `eq.${options.sourceName}`
    if (options.signalType) params['signal_type'] = `eq.${options.signalType}`
    if (options.scoreMin) params['relevance_score'] = `gte.${options.scoreMin}`
    if (options.scoreMax) params['relevance_score'] = `lte.${options.scoreMax}`
    if (options.search) params['name'] = `ilike.*${options.search}*`
    params['limit'] = String(options.perPage || 50)
    params['offset'] = String(((options.page || 1) - 1) * (options.perPage || 50))
    params['select'] = 'id,brand_id,name,domain,website,enrichment_status,source_name,source_id,signal_type,relevance_score,confidence,intent_score,risk,discovered_at'
    const result = await fetchAPI('discovered_companies', { params, count: true })
    return {
      data: result.data as DiscoveredCompany[],
      total: parseInt(result.count || '0'),
      error: result.error
    }
  },

  get: async (id: string): Promise<{ data: DiscoveredCompany | null, error: any }> => {
    const params: Record<string, string> = { 'id': `eq.${id}` }
    params['select'] = 'id,brand_id,name,domain,website,enrichment_status,source_name,source_id,signal_type,relevance_score,confidence,intent_score,risk,discovered_at,summary,raw_payload,updated_at'
    const { data, error } = await fetchAPI('discovered_companies', { params })
    if (error) return { data: null, error }
    return { data: data[0] || null, error: null }
  },

  update: async (id: string, data: Partial<DiscoveredCompany>): Promise<{ data: any, error: any }> => {
    return updateAPI('discovered_companies', id, data)
  },

  delete: async (id: string): Promise<{ error: any }> => {
    return deleteAPI('discovered_companies', id)
  },

  getSourceNames: async (_clientId?: string): Promise<{ data: string[], error: any }> => {
    const params: Record<string, string> = { 'source_name': 'not.is.null' }
    params['select'] = 'source_name'
    const { data, error } = await fetchAPI('discovered_companies', { params })
    if (error) return { data: [], error }
    const names = [...new Set(data.map((d: any) => d.source_name).filter(Boolean))] as string[]
    return { data: names, error: null }
  },

  getSignalTypes: async (_clientId?: string): Promise<{ data: string[], error: any }> => {
    const params: Record<string, string> = { 'signal_type': 'not.is.null' }
    params['select'] = 'signal_type'
    const { data, error } = await fetchAPI('discovered_companies', { params })
    if (error) return { data: [], error }
    const types = [...new Set(data.map((d: any) => d.signal_type).filter(Boolean))] as string[]
    return { data: types, error: null }
  }
}
