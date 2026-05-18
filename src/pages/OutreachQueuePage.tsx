import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { type BrandProfile, type Company } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import Drawer from '@/components/Drawer'
import { Mail, Send, XCircle, Eye, Building2, Edit3, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime } from '@/lib/utils'
import { brandsAPI, companiesAPI, campaignsAPI } from '@/lib/api'

interface OutreachEntry {
  id: string
  company_id: string
  brand_id: string
  subject: string | null
  body: string | null
  status: string
  created_at: string
  updated_at: string
  company?: Company | null
  brand?: BrandProfile | null
}

export default function OutreachQueuePage() {
  const { client } = useAuth()
  const navigate = useNavigate()
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

      const companyIds = [...new Set(items.map(e => e.company_id).filter(Boolean))]
      const companyMap: Record<string, Company | null> = {}

      await Promise.all(
        companyIds.map(async (cid) => {
          try {
            const { data } = await companiesAPI.get(cid)
            companyMap[cid] = data
          } catch {
            companyMap[cid] = null
          }
        })
      )

      items = items.map(e => ({
        ...e,
        company: e.company_id ? companyMap[e.company_id] : null,
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
    if (!entry.company) {
      toast.error('No associated company found')
      return
    }
    setIsSending(entry.id)
    try {
      const { error } = await companiesAPI.update(entry.brand_id, entry.company_id, { status: 'contacted' })
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
    if (!entry.company) {
      toast.error('No associated company found')
      return
    }
    try {
      const { error } = await companiesAPI.update(entry.brand_id, entry.company_id, { status: 'rejected' })
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
      if (editingEntry.company) {
        const { error } = await companiesAPI.update(editingEntry.brand_id, editingEntry.company_id, { status: 'contacted' })
        if (error) throw error
      }
      toast.success('Saved and queued for sending')
      setEditingEntry(null)
      fetchOutreachEntries()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save and approve')
    } finally {
      setIsSavingEdit(false)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Outreach Queue</h1>
          <p className="text-muted-foreground">Review and approve email drafts before sending</p>
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

      {entries.length === 0 ? (
        <Card className="bg-muted border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No outreach drafts</h3>
            <p className="text-muted-foreground mb-4">Draft emails will appear here once the engine generates them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {entry.company?.name || entry.company_id ? `Company (${entry.company_id.substring(0, 8)}...)` : 'Unknown Company'}
                      </CardTitle>
                      <CardDescription>{entry.company?.domain || entry.company_id}</CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border border-border">Draft</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded-xl space-y-1">
                  <p className="text-sm font-medium text-foreground/80">{entry.subject || 'No subject'}</p>
                  <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                    {entry.body || 'No body'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
                  <span>Created {formatRelativeTime(entry.created_at)}</span>
                  {entry.brand && <span>· Brand: {entry.brand.brand_name}</span>}
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <Button size="sm" onClick={() => handleApproveSend(entry)} isLoading={isSending === entry.id}>
                    <Send className="h-4 w-4 mr-2" />
                    Approve & Send
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleReject(entry)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Drawer
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        title="Edit Outreach Draft"
        description={editingEntry?.company?.name || editingEntry?.company_id || 'Unknown Company'}
        size="lg"
      >
        {editingEntry && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>To</Label>
              <p className="text-sm text-muted-foreground">{editingEntry.company?.domain || 'Unknown'}</p>
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
            <div className="p-3 bg-muted rounded-xl">
              <p className="text-xs font-medium text-muted-foreground mb-1">Preview</p>
              <p className="text-sm font-medium text-foreground/80">{editSubject}</p>
              <p className="text-sm text-muted-foreground/80 mt-2 whitespace-pre-wrap line-clamp-6">{editBody}</p>
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
