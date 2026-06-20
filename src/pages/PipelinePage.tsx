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
import { AnimatedCounter, StatCard, SectionHeader } from '@/components/DashboardComponents'
import { Plus, ExternalLink, Building2, MoreHorizontal, Search, CheckCircle, Target, BarChart3, GitBranch, TrendingUp, Activity, Loader2, Mail, Globe, Linkedin } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency, cn, formatNumber } from '@/lib/utils'
import { companiesAPI, brandsAPI } from '@/lib/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

interface CompanyWithBrand extends Company {
  brand?: BrandProfile
  lead_score?: number | null
  deal_value?: number | null
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
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithBrand | null>(null)

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

  const pipelineActive = companies.filter(c => c.status !== 'closed_lost' && c.status !== 'closed_won').length
  const pipelineWon = companies.filter(c => c.status === 'closed_won').length
  const pipelineLost = companies.filter(c => c.status === 'closed_lost').length
  const avgScore = companies.length > 0
    ? Math.round(companies.reduce((sum, c) => sum + (c.lead_score || 0), 0) / companies.length)
    : 0
  const dealValue = companies.reduce((sum, c) => sum + (c.deal_value || 0), 0)

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
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Pipeline</span>
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Manage companies through the sales pipeline</p>
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

      {/* ── KPI Ribbon ── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard icon={Building2} label="Total Companies" value={<AnimatedCounter value={companies.length} />}
          subvalue={`${pipelineActive} active`} color="#6366f1" />
        <StatCard icon={GitBranch} label="Active Pipeline" value={<AnimatedCounter value={pipelineActive} />}
          subvalue={`${pipelineWon} won`} color="#22c55e" />
        <StatCard icon={Target} label="Avg Score" value={<AnimatedCounter value={avgScore} />}
          subvalue={companies.length > 0 ? `across ${companies.length} companies` : '—'} color="#f59e0b" />
        <StatCard icon={TrendingUp} label="Deal Value" value={formatCurrency(dealValue)}
          subvalue={pipelineWon > 0 ? `${pipelineWon} closed won` : 'no closed deals'} color="#a855f7" />
      </div>

      {/* ── Pipeline Stats Bar ── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl px-5 py-3 border border-border/50">
        <span><span className="font-semibold text-foreground">{formatNumber(companies.length)}</span> <span className="text-muted-foreground">total</span></span>
        <span className="text-muted-foreground/30 hidden sm:inline">|</span>
        <span><span className="font-semibold text-foreground">{formatNumber(pipelineActive)}</span> <span className="text-muted-foreground">active</span></span>
        <span className="text-muted-foreground/30 hidden sm:inline">|</span>
        <span><span className="font-semibold text-green-600">{formatNumber(pipelineWon)}</span> <span className="text-muted-foreground">won</span></span>
        <span className="text-muted-foreground/30 hidden sm:inline">|</span>
        <span><span className="font-semibold text-red-500">{formatNumber(pipelineLost)}</span> <span className="text-muted-foreground">lost</span></span>
        {avgScore > 0 && (
          <>
            <span className="text-muted-foreground/30 hidden sm:inline">|</span>
            <span><span className="font-semibold text-foreground">{avgScore}</span> <span className="text-muted-foreground">avg score</span></span>
          </>
        )}
        {dealValue > 0 && (
          <>
            <span className="text-muted-foreground/30 hidden sm:inline">|</span>
            <span><span className="font-semibold text-foreground">{formatCurrency(dealValue)}</span> <span className="text-muted-foreground">total value</span></span>
          </>
        )}
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex gap-5 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between px-3 py-2.5 mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn('w-2.5 h-2.5 rounded-full', stage.color)} />
                  <h3 className="font-semibold text-sm text-foreground">{stage.label}</h3>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {companiesByStage[stage.id]?.length || 0}
                </span>
              </div>
              <div className="bg-muted/30 rounded-xl border border-border/50 p-2.5 space-y-2.5 min-h-[500px]">
                {companiesByStage[stage.id]?.map((company) => (
                  <Card
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className="rounded-xl border-border/50 bg-card shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <CardContent className="p-3.5">
                      <div className="flex items-start gap-2.5">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500/10 to-indigo-500/20">
                          <Building2 className="h-4 w-4 text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{company.name}</p>
                          {company.domain && (
                            <p className="text-xs text-muted-foreground/70 truncate">{company.domain}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 rounded-lg hover:bg-accent transition-colors -mr-1 -mt-1">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground/40" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
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
                      {company.lead_score != null && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground/70">Fit Score</span>
                            <span className={cn(
                              'font-semibold',
                              company.lead_score >= 80 ? 'text-green-600' : company.lead_score >= 60 ? 'text-yellow-600' : 'text-red-500'
                            )}>{company.lead_score}/100</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                company.lead_score >= 80 ? 'bg-green-500' : company.lead_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              )}
                              style={{ width: `${company.lead_score}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-border/30">
                        {company.industry && (
                          <span className="text-[11px] font-medium text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded-md">{company.industry}</span>
                        )}
                        {company.deal_value != null && company.deal_value > 0 && (
                          <span className="text-[11px] font-semibold text-emerald-600">{formatCurrency(company.deal_value)}</span>
                        )}
                        {company.created_at && (
                          <span className="text-[11px] text-muted-foreground/50 ml-auto">{new Date(company.created_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!companiesByStage[stage.id] || companiesByStage[stage.id].length === 0) && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted/50 mb-2">
                      <Building2 className="h-4 w-4 text-muted-foreground/20" />
                    </div>
                    <p className="text-xs text-muted-foreground/40">No companies</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="px-6 pt-5">
            <SectionHeader icon={Building2} title="All Companies" subtitle={`${companies.length} companies in pipeline`} />
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
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
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6366f112' }}>
                            <Building2 className="h-4 w-4" style={{ color: '#6366f1' }} />
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
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#a3a3a312' }}>
                    <Building2 className="h-7 w-7" style={{ color: '#a3a3a3' }} />
                  </div>
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

      {/* Lead Detail Panel */}
      <Drawer
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
        title="Lead Detail"
        size="md"
      >
        {selectedCompany && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-foreground">{selectedCompany.name}</h3>
              {selectedCompany.industry && (
                <p className="text-sm text-muted-foreground">
                  {selectedCompany.industry}
                  {selectedCompany.domain && ` · ${selectedCompany.domain}`}
                </p>
              )}
            </div>

            {selectedCompany.lead_score != null && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-muted-foreground">Fit Score</span>
                  <span className="text-sm font-semibold">{selectedCompany.lead_score}/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedCompany.lead_score >= 80 ? 'bg-green-500' : selectedCompany.lead_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    } transition-all`}
                    style={{ width: `${selectedCompany.lead_score}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Stage</p>
                <p className="font-medium text-foreground capitalize">{selectedCompany.status.replace(/_/g, ' ')}</p>
              </div>
              {selectedCompany.brand && (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Brand</p>
                  <p className="font-medium text-foreground">{selectedCompany.brand.brand_name}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Research</h4>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>Pain points: {selectedCompany.industry || 'Unknown'}</p>
                <p>Tech: React, Python, AWS</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {selectedCompany.domain && (
                <a
                  href={`https://${selectedCompany.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-accent text-foreground hover:bg-accent/80 transition-colors"
                >
                  <Globe className="h-3 w-3" />
                  Website
                </a>
              )}
              <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity">
                <Mail className="h-3 w-3" />
                Draft Email
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedCompany.name}?`)) {
                    companiesAPI.delete(selectedCompany.id).then(() => {
                      toast.success('Company deleted')
                      setSelectedCompany(null)
                      fetchCompanies()
                    })
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
