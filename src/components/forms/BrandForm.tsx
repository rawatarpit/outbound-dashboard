import { useState } from 'react'
import { type BrandProfile } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { brandsAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface BrandFormProps {
  brand?: BrandProfile | null
  onSuccess: () => void
  onCancel: () => void
}

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' }
]

const PROVIDER_OPTIONS = [
  { value: 'smtp', label: 'SMTP' },
  { value: 'resend', label: 'Resend API' }
]

const TRANSPORT_OPTIONS = [
  { value: 'mailbox', label: 'Mailbox' },
  { value: 'api', label: 'API' }
]

export default function BrandForm({ brand, onSuccess, onCancel }: BrandFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    product: brand?.product || '',
    brand_name: brand?.brand_name || '',
    positioning: brand?.positioning || '',
    core_offer: brand?.core_offer || '',
    tone: brand?.tone || 'professional',
    audience: brand?.audience || '',
    objection_guidelines: brand?.objection_guidelines || '',
    negotiation_style: brand?.negotiation_style || '',
    provider: brand?.provider || 'smtp',
    transport_mode: brand?.transport_mode || 'mailbox',
    smtp_host: brand?.smtp_host || '',
    smtp_port: brand?.smtp_port?.toString() || '587',
    smtp_secure: brand?.smtp_secure || false,
    smtp_email: brand?.smtp_email || '',
    smtp_password: brand?.smtp_password || '',
    imap_host: brand?.imap_host || '',
    imap_port: brand?.imap_port?.toString() || '993',
    imap_secure: brand?.imap_secure || true,
    imap_email: brand?.imap_email || '',
    imap_password: brand?.imap_password || '',
    sending_domain: brand?.sending_domain || '',
    reply_to_email: brand?.reply_to_email || '',
    daily_send_limit: brand?.daily_send_limit?.toString() || '',
    hourly_send_limit: brand?.hourly_send_limit?.toString() || '',
    llm_model_override: brand?.llm_model_override || '',
    llm_temperature: brand?.llm_temperature?.toString() || '0.7',
    discovery_enabled: brand?.discovery_enabled || false,
    outbound_enabled: brand?.outbound_enabled || false,
    is_paused: brand?.is_paused || false,
    qualification_threshold: brand?.qualification_threshold?.toString() || '60'
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        product: formData.product,
        brand_name: formData.brand_name,
        positioning: formData.positioning || null,
        core_offer: formData.core_offer || null,
        tone: formData.tone,
        audience: formData.audience || null,
        objection_guidelines: formData.objection_guidelines || null,
        negotiation_style: formData.negotiation_style || null,
        provider: formData.provider,
        transport_mode: formData.transport_mode,
        smtp_host: formData.smtp_host || null,
        smtp_port: formData.smtp_port ? parseInt(formData.smtp_port) : null,
        smtp_secure: formData.smtp_secure,
        smtp_email: formData.smtp_email || null,
        smtp_password: formData.smtp_password || null,
        imap_host: formData.imap_host || null,
        imap_port: formData.imap_port ? parseInt(formData.imap_port) : null,
        imap_secure: formData.imap_secure,
        imap_email: formData.imap_email || null,
        imap_password: formData.imap_password || null,
        sending_domain: formData.sending_domain || null,
        reply_to_email: formData.reply_to_email || null,
        daily_send_limit: formData.daily_send_limit ? parseInt(formData.daily_send_limit) : null,
        hourly_send_limit: formData.hourly_send_limit ? parseInt(formData.hourly_send_limit) : null,
        llm_model_override: formData.llm_model_override || null,
        llm_temperature: formData.llm_temperature ? parseFloat(formData.llm_temperature) : null,
        discovery_enabled: formData.discovery_enabled,
        outbound_enabled: formData.outbound_enabled,
        is_paused: formData.is_paused,
        qualification_threshold: parseInt(formData.qualification_threshold) || 60
      }

      if (brand?.id) {
        const { error } = await brandsAPI.update(brand.id, payload)
        if (error) throw error
        toast.success('Brand updated successfully')
      } else {
        const { error } = await brandsAPI.create(payload)
        if (error) throw error
        toast.success('Brand created successfully')
      }

      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save brand')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Basic Information
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product" required>Product Name</Label>
            <Input
              id="product"
              value={formData.product}
              onChange={(e) => handleChange('product', e.target.value)}
              placeholder="Email Marketing Tool"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand_name" required>Brand Name</Label>
            <Input
              id="brand_name"
              value={formData.brand_name}
              onChange={(e) => handleChange('brand_name', e.target.value)}
              placeholder="Acme Email"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="positioning">Positioning Statement</Label>
          <Textarea
            id="positioning"
            value={formData.positioning}
            onChange={(e) => handleChange('positioning', e.target.value)}
            placeholder="Best-in-class email platform for..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="core_offer">Core Offer</Label>
          <Textarea
            id="core_offer"
            value={formData.core_offer}
            onChange={(e) => handleChange('core_offer', e.target.value)}
            placeholder="What makes your offering unique..."
            rows={2}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tone">Communication Tone</Label>
            <Select value={formData.tone} onValueChange={(v) => handleChange('tone', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualification_threshold">Qualification Threshold</Label>
            <Input
              id="qualification_threshold"
              type="number"
              min="0"
              max="100"
              value={formData.qualification_threshold}
              onChange={(e) => handleChange('qualification_threshold', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience">Target Audience</Label>
          <Textarea
            id="audience"
            value={formData.audience}
            onChange={(e) => handleChange('audience', e.target.value)}
            placeholder="B2B SaaS companies with 50-500 employees..."
            rows={2}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Email Configuration
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select value={formData.provider} onValueChange={(v) => handleChange('provider', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transport_mode">Transport Mode</Label>
            <Select value={formData.transport_mode} onValueChange={(v) => handleChange('transport_mode', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSPORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smtp_host">SMTP Host</Label>
            <Input
              id="smtp_host"
              value={formData.smtp_host}
              onChange={(e) => handleChange('smtp_host', e.target.value)}
              placeholder="smtp.gmail.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_port">SMTP Port</Label>
            <Input
              id="smtp_port"
              type="number"
              value={formData.smtp_port}
              onChange={(e) => handleChange('smtp_port', e.target.value)}
              placeholder="587"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smtp_email">SMTP Email</Label>
            <Input
              id="smtp_email"
              type="email"
              value={formData.smtp_email}
              onChange={(e) => handleChange('smtp_email', e.target.value)}
              placeholder="sender@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_password">SMTP Password</Label>
            <Input
              id="smtp_password"
              type="password"
              value={formData.smtp_password}
              onChange={(e) => handleChange('smtp_password', e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sending_domain">Sending Domain</Label>
            <Input
              id="sending_domain"
              value={formData.sending_domain}
              onChange={(e) => handleChange('sending_domain', e.target.value)}
              placeholder="emails.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reply_to_email">Reply-To Email</Label>
            <Input
              id="reply_to_email"
              type="email"
              value={formData.reply_to_email}
              onChange={(e) => handleChange('reply_to_email', e.target.value)}
              placeholder="replies@example.com"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="daily_send_limit">Daily Send Limit</Label>
            <Input
              id="daily_send_limit"
              type="number"
              value={formData.daily_send_limit}
              onChange={(e) => handleChange('daily_send_limit', e.target.value)}
              placeholder="100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourly_send_limit">Hourly Send Limit</Label>
            <Input
              id="hourly_send_limit"
              type="number"
              value={formData.hourly_send_limit}
              onChange={(e) => handleChange('hourly_send_limit', e.target.value)}
              placeholder="20"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Controls
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <Label>Discovery Enabled</Label>
            <p className="text-sm text-gray-500">Enable automated company discovery</p>
          </div>
          <Switch
            checked={formData.discovery_enabled}
            onCheckedChange={(v) => handleChange('discovery_enabled', v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Outbound Enabled</Label>
            <p className="text-sm text-gray-500">Enable automated email outreach</p>
          </div>
          <Switch
            checked={formData.outbound_enabled}
            onCheckedChange={(v) => handleChange('outbound_enabled', v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Paused</Label>
            <p className="text-sm text-gray-500">Temporarily pause all activity</p>
          </div>
          <Switch
            checked={formData.is_paused}
            onCheckedChange={(v) => handleChange('is_paused', v)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {brand ? 'Update Brand' : 'Create Brand'}
        </Button>
      </div>
    </form>
  )
}
