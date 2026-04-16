import { getStoredToken, createAuthenticatedClient } from '@/lib/supabase'
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
  LeadImportBatch
} from '@/lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

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
  }
  
  if (options.count) {
    headers['Prefer'] = 'count=exact'
  }
  
  if (options.range) {
    headers['Range'] = `${options.range[0]}-${options.range[1]}`
    headers['Prefer'] = 'count=exact'
  }
  
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    console.error(`API Error [${table}]:`, data)
    
    if (data?.code === 'PGRST303' || data?.message?.includes('JWT expired')) {
      localStorage.removeItem('outbound_token')
      localStorage.removeItem('outbound_user')
      window.location.href = '/login'
    }
  }
  
  return {
    data: Array.isArray(data) ? data : data ? [data] : [],
    error: response.ok ? null : data,
    count: response.headers.get('content-range')?.split('/')[1]
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
    }
  })
  
  return { error: response.ok ? null : await response.json() }
}

export const brandsAPI = {
  list: async (clientId?: string): Promise<{ data: BrandProfile[], error: any }> => {
    const params: Record<string, string> = { 'order': 'created_at.desc' }
    if (clientId) params['client_id'] = `eq.${clientId}`
    return fetchAPI('brand_profiles', { params })
  },
  
  get: async (id: string): Promise<{ data: BrandProfile | null, error: any }> => {
    return fetchAPI('brand_profiles', {
      params: { 'id': `eq.${id}`, 'select': '*' }
    }).then(r => ({ data: r.data[0] || null, error: r.error }))
  },
  
  create: async (data: Partial<BrandProfile>): Promise<{ data: BrandProfile[], error: any }> => {
    return insertAPI('brand_profiles', data)
  },
  
  update: async (id: string, data: Partial<BrandProfile>): Promise<{ data: any, error: any }> => {
    return updateAPI('brand_profiles', id, data)
  },
  
  delete: async (id: string): Promise<{ error: any }> => {
    return deleteAPI('brand_profiles', id)
  }
}

export const leadsAPI = {
  list: async (options: {
    brandId?: string
    clientId?: string
    status?: string
    search?: string
    page?: number
    perPage?: number
  } = {}): Promise<{ data: Lead[], total: number, error: any }> => {
    const params: Record<string, string> = { 'order': 'created_at.desc' }
    
    if (options.clientId) params['client_id'] = `eq.${options.clientId}`
    if (options.brandId) params['brand_id'] = `eq.${options.brandId}`
    if (options.status) params['status'] = `eq.${options.status}`
    if (options.search) params['or'] = `(email.ilike.%${options.search}%,full_name.ilike.%${options.search}%)`
    
    const page = options.page || 1
    const perPage = options.perPage || 50
    const range: [number, number] = [(page - 1) * perPage, page * perPage - 1]
    
    return fetchAPI('leads', { params, range, count: true })
      .then(r => ({ data: r.data, total: parseInt(r.count || '0'), error: r.error }))
  },
  
  get: async (id: string): Promise<{ data: Lead | null, error: any }> => {
    return fetchAPI('leads', { params: { 'id': `eq.${id}` } })
      .then(r => ({ data: r.data[0] || null, error: r.error }))
  },
  
  create: async (data: Partial<Lead>): Promise<{ data: Lead[], error: any }> => {
    return insertAPI('leads', data)
  },
  
  createMany: async (data: Partial<Lead>[]): Promise<{ data: any[], error: any }> => {
    return insertAPI('leads', data)
  },
  
  update: async (id: string, data: Partial<Lead>): Promise<{ data: any, error: any }> => {
    return updateAPI('leads', id, data)
  },
  
  delete: async (id: string): Promise<{ error: any }> => {
    return deleteAPI('leads', id)
  }
}

export const companiesAPI = {
  list: async (options: { brandId?: string; clientId?: string } = {}): Promise<{ data: Company[], error: any }> => {
    const params: Record<string, string> = { 'order': 'updated_at.desc' }
    if (options.clientId) params['client_id'] = `eq.${options.clientId}`
    if (options.brandId) params['brand_id'] = `eq.${options.brandId}`
    return fetchAPI('companies', { params })
  },
  
  get: async (id: string): Promise<{ data: Company | null, error: any }> => {
    return fetchAPI('companies', { params: { 'id': `eq.${id}` } })
      .then(r => ({ data: r.data[0] || null, error: r.error }))
  },
  
  create: async (data: Partial<Company>): Promise<{ data: Company[], error: any }> => {
    return insertAPI('companies', data)
  },
  
  update: async (id: string, data: Partial<Company>): Promise<{ data: any, error: any }> => {
    return updateAPI('companies', id, data)
  },
  
  delete: async (id: string): Promise<{ error: any }> => {
    return deleteAPI('companies', id)
  }
}

export const messagesAPI = {
  list: async (options: { brandId?: string; clientId?: string; leadId?: string } = {}): Promise<{ data: SentMessage[], error: any }> => {
    const params: Record<string, string> = { 'order': 'created_at.desc' }
    if (options.clientId) params['client_id'] = `eq.${options.clientId}`
    if (options.brandId) params['brand_id'] = `eq.${options.brandId}`
    if (options.leadId) params['lead_id'] = `eq.${options.leadId}`
    return fetchAPI('sent_messages', { params })
  }
}

export const discoverySourcesAPI = {
  list: async (brandId?: string): Promise<{ data: BrandDiscoverySource[], error: any }> => {
    const params: Record<string, string> = { 'order': 'created_at.desc' }
    if (brandId) params['brand_id'] = `eq.${brandId}`
    return fetchAPI('brand_discovery_sources', { params })
  },
  
  create: async (data: Partial<BrandDiscoverySource>): Promise<{ data: BrandDiscoverySource[], error: any }> => {
    return insertAPI('brand_discovery_sources', data)
  },
  
  update: async (id: string, data: Partial<BrandDiscoverySource>): Promise<{ data: any, error: any }> => {
    return updateAPI('brand_discovery_sources', id, data)
  },
  
  delete: async (id: string): Promise<{ error: any }> => {
    return deleteAPI('brand_discovery_sources', id)
  }
}

export const settingsAPI = {
  get: async (clientId: string): Promise<{ data: ClientSettings | null, error: any }> => {
    return fetchAPI('client_settings', { params: { 'client_id': `eq.${clientId}` } })
      .then(r => ({ data: r.data[0] || null, error: r.error }))
  },
  
  upsert: async (clientId: string, data: Partial<ClientSettings>): Promise<{ data: any, error: any }> => {
    const token = getStoredToken()
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/client_settings`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ ...data, client_id: clientId })
    })
    
    const result = await response.json()
    return { data: result, error: response.ok ? null : result }
  }
}

export const teamAPI = {
  list: async (clientId: string): Promise<{ data: ClientMember[], error: any }> => {
    return fetchAPI('client_members', { params: { 'client_id': `eq.${clientId}` } })
  },
  
  invite: async (data: { clientId: string; email: string; role: string }): Promise<{ data: any, error: any }> => {
    return insertAPI('client_members', {
      client_id: data.clientId,
      email: data.email,
      role: data.role,
      invite_token: Math.random().toString(36).substring(2),
      invited_at: new Date().toISOString()
    })
  },
  
  updateRole: async (id: string, role: string): Promise<{ data: any, error: any }> => {
    return updateAPI('client_members', id, { role })
  },
  
  delete: async (id: string): Promise<{ error: any }> => {
    return deleteAPI('client_members', id)
  }
}

export const webhooksAPI = {
  list: async (clientId: string): Promise<{ data: ClientWebhook[], error: any }> => {
    return fetchAPI('client_webhooks', { params: { 'client_id': `eq.${clientId}` } })
  },
  
  create: async (data: Partial<ClientWebhook>): Promise<{ data: ClientWebhook[], error: any }> => {
    return insertAPI('client_webhooks', data)
  },
  
  update: async (id: string, data: Partial<ClientWebhook>): Promise<{ data: any, error: any }> => {
    return updateAPI('client_webhooks', id, data)
  },
  
  delete: async (id: string): Promise<{ error: any }> => {
    return deleteAPI('client_webhooks', id)
  }
}

export const apiKeysAPI = {
  list: async (clientId: string): Promise<{ data: ClientApiKey[], error: any }> => {
    return fetchAPI('client_api_keys', { params: { 'client_id': `eq.${clientId}` } })
  },
  
  create: async (data: Partial<ClientApiKey>): Promise<{ data: ClientApiKey[], error: any }> => {
    const keyValue = 'oe_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    return insertAPI('client_api_keys', { ...data, key_hash: await hashKey(keyValue) })
      .then(r => ({ data: r.data.map((d: any, i: number) => ({ ...d, _rawKey: keyValue })), error: r.error }))
  },
  
  delete: async (id: string): Promise<{ error: any }> => {
    return deleteAPI('client_api_keys', id)
  }
}

async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const analyticsAPI = {
  getMessages: async (clientId?: string, brandId?: string): Promise<{ data: SentMessage[], error: any }> => {
    const params: Record<string, string> = {}
    if (clientId) params['client_id'] = `eq.${clientId}`
    if (brandId) params['brand_id'] = `eq.${brandId}`
    return fetchAPI('sent_messages', { params })
  }
}

export const activityAPI = {
  list: async (clientId?: string, limit = 10): Promise<{ data: ActivityLog[], error: any }> => {
    const params: Record<string, string> = { 'order': 'created_at.desc', 'limit': limit.toString() }
    if (clientId) params['client_id'] = `eq.${clientId}`
    return fetchAPI('activity_logs', { params })
  }
}

export const clientAPI = {
  get: async (clientId: string): Promise<{ data: Client | null, error: any }> => {
    return fetchAPI('clients', { params: { 'id': `eq.${clientId}` } })
      .then(r => ({ data: r.data[0] || null, error: r.error }))
  }
}

export const importBatchesAPI = {
  create: async (data: Partial<LeadImportBatch>): Promise<{ data: LeadImportBatch[], error: any }> => {
    return insertAPI('lead_import_batches', data)
  }
}
