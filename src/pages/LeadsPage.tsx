import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { type Lead, type BrandProfile, LEAD_STATUSES } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import Drawer from '@/components/Drawer'
import LeadImportForm from '@/components/forms/LeadImportForm'
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
  Users,
  Search,
  Upload,
  ChevronLeft,
  ChevronRight,
  Mail,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, formatNumber, cn } from '@/lib/utils'
import { leadsAPI, brandsAPI } from '@/lib/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

const PAGE_SIZE = 50

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
        perPage: PAGE_SIZE
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground">Manage and track your leads through the pipeline</p>
        </div>
        <Button onClick={() => setIsImportModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Import Leads
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={brandFilter} onValueChange={(v) => { setBrandFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="w-[180px]">
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
              <Button variant="outline" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-white/[0.04] border-t-primary shadow-2xl" />
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
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                          {lead.email || 'N/A'}
                        </a>
                      </TableCell>
                      <TableCell>{lead.domain || 'N/A'}</TableCell>
                      <TableCell>{lead.title || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[lead.status] || ''}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.lead_score != null ? (
                          <span className={cn(
                            'font-medium',
                            lead.lead_score >= 70 ? 'text-green-400' :
                            lead.lead_score >= 40 ? 'text-amber-400' : 'text-muted-foreground'
                          )}>
                            {lead.lead_score}
                          </span>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell className="capitalize">{lead.source || 'manual'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatRelativeTime(lead.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 rounded hover:bg-white/[0.06]">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
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
                  <span className="text-sm text-muted-foreground/80">
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
