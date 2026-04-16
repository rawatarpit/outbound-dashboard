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
  Zap,
  Target,
  BarChart3,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, formatNumber, cn } from '@/lib/utils'
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
import { Tooltip } from '@/components/ui/Tooltip'

const SOURCE_COLORS: Record<string, { bg: string; icon: string; gradient: string }> = {
  apollo: { bg: 'bg-blue-50', icon: 'text-blue-600', gradient: 'from-blue-500 to-indigo-600' },
  apify: { bg: 'bg-emerald-50', icon: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600' },
  hunter: { bg: 'bg-amber-50', icon: 'text-amber-600', gradient: 'from-amber-500 to-orange-600' },
  default: { bg: 'bg-slate-50', icon: 'text-slate-600', gradient: 'from-slate-500 to-slate-600' }
}

function SourceDetailView({ 
  source, 
  onClose,
  onEdit,
  onToggle,
  onRun,
  onDelete
}: { 
  source: BrandDiscoverySource & { brand?: BrandProfile }
  onClose: () => void
  onEdit: () => void
  onToggle: () => void
  onRun: () => void
  onDelete: () => void
}) {
  const colors = SOURCE_COLORS[source.type] || SOURCE_COLORS.default
  
  const metrics = [
    { label: 'Total Records', value: source.total_records_fetched || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Companies Enriched', value: source.total_companies_enriched || 0, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Contacts Enriched', value: source.total_contacts_enriched || 0, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Success Rate', value: source.last_status === 'success' ? '100%' : source.last_status === 'failed' ? '0%' : 'N/A', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className={cn('rounded-2xl p-3', colors.bg)}>
            <Search className={cn('h-6 w-6', colors.icon)} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{source.name}</h2>
            <p className="text-slate-500">{DISCOVERY_SOURCE_TYPES.find(t => t.id === source.type)?.label || source.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onEdit}>
            Edit
          </Button>
          <Button onClick={onRun}>
            <Play className="h-4 w-4 mr-2" />
            Run Now
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-slate-200/50 shadow-lg shadow-slate-200/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn('rounded-xl p-2.5', metric.bg)}>
                  <metric.icon className={cn('h-5 w-5', metric.color)} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-900">{typeof metric.value === 'number' ? formatNumber(metric.value) : metric.value}</p>
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {source.brand && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Brand</span>
                <span className="text-sm font-semibold text-slate-900">{source.brand.brand_name}</span>
              </div>
            )}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Rate Limit</span>
              <span className="text-sm font-semibold text-slate-900">{source.rate_limit_per_min} requests/min</span>
            </div>
            {source.schedule_cron && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Schedule</span>
                <code className="text-xs bg-slate-200 px-2 py-1 rounded">{source.schedule_cron}</code>
              </div>
            )}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-600">Status</span>
              <Badge variant={source.is_active ? 'success' : 'secondary'}>
                {source.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Execution History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg">
                {source.is_running ? (
                  <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                ) : source.last_status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : source.last_status === 'failed' ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <Clock className="h-5 w-5 text-slate-400" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {source.is_running ? 'Running...' : source.last_status === 'success' ? 'Last run successful' : source.last_status === 'failed' ? 'Last run failed' : 'Never run'}
                  </p>
                  {source.last_run_at && (
                    <p className="text-xs text-slate-500">{formatRelativeTime(source.last_run_at)}</p>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={onRun}>
                  <Zap className="h-4 w-4 mr-1" />
                  Run
                </Button>
              </div>
              
              {source.last_error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Last Error</p>
                  <p className="text-xs text-red-600 mt-1">{source.last_error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">API Configuration</CardTitle>
          <Tooltip content="View API documentation">
            <a href="#" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ExternalLink className="h-4 w-4 text-slate-500" />
            </a>
          </Tooltip>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {source.api_key && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">API Key</span>
                <code className="text-xs bg-slate-200 px-2 py-1 rounded">••••••••••••</code>
              </div>
            )}
            {source.config && typeof source.config === 'object' && Object.entries(source.config).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-sm font-semibold text-slate-900">{String(value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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

      const sourcesWithBrand = data.map(s => ({
        ...s,
        brand: brands.find(b => b.id === s.brand_id)
      }))
      setSources(sourcesWithBrand)
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

  const handleAddSource = () => {
    setEditingSource(null)
    setIsModalOpen(true)
  }

  const handleViewDetail = (sourceId: string) => {
    setSelectedSourceId(sourceId)
  }

  const handleCloseDetail = () => {
    setSelectedSourceId(null)
  }

  const getStatusIcon = (source: BrandDiscoverySource) => {
    if (source.is_running) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (source.last_status === 'success') {
      return <CheckCircle className="h-4 w-4 text-emerald-500" />
    }
    if (source.last_status === 'failed') {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getSourceTypeLabel = (type: string) => {
    return DISCOVERY_SOURCE_TYPES.find(t => t.id === type)?.label || type
  }

  const selectedSource = sources.find(s => s.id === selectedSourceId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (selectedSource) {
    return (
      <SourceDetailView
        source={selectedSource}
        onClose={handleCloseDetail}
        onEdit={() => handleEditSource(selectedSource)}
        onToggle={() => handleToggleActive(selectedSource)}
        onRun={() => handleTriggerSource(selectedSource)}
        onDelete={() => handleDeleteSource(selectedSource)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Discovery Sources</h1>
            <Tooltip content="AI-powered data enrichment sources">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-700">AI Powered</span>
              </div>
            </Tooltip>
          </div>
          <p className="text-slate-500 mt-1">Configure data sources for automated company and contact discovery</p>
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
          <Button onClick={handleAddSource} className="bg-gradient-to-r from-indigo-600 to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      {sources.length === 0 ? (
        <Card className="border-slate-200/50 shadow-xl shadow-slate-200/20">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-6">
                <Search className="h-16 w-16 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Discovery Sources</h3>
            <p className="text-slate-500 text-center max-w-md mb-6">
              Configure your first data source to start automatically discovering and enriching companies
            </p>
            <Button onClick={handleAddSource} className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => {
            const colors = SOURCE_COLORS[source.type] || SOURCE_COLORS.default
            return (
              <Card 
                key={source.id} 
                className={cn(
                  'group border-slate-200/50 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-slate-300/20 transition-all duration-300 cursor-pointer',
                  !source.is_active && 'opacity-60'
                )}
                onClick={() => handleViewDetail(source.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('rounded-xl p-2.5', colors.bg)}>
                        <Search className={cn('h-5 w-5', colors.icon)} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-slate-900">{source.name}</CardTitle>
                        <p className="text-sm text-slate-500">{getSourceTypeLabel(source.type)}</p>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                          <MoreHorizontal className="h-5 w-5 text-slate-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditSource(source)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(source)}>
                            {source.is_active ? 'Disable' : 'Enable'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTriggerSource(source)}>
                            <Play className="h-4 w-4 mr-2" />
                            Run Now
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteSource(source)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={source.is_active ? 'success' : 'secondary'} className="font-medium">
                      {source.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Tooltip content={source.is_running ? 'Currently running' : source.last_status === 'success' ? 'Last run successful' : source.last_status === 'failed' ? 'Last run failed' : 'Not yet run'}>
                      <div>{getStatusIcon(source)}</div>
                    </Tooltip>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    {source.brand && (
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-500">Brand</span>
                        <span className="font-medium text-slate-700">{source.brand.brand_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500">Rate Limit</span>
                      <span className="font-medium text-slate-700">{source.rate_limit_per_min}/min</span>
                    </div>
                    {source.schedule_cron && (
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-500">Schedule</span>
                        <code className="text-xs bg-slate-200 px-2 py-0.5 rounded">{source.schedule_cron}</code>
                      </div>
                    )}
                    {source.last_run_at && (
                      <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-500">Last Run</span>
                        <span className="font-medium text-slate-700">{formatRelativeTime(source.last_run_at)}</span>
                      </div>
                    )}
                  </div>

                  {source.last_error && (
                    <div className="p-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                      {source.last_error}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Click to view details & analytics
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
              onSuccess={() => {
                setIsModalOpen(false)
                fetchSources()
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
        </Drawer>
      )}
    </div>
  )
}