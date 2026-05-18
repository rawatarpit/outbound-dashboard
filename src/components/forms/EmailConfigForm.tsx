import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Switch } from '@/components/ui/Switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { settingsAPI } from '@/lib/api'
import type { ClientSettings } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface EmailConfigFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function EmailConfigForm({ onSuccess, onCancel }: EmailConfigFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [provider, setProvider] = useState('smtp')
  const [formData, setFormData] = useState({
    smtp_host: '',
    smtp_port: '587',
    smtp_secure: false,
    smtp_email: '',
    smtp_password: '',
    smtp_from_name: '',
    smtp_from_email: '',
    imap_host: '',
    imap_port: '993',
    imap_secure: true,
    imap_email: '',
    imap_password: '',
    imap_enabled: false,
    provider_api_key: '',
    sending_domain: '',
  })

  useEffect(() => {
    fetchEmailConfig()
  }, [])

  const fetchEmailConfig = async () => {
    setIsFetching(true)
    try {
      const { data, error } = await settingsAPI.getEmail()
      if (error) throw error
      if (data) {
        setProvider(data.email_provider || 'smtp')
        setFormData({
          smtp_host: data.smtp_host || '',
          smtp_port: data.smtp_port?.toString() || '587',
          smtp_secure: data.smtp_secure ?? false,
          smtp_email: data.smtp_email || '',
          smtp_password: data.smtp_password || '',
          smtp_from_name: data.smtp_from_name || '',
          smtp_from_email: data.smtp_from_email || '',
          imap_host: data.imap_host || '',
          imap_port: data.imap_port?.toString() || '993',
          imap_secure: data.imap_secure ?? true,
          imap_email: data.imap_email || '',
          imap_password: data.imap_password || '',
          imap_enabled: data.imap_enabled ?? false,
          provider_api_key: data.provider_api_key || '',
          sending_domain: data.sending_domain || '',
        })
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch email config')
    } finally {
      setIsFetching(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload: Partial<ClientSettings> = {
        email_provider: provider,
        smtp_host: formData.smtp_host || null,
        smtp_port: formData.smtp_port ? parseInt(formData.smtp_port) : null,
        smtp_secure: formData.smtp_secure,
        smtp_email: formData.smtp_email || null,
        smtp_password: formData.smtp_password || null,
        smtp_from_name: formData.smtp_from_name || null,
        smtp_from_email: formData.smtp_from_email || null,
        imap_host: formData.imap_host || null,
        imap_port: formData.imap_port ? parseInt(formData.imap_port) : null,
        imap_secure: formData.imap_secure,
        imap_email: formData.imap_email || null,
        imap_password: formData.imap_password || null,
        imap_enabled: formData.imap_enabled,
        provider_api_key: formData.provider_api_key || null,
        sending_domain: formData.sending_domain || null,
      }

      const { error } = await settingsAPI.upsert('', payload)
      if (error) throw error

      toast.success('Email configuration saved')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save email configuration')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Email Provider</Label>
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="smtp">SMTP</SelectItem>
            <SelectItem value="resend">Resend</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {provider === 'smtp' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">SMTP Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SMTP Host</Label>
                <Input
                  value={formData.smtp_host}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label>SMTP Port</Label>
                <Input
                  value={formData.smtp_port}
                  onChange={(e) => handleChange('smtp_port', e.target.value)}
                  placeholder="587"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Secure Connection (TLS/SSL)</Label>
              <Switch
                checked={formData.smtp_secure}
                onCheckedChange={(checked) => handleChange('smtp_secure', checked)}
              />
            </div>

            <div>
              <Label>SMTP Email</Label>
              <Input
                type="email"
                value={formData.smtp_email}
                onChange={(e) => handleChange('smtp_email', e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label>SMTP Password</Label>
              <Input
                type="password"
                value={formData.smtp_password}
                onChange={(e) => handleChange('smtp_password', e.target.value)}
                placeholder="App password or API key"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">IMAP Settings (Reply Tracking)</h3>
              <Switch
                checked={formData.imap_enabled}
                onCheckedChange={(checked) => handleChange('imap_enabled', checked)}
              />
            </div>

            {formData.imap_enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>IMAP Host</Label>
                    <Input
                      value={formData.imap_host}
                      onChange={(e) => handleChange('imap_host', e.target.value)}
                      placeholder="imap.gmail.com"
                    />
                  </div>
                  <div>
                    <Label>IMAP Port</Label>
                    <Input
                      value={formData.imap_port}
                      onChange={(e) => handleChange('imap_port', e.target.value)}
                      placeholder="993"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Secure Connection</Label>
                  <Switch
                    checked={formData.imap_secure}
                    onCheckedChange={(checked) => handleChange('imap_secure', checked)}
                  />
                </div>

                <div>
                  <Label>IMAP Email</Label>
                  <Input
                    type="email"
                    value={formData.imap_email}
                    onChange={(e) => handleChange('imap_email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <Label>IMAP Password</Label>
                  <Input
                    type="password"
                    value={formData.imap_password}
                    onChange={(e) => handleChange('imap_password', e.target.value)}
                    placeholder="App password"
                  />
                </div>
              </>
            )}
          </div>

          <div className="rounded-lg border border-border p-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">From Settings</h3>
            
            <div>
              <Label>From Name</Label>
              <Input
                value={formData.smtp_from_name}
                onChange={(e) => handleChange('smtp_from_name', e.target.value)}
                placeholder="Your Name"
              />
            </div>

            <div>
              <Label>From Email</Label>
              <Input
                type="email"
                value={formData.smtp_from_email}
                onChange={(e) => handleChange('smtp_from_email', e.target.value)}
                placeholder="noreply@yourdomain.com"
              />
            </div>
          </div>
        </div>
      )}

      {provider === 'resend' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Resend Settings</h3>
            
            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={formData.provider_api_key}
                onChange={(e) => handleChange('provider_api_key', e.target.value)}
                placeholder="re_xxxxxxxxxxxxxxxxxxxxx"
              />
            </div>

            <div>
              <Label>Sending Domain</Label>
              <Input
                value={formData.sending_domain}
                onChange={(e) => handleChange('sending_domain', e.target.value)}
                placeholder="yourdomain.com"
              />
            </div>

            <div>
              <Label>From Name</Label>
              <Input
                value={formData.smtp_from_name}
                onChange={(e) => handleChange('smtp_from_name', e.target.value)}
                placeholder="Your Name"
              />
            </div>

            <div>
              <Label>From Email</Label>
              <Input
                type="email"
                value={formData.smtp_from_email}
                onChange={(e) => handleChange('smtp_from_email', e.target.value)}
                placeholder="noreply@yourdomain.com"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Save Configuration
        </Button>
      </div>
    </form>
  )
}
