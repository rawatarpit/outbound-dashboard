import { useState, useEffect } from 'react'
import { type DiscoveredCompany, type BrandProfile, ENRICHMENT_STATUSES, REJECTION_REASONS } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  TrendingUp,
  Target,
  Brain,
  BarChart3,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, formatNumber, cn } from '@/lib/utils'
import { discoveredCompaniesAPI, brandsAPI } from '@/lib/api'

const PAGE_SIZE = 50

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  raw: { badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20', dot: 'bg-blue-500' },
  rejected: { badge: 'bg-red-500/10 text-red-600 border-red-500/20', dot: 'bg-red-500' },
  approved: { badge: 'bg-green-500/10 text-green-600 border-green-500/20', dot: 'bg-green-500' },
}

const SIGNAL_COLORS: Record<string, string> = {
  PAIN_POINT: 'bg-orange-500/10 text-orange-600',
  FUNDING: 'bg-green-500/10 text-green-600',
  HIRING: 'bg-blue-500/10 text-blue-600',
  LAUNCH: 'bg-purple-500/10 text-purple-600',
  PARTNERSHIP: 'bg-indigo-500/10 text-indigo-600',
  TECH_USAGE: 'bg-cyan-500/10 text-cyan-600',
  GROWTH: 'bg-emerald-500/10 text-emerald-600',
}

function RejectionBadge({ reason }: { reason: string }) {
  const match = REJECTION_REASONS.find(r => reason.includes(r.value) || r.value.includes(reason))
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
      {match?.label || reason || 'Unknown'}
    </span>
  )
}

export default function DiscoveredCompaniesPage() {
  const { client, user } = useAuth()
  const effectiveClientId = user?.clientId ?? client?.id
  const [companies, setCompanies] = useState<DiscoveredCompany[]>([])
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [brandFilter, setBrandFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [sourceFilter, setSourceFilter] = useState<string | undefined>(undefined)
  const [rejectionFilter, setRejectionFilter] = useState<string | undefined>(undefined)
  const [scoreMin, setScoreMin] = useState('')
  const [scoreMax, setScoreMax] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [sourceNames, setSourceNames] = useState<string[]>([])

  useEffect(() => {
    if (!effectiveClientId) return
    fetchBrands()
    fetchSourceNames()
  }, [effectiveClientId])

  useEffect(() => {
    if (!effectiveClientId) return
    fetchCompanies()
  }, [effectiveClientId, currentPage, statusFilter, sourceFilter, brandFilter])

  const fetchBrands = async () => {
    try {
      const { data } = await brandsAPI.list(effectiveClientId)
      setBrands(data || [])
    } catch {}
  }

  const fetchSourceNames = async () => {
    try {
      const { data } = await discoveredCompaniesAPI.getSourceNames(effectiveClientId)
      setSourceNames(data)
    } catch {}
  }

  const fetchCompanies = async () => {
    setIsLoading(true)
    try {
      const { data, total, error } = await discoveredCompaniesAPI.list({
        clientId: effectiveClientId,
        brandId: brandFilter,
        status: statusFilter,
        sourceName: sourceFilter,
        scoreMin: scoreMin ? parseInt(scoreMin) : undefined,
        scoreMax: scoreMax ? parseInt(scoreMax) : undefined,
        search: searchQuery || undefined,
        page: currentPage,
        perPage: PAGE_SIZE,
      })
      if (error) throw error
      setCompanies(data)
      setTotalCount(total)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchCompanies()
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const rejectionOptions = REJECTION_REASONS.map(r => r.value)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discovered Companies</h1>
          <p className="text-muted-foreground">Browse all companies through the pipeline — from raw results to approved leads</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <Building2 className="h-4 w-4" />
          {formatNumber(totalCount)} total
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  placeholder="Search by name or domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter || 'all'} onValueChange={(v) => { setStatusFilter(v === 'all' ? undefined : v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {ENRICHMENT_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sourceFilter || 'all'} onValueChange={(v) => { setSourceFilter(v === 'all' ? undefined : v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sourceNames.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {statusFilter === 'rejected' && (
                <Select value={rejectionFilter || 'all'} onValueChange={(v) => setRejectionFilter(v === 'all' ? undefined : v)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Rejection Reasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    {rejectionOptions.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={brandFilter || 'all'} onValueChange={(v) => { setBrandFilter(v === 'all' ? undefined : v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.brand_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {statusFilter === 'approved' && (
                <>
                  <span className="text-xs text-muted-foreground font-medium">Score range:</span>
                  <Input type="number" placeholder="Min" value={scoreMin} onChange={(e) => setScoreMin(e.target.value)} className="w-20 h-8 text-xs" min={0} max={100} />
                  <span className="text-xs text-muted-foreground">-</span>
                  <Input type="number" placeholder="Max" value={scoreMax} onChange={(e) => setScoreMax(e.target.value)} className="w-20 h-8 text-xs" min={0} max={100} />
                  <Button variant="outline" size="sm" onClick={handleSearch}>Apply</Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-border border-t-primary shadow-2xl" />
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No companies found</h3>
              <p className="text-muted-foreground">Run a discovery to start finding companies</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Signal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rejection / Score</TableHead>
                    <TableHead>Discovered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => {
                    const style = STATUS_STYLES[company.enrichment_status ?? 'raw'] || STATUS_STYLES.raw
                    return (
                      <>
                        <TableRow
                          key={company.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setExpandedRow(expandedRow === company.id ? null : company.id)}
                        >
                          <TableCell>
                            {expandedRow === company.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </TableCell>
                          <TableCell className="font-medium">{company.name || company.domain || 'N/A'}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {company.domain ? (
                              <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()} className="hover:underline">
                                {company.domain}
                              </a>
                            ) : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{company.source_name || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell>
                            {company.signal_type ? (
                              <Badge className={cn('text-xs border-0', SIGNAL_COLORS[company.signal_type] || 'bg-muted text-muted-foreground')}>
                                {company.signal_type.replace(/_/g, ' ')}
                              </Badge>
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border', style.badge)}>
                              <span className={cn('inline-block h-1.5 w-1.5 rounded-full', style.dot)} />
                              {(company.enrichment_status?.charAt(0).toUpperCase() ?? '') + (company.enrichment_status?.slice(1) ?? '')}
                            </span>
                          </TableCell>
                          <TableCell>
                            {company.enrichment_status === 'rejected' && company.error ? (
                              <RejectionBadge reason={company.error} />
                            ) : company.enrichment_status === 'approved' && company.relevance_score != null ? (
                              <span className={cn('font-bold text-sm', company.relevance_score >= 70 ? 'text-green-600' : company.relevance_score >= 40 ? 'text-amber-600' : 'text-red-600')}>
                                {company.relevance_score}
                              </span>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatRelativeTime(company.discovered_at)}</TableCell>
                        </TableRow>
                        {expandedRow === company.id && (
                          <TableRow key={`${company.id}-detail`}>
                            <TableCell colSpan={8} className="bg-muted/30 p-0">
                              <div className="p-6 border-t border-border">
                                <div className="grid gap-6 lg:grid-cols-2">
                                  <div className="space-y-5">
                                    <div>
                                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                        Raw Search Result
                                      </h4>
                                      <div className="rounded-xl bg-card border border-border p-4 space-y-2">
                                        {company.name && <div><span className="text-muted-foreground text-xs">Title:</span> <p className="text-sm font-medium">{company.name}</p></div>}
                                        {(company.raw_payload as any)?.url && (
                                          <a href={(company.raw_payload as any).url} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                            <ExternalLink className="h-3 w-3" />
                                            {(company.raw_payload as any).url}
                                          </a>
                                        )}
                                        {(company.raw_payload as any)?.snippet && (
                                          <div><span className="text-muted-foreground text-xs">Snippet:</span> <p className="text-xs text-foreground/80 mt-0.5">{(company.raw_payload as any).snippet}</p></div>
                                        )}
                                        {(company.raw_payload as any)?.query && (
                                          <div><span className="text-muted-foreground text-xs">Query:</span> <span className="text-xs font-medium">{(company.raw_payload as any).query}</span></div>
                                        )}
                                        {(company.raw_payload as any)?.intent_id && (
                                          <div><span className="text-muted-foreground text-xs">Intent ID:</span> <span className="text-xs font-medium">{(company.raw_payload as any).intent_id}</span></div>
                                        )}
                                      </div>
                                    </div>

                                    {company.enrichment_status === 'rejected' && company.error && (
                                      <div>
                                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                          Rejection Details
                                        </h4>
                                        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
                                          <RejectionBadge reason={company.error} />
                                          <p className="text-xs text-muted-foreground mt-2">
                                            {(() => {
                                              const match = REJECTION_REASONS.find(r => company.error?.includes(r.value) || r.value.includes(company.error || ''))
                                              return match ? `Caught in Phase ${match.phase}: ${match.description}` : 'Filtered by the discovery engine'
                                            })()}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {company.enrichment_status === 'approved' && (
                                      <>
                                        <div>
                                          <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                            <Brain className="h-4 w-4 text-muted-foreground" />
                                            LLM Extraction
                                          </h4>
                                          <div className="rounded-xl bg-card border border-border p-4 space-y-2">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                              {company.name && <div><span className="text-muted-foreground">Company:</span> <span className="font-medium">{company.name}</span></div>}
                                              {company.domain && <div><span className="text-muted-foreground">Domain:</span> <span className="font-medium">{company.domain}</span></div>}
                                              {company.website && <div className="col-span-2"><span className="text-muted-foreground">Website:</span> <span className="font-medium">{company.website}</span></div>}
                                              {company.summary && <div className="col-span-2"><span className="text-muted-foreground">Summary:</span> <span className="font-medium text-xs">{company.summary}</span></div>}
                                              {company.fit_reason && <div className="col-span-2"><span className="text-muted-foreground">Fit Reason:</span> <span className="font-medium text-xs">{company.fit_reason}</span></div>}
                                              {company.confidence != null && <div><span className="text-muted-foreground">Confidence:</span> <span className="font-medium">{(company.confidence * 100).toFixed(0)}%</span></div>}
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                            Score Analysis
                                          </h4>
                                          <div className="rounded-xl bg-card border border-border p-4">
                                            <div className="space-y-3">
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold">Composite Score</span>
                                                <span className={cn('text-lg font-bold', (company.relevance_score ?? 0) >= 70 ? 'text-green-600' : (company.relevance_score ?? 0) >= 40 ? 'text-amber-600' : 'text-red-600')}>
                                                  {company.relevance_score ?? 'N/A'}/100
                                                </span>
                                              </div>
                                              {company.fit_reason && (
                                                <div className="text-xs text-muted-foreground border-t border-border pt-2">
                                                  Score components and signal evidence available in raw payload.
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {company.signal_type && (
                                          <div>
                                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                              <Target className="h-4 w-4 text-muted-foreground" />
                                              Signal Evidence
                                            </h4>
                                            <div className="rounded-xl bg-card border border-border p-4">
                                              <Badge className={cn('text-xs border-0', SIGNAL_COLORS[company.signal_type] || 'bg-muted text-muted-foreground')}>
                                                {company.signal_type.replace(/_/g, ' ')}
                                              </Badge>
                                              {(company.raw_payload as any)?.snippet && (
                                                <p className="text-xs text-muted-foreground mt-2 italic">"{(company.raw_payload as any).snippet}"</p>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  <div className="space-y-5">
                                    <div>
                                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        Discovery Summary
                                      </h4>
                                      <div className="rounded-xl bg-card border border-border p-4 space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span className="font-medium">{company.source_name || 'N/A'}</span></div>
                                        <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={cn('font-medium capitalize', company.enrichment_status === 'approved' ? 'text-green-600' : company.enrichment_status === 'rejected' ? 'text-red-600' : '')}>{company.enrichment_status}</span></div>
                                        {company.discovered_at && <div className="flex justify-between"><span className="text-muted-foreground">Discovered</span><span className="font-medium text-xs">{formatRelativeTime(company.discovered_at)}</span></div>}
                                        {company.error && <div className="flex justify-between"><span className="text-muted-foreground">Error</span><span className="font-medium text-xs text-red-600">{company.error}</span></div>}
                                      </div>
                                    </div>

                                    {company.raw_payload && (
                                      <div>
                                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                          Raw Data
                                        </h4>
                                        <details className="rounded-xl bg-card border border-border">
                                          <summary className="px-4 py-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground">View raw payload JSON</summary>
                                          <div className="px-4 pb-4">
                                            <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-60 text-foreground">{JSON.stringify(company.raw_payload, null, 2)}</pre>
                                          </div>
                                        </details>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {formatNumber(totalCount)}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground/80">Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}