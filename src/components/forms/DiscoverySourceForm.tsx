import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { DISCOVERY_SOURCE_TYPES } from '@/lib/supabase'
import { discoverySourcesAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface DiscoverySourceFormProps {
  brandId: string
  source?: any
  onSuccess: () => void
  onCancel: () => void
}

export default function DiscoverySourceForm({ brandId, source, onSuccess, onCancel }: DiscoverySourceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: source?.name || '',
    type: source?.type || 'apollo',
    config: source?.config || {},
    is_active: source?.is_active ?? true,
    rate_limit_per_min: source?.rate_limit_per_min || 10,
    schedule_cron: source?.schedule_cron || '',
    execution_mode: source?.execution_mode || 'pull'
  })
  const [configText, setConfigText] = useState(JSON.stringify(formData.config, null, 2))

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleConfigChange = (text: string) => {
    setConfigText(text)
    try {
      const parsed = JSON.parse(text)
      setFormData(prev => ({ ...prev, config: parsed }))
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        brand_id: brandId,
        name: formData.name,
        type: formData.type,
        config: formData.config,
        is_active: formData.is_active,
        rate_limit_per_min: formData.rate_limit_per_min,
        schedule_cron: formData.schedule_cron || null,
        execution_mode: formData.execution_mode
      }

      if (source?.id) {
        const { error } = await discoverySourcesAPI.update(source.id, payload)
        if (error) throw error
        toast.success('Source updated successfully')
      } else {
        const { error } = await discoverySourcesAPI.create(payload)
        if (error) throw error
        toast.success('Source created successfully')
      }

      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save source')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" required>Source Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Apollo Tech Companies"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type" required>Source Type</Label>
          <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISCOVERY_SOURCE_TYPES.map(opt => (
                <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rate_limit_per_min">Rate Limit (per minute)</Label>
            <Input
              id="rate_limit_per_min"
              type="number"
              value={formData.rate_limit_per_min}
              onChange={(e) => handleChange('rate_limit_per_min', parseInt(e.target.value))}
              min={1}
              max={60}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule_cron">Schedule (Cron)</Label>
            <Input
              id="schedule_cron"
              value={formData.schedule_cron}
              onChange={(e) => handleChange('schedule_cron', e.target.value)}
              placeholder="0 */6 * * *"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="config">Configuration (JSON)</Label>
          <Textarea
            id="config"
            value={configText}
            onChange={(e) => handleConfigChange(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500">
            Configure API keys, search filters, and other source-specific settings
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Active</Label>
            <p className="text-sm text-gray-500">Enable this source for discovery</p>
          </div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(v) => handleChange('is_active', v)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {source ? 'Update Source' : 'Create Source'}
        </Button>
      </div>
    </form>
  )
}
