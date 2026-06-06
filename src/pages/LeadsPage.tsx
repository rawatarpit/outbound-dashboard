import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { type Lead, type BrandProfile, LEAD_STATUSES } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Drawer from '@/components/Drawer'
import LeadImportForm from '@/components/forms/LeadImportForm'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Users, Search, Upload, ChevronLeft, ChevronRight, Mail, ExternalLink, MoreHorizontal, Target, TrendingUp, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, formatNumber, cn } from '@/lib/utils'
import { leadsAPI, brandsAPI } from '@/lib/api'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu'

const PAGE_SIZE = 50

const STATUS_CONFIG: Record<string, { dot: string; bg: string; text: string }> = {
  new: { dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300' },
  researching: { dot: 'bg-slate-500', bg: 'bg-slate-50 dark:bg-slate-950/30', text: 'text-slate-700 dark:text-slate-300' },
  qualified: { dot: 'bg-green-500', bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-300' },
  icp_passed: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300' },
  contacted: { dot: 'bg-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300' },
  replied: { dot: 'bg-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300' },
  negotiating: { dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300' },
  closed_won: { dot: 'bg-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300 font-semibold' },
  closed_lost: { dot: 'bg-gray-400', bg: 'bg-gray-50 dark:bg-gray-950/30', text: 'text-gray-500 dark:text-gray-400' },
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const SOURCE_PALETTE = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-pink-500',
  'bg-orange-500',
]

export default function LeadsPage() {
  const { client } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [brandFilter, setBrandFilter] = useState<string | undefined>(undefined)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [currentPage, statusFilter, brandFilter])

  const fetchBrands = async () => {
    try {
      const { data } = await brandsAPI.list(client?.id)
      setBrands(data)
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchLeads = async () => {
    setIsLoading(true)
    try {
      const { data, total, error } = await leadsAPI.list({
        clientId: client?.id,
        brandId: brandFilter || undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        page: currentPage,
        perPage: PAGE_SIZE,
      })
      if (error) throw error
      setLeads(data)
      setTotalCount(total)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch leads')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchLeads()
  }

  const handleDeleteLead = async (lead: Lead) => {
    if (!confirm(`Delete lead ${lead.full_name || lead.email}?`)) return
    try {
      const { error } = await leadsAPI.delete(lead.id)
      if (error) throw error
      toast.success('Lead deleted')
      fetchLeads()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete lead')
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const stats = useMemo(() => {
    const newLeads = leads.filter(l => l.status === 'new').length
    const contacted = leads.filter(l => l.status === 'contacted').length
    const won = leads.filter(l => l.status === 'closed_won').length
    return [
      { label: 'Total Leads', value: formatNumber(totalCount), icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
      { label: 'New', value: formatNumber(newLeads), icon: Target, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
      { label: 'Contacted', value: formatNumber(contacted), icon: TrendingUp, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
      { label: 'Won', value: formatNumber(won), icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    ]
  }, [leads, totalCount])

  const sourceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    leads.forEach(l => {
      const src = l.source || 'manual'
      counts[src] = (counts[src] || 0) + 1
    })
    const total = leads.length || 1
    return Object.entries(counts)
      .map(([source, count], i) => ({
        source,
        count,
        percentage: Math.round((count / total) * 100),
        color: SOURCE_PALETTE[i % SOURCE_PALETTE.length],
      }))
      .sort((a, b) => b.count - a.count)
  }, [leads])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Leads</span>
          </h1>
          <p className="text-muted-foreground">Manage and track your leads through the pipeline</p>
        </div>
        <Button onClick={() => setIsImportModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Import Leads
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={cn('rounded-xl p-3', stat.bg)}>
                  <Icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {sourceBreakdown.length > 0 && (
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Lead Sources</h3>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-muted">
              {sourceBreakdown.map(s => (
                <div
                  key={s.source}
                  className={cn(s.color, 'transition-all')}
                  style={{ width: `${s.percentage}%` }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              {sourceBreakdown.map(s => (
                <div key={s.source} className="flex items-center gap-2 text-sm">
                  <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', s.color)} />
                  <span className="text-foreground capitalize">{s.source}</span>
                  <span className="text-muted-foreground">{s.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter || 'all'} onValueChange={v => { setStatusFilter(v === 'all' ? undefined : v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {LEAD_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {formatStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={brandFilter || 'all'} onValueChange={v => { setBrandFilter(v === 'all' ? undefined : v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.brand_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4 mr-1.5" />
                Search
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-border border-t-primary shadow-2xl" />
                <div className="absolute inset-0 animate-pulse rounded-full h-10 w-10 bg-primary/5 blur-xl" />
              </div>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No leads found</h3>
              <p className="text-muted-foreground">Import leads or adjust your filters</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map(lead => {
                    const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new
                    return (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          {lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                            {lead.email || 'N/A'}
                          </a>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{lead.domain || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{lead.title || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', statusCfg.bg, statusCfg.text)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
                            {formatStatusLabel(lead.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {lead.lead_score != null ? (
                            <span className={cn(
                              'font-mono text-sm font-medium',
                              lead.lead_score >= 70 ? 'text-emerald-600 dark:text-emerald-400' :
                              lead.lead_score >= 40 ? 'text-amber-600 dark:text-amber-400' :
                              'text-muted-foreground'
                            )}>
                              {lead.lead_score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-sm capitalize text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                            {lead.source || 'manual'}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {formatRelativeTime(lead.created_at)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1.5 rounded-md hover:bg-accent transition-colors">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem asChild>
                                <Link to={`/leads/${lead.id}`}>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {lead.email && (
                                <DropdownMenuItem asChild>
                                  <a href={`mailto:${lead.email}`}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteLead(lead)}
                                className="text-destructive focus:text-destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {formatNumber(totalCount)} leads
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Drawer
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Leads"
        description="Upload a CSV file to import leads in bulk"
        size="lg"
      >
        <LeadImportForm
          brands={brands}
          onSuccess={() => {
            setIsImportModalOpen(false)
            fetchLeads()
          }}
          onCancel={() => setIsImportModalOpen(false)}
        />
      </Drawer>
    </div>
  )
}
