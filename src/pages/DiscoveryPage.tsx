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
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, cn } from '@/lib/utils'
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

const SOURCE_COLORS: Record<string, { bg: string; icon: string }> = {
  apollo: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  apify: { bg: 'bg-green-50', icon: 'text-green-600' },
  hunter: { bg: 'bg-amber-50', icon: 'text-amber-600' },
  default: { bg: 'bg-gray-50', icon: 'text-gray-600' }
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
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div className={cn('rounded-lg p-3', colors.bg)}>
            <Search className={cn('h-6 w-6', colors.icon)} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{source.name}</h2>
            <p className="text-gray-500">{DISCOVERY_SOURCE_TYPES.find(t => t.id === source.type)?.label || source.type}</p>
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{source.total_records_fetched || 0}</p>
                <p className="text-sm text-gray-500">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{source.total_companies_enriched || 0}</p>
                <p className="text-sm text-gray-500">Companies Enriched</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{source.total_contacts_enriched || 0}</p>
                <p className="text-sm text-gray-500">Contacts Enriched</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {source.last_status === 'success' ? '100%' : source.last_status === 'failed' ? '0%' : 'N/A'}
                </p>
                <p className="text-sm text-gray-500">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {source.brand && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Brand</span>
                <span className="font-medium">{source.brand.brand_name}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Rate Limit</span>
              <span className="font-medium">{source.rate_limit_per_min}/min</span>
            </div>
            {source.schedule_cron && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Schedule</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{source.schedule_cron}</code>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Status</span>
              <Badge variant={source.is_active ? 'success' : 'secondary'}>
                {source.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
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
                <Clock className="h-5 w-5 text-gray-400" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {source.is_running ? 'Running...' : source.last_status === 'success' ? 'Last run successful' : source.last_status === 'failed' ? 'Last run failed' : 'Never run'}
                </p>
                {source.last_run_at && (
                  <p className="text-sm text-gray-500">{formatRelativeTime(source.last_run_at)}</p>
                )}
              </div>
            </div>
            {source.last_error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">Last Error</p>
                <p className="text-xs text-red-600 mt-1">{source.last_error}</p>
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Discovery Sources</h1>
          <p className="text-gray-500">Configure data sources for company and contact discovery</p>
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

      {sources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No discovery sources</h3>
            <p className="text-gray-500 mb-4">Configure your first data source to start discovering companies</p>
            <Button onClick={() => { setEditingSource(null); setIsModalOpen(true) }}>
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
                className={cn('hover:shadow-md transition-shadow cursor-pointer', !source.is_active && 'opacity-60')}
                onClick={() => setSelectedSourceId(source.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('rounded-lg p-2', colors.bg)}>
                        <Search className={cn('h-5 w-5', colors.icon)} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{source.name}</CardTitle>
                        <p className="text-sm text-gray-500">{getSourceTypeLabel(source.type)}</p>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal className="h-5 w-5 text-gray-400" />
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
                          <DropdownMenuItem onClick={() => handleDeleteSource(source)} className="text-red-600">
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
                        <span className="text-gray-500">Brand</span>
                        <span className="font-medium">{source.brand.brand_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rate Limit</span>
                      <span>{source.rate_limit_per_min}/min</span>
                    </div>
                    {source.last_run_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Run</span>
                        <span>{formatRelativeTime(source.last_run_at)}</span>
                      </div>
                    )}
                  </div>
                  {source.last_error && (
                    <div className="p-2 bg-red-50 rounded text-xs text-red-600">{source.last_error}</div>
                  )}
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
              onSuccess={() => { setIsModalOpen(false); fetchSources() }}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
        </Drawer>
      )}
    </div>
  )
}