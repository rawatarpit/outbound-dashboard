import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { type Lead, type BrandProfile, type Company, type SentMessage, LEAD_STATUSES } from '@/lib/supabase'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { ArrowLeft, Mail, Building2, Calendar, Linkedin, MessageSquare, Edit2, Save, X, Activity, BarChart3, Target, Clock, Send, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import { leadsAPI, brandsAPI, companiesAPI, messagesAPI } from '@/lib/api'
import { AnimatedCounter, SectionHeader, StatCard } from '@/components/DashboardComponents'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'destructive' | 'warning' | 'outline'> = {
  new: 'default',
  researching: 'secondary',
  qualified: 'default',
  icp_passed: 'success',
  contacted: 'default',
  replied: 'success',
  negotiating: 'warning',
  closed_won: 'success',
  closed_lost: 'destructive',
}

function ScoreRing({ score }: { score: number | null }) {
  const value = Math.min(Math.max(score ?? 0, 0), 100)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const strokeColor = value > 70 ? '#22c55e' : value > 40 ? '#f59e0b' : '#ef4444'
  const textColor = value > 70 ? 'text-green-500' : value > 40 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted-foreground/20" />
          <circle
            cx="50" cy="50" r={radius} fill="none" stroke={strokeColor} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${textColor}`}>{value}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">Lead Score</p>
    </div>
  )
}

interface TimelineEvent {
  id: string
  title: string
  description: string
  date: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<Lead | null>(null)
  const [brand, setBrand] = useState<BrandProfile | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [messages, setMessages] = useState<SentMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({})

  useEffect(() => {
    if (id) fetchLeadData()
  }, [id])

  const fetchLeadData = async () => {
    try {
      const { data: leadData, error: leadError } = await leadsAPI.get(id!)
      if (leadError || !leadData) throw leadError || new Error('Lead not found')
      setLead(leadData)
      setEditedLead(leadData)

      if (leadData.brand_id) {
        const { data: brandData } = await brandsAPI.get(leadData.brand_id)
        setBrand(brandData)
      }

      if (leadData.company_id) {
        const { data: companyData } = await companiesAPI.get(leadData.company_id)
        setCompany(companyData)
      }

      const { data: messagesData } = await messagesAPI.list({ leadId: id })
      setMessages(messagesData)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch lead')
      navigate('/leads')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateLead = async () => {
    if (!lead) return
    try {
      const { error } = await leadsAPI.update(lead.id, editedLead)
      if (error) throw error
      toast.success('Lead updated')
      setLead({ ...lead, ...editedLead })
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update lead')
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return
    try {
      const { error } = await leadsAPI.update(lead.id, { status: newStatus })
      if (error) throw error
      toast.success('Status updated')
      setLead({ ...lead, status: newStatus })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    }
  }

  const   timelineEvents: TimelineEvent[] = useMemo(() => {
    if (!lead) return []
    const events: TimelineEvent[] = [
      {
        id: 'created',
        title: 'Lead Created',
        description: lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Lead',
        date: lead.created_at,
        icon: Calendar,
        color: '#3b82f6',
      },
    ]

    messages.forEach((msg) => {
      if (msg.sent_at || msg.created_at) {
        events.push({
          id: `sent-${msg.id}`,
          title: 'Email Sent',
          description: msg.subject || 'No subject',
          date: msg.sent_at || msg.created_at,
          icon: Send,
          color: '#6366f1',
        })
      }
      if (msg.delivered_at) {
        events.push({
          id: `delivered-${msg.id}`,
          title: 'Email Delivered',
          description: msg.subject || 'No subject',
          date: msg.delivered_at,
          icon: CheckCircle,
          color: '#06b6d4',
        })
      }
      if (msg.opened_at) {
        events.push({
          id: `opened-${msg.id}`,
          title: 'Email Opened',
          description: msg.subject || 'No subject',
          date: msg.opened_at,
          icon: Activity,
          color: '#22c55e',
        })
      }
      if (msg.replied_at) {
        events.push({
          id: `replied-${msg.id}`,
          title: 'Reply Received',
          description: msg.subject || 'No subject',
          date: msg.replied_at,
          icon: MessageSquare,
          color: '#10b981',
        })
      }
      if (msg.bounced_at) {
        events.push({
          id: `bounced-${msg.id}`,
          title: 'Email Bounced',
          description: msg.subject || 'No subject',
          date: msg.bounced_at,
          icon: AlertCircle,
          color: '#ef4444',
        })
      }
    })

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return events
  }, [lead, messages])

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

  if (!lead) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Lead not found</p>
        <Button onClick={() => navigate('/leads')} className="mt-4">
          Back to Leads
        </Button>
      </div>
    )
  }

  const displayName = lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Lead Details'

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leads')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground truncate">{displayName}</h1>
            <Badge variant={STATUS_VARIANTS[lead.status] || 'default'}>
              {formatStatusLabel(lead.status)}
            </Badge>
          </div>
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              {lead.email}
            </a>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => { setIsEditing(false); setEditedLead(lead) }}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleUpdateLead}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {lead.email && (
            <Button onClick={() => window.location.href = `mailto:${lead.email}`}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          )}
          {lead.linkedin_url && (
            <Button variant="outline" onClick={() => window.open(lead.linkedin_url!, '_blank', 'noopener,noreferrer')}>
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
          )}
        </div>
      </div>

      {/* Overview KPI Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard icon={BarChart3} label="Lead Score" value={lead.lead_score != null ? <AnimatedCounter value={lead.lead_score} /> : '—'}
          subvalue={lead.lead_score != null ? (lead.lead_score >= 70 ? 'High quality' : lead.lead_score >= 40 ? 'Medium quality' : 'Low quality') : undefined} color="#6366f1" />
        <StatCard icon={Activity} label="Status" value={formatStatusLabel(lead.status)}
          subvalue="Current stage" color="#22c55e" />
        <StatCard icon={Building2} label="Company" value={company?.name || lead.domain || 'N/A'}
          subvalue={company?.industry || 'No industry'} color="#f59e0b" />
        <StatCard icon={Clock} label="Timeline Events" value={<AnimatedCounter value={timelineEvents.length} />}
          subvalue={messages.length > 0 ? `${messages.length} email(s)` : 'No emails'} color="#8b5cf6" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <SectionHeader icon={Building2} title="Lead Information" subtitle="Contact details and metadata" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Full Name</Label>
                    {isEditing ? (
                      <Input value={editedLead.full_name || ''} onChange={(e) => setEditedLead({ ...editedLead, full_name: e.target.value })} className="mt-1" />
                    ) : (
                      <p className="font-medium mt-0.5">{lead.full_name || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Email</Label>
                    {isEditing ? (
                      <Input type="email" value={editedLead.email || ''} onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })} className="mt-1" />
                    ) : (
                      <p className="mt-0.5">{lead.email || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Phone</Label>
                    {isEditing ? (
                      <Input value={(editedLead.raw_payload as any)?.phone || ''} onChange={(e) => setEditedLead({ ...editedLead, raw_payload: { ...(editedLead.raw_payload as any), phone: e.target.value } })} className="mt-1" />
                    ) : (
                      <p className="mt-0.5">{(lead.raw_payload as any)?.phone || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Title</Label>
                    {isEditing ? (
                      <Input value={editedLead.title || ''} onChange={(e) => setEditedLead({ ...editedLead, title: e.target.value })} className="mt-1" />
                    ) : (
                      <p className="mt-0.5">{lead.title || 'N/A'}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Company</Label>
                    <p className="font-medium mt-0.5">{company?.name || lead.domain || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Source</Label>
                    <p className="capitalize mt-0.5">{lead.source || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Lead Score</Label>
                    <p className="text-2xl font-bold mt-0.5">{lead.lead_score ?? 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Confidence</Label>
                    <p className="mt-0.5">{lead.confidence_score != null ? `${(lead.confidence_score * 100).toFixed(1)}%` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {lead.tags && lead.tags.length > 0 && (
                <div className="mt-5 pt-5 border-t border-border">
                  <Label className="text-muted-foreground text-xs">Tags</Label>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {lead.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-border">
                <Label className="text-muted-foreground text-xs">Status</Label>
                <div className="mt-1.5">
                  <Select value={lead.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {formatStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(lead.notes || isEditing) && (
                <div className="mt-5 pt-5 border-t border-border">
                  <Label className="text-muted-foreground text-xs">Notes</Label>
                  {isEditing ? (
                    <textarea
                      value={editedLead.notes || ''}
                      onChange={(e) => setEditedLead({ ...editedLead, notes: e.target.value })}
                      className="mt-1 flex w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition-colors hover:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring min-h-[80px] resize-y"
                      rows={3}
                      placeholder="Add notes..."
                    />
                  ) : (
                    <p className="mt-1 text-sm whitespace-pre-wrap text-foreground/80">{lead.notes}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <SectionHeader icon={Activity} title="Activity Timeline" subtitle={timelineEvents.length > 0 ? `${timelineEvents.length} event(s)` : 'No activity yet'} />
            </CardHeader>
            <CardContent>
              {timelineEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">No activity recorded</p>
              ) : (
                <div className="relative">
                  {timelineEvents.map((event, idx) => {
                    const Icon = event.icon
                    const isLast = idx === timelineEvents.length - 1
                    return (
                      <div key={event.id} className="flex gap-4 pb-2 relative">
                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center ring-4 ring-background z-10" style={{ backgroundColor: event.color }}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          {!isLast && <div className="w-0.5 flex-1 bg-border mt-1" />}
                        </div>
                        <div className="pb-6 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{event.title}</p>
                            <span className="text-xs text-muted-foreground/50">{formatRelativeTime(event.date)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <SectionHeader icon={MessageSquare} title="Email History" subtitle={messages.length > 0 ? `${messages.length} email(s) sent` : 'No emails sent'}
                action={messages.length > 0 ? <Badge variant="secondary" className="text-xs">{messages.length}</Badge> : undefined} />
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No emails sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{msg.subject || 'No subject'}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            To: {msg.to_email}
                          </p>
                          {msg.body && (
                            <p className="text-sm text-muted-foreground/70 mt-2 line-clamp-2">
                              {msg.body.length > 180 ? `${msg.body.substring(0, 180)}...` : msg.body}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2.5">
                            <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(msg.created_at)}
                            </span>
                            {msg.opened_at && (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Opened
                              </span>
                            )}
                            {msg.replied_at && (
                              <span className="text-xs text-emerald-600 flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" /> Replied
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            msg.status === 'delivered' || msg.status === 'sent' ? 'success' :
                            msg.status === 'failed' || msg.status === 'bounced' ? 'destructive' :
                            'secondary'
                          }
                          className="shrink-0 capitalize"
                        >
                          {msg.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <SectionHeader icon={BarChart3} title="Lead Score" subtitle={lead.lead_score != null ? `Score: ${lead.lead_score}/100` : 'Not scored'} />
            </CardHeader>
            <CardContent>
              <ScoreRing score={lead.lead_score ?? null} />
              {lead.confidence_score != null && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">{(lead.confidence_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="mt-1.5 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(lead.confidence_score * 100, 100)}%`,
                        backgroundColor: lead.confidence_score > 0.7 ? '#22c55e' : lead.confidence_score > 0.4 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <SectionHeader icon={Target} title="Quick Actions" subtitle="Common lead tasks" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = `mailto:${lead.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              {lead.linkedin_url && (
                <Button className="w-full justify-start" variant="outline" onClick={() => window.open(lead.linkedin_url!, '_blank', 'noopener,noreferrer')}>
                  <Linkedin className="h-4 w-4 mr-2" />
                  View LinkedIn
                </Button>
              )}
              {company && (
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate(`/pipeline?company=${company.id}`)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  View in Pipeline
                </Button>
              )}
            </CardContent>
          </Card>

          {company && (
            <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <SectionHeader icon={Building2} title="Company" subtitle={company?.name || 'Unknown company'} />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{company.name}</p>
                  </div>
                  {company.domain && (
                    <div>
                      <p className="text-xs text-muted-foreground">Domain</p>
                      <p className="text-sm">{company.domain}</p>
                    </div>
                  )}
                  {company.industry && (
                    <div>
                      <p className="text-xs text-muted-foreground">Industry</p>
                      <p className="text-sm">{company.industry}</p>
                    </div>
                  )}
                  {company.employee_count != null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Employees</p>
                      <p className="text-sm">{formatNumber(company.employee_count)}</p>
                    </div>
                  )}
                  {company.estimated_value != null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Value</p>
                      <p className="text-sm font-medium">${formatNumber(company.estimated_value)}</p>
                    </div>
                  )}
                  {company.priority && (
                    <div>
                      <p className="text-xs text-muted-foreground">Priority</p>
                      <Badge variant={company.priority === 'high' ? 'destructive' : company.priority === 'medium' ? 'warning' : 'secondary'} className="mt-0.5 capitalize">
                        {company.priority}
                      </Badge>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={company.status === 'active' ? 'success' : company.status === 'inactive' ? 'secondary' : 'default'} className="mt-0.5 capitalize">
                      {company.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {brand && (
            <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <SectionHeader icon={Building2} title="Brand" subtitle={brand?.brand_name || 'Unknown brand'} />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{brand.brand_name}</p>
                  </div>
                  {brand.product && (
                    <div>
                      <p className="text-xs text-muted-foreground">Product</p>
                      <p className="text-sm">{brand.product}</p>
                    </div>
                  )}
                  {brand.positioning && (
                    <div>
                      <p className="text-xs text-muted-foreground">Positioning</p>
                      <p className="text-sm line-clamp-2">{brand.positioning}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
