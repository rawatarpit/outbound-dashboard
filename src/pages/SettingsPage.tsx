import { useState, useEffect } from 'react'
import { type ClientSettings, LLM_PROVIDERS } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Settings, Mail, Bot, Server, Save, Building2, Loader2, Activity } from 'lucide-react'
import { settingsAPI, clientAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import type { Client } from '@/lib/supabase'
import { SectionHeader, AnimatedCounter } from '@/components/DashboardComponents'

export default function SettingsPage() {
  const { client, user } = useAuth()
  const clientId = user?.clientId || client?.id
  const [_settings, setSettings] = useState<ClientSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<ClientSettings>>({})
  const [clientData, setClientData] = useState<Client | null>(null)
  const [clientForm, setClientForm] = useState<Partial<Client>>({})

  useEffect(() => {
    if (clientId) {
      fetchSettings()
      fetchClient()
    } else {
      setIsLoading(false)
    }
  }, [clientId])

  const fetchClient = async () => {
    if (!clientId) return
    try {
      const { data } = await clientAPI.get(clientId)
      if (data) {
        setClientData(data)
        setClientForm(data)
      }
    } catch {} // client fetch is best-effort
  }

  const fetchSettings = async () => {
    if (!clientId) return

    try {
      const { data, error } = await settingsAPI.get(clientId)

      if (error) throw error

      if (data) {
        setSettings(data)
        setFormData(data)
      } else {
        setFormData({
          llm_provider: 'ollama',
          llm_temperature: 0.7,
          email_provider: 'smtp',
          smtp_secure: true,
          imap_secure: true,
          imap_enabled: false
        })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!clientId) return
    setIsSaving(true)

    try {
      const payload = {
        ...formData,
        llm_temperature: formData.llm_temperature ?? 0.7
      }

      await settingsAPI.upsert(clientId, payload)

      toast.success('Settings saved successfully')
      fetchSettings()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const providersCount = [formData.llm_provider, formData.smtp_host || formData.email_provider === 'resend'].filter(Boolean).length
  const featuresCount = [formData.imap_enabled, clientForm.discovery_enabled ?? true, clientForm.enrichment_enabled ?? true].filter(Boolean).length

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
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Settings</span>
        </h1>
        <p className="text-muted-foreground mt-1">Configure your outbound engine</p>
      </div>

      {/* Config Health Banner */}
      <div className="relative overflow-hidden rounded-xl border p-4 bg-gradient-to-r from-muted/50 to-muted/30 border-border/50">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#6366f112' }}>
            <Settings className="h-5 w-5" style={{ color: '#6366f1' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Configuration Summary</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${formData.llm_provider ? 'bg-green-500' : 'bg-red-500'}`} />
                LLM {formData.llm_provider ? 'Configured' : 'Not configured'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${formData.smtp_host ? 'bg-green-500' : formData.email_provider === 'resend' ? 'bg-green-500' : 'bg-amber-500'}`} />
                Email {formData.smtp_host || formData.email_provider === 'resend' ? 'Configured' : 'Partial'}
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${formData.imap_enabled ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                IMAP {formData.imap_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6366f112' }}>
              <Server className="h-[18px] w-[18px]" style={{ color: '#6366f1' }} />
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available Providers</p>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            <AnimatedCounter value={providersCount} />
          </p>
        </div>
        <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22c55e12' }}>
              <Activity className="h-[18px] w-[18px]" style={{ color: '#22c55e' }} />
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Features</p>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            <AnimatedCounter value={featuresCount} />
          </p>
        </div>
      </div>

      <Tabs defaultValue="llm" className="w-full">
        <TabsList className="bg-muted/70 border border-border/50 p-0.5">
          <TabsTrigger value="llm">
            <Bot className="h-4 w-4 mr-2" />
            LLM Configuration
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email Settings
          </TabsTrigger>
          <TabsTrigger value="imap">
            <Server className="h-4 w-4 mr-2" />
            IMAP Settings
          </TabsTrigger>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Building2 className="h-4 w-4 mr-2" />
            Client Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="llm">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6 space-y-5">
              <SectionHeader icon={Bot} title="LLM Configuration" subtitle="Configure the AI model used for outreach and analysis" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="llm_provider">Provider</Label>
                  <Select
                    value={formData.llm_provider || 'ollama'}
                    onValueChange={(v) => handleChange('llm_provider', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LLM_PROVIDERS.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="llm_model">Model</Label>
                  <Input
                    id="llm_model"
                    value={formData.llm_model || ''}
                    onChange={(e) => handleChange('llm_model', e.target.value)}
                    placeholder="llama3:8b, gpt-4-turbo, etc."
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="llm_temperature">Temperature</Label>
                  <Input
                    id="llm_temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={formData.llm_temperature ?? 0.7}
                    onChange={(e) => handleChange('llm_temperature', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground/70">Lower values are more deterministic</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="llm_base_url">Base URL (for Ollama)</Label>
                  <Input
                    id="llm_base_url"
                    value={formData.llm_base_url || ''}
                    onChange={(e) => handleChange('llm_base_url', e.target.value)}
                    placeholder="http://localhost:11434"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="llm_api_key">API Key</Label>
                <Input
                  id="llm_api_key"
                  type="password"
                  value={formData.llm_api_key || ''}
                  onChange={(e) => handleChange('llm_api_key', e.target.value)}
                  placeholder="sk-... (for OpenAI, Anthropic, Groq)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6 space-y-5">
              <SectionHeader icon={Mail} title="Email Configuration" subtitle="Configure SMTP settings for sending emails" />
              <div className="space-y-2">
                <Label htmlFor="email_provider">Email Provider</Label>
                <Select
                  value={formData.email_provider || 'smtp'}
                  onValueChange={(v) => handleChange('email_provider', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="resend">Resend API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.email_provider === 'smtp' ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_host">SMTP Host</Label>
                      <Input
                        id="smtp_host"
                        value={formData.smtp_host || ''}
                        onChange={(e) => handleChange('smtp_host', e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Input
                        id="smtp_port"
                        type="number"
                        value={formData.smtp_port || ''}
                        onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="smtp_secure"
                      checked={formData.smtp_secure ?? true}
                      onCheckedChange={(v) => handleChange('smtp_secure', v)}
                    />
                    <Label htmlFor="smtp_secure">Use SSL/TLS</Label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_email">SMTP Email</Label>
                      <Input
                        id="smtp_email"
                        type="email"
                        value={formData.smtp_email || ''}
                        onChange={(e) => handleChange('smtp_email', e.target.value)}
                        placeholder="sender@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_password">SMTP Password</Label>
                      <Input
                        id="smtp_password"
                        type="password"
                        value={formData.smtp_password || ''}
                        onChange={(e) => handleChange('smtp_password', e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_from_name">From Name</Label>
                      <Input
                        id="smtp_from_name"
                        value={formData.smtp_from_name || ''}
                        onChange={(e) => handleChange('smtp_from_name', e.target.value)}
                        placeholder="Sales Team"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp_from_email">From Email</Label>
                      <Input
                        id="smtp_from_email"
                        type="email"
                        value={formData.smtp_from_email || ''}
                        onChange={(e) => handleChange('smtp_from_email', e.target.value)}
                        placeholder="sales@example.com"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="provider_api_key">API Key</Label>
                    <Input
                      id="provider_api_key"
                      type="password"
                      value={formData.provider_api_key || ''}
                      onChange={(e) => handleChange('provider_api_key', e.target.value)}
                      placeholder="re_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sending_domain">Sending Domain</Label>
                    <Input
                      id="sending_domain"
                      value={formData.sending_domain || ''}
                      onChange={(e) => handleChange('sending_domain', e.target.value)}
                      placeholder="emails.example.com"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imap">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6 space-y-5">
              <SectionHeader icon={Server} title="IMAP Configuration" subtitle="Configure IMAP settings for receiving replies" />
              <div className="flex items-center gap-2">
                <Switch
                  id="imap_enabled"
                  checked={formData.imap_enabled ?? false}
                  onCheckedChange={(v) => handleChange('imap_enabled', v)}
                />
                <Label htmlFor="imap_enabled">Enable IMAP Monitoring</Label>
              </div>

              {formData.imap_enabled && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="imap_host">IMAP Host</Label>
                      <Input
                        id="imap_host"
                        value={formData.imap_host || ''}
                        onChange={(e) => handleChange('imap_host', e.target.value)}
                        placeholder="imap.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imap_port">IMAP Port</Label>
                      <Input
                        id="imap_port"
                        type="number"
                        value={formData.imap_port || ''}
                        onChange={(e) => handleChange('imap_port', parseInt(e.target.value))}
                        placeholder="993"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="imap_secure"
                      checked={formData.imap_secure ?? true}
                      onCheckedChange={(v) => handleChange('imap_secure', v)}
                    />
                    <Label htmlFor="imap_secure">Use SSL</Label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="imap_email">IMAP Email</Label>
                      <Input
                        id="imap_email"
                        type="email"
                        value={formData.imap_email || ''}
                        onChange={(e) => handleChange('imap_email', e.target.value)}
                        placeholder="inbox@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imap_password">IMAP Password</Label>
                      <Input
                        id="imap_password"
                        type="password"
                        value={formData.imap_password || ''}
                        onChange={(e) => handleChange('imap_password', e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6 space-y-5">
              <SectionHeader icon={Settings} title="General Settings" subtitle="Webhook configuration and other settings" />
              <div className="space-y-2">
                <Label htmlFor="sending_domain">Default Sending Domain</Label>
                <Input
                  id="sending_domain"
                  value={formData.sending_domain || ''}
                  onChange={(e) => handleChange('sending_domain', e.target.value)}
                  placeholder="emails.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook_secret">Webhook Secret</Label>
                <Input
                  id="webhook_secret"
                  type="password"
                  value={formData.webhook_secret || ''}
                  onChange={(e) => handleChange('webhook_secret', e.target.value)}
                  placeholder="Used for signature verification"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6 space-y-5">
              <SectionHeader icon={Building2} title="Client Profile" subtitle="Manage your organization profile and settings" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Organization Name</Label>
                  <Input
                    id="client_name"
                    value={clientForm.name || ''}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    placeholder="My Company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_slug">Slug</Label>
                  <Input
                    id="client_slug"
                    value={clientForm.slug || ''}
                    onChange={(e) => setClientForm({ ...clientForm, slug: e.target.value })}
                    placeholder="my-company"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client_website">Website</Label>
                  <Input
                    id="client_website"
                    value={clientForm.website || ''}
                    onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_plan">Plan</Label>
                  <Input
                    id="client_plan"
                    value={clientForm.plan || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client_seats">Seats</Label>
                  <Input
                    id="client_seats"
                    type="number"
                    value={clientForm.seats || 1}
                    onChange={(e) => setClientForm({ ...clientForm, seats: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_daily_limit">Daily Send Limit</Label>
                  <Input
                    id="client_daily_limit"
                    type="number"
                    value={clientForm.daily_send_limit || 50}
                    onChange={(e) => setClientForm({ ...clientForm, daily_send_limit: parseInt(e.target.value) || 50 })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Switch
                    id="client_active"
                    checked={clientForm.is_active ?? true}
                    onCheckedChange={(v) => setClientForm({ ...clientForm, is_active: v })}
                  />
                  <Label htmlFor="client_active">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="client_discovery"
                    checked={clientForm.discovery_enabled ?? true}
                    onCheckedChange={(v) => setClientForm({ ...clientForm, discovery_enabled: v })}
                  />
                  <Label htmlFor="client_discovery">Discovery Enabled</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="client_enrichment"
                    checked={clientForm.enrichment_enabled ?? true}
                    onCheckedChange={(v) => setClientForm({ ...clientForm, enrichment_enabled: v })}
                  />
                  <Label htmlFor="client_enrichment">Enrichment Enabled</Label>
                </div>
              </div>
              {clientData?.id && (
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button
                    onClick={async () => {
                      if (!clientData?.id) return
                      try {
                        await clientAPI.update(clientData.id, clientForm)
                        toast.success('Client profile updated')
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to update client')
                      }
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Client Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
