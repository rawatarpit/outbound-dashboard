import { useState, useEffect } from 'react'
import { type BrandDiscoverySource, type BrandProfile, DISCOVERY_SOURCE_TYPES } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Drawer from '@/components/Drawer'
import DiscoverySourceForm from '@/components/forms/DiscoverySourceForm'
import {
  Search,
  Plus,
  Play,
  Trash2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  MoreHorizontal,
  ArrowLeft,
  TrendingUp,
  Users,
  Building2,
  Clock,
  Activity,
  Database
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, cn } from '@/lib/utils'
import { AnimatedCounter, StatCard, SectionHeader } from '@/components/DashboardComponents'
import { discoverySourcesAPI, brandsAPI } from '@/lib/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

const SOURCE_COLORS: Record<string, { bgColor: string; iconColor: string }> = {
  apollo: { bgColor: '#6366f112', iconColor: '#6366f1' },
  apify: { bgColor: '#6366f112', iconColor: '#6366f1' },
  hunter: { bgColor: '#6366f112', iconColor: '#6366f1' },
  default: { bgColor: '#6366f112', iconColor: '#6366f1' }
}

function SourceDetailView({ 
  source, 
  onClose,
  onEdit,
  onRun
}: { 
  source: BrandDiscoverySource & { brand?: BrandProfile }
  onClose: () => void
  onEdit: () => void
  onRun: () => void
}) {
  const colors = SOURCE_COLORS[source.type] || SOURCE_COLORS.default
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className="rounded-lg p-3" style={{ backgroundColor: colors.bgColor }}>
            <Search className="h-6 w-6" style={{ color: colors.iconColor }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{source.name}</h2>
            <p className="text-muted-foreground">{DISCOVERY_SOURCE_TYPES.find(t => t.id === source.type)?.label || source.type}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onEdit}>
          Edit
        </Button>
        <Button onClick={onRun}>
          <Play className="h-4 w-4 mr-2" />
          Run Now
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3b82f612' }}>
              <Users className="h-5 w-5" style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={(source as any).total_records_fetched || 0} /></p>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#22c55e12' }}>
              <Building2 className="h-5 w-5" style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={(source as any).total_companies_enriched || 0} /></p>
              <p className="text-sm text-muted-foreground">Companies Enriched</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8b5cf612' }}>
              <Users className="h-5 w-5" style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={(source as any).total_contacts_enriched || 0} /></p>
              <p className="text-sm text-muted-foreground">Contacts Enriched</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: source.last_status === 'success' ? '#10b98112' : source.last_status === 'failed' ? '#ef444412' : '#a3a3a312' }}>
              <TrendingUp className="h-5 w-5" style={{ color: source.last_status === 'success' ? '#10b981' : source.last_status === 'failed' ? '#ef4444' : '#a3a3a3' }} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight" style={{ color: source.last_status === 'success' ? '#10b981' : source.last_status === 'failed' ? '#ef4444' : 'inherit' }}>
                {source.last_status === 'success' ? '100%' : source.last_status === 'failed' ? '0%' : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {source.brand && (
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Brand</span>
                <span className="font-medium">{source.brand.brand_name}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Rate Limit</span>
              <span className="font-medium">{source.rate_limit_per_min}/min</span>
            </div>
            {source.schedule_cron && (
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Schedule</span>
                <code className="text-sm bg-muted px-2 py-1 rounded text-foreground">{source.schedule_cron}</code>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={source.is_active ? 'success' : 'secondary'}>
                {source.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">

          <CardHeader>
            <CardTitle>Execution History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {source.is_running ? (
                <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
              ) : source.last_status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : source.last_status === 'failed' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Clock className="h-5 w-5 text-muted-foreground/50" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {source.is_running ? 'Running...' : source.last_status === 'success' ? 'Last run successful' : source.last_status === 'failed' ? 'Last run failed' : 'Never run'}
                </p>
                {source.last_run_at && (
                  <p className="text-sm text-muted-foreground">{formatRelativeTime(source.last_run_at)}</p>
                )}
              </div>
            </div>
            {source.last_error && (
              <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                <p className="text-sm font-medium text-red-400">Last Error</p>
                <p className="text-xs text-red-400 mt-1">{source.last_error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DiscoveryPage() {
  const { client } = useAuth()
  const [sources, setSources] = useState<(BrandDiscoverySource & { brand?: BrandProfile })[]>([])
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [brandFilter, setBrandFilter] = useState<string | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<BrandDiscoverySource | null>(null)
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    fetchSources()
  }, [brandFilter])

  const fetchBrands = async () => {
    try {
      const { data } = await brandsAPI.list(client?.id)
      setBrands(data || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchSources = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await discoverySourcesAPI.list(brandFilter || undefined)
      if (error) throw error
      setSources(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch sources')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (source: BrandDiscoverySource) => {
    try {
      const { error } = await discoverySourcesAPI.update(source.id, { is_active: !source.is_active })
      if (error) throw error
      toast.success(`${source.is_active ? 'Disabled' : 'Enabled'} ${source.name}`)
      fetchSources()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update source')
    }
  }

  const handleTriggerSource = async (source: BrandDiscoverySource) => {
    try {
      if (!source.brand_id) throw new Error('Source has no brand')
      const { error } = await brandsAPI.triggerDiscovery(source.brand_id)
      if (error) throw error
      toast.success(`Discovery triggered for ${source.name}`)
      fetchSources()
    } catch (error: any) {
      toast.error(error.message || 'Failed to trigger discovery')
    }
  }

  const handleDeleteSource = async (source: BrandDiscoverySource) => {
    if (!confirm(`Delete ${source.name}?`)) return
    try {
      const { error } = await discoverySourcesAPI.delete(source.id)
      if (error) throw error
      toast.success('Source deleted')
      fetchSources()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete source')
    }
  }

  const handleEditSource = (source: BrandDiscoverySource) => {
    setEditingSource(source)
    setIsModalOpen(true)
  }

  const getStatusIcon = (source: BrandDiscoverySource) => {
    if (source.is_running) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
    if (source.last_status === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (source.last_status === 'failed') return <AlertCircle className="h-4 w-4 text-red-500" />
    return null
  }

  const getSourceTypeLabel = (type: string) => {
    return DISCOVERY_SOURCE_TYPES.find(t => t.id === type)?.label || type
  }

  const selectedSource = sources.find(s => s.id === selectedSourceId)

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

  if (selectedSource) {
    return (
      <SourceDetailView
        source={selectedSource}
        onClose={() => setSelectedSourceId(null)}
        onEdit={() => handleEditSource(selectedSource)}
        onRun={() => handleTriggerSource(selectedSource)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Discovery Sources</span>
          </h1>
          <p className="text-muted-foreground mt-1">Configure data sources for company and contact discovery</p>
        </div>
        <div className="flex items-center gap-4">
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
          <Button onClick={() => { setEditingSource(null); setIsModalOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      {/* ── KPI Ribbon ── */}
      {sources.length > 0 && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatCard icon={Search} label="Total Sources" value={<AnimatedCounter value={sources.length} />}
            subvalue={`${sources.filter(s => s.is_active).length} active`} color="#6366f1" />
          <StatCard icon={Activity} label="Active Sources" value={<AnimatedCounter value={sources.filter(s => s.is_active).length} />}
            subvalue={`${sources.filter(s => !s.is_active).length} inactive`} color="#22c55e" />
          <StatCard icon={Database} label="Total Records" value={<AnimatedCounter value={sources.reduce((sum, s) => sum + ((s as any).total_records_fetched || 0), 0)} />}
            subvalue={`across ${sources.length} sources`} color="#a855f7" />
          <StatCard icon={CheckCircle} label="Success Rate" value={`${sources.length > 0 ? Math.round((sources.filter(s => s.last_status === 'success').length / sources.length) * 100) : 0}%`}
            subvalue={`${sources.filter(s => s.last_status === 'failed').length} failed`} color="#f59e0b" />
        </div>
      )}

      {sources.length === 0 ? (
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#6366f112' }}>
              <Search className="h-7 w-7" style={{ color: '#6366f1' }} />
            </div>
            <h3 className="text-lg font-medium text-foreground">No discovery sources</h3>
            <p className="text-muted-foreground mb-4">Configure your first data source to start discovering companies</p>
            <Button onClick={() => { setEditingSource(null); setIsModalOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <SectionHeader icon={Search} title="Discovery Sources" subtitle={`${sources.length} configured sources`} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => {
            const colors = SOURCE_COLORS[source.type] || SOURCE_COLORS.default
            return (
              <Card 
                key={source.id} 
                className={cn('hover:shadow-md transition-shadow cursor-pointer', !source.is_active && 'opacity-60')}
                onClick={() => setSelectedSourceId(source.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2" style={{ backgroundColor: colors.bgColor }}>
                        <Search className="h-5 w-5" style={{ color: colors.iconColor }} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{source.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{getSourceTypeLabel(source.type)}</p>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded hover:bg-accent">
                          <MoreHorizontal className="h-5 w-5 text-muted-foreground/50" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditSource(source)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(source)}>
                            {source.is_active ? 'Disable' : 'Enable'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTriggerSource(source)}>
                            <Play className="h-4 w-4 mr-2" />
                            Run Now
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteSource(source)} className="text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={source.is_active ? 'success' : 'secondary'}>
                      {source.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {getStatusIcon(source)}
                  </div>
                  <div className="space-y-2 text-sm">
                    {source.brand && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Brand</span>
                        <span className="font-medium">{source.brand.brand_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate Limit</span>
                      <span>{source.rate_limit_per_min}/min</span>
                    </div>
                    {source.last_run_at && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Run</span>
                        <span>{formatRelativeTime(source.last_run_at)}</span>
                      </div>
                    )}
                  </div>
                  {source.last_error && (
                    <div className="p-2 bg-red-500/10 rounded text-xs text-red-400">{source.last_error}</div>
                  )}
                </CardContent>
              </Card>
            )
            })}
        </div>
        </div>
      )}

      {brands.length > 0 && (
        <Drawer
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSource ? 'Edit Source' : 'Add Discovery Source'}
          size="md"
        >
          {isModalOpen && (
            <DiscoverySourceForm
              brandId={brandFilter || brands[0]?.id || ''}
              source={editingSource}
              onSuccess={() => { setIsModalOpen(false); fetchSources() }}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
        </Drawer>
      )}
    </div>
  )
}