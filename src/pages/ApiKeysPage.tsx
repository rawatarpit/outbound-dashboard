import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Drawer from '@/components/Drawer'
import EmailConfigForm from '@/components/forms/EmailConfigForm'
import LLMConfigForm from '@/components/forms/LLMConfigForm'
import DiscoveryConfigForm from '@/components/forms/DiscoveryConfigForm'
import { apiKeysAPI, brandsAPI, discoverySourcesAPI, settingsAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { copyToClipboard } from '@/lib/utils'
import { Eye, EyeOff, Copy, Key, Globe, Database, Search, Bot, Mail, ExternalLink, Shield, Plus, Sparkles, Settings } from 'lucide-react'

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
  const [isEmailConfigDrawerOpen, setIsEmailConfigDrawerOpen] = useState(false)
  const [isAIConfigDrawerOpen, setIsAIConfigDrawerOpen] = useState(false)
  const [isDiscoveryConfigDrawerOpen, setIsDiscoveryConfigDrawerOpen] = useState(false)

  useEffect(() => {
    fetchAllKeys()
  }, [])

  const fetchAllKeys = async () => {
    setIsLoading(true)
    try {
      const { data: brands } = await brandsAPI.list(client?.id || '')
      const { data: settings } = await settingsAPI.get(client?.id || '')
      
      const allKeys: ExternalKey[] = []
      
      // Process discovery source keys
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

      // Process brand-specific email keys
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

      // Process general settings keys (LLMs, etc.)
      if (settings) {
        if (settings.llm_api_key) {
          allKeys.push({
            id: 'llm-key',
            service: 'llm',
            type: 'ai',
            keyValue: settings.llm_api_key,
            label: 'LLM API Key',
            source: 'Global Settings',
            status: 'configured',
            icon: Bot,
            color: 'text-muted-foreground bg-muted',
          })
        }
      }

      // Add placeholders for missing services
      const keyTypes = ['apollo', 'hunter', 'apify', 'github', 'llm', 'smtp', 'resend']
      for (const type of keyTypes) {
        const hasKey = allKeys.some(k => k.service === type)
        if (!hasKey) {
          const meta = SERVICE_META[type] || { icon: Key, color: 'text-muted-foreground bg-muted' }
          allKeys.push({
            id: `missing-${type}`,
            service: type,
            type: type === 'smtp' || type === 'resend' ? 'email' : type === 'llm' ? 'ai' : 'discovery',
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
      fetchAllKeys() // Refresh the key list
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

  const handleConfigSuccess = () => {
    setIsEmailConfigDrawerOpen(false)
    setIsAIConfigDrawerOpen(false)
    setIsDiscoveryConfigDrawerOpen(false)
    fetchAllKeys()
  }

  const handleConfigureService = (service: string) => {
    if (service === 'smtp' || service === 'resend') {
      setIsEmailConfigDrawerOpen(true)
    } else if (service === 'llm' || service === 'openai' || service === 'anthropic' || service === 'groq' || service === 'ollama') {
      setIsAIConfigDrawerOpen(true)
    } else {
      setIsDiscoveryConfigDrawerOpen(true)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'discovery': return 'Discovery Sources'
      case 'email': return 'Email Providers'
      case 'ai': return 'AI / LLM Services'
      default: return type
    }
  }

  const getServiceDescription = (service: string) => {
    switch (service) {
      case 'apollo': return 'People and company data from Apollo.io'
      case 'hunter': return 'Email finder for professional domains'
      case 'apify': return 'Web scraping platform for data extraction'
      case 'github': return 'Developer profile and repository data'
      case 'llm': return 'Language models for AI-powered outreach'
      case 'smtp': return 'Standard email protocol for sending'
      case 'resend': return 'Modern email API for transactional emails'
      default: return 'External service integration'
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
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-border border-t-primary shadow-2xl" />
          <div className="absolute inset-0 animate-pulse rounded-full h-10 w-10 bg-primary/5 blur-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">API Keys & Services</span>
          </h1>
          <p className="text-sm text-muted-foreground">Configure all services your outbound engine uses. Configure once, use everywhere.</p>
        </div>
      </div>

      {/* Centralized Service Configuration */}
      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Service Integrations
          </CardTitle>
          <CardDescription>
            Connect your email, AI, and data providers to power your outbound engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto py-4 flex-col items-center justify-center gap-2" onClick={() => setIsEmailConfigDrawerOpen(true)}>
              <Mail className="h-5 w-5" />
              <span className="font-medium">Email Services</span>
              <span className="text-xs text-muted-foreground">SMTP, Resend</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-center justify-center gap-2" onClick={() => setIsAIConfigDrawerOpen(true)}>
              <Bot className="h-5 w-5" />
              <span className="font-medium">AI Services</span>
              <span className="text-xs text-muted-foreground">OpenAI, Anthropic</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-center justify-center gap-2" onClick={() => setIsDiscoveryConfigDrawerOpen(true)}>
              <Globe className="h-5 w-5" />
              <span className="font-medium">Discovery Sources</span>
              <span className="text-xs text-muted-foreground">Apollo, Hunter</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personal API Keys - for programmatic access */}
      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Personal API Keys
              </CardTitle>
              <CardDescription>
                Create API keys for programmatic access to your account
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setIsCreateDrawerOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            API keys allow external applications and integrations to access your outbound engine programmatically. Use them to build custom workflows or connect with third-party tools.
          </p>
        </CardContent>
      </Card>

      {/* Existing Keys Display */}
      <div className="space-y-8">
        {Object.entries(groupedKeys).map(([type, typeKeys]) => (
          <div key={type}>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              {getTypeLabel(type)}
              <Badge variant="secondary">{typeKeys.length} services</Badge>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {typeKeys.map((key) => {
                const Icon = key.icon
                const isVisible = visibleKeys.has(key.id)
                const isConfigured = key.status === 'configured'

                return (
                  <Card key={key.id} className={`rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow ${!isConfigured ? 'opacity-70 border-dashed' : ''}`}>
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
                            <p className="text-xs text-muted-foreground mt-0.5">{getServiceDescription(key.service)}</p>
                          </div>
                        </div>
                        <Badge variant={isConfigured ? 'success' : 'secondary'} className="shrink-0 text-xs">
                          {isConfigured ? 'Active' : 'Not Configured'}
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

                      {!isConfigured && (
                        <div className="mt-3">
                          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleConfigureService(key.service)}>
                            Configure {key.label}
                          </Button>
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
                Generate New Key
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Generated keys can be used to authenticate API requests to your outbound engine
              </p>
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

      <Drawer
        isOpen={isEmailConfigDrawerOpen}
        onClose={() => setIsEmailConfigDrawerOpen(false)}
        title="Email Services Configuration"
        description="Configure SMTP or Resend for email delivery"
        size="lg"
      >
        <EmailConfigForm
          onSuccess={handleConfigSuccess}
          onCancel={() => setIsEmailConfigDrawerOpen(false)}
        />
      </Drawer>

      <Drawer
        isOpen={isAIConfigDrawerOpen}
        onClose={() => setIsAIConfigDrawerOpen(false)}
        title="AI Services Configuration"
        description="Configure your LLM provider and model settings"
        size="lg"
      >
        <LLMConfigForm
          onSuccess={handleConfigSuccess}
          onCancel={() => setIsAIConfigDrawerOpen(false)}
        />
      </Drawer>

      <Drawer
        isOpen={isDiscoveryConfigDrawerOpen}
        onClose={() => setIsDiscoveryConfigDrawerOpen(false)}
        title="Discovery Sources Configuration"
        description="Update API keys for your discovery sources"
        size="lg"
      >
        <DiscoveryConfigForm
          onSuccess={handleConfigSuccess}
          onCancel={() => setIsDiscoveryConfigDrawerOpen(false)}
        />
      </Drawer>
    </div>
  )
}
