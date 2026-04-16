import { useState, useEffect } from 'react'
import { type BrandDiscoverySource, type BrandProfile, DISCOVERY_SOURCE_TYPES } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Modal from '@/components/Modal'
import DiscoverySourceForm from '@/components/forms/DiscoverySourceForm'
import {
  Search,
  Plus,
  Play,
  Pause,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  MoreHorizontal,
  BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime } from '@/lib/utils'
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

export default function DiscoveryPage() {
  const [sources, setSources] = useState<(BrandDiscoverySource & { brand?: BrandProfile })[]>([])
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [brandFilter, setBrandFilter] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<BrandDiscoverySource | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    fetchSources()
  }, [brandFilter])

  const fetchBrands = async () => {
    try {
      const { data } = await brandsAPI.list()
      setBrands(data)
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
      toast.success('Discovery triggered for ' + source.name)
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

  const getStatusIcon = (source: BrandDiscoverySource) => {
    if (source.is_running) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
    }
    if (source.last_status === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (source.last_status === 'failed') {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getSourceTypeLabel = (type: string) => {
    return DISCOVERY_SOURCE_TYPES.find(t => t.id === type)?.label || type
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
          <h1 className="text-2xl font-bold text-gray-900">Discovery Sources</h1>
          <p className="text-gray-500">Configure data sources for company and contact discovery</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Brands</SelectItem>
              {brands.map(brand => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.brand_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddSource}>
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
            <Button onClick={handleAddSource}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <Card key={source.id} className={cn('hover:shadow-md transition-shadow', !source.is_active && 'opacity-60')}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'rounded-lg p-2',
                      source.type === 'apollo' ? 'bg-blue-50' :
                      source.type === 'apify' ? 'bg-green-50' :
                      source.type === 'hunter' ? 'bg-amber-50' :
                      'bg-gray-50'
                    )}>
                      <Search className={cn(
                        'h-5 w-5',
                        source.type === 'apollo' ? 'text-blue-600' :
                        source.type === 'apify' ? 'text-green-600' :
                        source.type === 'hunter' ? 'text-amber-600' :
                        'text-gray-600'
                      )} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{source.name}</CardTitle>
                      <p className="text-sm text-gray-500">{getSourceTypeLabel(source.type)}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal className="h-5 w-5 text-gray-400" />
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
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  {source.schedule_cron && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Schedule</span>
                      <code className="text-xs bg-gray-100 px-1 rounded">{source.schedule_cron}</code>
                    </div>
                  )}
                  {source.last_run_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Run</span>
                      <span>{formatRelativeTime(source.last_run_at)}</span>
                    </div>
                  )}
                </div>

                {source.last_error && (
                  <div className="p-2 bg-red-50 rounded text-xs text-red-600">
                    {source.last_error}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {brands.length > 0 && (
        <Modal
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
        </Modal>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
