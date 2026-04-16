import { useState, useEffect } from 'react'
import { type ClientSettings, LLM_PROVIDERS } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
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
import { Settings, Mail, Bot, Server, Save } from 'lucide-react'
import { settingsAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { client, refreshClient } = useAuth()
  const [settings, setSettings] = useState<ClientSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<ClientSettings>>({})

  useEffect(() => {
    fetchSettings()
  }, [client])

  const fetchSettings = async () => {
    if (!client?.id) return

    try {
      const { data, error } = await settingsAPI.get(client.id)

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
    if (!client?.id) return
    setIsSaving(true)

    try {
      const payload = {
        ...formData,
        llm_temperature: formData.llm_temperature ?? 0.7
      }

      await settingsAPI.upsert(client.id, payload)

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Configure your outbound engine</p>
      </div>

      <Tabs defaultValue="llm" className="w-full">
        <TabsList>
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
        </TabsList>

        <TabsContent value="llm">
          <Card>
            <CardHeader>
              <CardTitle>LLM Configuration</CardTitle>
              <CardDescription>
                Configure the AI model used for outreach and analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  <p className="text-xs text-gray-500">Lower values are more deterministic</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure SMTP settings for sending emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
          <Card>
            <CardHeader>
              <CardTitle>IMAP Configuration</CardTitle>
              <CardDescription>
                Configure IMAP settings for receiving replies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Webhook configuration and other settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
