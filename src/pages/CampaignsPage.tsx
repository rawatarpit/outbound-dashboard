import { useState, useEffect } from 'react'
import { type BrandProfile } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Mail, MessageSquare, Send, TrendingUp, AlertTriangle, Reply, Clock, ChevronDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, formatNumber, formatPercentage } from '@/lib/utils'
import { brandsAPI, messagesAPI } from '@/lib/api'
import { Input } from '@/components/ui/Input'

const STATUS_BADGE: Record<string, { dot: string; label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }> = {
  sent: { dot: 'bg-blue-500', label: 'Sent', variant: 'default' },
  delivered: { dot: 'bg-green-500', label: 'Delivered', variant: 'success' },
  opened: { dot: 'bg-indigo-500', label: 'Opened', variant: 'default' },
  replied: { dot: 'bg-emerald-500', label: 'Replied', variant: 'success' },
  bounced: { dot: 'bg-red-500', label: 'Bounced', variant: 'destructive' },
  failed: { dot: 'bg-red-500', label: 'Failed', variant: 'destructive' },
}

const FUNNEL_COLORS = ['#3b82f6', '#22c55e', '#6366f1', '#10b981']

export default function CampaignsPage() {
  const { client } = useAuth()
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [brandFilter, setBrandFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [brandFilter])

  const fetchBrands = async () => {
    try {
      const { data } = await brandsAPI.list(client?.id)
      setBrands(data)
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const { data } = await messagesAPI.list({ brandId: brandFilter || undefined })
      const filtered = Array.isArray(data)
        ? data.filter((m: any) => m.direction === 'outbound' || !m.direction)
        : []
      setMessages(filtered)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch messages')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMessages = messages.filter(msg => {
    if (statusFilter && msg.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const subject = (msg.subject || '').toLowerCase()
      const toEmail = (msg.to_email || '').toLowerCase()
      if (!subject.includes(q) && !toEmail.includes(q)) return false
    }
    return true
  })

  const totalSent = messages.length
  const totalDelivered = messages.filter(m => m.status === 'delivered' || m.delivered_at).length
  const totalOpened = messages.filter(m => m.status === 'opened' || m.opened_at).length
  const totalReplied = messages.filter(m => m.status === 'replied' || m.replied_at).length
  const totalBounced = messages.filter(m => m.status === 'bounced' || m.bounced_at).length

  const deliveryRate = totalSent ? totalDelivered / totalSent : 0
  const bounceRate = totalSent ? totalBounced / totalSent : 0
  const replyRate = totalSent ? totalReplied / totalSent : 0

  const todaySent = messages.filter(m => {
    const date = new Date(m.sent_at || m.created_at)
    const now = new Date()
    return date.toDateString() === now.toDateString()
  }).length

  const funnelMax = Math.max(totalSent, 1)
  const funnelSteps = [
    { label: 'Sent', value: totalSent, pct: 100 },
    { label: 'Delivered', value: totalDelivered, pct: (totalDelivered / funnelMax) * 100 },
    { label: 'Opened', value: totalOpened, pct: (totalOpened / funnelMax) * 100 },
    { label: 'Replied', value: totalReplied, pct: (totalReplied / funnelMax) * 100 },
  ]

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
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Campaigns</span>
          </h1>
          <p className="text-muted-foreground">Track all sent emails and their delivery status</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Send className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatNumber(totalSent)}</p>
              <p className="text-sm text-muted-foreground">Total Sent</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 bg-green-500/10 rounded-xl">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatPercentage(deliveryRate)}</p>
              <p className="text-sm text-muted-foreground">Delivery Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${bounceRate > 0.05 ? 'bg-red-500/10' : 'bg-muted'}`}>
              <AlertTriangle className={`h-5 w-5 ${bounceRate > 0.05 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${bounceRate > 0.05 ? 'text-red-500' : 'text-foreground'}`}>
                {formatPercentage(bounceRate)}
              </p>
              <p className="text-sm text-muted-foreground">Bounce Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${replyRate > 0.03 ? 'bg-emerald-500/10' : 'bg-muted'}`}>
              <Reply className={`h-5 w-5 ${replyRate > 0.03 ? 'text-emerald-500' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${replyRate > 0.03 ? 'text-emerald-500' : 'text-foreground'}`}>
                {formatPercentage(replyRate)}
              </p>
              <p className="text-sm text-muted-foreground">Reply Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl">
              <Clock className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatNumber(todaySent)}</p>
              <p className="text-sm text-muted-foreground">Sent Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle>Delivery Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-4">
                <div className="w-24 text-right shrink-0">
                  <span className="text-sm font-medium text-muted-foreground">{step.label}</span>
                </div>
                <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center px-3"
                    style={{
                      width: `${step.pct}%`,
                      backgroundColor: FUNNEL_COLORS[i],
                      minWidth: step.value > 0 ? 'fit-content' : undefined,
                    }}
                  >
                    <span className="text-xs font-bold text-white drop-shadow-sm whitespace-nowrap">
                      {formatNumber(step.value)}
                    </span>
                  </div>
                </div>
                <div className="w-16 text-left shrink-0">
                  <span className="text-sm text-muted-foreground">{step.pct.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                placeholder="Search by subject or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                {brands.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>{brand.brand_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-16 px-6">
              <MessageSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No emails sent yet</h3>
              <p className="text-muted-foreground">Campaigns will appear here after sending begins</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Subject</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((msg) => {
                  const badge = STATUS_BADGE[msg.status] || STATUS_BADGE.sent
                  const isExpanded = expandedRow === msg.id
                  return (
                    <>
                      <TableRow
                        key={msg.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedRow(isExpanded ? null : msg.id)}
                      >
                        <TableCell>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[250px] truncate">
                          {msg.subject || <span className="italic text-muted-foreground">No subject</span>}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{msg.to_email || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${badge.dot}`} />
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {msg.sent_at ? formatRelativeTime(msg.sent_at) : formatRelativeTime(msg.created_at)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {msg.delivered_at ? formatRelativeTime(msg.delivered_at) : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {msg.opened_at ? formatRelativeTime(msg.opened_at) : '-'}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${msg.id}-detail`} className="bg-muted/20">
                          <TableCell colSpan={7} className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-3 border border-border rounded-xl">
                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-block w-2 h-2 rounded-full ${badge.dot}`} />
                                  <span className="text-sm font-medium capitalize">{msg.status || 'pending'}</span>
                                </div>
                              </div>
                              <div className="p-3 border border-border rounded-xl">
                                <p className="text-xs text-muted-foreground mb-1">Created</p>
                                <p className="text-sm font-medium">{formatRelativeTime(msg.created_at)}</p>
                              </div>
                              {msg.delivered_at && (
                                <div className="p-3 border border-border rounded-xl">
                                  <p className="text-xs text-muted-foreground mb-1">Delivered</p>
                                  <p className="text-sm font-medium">{formatRelativeTime(msg.delivered_at)}</p>
                                </div>
                              )}
                              {msg.opened_at && (
                                <div className="p-3 border border-border rounded-xl">
                                  <p className="text-xs text-muted-foreground mb-1">Opened</p>
                                  <p className="text-sm font-medium">{formatRelativeTime(msg.opened_at)}</p>
                                </div>
                              )}
                              {msg.replied_at && (
                                <div className="p-3 border border-border rounded-xl">
                                  <p className="text-xs text-muted-foreground mb-1">Replied</p>
                                  <p className="text-sm font-medium">{formatRelativeTime(msg.replied_at)}</p>
                                </div>
                              )}
                              {msg.bounced_at && (
                                <div className="p-3 border border-border rounded-xl">
                                  <p className="text-xs text-muted-foreground mb-1">Bounced</p>
                                  <p className="text-sm font-medium text-red-500">{formatRelativeTime(msg.bounced_at)}</p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
