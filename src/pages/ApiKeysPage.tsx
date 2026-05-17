import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Drawer from '@/components/Drawer'
import { apiKeysAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { copyToClipboard } from '@/lib/utils'
import { brandsAPI, discoverySourcesAPI } from '@/lib/api'
import { Eye, EyeOff, Copy, Key, Globe, Database, Search, Bot, Mail, ExternalLink, Shield, Plus, Sparkles } from 'lucide-react'

interface ExternalKey {
  id: string
  service: string
  type: string
  keyValue: string
  label: string
  source: string
  status: 'configured' | 'missing'
  icon: any
  color: string
  url?: string
}

const SERVICE_META: Record<string, { icon: any; color: string; url?: string }> = {
  apollo: { icon: Globe, color: 'text-muted-foreground bg-muted', url: 'https://apollo.io' },
  hunter: { icon: Search, color: 'text-muted-foreground bg-muted', url: 'https://hunter.io' },
  apify: { icon: Database, color: 'text-muted-foreground bg-muted', url: 'https://apify.com' },
  github: { icon: Shield, color: 'text-foreground/80 bg-muted', url: 'https://github.com/settings/tokens' },
  llm: { icon: Bot, color: 'text-muted-foreground bg-muted' },
  smtp: { icon: Mail, color: 'text-muted-foreground bg-muted' },
}

export default function ApiKeysPage() {
  const { client } = useAuth()
  const [keys, setKeys] = useState<ExternalKey[]>([])
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchAllKeys()
  }, [])

  const fetchAllKeys = async () => {
    setIsLoading(true)
    try {
      const { data: brands } = await brandsAPI.list(client?.id)
      const allKeys: ExternalKey[] = []

      for (const brand of brands || []) {
        const { data: sources } = await discoverySourcesAPI.list(brand.id)
        for (const source of sources || []) {
          const config = (source.config || {}) as Record<string, any>
          const apiKey = config.api_key || config.token
          if (apiKey) {
            const meta = SERVICE_META[source.type] || { icon: Key, color: 'text-muted-foreground bg-muted' }
            const brandLabel = brand.brand_name || brand.product || ''
            allKeys.push({
              id: `src-${source.id}`,
              service: source.type,
              type: 'discovery',
              keyValue: apiKey,
              label: source.name,
              source: brandLabel,
              status: 'configured',
              icon: meta.icon,
              color: meta.color,
              url: meta.url,
            })
          }
        }
      }

      if (brands && brands.length > 0) {
        const activeBrand = brands[0]
        if (activeBrand.smtp_password) {
          const brandLabel = activeBrand.brand_name || activeBrand.product || 'Brand'
          allKeys.push({
            id: `brand-${activeBrand.id}-smtp`,
            service: 'smtp',
            type: 'email',
            keyValue: activeBrand.smtp_password || '',
            label: `${brandLabel} SMTP`,
            source: brandLabel,
            status: 'configured',
            icon: Mail,
            color: 'text-muted-foreground bg-muted',
          })
        }
        if (activeBrand.provider_api_key) {
          const brandLabel = activeBrand.brand_name || activeBrand.product || 'Brand'
          allKeys.push({
            id: `brand-${activeBrand.id}-provider`,
            service: activeBrand.provider || 'email',
            type: 'email',
            keyValue: activeBrand.provider_api_key,
            label: `${brandLabel} API`,
            source: brandLabel,
            status: 'configured',
            icon: Mail,
            color: 'text-muted-foreground bg-muted',
          })
        }
      }

      const keyTypes = ['apollo', 'hunter', 'apify', 'github', 'llm', 'smtp']
      for (const type of keyTypes) {
        const hasKey = allKeys.some(k => k.service === type)
        if (!hasKey) {
          const meta = SERVICE_META[type] || { icon: Key, color: 'text-muted-foreground bg-muted' }
          allKeys.push({
            id: `missing-${type}`,
            service: type,
            type: type === 'smtp' ? 'email' : type === 'llm' ? 'ai' : 'discovery',
            keyValue: '',
            label: type.charAt(0).toUpperCase() + type.slice(1),
            source: 'Not configured',
            status: 'missing',
            icon: meta.icon,
            color: 'text-muted-foreground/50 bg-muted',
            url: meta.url,
          })
        }
      }

      setKeys(allKeys)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch API keys')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVisible = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCopy = async (value: string) => {
    await copyToClipboard(value)
    toast.success('Copied to clipboard')
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Key name is required')
      return
    }
    setIsCreating(true)
    try {
      const { data, error } = await apiKeysAPI.create({ name: newKeyName })
      if (error) throw error
      if (data && data[0] && (data[0] as any)._rawKey) {
        setCreatedKey((data[0] as any)._rawKey)
      }
      toast.success('API key created')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create API key')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCloseCreate = () => {
    setIsCreateDrawerOpen(false)
    setNewKeyName('')
    setCreatedKey(null)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'discovery': return 'Discovery'
      case 'email': return 'Email'
      case 'ai': return 'AI / LLM'
      default: return type
    }
  }

  const groupedKeys = keys.reduce((acc, key) => {
    if (!acc[key.type]) acc[key.type] = []
    acc[key.type].push(key)
    return acc
  }, {} as Record<string, ExternalKey[]>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">External API Keys</h1>
          <p className="text-sm text-muted-foreground">API keys and tokens the engine uses to connect to third-party services</p>
        </div>
        <Button onClick={() => setIsCreateDrawerOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create API Key
        </Button>
      </div>

      {Object.entries(groupedKeys).map(([type, typeKeys]) => (
        <div key={type}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{getTypeLabel(type)}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {typeKeys.map((key) => {
              const Icon = key.icon
              const isVisible = visibleKeys.has(key.id)
              const isConfigured = key.status === 'configured'

              return (
                <Card key={key.id} className={`hover:shadow-md transition-shadow ${!isConfigured ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2.5 ${key.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-semibold">{key.label}</CardTitle>
                            {key.url && isConfigured && (
                              <a href={key.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground/50 hover:text-foreground/80">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{key.source}</p>
                        </div>
                      </div>
                      <Badge variant={isConfigured ? 'success' : 'secondary'} className="shrink-0 text-xs">
                        {isConfigured ? 'Configured' : 'Missing'}
                      </Badge>
                    </div>

                    {isConfigured && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 relative">
                          <Input
                            readOnly
                            type={isVisible ? 'text' : 'password'}
                            value={key.keyValue}
                            className="font-mono text-xs pr-16 bg-muted/30"
                          />
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                            <button
                              onClick={() => toggleVisible(key.id)}
                              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground/50 hover:text-foreground/80"
                            >
                              {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(key.keyValue)}
                              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground/50 hover:text-foreground/80"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      <Drawer
        isOpen={isCreateDrawerOpen}
        onClose={handleCloseCreate}
        title="Create API Key"
        size="sm"
      >
        <div className="space-y-6">
          {!createdKey ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Key Name</label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production API Key"
                />
              </div>
              <Button onClick={handleCreateKey} isLoading={isCreating} className="w-full">
                <Sparkles className="h-4 w-4 mr-1.5" />
                Generate Key
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-foreground/5 border border-foreground/10 p-4">
                <p className="text-sm font-semibold text-foreground mb-1">Your API Key</p>
                <p className="text-xs text-muted-foreground mb-3">Copy this key now. You won't be able to see it again.</p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={createdKey}
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(createdKey)}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button variant="outline" onClick={handleCloseCreate} className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  )
}
