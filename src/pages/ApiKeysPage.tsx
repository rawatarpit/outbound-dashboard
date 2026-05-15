import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { copyToClipboard } from '@/lib/utils'
import { brandsAPI, discoverySourcesAPI } from '@/lib/api'
import { Eye, EyeOff, Copy, Key, Globe, Database, Search, Bot, Mail, ExternalLink, Shield } from 'lucide-react'

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
  apollo: { icon: Globe, color: 'text-blue-400 bg-blue-500/10', url: 'https://apollo.io' },
  hunter: { icon: Search, color: 'text-amber-400 bg-amber-500/10', url: 'https://hunter.io' },
  apify: { icon: Database, color: 'text-green-400 bg-green-500/10', url: 'https://apify.com' },
  github: { icon: Shield, color: 'text-foreground/80 bg-white/[0.04]', url: 'https://github.com/settings/tokens' },
  llm: { icon: Bot, color: 'text-purple-400 bg-purple-500/10' },
  smtp: { icon: Mail, color: 'text-red-400 bg-red-500/10' },
}

export default function ApiKeysPage() {
  const { client } = useAuth()
  const [keys, setKeys] = useState<ExternalKey[]>([])
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

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
            const meta = SERVICE_META[source.type] || { icon: Key, color: 'text-muted-foreground bg-white/[0.03]' }
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
            color: 'text-red-600 bg-red-50',
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
            color: 'text-red-600 bg-red-50',
          })
        }
      }

      const keyTypes = ['apollo', 'hunter', 'apify', 'github', 'llm', 'smtp']
      for (const type of keyTypes) {
        const hasKey = allKeys.some(k => k.service === type)
        if (!hasKey) {
          const meta = SERVICE_META[type] || { icon: Key, color: 'text-muted-foreground bg-white/[0.03]' }
          allKeys.push({
            id: `missing-${type}`,
            service: type,
            type: type === 'smtp' ? 'email' : type === 'llm' ? 'ai' : 'discovery',
            keyValue: '',
            label: type.charAt(0).toUpperCase() + type.slice(1),
            source: 'Not configured',
            status: 'missing',
            icon: meta.icon,
            color: 'text-muted-foreground/50 bg-white/[0.03]',
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
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-white/[0.04] border-t-primary shadow-2xl" />
          <div className="absolute inset-0 animate-pulse rounded-full h-10 w-10 bg-primary/5 blur-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">External API Keys</h1>
        <p className="text-muted-foreground">API keys and tokens the engine uses to connect to third-party services</p>
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
                            className="font-mono text-xs pr-16 bg-white/[0.02]"
                          />
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                            <button
                              onClick={() => toggleVisible(key.id)}
                              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground/50 hover:text-foreground/80"
                            >
                              {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(key.keyValue)}
                              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground/50 hover:text-foreground/80"
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
    </div>
  )
}
