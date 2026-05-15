import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { type Lead, type BrandProfile, type Company, type SentMessage, LEAD_STATUSES } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  ArrowLeft,
  Mail,
  Building2,
  Calendar,
  Linkedin,
  MessageSquare,
  Edit2,
  Save,
  X,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { leadsAPI, brandsAPI, companiesAPI, messagesAPI } from '@/lib/api'

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400',
  researching: 'bg-purple-500/10 text-purple-400',
  qualified: 'bg-indigo-500/10 text-indigo-400',
  icp_passed: 'bg-violet-500/10 text-violet-400',
  contacted: 'bg-pink-500/10 text-pink-400',
  replied: 'bg-green-500/10 text-green-400',
  negotiating: 'bg-amber-500/10 text-amber-400',
  closed_won: 'bg-emerald-500/10 text-emerald-400',
  closed_lost: 'bg-red-500/10 text-red-400'
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-white/[0.04] border-t-primary shadow-2xl" />
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/leads')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Lead Details'}
            </h1>
            <Badge className={STATUS_COLORS[lead.status] || ''}>
              {lead.status.replace('_', ' ')}
            </Badge>
          </div>
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="text-muted-foreground hover:underline">
              {lead.email}
            </a>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
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
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
                <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  {isEditing ? (
                    <Input
                      value={editedLead.full_name || ''}
                      onChange={(e) => setEditedLead({ ...editedLead, full_name: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium">{lead.full_name || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editedLead.email || ''}
                      onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                    />
                  ) : (
                    <p>{lead.email || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  {isEditing ? (
                    <Input
                      value={editedLead.raw_payload?.['phone'] as string || ''}
                      onChange={(e) => setEditedLead({
                        ...editedLead,
                        raw_payload: { ...editedLead.raw_payload, phone: e.target.value }
                      })}
                    />
                  ) : (
                    <p>{(lead.raw_payload as any)?.phone || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Title</Label>
                  {isEditing ? (
                    <Input
                      value={editedLead.title || ''}
                      onChange={(e) => setEditedLead({ ...editedLead, title: e.target.value })}
                    />
                  ) : (
                    <p>{lead.title || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Company</Label>
                  <p>{lead.domain || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Source</Label>
                  <p className="capitalize">{lead.source || 'manual'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Lead Score</Label>
                  <p className="text-2xl font-bold">{lead.lead_score ?? 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Confidence</Label>
                  <p>{lead.confidence_score ? `${(lead.confidence_score * 100).toFixed(1)}%` : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-muted-foreground">Status</Label>
                  <Select value={lead.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {lead.linkedin_url && (
                  <Button variant="outline" onClick={() => window.open(lead.linkedin_url!, '_blank', 'noopener,noreferrer')}>
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                )}
              </div>
            </div>

            {lead.notes && (
              <div className="mt-6 pt-6 border-t border-white/[0.06]">
                <Label className="text-muted-foreground">Notes</Label>
                <p className="mt-1">{lead.notes}</p>
              </div>
            )}

            {lead.tags && lead.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/[0.06]">
                <Label className="text-muted-foreground">Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {lead.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground/50" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{formatDate(lead.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-muted-foreground/50" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">{formatRelativeTime(lead.updated_at)}</p>
                </div>
              </div>
              {brand && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground/50" />
                  <div>
                    <p className="text-sm text-muted-foreground">Brand</p>
                    <p className="text-sm font-medium">{brand.brand_name}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {company && (
            <Card>
              <CardHeader>
                <CardTitle>Company</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{company.name}</p>
                  </div>
                  {company.industry && (
                    <div>
                      <p className="text-sm text-muted-foreground">Industry</p>
                      <p>{company.industry}</p>
                    </div>
                  )}
                  {company.employee_count && (
                    <div>
                      <p className="text-sm text-muted-foreground">Employees</p>
                      <p>{company.employee_count}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Email History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No emails sent yet</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="p-4 border border-white/[0.06] rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{msg.subject || 'No subject'}</p>
                      <p className="text-sm text-muted-foreground">
                        To: {msg.to_email} • {formatRelativeTime(msg.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        msg.status === 'delivered' ? 'success' :
                        msg.status === 'failed' ? 'destructive' :
                        msg.status === 'bounced' ? 'destructive' :
                        'secondary'
                      }
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
  )
}
