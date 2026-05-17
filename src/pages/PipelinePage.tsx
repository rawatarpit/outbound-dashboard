import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { type Company, type BrandProfile, COMPANY_STATUSES, PIPELINE_STAGES } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Drawer from '@/components/Drawer'
import CompanyForm from '@/components/forms/CompanyForm'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Plus, ExternalLink, Building2, MoreHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency, cn } from '@/lib/utils'
import { companiesAPI, brandsAPI } from '@/lib/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

interface CompanyWithBrand extends Company {
  brand?: BrandProfile
}

const STATUS_COLORS: Record<string, string> = {
  researching: 'bg-muted text-foreground',
  qualified: 'bg-muted text-foreground',
  icp_passed: 'bg-muted text-foreground',
  draft_ready: 'bg-muted text-foreground',
  contacted: 'bg-muted text-foreground',
  replied: 'bg-muted text-foreground',
  negotiating: 'bg-muted text-muted-foreground',
  closed_won: 'bg-muted text-foreground',
  closed_lost: 'bg-muted text-foreground'
}

export default function PipelinePage() {
  const { client } = useAuth()
  const [companies, setCompanies] = useState<CompanyWithBrand[]>([])
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [brandFilter, setBrandFilter] = useState<string | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  useEffect(() => {
    (async () => {
      await fetchBrands()
      fetchCompanies()
    })()
  }, [brandFilter])

  const fetchBrands = async () => {
    try {
      const { data } = await brandsAPI.list(client?.id)
      setBrands(data || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchCompanies = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await companiesAPI.list({ clientId: client?.id, brandId: brandFilter || undefined })
      if (error) throw error

      const companiesWithBrand = data.map(c => ({
        ...c,
        brand: brands.find(b => b.id === c.brand_id)
      }))
      setCompanies(companiesWithBrand)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch companies')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCompany = async (company: Company) => {
    if (!confirm(`Delete ${company.name}?`)) return

    try {
      const { error } = await companiesAPI.delete(company.id)
      if (error) throw error
      toast.success('Company deleted')
      fetchCompanies()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete company')
    }
  }

  const companiesByStage = COMPANY_STATUSES.reduce((acc, status) => {
    acc[status] = companies.filter(c => c.status === status)
    return acc
  }, {} as Record<string, CompanyWithBrand[]>)

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
          <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
          <p className="text-muted-foreground">Manage companies through the sales pipeline</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.brand_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              className={cn(
                'px-3 py-2 text-sm font-medium',
                viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'
              )}
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </button>
            <button
              className={cn(
                'px-3 py-2 text-sm font-medium',
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'
              )}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className={cn('rounded-t-lg px-3 py-2', stage.color, 'text-white')}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{stage.label}</h3>
                  <span className="text-sm opacity-80">{companiesByStage[stage.id]?.length || 0}</span>
                </div>
              </div>
              <div className="bg-muted rounded-b-lg border border-border p-2 space-y-2 min-h-[500px]">
                {companiesByStage[stage.id]?.map((company) => (
                  <Card key={company.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{company.name}</p>
                          {company.domain && (
                            <p className="text-xs text-muted-foreground truncate">{company.domain}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 rounded hover:bg-accent">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground/50" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/pipeline/${company.id}`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteCompany(company)} className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {company.lead_score != null && (
                          <Badge variant="secondary" className="text-xs">
                            Score: {company.lead_score}
                          </Badge>
                        )}
                        {company.deal_value != null && (
                          <Badge variant="outline" className="text-xs">
                            {formatCurrency(company.deal_value)}
                          </Badge>
                        )}
                      </div>
                      {company.brand && (
                        <p className="mt-2 text-xs text-muted-foreground/50">{company.brand.brand_name}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {companiesByStage[stage.id]?.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground/50 py-4">No companies</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Company</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Industry</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Deal Value</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Brand</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{company.name}</p>
                            {company.domain && (
                              <p className="text-xs text-muted-foreground">{company.domain}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_COLORS[company.status] || ''}>
                          {company.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{company.industry || 'N/A'}</td>
                      <td className="px-4 py-3">
                        {company.lead_score != null ? (
                          <span className={cn(
                            'font-medium',
                            company.lead_score >= 70 ? 'text-foreground font-bold' :
                            company.lead_score >= 40 ? 'text-foreground' : 'text-muted-foreground'
                          )}>
                            {company.lead_score}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {company.deal_value != null ? formatCurrency(company.deal_value) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">{company.brand?.brand_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 rounded hover:bg-accent">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/pipeline/${company.id}`}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCompany(company)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {companies.length === 0 && (
                <div className="text-center py-16">
                  <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No companies found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Drawer
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Company"
        description="Create a new company in the pipeline"
        size="lg"
      >
        <CompanyForm
          brands={brands}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchCompanies()
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Drawer>
    </div>
  )
}
