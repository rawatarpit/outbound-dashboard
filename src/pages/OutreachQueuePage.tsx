import { useState, useEffect } from 'react'
import { type BrandProfile } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import Drawer from '@/components/Drawer'
import { Mail, Send, XCircle, Eye, Building2, Edit3, Save, Clock } from 'lucide-react'
import { AnimatedCounter } from '@/components/DashboardComponents'
import toast from 'react-hot-toast'
import { formatRelativeTime } from '@/lib/utils'
import { brandsAPI, campaignsAPI } from '@/lib/api'

interface OutreachEntry {
  id: string
  company_id: string
  brand_id: string
  subject: string | null
  body: string | null
  status: string
  created_at: string
  updated_at: string
  company_name: string | null
  company_domain: string | null
  brand?: BrandProfile | null
}

export default function OutreachQueuePage() {
  const { client } = useAuth()
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [entries, setEntries] = useState<OutreachEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [brandFilter, setBrandFilter] = useState<string | undefined>(undefined)
  const [isSending, setIsSending] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<OutreachEntry | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editBody, setEditBody] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    fetchOutreachEntries()
  }, [brandFilter])

  const fetchBrands = async () => {
    try {
      const { data } = await brandsAPI.list(client?.id)
      setBrands(data || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchOutreachEntries = async () => {
    setIsLoading(true)
    try {
      const { data: campaignData, error } = await campaignsAPI.list()
      if (error) throw error

      let items: OutreachEntry[] = (Array.isArray(campaignData) ? campaignData : []).filter(
        (e: any) => e.status === 'draft' || e.status === 'draft_processing'
      )

      if (brandFilter) {
        items = items.filter(e => e.brand_id === brandFilter)
      }

      const brandMap: Record<string, BrandProfile> = {}
      for (const b of brands) brandMap[b.id] = b

      items = items.map(e => ({
        ...e,
        brand: e.brand_id ? brandMap[e.brand_id] : null,
      }))

      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setEntries(items)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch outreach entries')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveSend = async (entry: OutreachEntry) => {
    if (!entry.company_domain) {
      toast.error('No associated company found')
      return
    }
    setIsSending(entry.id)
    try {
      const { error } = await campaignsAPI.update(entry.id, { status: 'sent' })
      if (error) throw error
      toast.success('Queued for sending')
      fetchOutreachEntries()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve')
    } finally {
      setIsSending(null)
    }
  }

  const handleReject = async (entry: OutreachEntry) => {
    if (!entry.company_domain) {
      toast.error('No associated company found')
      return
    }
    try {
      const { error } = await campaignsAPI.update(entry.id, { status: 'rejected' })
      if (error) throw error
      toast.success('Rejected')
      fetchOutreachEntries()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject')
    }
  }

  const handleEdit = (entry: OutreachEntry) => {
    setEditingEntry(entry)
    setEditSubject(entry.subject || '')
    setEditBody(entry.body || '')
  }

  const handleSaveEdit = async () => {
    if (!editingEntry) return
    setIsSavingEdit(true)
    try {
      const { error } = await campaignsAPI.update(editingEntry.id, { subject: editSubject, body: editBody })
      if (error) throw error
      toast.success('Draft saved')
      setEditingEntry(null)
      fetchOutreachEntries()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save draft')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleApproveAfterEdit = async () => {
    if (!editingEntry) return
    setIsSavingEdit(true)
    try {
      await campaignsAPI.update(editingEntry.id, { subject: editSubject, body: editBody })
      const { error } = await campaignsAPI.update(editingEntry.id, { status: 'sent' })
      if (error) throw error
      toast.success('Saved and queued for sending')
      setEditingEntry(null)
      fetchOutreachEntries()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save and approve')
    } finally {
      setIsSavingEdit(false)
    }
  }

  const pendingCount = entries.length
  const todayCount = entries.filter(e => {
    const d = new Date(e.created_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length

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
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Outreach Queue</span>
          </h1>
          <p className="text-muted-foreground mt-1">Review and approve email drafts before sending</p>
        </div>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            {brands.map(brand => (
              <SelectItem key={brand.id} value={brand.id}>{brand.brand_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3b82f612' }}>
              <Mail className="h-5 w-5" style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={pendingCount} /></p>
              <p className="text-sm text-muted-foreground">Pending Drafts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8b5cf612' }}>
              <Clock className="h-5 w-5" style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={todayCount} /></p>
              <p className="text-sm text-muted-foreground">Created Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {entries.length === 0 ? (
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center mb-4">
              <Mail className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No outreach drafts</h3>
            <p className="text-muted-foreground">Draft emails will appear here once the engine generates them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const isProcessing = entry.status === 'draft_processing'
            return (
              <Card key={entry.id} className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg leading-tight">{entry.company_name || 'No Company'}</CardTitle>
                        <CardDescription className="truncate">{entry.company_domain || entry.company_id}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={isProcessing ? 'warning' : 'default'} className="shrink-0 ml-3">
                      {isProcessing ? 'Draft Processing' : 'Draft'}
                    </Badge>
                  </div>

                  <div className="p-4 bg-muted rounded-xl space-y-2 mb-4">
                    <p className="font-semibold text-foreground">{entry.subject || <span className="italic text-muted-foreground">No subject</span>}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-wrap">
                      {entry.body || <span className="italic">No body</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatRelativeTime(entry.created_at)}
                    </span>
                    {entry.brand && (
                      <>
                        <span className="text-muted-foreground/30">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          {entry.brand.brand_name}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Button size="sm" onClick={() => handleApproveSend(entry)} isLoading={isSending === entry.id}>
                      <Send className="h-4 w-4 mr-2" />
                      Approve & Send
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleReject(entry)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Drawer
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        title="Edit Outreach Draft"
        description={editingEntry?.company_name || editingEntry?.company_domain || 'Unknown'}
        size="xl"
      >
        {editingEntry && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>To</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{editingEntry.company_domain || editingEntry.company_name || 'Unknown'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_subject">Subject</Label>
              <Input
                id="edit_subject"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_body">Body</Label>
              <Textarea
                id="edit_body"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            <div className="p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Preview</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{editSubject || <span className="italic text-muted-foreground">No subject</span>}</p>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-6 leading-relaxed">{editBody || <span className="italic">No body</span>}</p>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setEditingEntry(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} isLoading={isSavingEdit}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleApproveAfterEdit} isLoading={isSavingEdit}>
                <Send className="h-4 w-4 mr-2" />
                Save & Send
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
