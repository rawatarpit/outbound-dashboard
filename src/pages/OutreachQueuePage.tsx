import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { type BrandProfile, type Company } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Mail, Send, XCircle, Eye, ExternalLink, MessageSquare, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime } from '@/lib/utils'
import { brandsAPI, companiesAPI, outreachAPI } from '@/lib/api'

export default function OutreachQueuePage() {
  const { client } = useAuth()
  const navigate = useNavigate()
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [draftCompanies, setDraftCompanies] = useState<(Company & { brand?: BrandProfile })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [brandFilter, setBrandFilter] = useState<string | undefined>(undefined)
  const [outreachDrafts, setOutreachDrafts] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    fetchDraftCompanies()
  }, [brandFilter])

  const fetchBrands = async () => {
    try {
      const { data } = await brandsAPI.list(client?.id)
      setBrands(data)
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchDraftCompanies = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await companiesAPI.list({ brandId: brandFilter || undefined, status: 'draft_ready', perPage: 100 })
      if (error) throw error

      const companiesWithBrand = data.map(c => ({
        ...c,
        brand: brands.find(b => b.id === c.brand_id)
      }))
      setDraftCompanies(companiesWithBrand)

      for (const company of companiesWithBrand) {
        const { data: drafts } = await outreachAPI.listByCompany(company.brand_id, company.id)
        if (drafts && drafts.length > 0) {
          setOutreachDrafts(prev => ({ ...prev, [company.id]: drafts[0] }))
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch queue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveSend = async (company: Company) => {
    try {
      const { error } = await companiesAPI.update(company.brand_id, company.id, { status: 'contacted' })
      if (error) throw error
      toast.success(`${company.name} queued for sending`)
      fetchDraftCompanies()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve')
    }
  }

  const handleReject = async (company: Company) => {
    try {
      const { error } = await companiesAPI.update(company.brand_id, company.id, { status: 'rejected' })
      if (error) throw error
      toast.success(`${company.name} rejected`)
      fetchDraftCompanies()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject')
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
          <h1 className="text-2xl font-bold text-gray-900">Outreach Queue</h1>
          <p className="text-gray-500">Review and approve email drafts before sending</p>
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

      {draftCompanies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No draft-ready companies</h3>
            <p className="text-gray-500 mb-4">Complete discovery and enrichment first</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {draftCompanies.map((company) => {
            const draft = outreachDrafts[company.id]
            return (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <CardDescription>{company.domain || 'No domain'}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">Draft Ready</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {draft ? (
                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {draft.subject || 'No subject'}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {draft.body ? draft.body.substring(0, 150) + '...' : 'No body'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No outreach draft generated yet</p>
                  )}

                  {company.relevance_score != null && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Score: {company.relevance_score}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2 border-t">
                    <Button size="sm" onClick={() => handleApproveSend(company)}>
                      <Send className="h-4 w-4 mr-2" />
                      Approve & Send
                    </Button>
                    {draft && (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/campaigns/${draft.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Draft
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleReject(company)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>

                  {company.brand && (
                    <p className="text-xs text-gray-400">Brand: {company.brand.brand_name}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
