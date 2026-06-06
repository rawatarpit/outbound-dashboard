import { useState, useEffect } from 'react'
import { type ClientWebhook, WEBHOOK_EVENTS } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import Drawer from '@/components/Drawer'
import {
  Plus,
  Webhook,
  Trash2,
  MoreHorizontal,
  Send,
  Loader2,
  Activity,
  CheckCircle,
  XCircle,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime } from '@/lib/utils'
import { webhooksAPI } from '@/lib/api'
import { AnimatedCounter, SectionHeader, StatCard } from '@/components/DashboardComponents'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

export default function WebhooksPage() {
  const { user, client } = useAuth()
  const clientId = user?.clientId || client?.id
  const [webhooks, setWebhooks] = useState<ClientWebhook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<ClientWebhook | null>(null)

  useEffect(() => {
    if (clientId) {
      fetchWebhooks()
    } else {
      setIsLoading(false)
    }
  }, [clientId])

  const fetchWebhooks = async () => {
    if (!clientId) return

    setIsLoading(true)
    try {
      const { data, error } = await webhooksAPI.list(clientId)
      if (error) throw error
      setWebhooks(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch webhooks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (webhook: ClientWebhook) => {
    try {
      const { error } = await webhooksAPI.update(webhook.id, { is_active: !webhook.is_active })
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
      const { error } = await webhooksAPI.delete(webhook.id)
      if (error) throw error
      toast.success('Webhook deleted')
      fetchWebhooks()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete webhook')
    }
  }

  const handleTestWebhook = async (webhook: ClientWebhook) => {
    try {
      const { data, error } = await webhooksAPI.test(webhook.id)
      if (error) throw error
      toast.success(data.message || 'Test request sent')
      fetchWebhooks()
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test request')
    }
  }

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

  const activeCount = webhooks.filter(w => w.is_active).length
  const disabledCount = webhooks.filter(w => !w.is_active).length
  const recentTriggers = webhooks.filter(w => w.last_triggered_at).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Webhooks</span>
          </h1>
          <p className="text-muted-foreground mt-1">Configure outbound webhooks for system events</p>
        </div>
        <Button onClick={() => { setEditingWebhook(null); setIsModalOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard icon={Webhook} label="Total Webhooks" value={<AnimatedCounter value={webhooks.length} />}
          subvalue="Configured endpoints" color="#6366f1" />
        <StatCard icon={CheckCircle} label="Active" value={<AnimatedCounter value={activeCount} />}
          subvalue={`${webhooks.length > 0 ? Math.round((activeCount / webhooks.length) * 100) : 0}% of total`} color="#22c55e" />
        <StatCard icon={XCircle} label="Disabled" value={<AnimatedCounter value={disabledCount} />}
          subvalue={disabledCount === 0 ? 'All active' : `${disabledCount} inactive`} color="#a3a3a3" />
        <StatCard icon={Zap} label="Recent Triggers" value={<AnimatedCounter value={recentTriggers} />}
          subvalue="Have been triggered" color="#f59e0b" />
      </div>

      {webhooks.length === 0 ? (
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#6366f112' }}>
              <Webhook className="h-7 w-7" style={{ color: '#6366f1' }} />
            </div>
            <h3 className="text-lg font-medium text-foreground">No webhooks configured</h3>
            <p className="text-muted-foreground mb-4">Add a webhook to receive notifications about system events</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <SectionHeader icon={Webhook} title="Webhook Endpoints" subtitle={`${webhooks.length} webhook(s) configured`} />
          <div className="grid gap-4 md:grid-cols-2">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: '#6366f112' }}>
                      <Webhook className="h-5 w-5" style={{ color: '#6366f1' }} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{webhook.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">{webhook.url}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 rounded hover:bg-accent">
                      <MoreHorizontal className="h-5 w-5 text-muted-foreground/50" />
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
                  <p className="text-sm font-medium text-muted-foreground mb-2">Events</p>
                  <div className="flex flex-wrap gap-1">
                    {(webhook.events as string[])?.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                {webhook.last_triggered_at && (
                  <p className="text-xs text-muted-foreground">
                    Last triggered: {formatRelativeTime(webhook.last_triggered_at)}
                  </p>
                )}

                {webhook.last_error && (
                  <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl">
                    {webhook.last_error}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          </div>
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
  const { user, client } = useAuth()
  const clientId = user?.clientId || client?.id
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<{
    name: string; url: string; secret: string; events: string[];
    retry_count: number; retry_delay_seconds: number
  }>({
    name: webhook?.name || '',
    url: webhook?.url || '',
    secret: webhook?.secret || '',
    events: (webhook?.events as string[]) || ['lead.created'],
    retry_count: webhook?.retry_count ?? 3,
    retry_delay_seconds: webhook?.retry_delay_seconds ?? 60
  })

  useEffect(() => {
    if (webhook) {
      setFormData({
        name: webhook.name,
        url: webhook.url,
        secret: webhook.secret || '',
        events: webhook.events as string[],
        retry_count: webhook.retry_count ?? 3,
        retry_delay_seconds: webhook.retry_delay_seconds ?? 60
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
    if (!clientId) return

    setIsLoading(true)
    try {
      const payload = {
        client_id: clientId,
        name: formData.name,
        url: formData.url,
        secret: formData.secret || null,
        events: formData.events,
        retry_count: formData.retry_count,
        retry_delay_seconds: formData.retry_delay_seconds
      }

      if (webhook?.id) {
        const { error } = await webhooksAPI.update(webhook.id, payload)
        if (error) throw error
        toast.success('Webhook updated')
      } else {
        const { error } = await webhooksAPI.create(payload)
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
    <Drawer
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
                  className="flex items-center gap-2 p-2 border border-border rounded-xl cursor-pointer hover:bg-muted"
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

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {webhook ? 'Update' : 'Create'} Webhook
          </Button>
        </div>
      </form>
    </Drawer>
  )
}
