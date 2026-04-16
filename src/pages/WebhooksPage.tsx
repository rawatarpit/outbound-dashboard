import { useState, useEffect } from 'react'
import { supabase, type ClientWebhook, WEBHOOK_EVENTS } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import Modal from '@/components/Modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Plus,
  Webhook,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  RefreshCw,
  Send
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

export default function WebhooksPage() {
  const { client } = useAuth()
  const [webhooks, setWebhooks] = useState<ClientWebhook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<ClientWebhook | null>(null)

  useEffect(() => {
    fetchWebhooks()
  }, [client])

  const fetchWebhooks = async () => {
    if (!client?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('client_webhooks')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setWebhooks(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch webhooks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (webhook: ClientWebhook) => {
    try {
      const { error } = await supabase
        .from('client_webhooks')
        .update({ is_active: !webhook.is_active })
        .eq('id', webhook.id)

      if (error) throw error
      toast.success(`Webhook ${webhook.is_active ? 'disabled' : 'enabled'}`)
      fetchWebhooks()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update webhook')
    }
  }

  const handleDeleteWebhook = async (webhook: ClientWebhook) => {
    if (!confirm(`Delete webhook ${webhook.name}?`)) return

    try {
      const { error } = await supabase
        .from('client_webhooks')
        .delete()
        .eq('id', webhook.id)

      if (error) throw error
      toast.success('Webhook deleted')
      fetchWebhooks()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete webhook')
    }
  }

  const handleTestWebhook = async (webhook: ClientWebhook) => {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString(),
          data: { message: 'This is a test webhook payload' }
        })
      })

      await supabase
        .from('client_webhooks')
        .update({
          last_triggered_at: new Date().toISOString(),
          last_status_code: response.status
        })
        .eq('id', webhook.id)

      toast.success(`Test request sent (Status: ${response.status})`)
      fetchWebhooks()
    } catch (error: any) {
      toast.error('Failed to send test request')
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
          <p className="text-gray-500">Configure outbound webhooks for system events</p>
        </div>
        <Button onClick={() => { setEditingWebhook(null); setIsModalOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Webhook className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No webhooks configured</h3>
            <p className="text-gray-500 mb-4">Add a webhook to receive notifications about system events</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-50 p-2">
                      <Webhook className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{webhook.name}</CardTitle>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">{webhook.url}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal className="h-5 w-5 text-gray-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTestWebhook(webhook)}>
                        <Send className="h-4 w-4 mr-2" />
                        Send Test
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(webhook)}>
                        {webhook.is_active ? 'Disable' : 'Enable'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteWebhook(webhook)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={webhook.is_active ? 'success' : 'secondary'}>
                    {webhook.is_active ? 'Active' : 'Disabled'}
                  </Badge>
                  {webhook.last_status_code && (
                    <Badge variant={webhook.last_status_code < 400 ? 'success' : 'destructive'}>
                      Last: {webhook.last_status_code}
                    </Badge>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Events</p>
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                {webhook.last_triggered_at && (
                  <p className="text-xs text-gray-500">
                    Last triggered: {formatRelativeTime(webhook.last_triggered_at)}
                  </p>
                )}

                {webhook.last_error && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {webhook.last_error}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WebhookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        webhook={editingWebhook}
        onSuccess={() => {
          setIsModalOpen(false)
          fetchWebhooks()
        }}
      />
    </div>
  )
}

interface WebhookModalProps {
  isOpen: boolean
  onClose: () => void
  webhook: ClientWebhook | null
  onSuccess: () => void
}

function WebhookModal({ isOpen, onClose, webhook, onSuccess }: WebhookModalProps) {
  const { client } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: webhook?.name || '',
    url: webhook?.url || '',
    secret: webhook?.secret || '',
    events: webhook?.events || ['lead.created'],
    retry_count: webhook?.retry_count || 3,
    retry_delay_seconds: webhook?.retry_delay_seconds || 60
  })

  useEffect(() => {
    if (webhook) {
      setFormData({
        name: webhook.name,
        url: webhook.url,
        secret: webhook.secret || '',
        events: webhook.events,
        retry_count: webhook.retry_count,
        retry_delay_seconds: webhook.retry_delay_seconds
      })
    } else {
      setFormData({
        name: '',
        url: '',
        secret: '',
        events: ['lead.created'],
        retry_count: 3,
        retry_delay_seconds: 60
      })
    }
  }, [webhook])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client?.id) return

    setIsLoading(true)
    try {
      const payload = {
        client_id: client.id,
        name: formData.name,
        url: formData.url,
        secret: formData.secret || null,
        events: formData.events,
        retry_count: formData.retry_count,
        retry_delay_seconds: formData.retry_delay_seconds
      }

      if (webhook?.id) {
        const { error } = await supabase
          .from('client_webhooks')
          .update(payload)
          .eq('id', webhook.id)

        if (error) throw error
        toast.success('Webhook updated')
      } else {
        const { error } = await supabase
          .from('client_webhooks')
          .insert([payload])

        if (error) throw error
        toast.success('Webhook created')
      }

      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save webhook')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleEvent = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={webhook ? 'Edit Webhook' : 'Add Webhook'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook_name" required>Name</Label>
            <Input
              id="webhook_name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Lead Notifications"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url" required>URL</Label>
            <Input
              id="webhook_url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://api.example.com/webhook"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_secret">Secret (optional)</Label>
            <Input
              id="webhook_secret"
              type="password"
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              placeholder="Used for signature verification"
            />
          </div>

          <div className="space-y-2">
            <Label>Events</Label>
            <div className="grid grid-cols-2 gap-2">
              {WEBHOOK_EVENTS.map((event) => (
                <label
                  key={event.id}
                  className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event.id)}
                    onChange={() => toggleEvent(event.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{event.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="retry_count">Retry Count</Label>
              <Input
                id="retry_count"
                type="number"
                value={formData.retry_count}
                onChange={(e) => setFormData({ ...formData, retry_count: parseInt(e.target.value) })}
                min={0}
                max={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retry_delay">Retry Delay (seconds)</Label>
              <Input
                id="retry_delay"
                type="number"
                value={formData.retry_delay_seconds}
                onChange={(e) => setFormData({ ...formData, retry_delay_seconds: parseInt(e.target.value) })}
                min={10}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {webhook ? 'Update' : 'Create'} Webhook
          </Button>
        </div>
      </form>
    </Modal>
  )
}
