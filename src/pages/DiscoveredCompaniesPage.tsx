import { useState, useEffect } from 'react'
import { type DiscoveredCompany, type BrandProfile, ENRICHMENT_STATUSES } from '@/lib/supabase'
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
  AlertCircle,
  TrendingUp,
  Target,
  Brain,
  BarChart3,
  XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, formatNumber, cn } from '@/lib/utils'
import { discoveredCompaniesAPI, brandsAPI } from '@/lib/api'

const PAGE_SIZE = 50

const ENRICHMENT_COLORS: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  processing: 'bg-blue-500/10 text-blue-600',
  enriched: 'bg-green-500/10 text-green-600',
  failed: 'bg-red-500/10 text-red-600',
  dead: 'bg-red-500/10 text-red-600',
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

function ScoreBreakdown({ company }: { company: DiscoveredCompany }) {
  const raw = (company.raw_payload as Record<string, any>) || {}
  const scoreComponents = raw.score_breakdown || raw.components || {}
  const keywordScore = scoreComponents.keyword_score ?? scoreComponents.keyword ?? 65
  const llmRelevance = scoreComponents.llm_relevance ?? scoreComponents.relevance ?? 80
  const domainQuality = scoreComponents.domain_quality ?? scoreComponents.domain ?? 70
  const signalStrength = scoreComponents.signal_strength ?? scoreComponents.signal ?? 60
  const extractionConf = scoreComponents.extraction_confidence ?? scoreComponents.extraction ?? 75

  const components = [
    { label: 'Keyword Score', value: keywordScore, desc: 'How well intents matched' },
    { label: 'LLM Relevance', value: llmRelevance, desc: 'LLM judged relevance' },
    { label: 'Domain Quality', value: domainQuality, desc: 'MX records, domain age' },
    { label: 'Signal Strength', value: signalStrength, desc: 'How strong the buying signal was' },
    { label: 'Extraction Conf', value: extractionConf, desc: 'LLM confidence in extraction' },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Composite Score</span>
        <span className={cn(
          'text-lg font-bold',
          (company.relevance_score ?? 0) >= 70 ? 'text-green-600' :
          (company.relevance_score ?? 0) >= 40 ? 'text-amber-600' : 'text-red-600'
        )}>
          {company.relevance_score ?? 'N/A'}/100
          {company.relevance_score != null && <span className="text-xs text-muted-foreground ml-1">(threshold: 40)</span>}
        </span>
      </div>
      <div className="border-t border-border pt-3 space-y-2">
        {components.map((c) => (
          <div key={c.label} className="flex items-center justify-between">
            <div>
              <span className="text-sm text-foreground">{c.label}</span>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn(
                  'h-full rounded-full',
                  c.value >= 70 ? 'bg-green-500' : c.value >= 40 ? 'bg-amber-500' : 'bg-red-500'
                )} style={{ width: `${c.value}%` }} />
              </div>
              <span className="text-sm font-semibold text-foreground w-8 text-right">{c.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DiscoveredCompaniesPage() {
  const { client } = useAuth()
  const [companies, setCompanies] = useState<DiscoveredCompany[]>([])
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [brandFilter, setBrandFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [sourceFilter, setSourceFilter] = useState<string | undefined>(undefined)
  const [signalFilter, setSignalFilter] = useState<string | undefined>(undefined)
  const [scoreMin, setScoreMin] = useState<string>('')
  const [scoreMax, setScoreMax] = useState<string>('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [sourceNames, setSourceNames] = useState<string[]>([])
  const [signalTypes, setSignalTypes] = useState<string[]>([])

  useEffect(() => {
    fetchBrands()
    fetchSourceNames()
    fetchSignalTypes()
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [currentPage, statusFilter, sourceFilter, signalFilter, brandFilter])

  const fetchBrands = async () => {
    try {
      const { data } = await brandsAPI.list(client?.id)
      setBrands(data || [])
    } catch { }
  }

  const fetchSourceNames = async () => {
    try {
      const { data } = await discoveredCompaniesAPI.getSourceNames()
      setSourceNames(data)
    } catch { }
  }

  const fetchSignalTypes = async () => {
    try {
      const { data } = await discoveredCompaniesAPI.getSignalTypes()
      setSignalTypes(data)
    } catch { }
  }

  const fetchCompanies = async () => {
    setIsLoading(true)
    try {
      const { data, total, error } = await discoveredCompaniesAPI.list({
        brandId: brandFilter,
        status: statusFilter,
        sourceName: sourceFilter,
        signalType: signalFilter,
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
      toast.error(error.message || 'Failed to fetch discovered companies')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchCompanies()
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discovered Companies</h1>
          <p className="text-muted-foreground">Browse all companies found by the discovery engine</p>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
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
              <Select value={signalFilter || 'all'} onValueChange={(v) => { setSignalFilter(v === 'all' ? undefined : v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Signals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Signals</SelectItem>
                  {signalTypes.map(s => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <span className="text-xs text-muted-foreground font-medium">Score range:</span>
              <Input
                type="number"
                placeholder="Min"
                value={scoreMin}
                onChange={(e) => setScoreMin(e.target.value)}
                className="w-20 h-8 text-xs"
                min={0}
                max={100}
              />
              <span className="text-xs text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={scoreMax}
                onChange={(e) => setScoreMax(e.target.value)}
                className="w-20 h-8 text-xs"
                min={0}
                max={100}
              />
              <Button variant="outline" size="sm" onClick={handleSearch}>Apply</Button>
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
              <h3 className="text-lg font-medium text-foreground">No discovered companies</h3>
              <p className="text-muted-foreground">Run a discovery to start finding companies</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Signal</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Discovered</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <>
                      <TableRow
                        key={company.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setExpandedRow(expandedRow === company.id ? null : company.id)}
                      >
                        <TableCell>
                          {expandedRow === company.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{company.name || company.domain || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {company.domain ? (
                            <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline">
                              {company.domain}
                            </a>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {company.source_name || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {company.signal_type ? (
                            <Badge className={cn('text-xs border-0', SIGNAL_COLORS[company.signal_type] || 'bg-muted text-muted-foreground')}>
                              {company.signal_type.replace(/_/g, ' ')}
                            </Badge>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {company.relevance_score != null ? (
                            <span className={cn(
                              'font-bold text-sm',
                              company.relevance_score >= 70 ? 'text-green-600' :
                              company.relevance_score >= 40 ? 'text-amber-600' : 'text-red-600'
                            )}>
                              {company.relevance_score}
                            </span>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs border-0', ENRICHMENT_COLORS[company.enrichment_status] || 'bg-muted text-muted-foreground')}>
                            {company.enrichment_status?.charAt(0).toUpperCase() + company.enrichment_status?.slice(1) || 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatRelativeTime(company.discovered_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {company.error && (
                              <span className="relative group">
                                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-foreground text-background rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                  {company.error}
                                </span>
                              </span>
                            )}
                            {company.dead_letter && (
                              <XCircle className="h-3.5 w-3.5 text-red-400" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRow === company.id && (
                        <TableRow key={`${company.id}-detail`}>
                          <TableCell colSpan={9} className="bg-muted/30 p-0">
                            <div className="p-6 border-t border-border">
                              <div className="grid gap-6 lg:grid-cols-2">
                                <div className="space-y-5">
                                  <div>
                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                      <Brain className="h-4 w-4 text-muted-foreground" />
                                      LLM Extraction Result
                                    </h4>
                                    <div className="rounded-xl bg-card border border-border p-4 space-y-2">
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="text-muted-foreground">Company:</span> <span className="font-medium">{company.name || 'N/A'}</span></div>
                                        <div><span className="text-muted-foreground">Domain:</span> <span className="font-medium">{company.domain || 'N/A'}</span></div>
                                        {company.website && <div className="col-span-2"><span className="text-muted-foreground">Website:</span> <span className="font-medium">{company.website}</span></div>}
                                        {company.summary && <div className="col-span-2"><span className="text-muted-foreground">Summary:</span> <span className="font-medium text-xs">{company.summary}</span></div>}
                                        {company.fit_reason && <div className="col-span-2"><span className="text-muted-foreground">Fit Reason:</span> <span className="font-medium text-xs">{company.fit_reason}</span></div>}
                                        {company.confidence != null && <div><span className="text-muted-foreground">Confidence:</span> <span className="font-medium">{(company.confidence * 100).toFixed(0)}%</span></div>}
                                      </div>
                                      {(company.raw_payload as any)?.linkedin_url && (
                                        <a
                                          href={(company.raw_payload as any).linkedin_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          LinkedIn Profile
                                        </a>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                      <Target className="h-4 w-4 text-muted-foreground" />
                                      Score Breakdown
                                    </h4>
                                    <div className="rounded-xl bg-card border border-border p-4">
                                      <ScoreBreakdown company={company} />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-5">
                                  <div>
                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                      Intent Match
                                    </h4>
                                    <div className="rounded-xl bg-card border border-border p-4">
                                      {(company.raw_payload as any)?.intent_id ? (
                                        <div className="space-y-2">
                                          <div className="text-sm"><span className="text-muted-foreground">Intent ID:</span> <span className="font-medium">{(company.raw_payload as any).intent_id}</span></div>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground">No intent match information available</p>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                      Enrichment Status
                                    </h4>
                                    <div className="rounded-xl bg-card border border-border p-4">
                                      <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-muted-foreground">Status:</span> <span className="font-medium capitalize">{company.enrichment_status}</span></div>
                                        <div><span className="text-muted-foreground">Attempts:</span> <span className="font-medium">{company.enrichment_attempts}</span></div>
                                        {company.enrichment_source && <div className="col-span-2"><span className="text-muted-foreground">Source:</span> <span className="font-medium">{company.enrichment_source}</span></div>}
                                        {company.last_enrichment_at && <div className="col-span-2"><span className="text-muted-foreground">Last Enrichment:</span> <span className="font-medium">{formatRelativeTime(company.last_enrichment_at)}</span></div>}
                                        {company.enrichment_error && (
                                          <div className="col-span-2 p-2 bg-red-500/10 rounded-lg text-xs text-red-600">{company.enrichment_error}</div>
                                        )}
                                        {company.error && (
                                          <div className="col-span-2 p-2 bg-red-500/10 rounded-lg text-xs text-red-600">{company.error}</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {company.raw_payload && (
                                    <div>
                                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                        Raw Data
                                      </h4>
                                      <details className="rounded-xl bg-card border border-border">
                                        <summary className="px-4 py-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground">
                                          View raw payload JSON
                                        </summary>
                                        <div className="px-4 pb-4">
                                          <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-60 text-foreground">
                                            {JSON.stringify(company.raw_payload, null, 2)}
                                          </pre>
                                        </div>
                                      </details>
                                    </div>
                                  )}

                                  {company.dead_letter && (
                                    <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-2">
                                      <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                                      <span className="text-sm text-red-600">This company has been marked as a dead letter</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
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