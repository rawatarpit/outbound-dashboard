import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { brandsAPI, discoverySourcesAPI } from '@/lib/api'
import { DISCOVERY_SOURCE_TYPES } from '@/lib/supabase'
import { Globe, Search, Database, Shield, Key } from 'lucide-react'
import toast from 'react-hot-toast'

interface DiscoveryConfigFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const SOURCE_ICONS: Record<string, any> = {
  apollo: Globe,
  hunter: Search,
  apify: Database,
  github: Shield,
}

export default function DiscoveryConfigForm({ onCancel }: DiscoveryConfigFormProps) {
  const { client } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [brands, setBrands] = useState<any[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string>('')
  const [sources, setSources] = useState<any[]>([])
  const [sourceConfigs, setSourceConfigs] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (selectedBrandId) {
      fetchSources(selectedBrandId)
    }
  }, [selectedBrandId])

  const fetchBrands = async () => {
    try {
      const { data, error } = await brandsAPI.list(client?.id)
      if (error) throw error
      if (data && data.length > 0) {
        setBrands(data)
        setSelectedBrandId(data[0].id)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch brands')
    }
  }

  const fetchSources = async (brandId: string) => {
    setIsFetching(true)
    try {
      const { data, error } = await discoverySourcesAPI.list(brandId)
      if (error) throw error
      if (data) {
        setSources(data)
        const configs: Record<string, string> = {}
        for (const source of data) {
          const config = (source.config || {}) as Record<string, any>
          configs[source.id] = config.api_key || config.token || ''
        }
        setSourceConfigs(configs)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch discovery sources')
    } finally {
      setIsFetching(false)
    }
  }

  const handleKeyChange = (sourceId: string, value: string) => {
    setSourceConfigs(prev => ({ ...prev, [sourceId]: value }))
  }

  const handleUpdateKey = async (source: any) => {
    setIsLoading(true)
    try {
      const newKey = sourceConfigs[source.id]
      const payload = {
        brand_id: source.brand_id,
        config: {
          ...(source.config || {}),
          api_key: newKey || null,
          token: newKey || null,
        },
      }

      const { error } = await discoverySourcesAPI.update(source.id, payload)
      if (error) throw error

      toast.success(`Updated ${source.name} API key`)
      fetchSources(selectedBrandId)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update API key')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateAll = async () => {
    setIsLoading(true)
    try {
      for (const source of sources) {
        const newKey = sourceConfigs[source.id]
        const payload = {
          brand_id: source.brand_id,
          config: {
            ...(source.config || {}),
            api_key: newKey || null,
            token: newKey || null,
          },
        }
        const { error } = await discoverySourcesAPI.update(source.id, payload)
        if (error) throw error
      }

      toast.success('All API keys updated')
      fetchSources(selectedBrandId)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update API keys')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Brand</Label>
        <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.brand_name || brand.product}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {sources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No discovery sources configured for this brand</p>
            <p className="text-xs mt-1">Add discovery sources from the Discovery page first</p>
          </div>
        ) : (
          sources.map((source) => {
            const Icon = SOURCE_ICONS[source.type] || Key
            const sourceMeta = DISCOVERY_SOURCE_TYPES.find(s => s.id === source.type)
            
            return (
              <div key={source.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2 bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{source.name}</p>
                      <p className="text-xs text-muted-foreground">{sourceMeta?.label || source.type}</p>
                    </div>
                  </div>
                  <Badge variant={source.is_active ? 'success' : 'secondary'} className="text-xs">
                    {source.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={sourceConfigs[source.id] || ''}
                    onChange={(e) => handleKeyChange(source.id, e.target.value)}
                    placeholder={`Enter ${sourceMeta?.label || source.type} API key`}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateKey(source)}
                  isLoading={isLoading}
                  className="w-full"
                >
                  Update Key
                </Button>
              </div>
            )
          })
        )}
      </div>

      {sources.length > 0 && (
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateAll}
            isLoading={isLoading}
            className="flex-1"
          >
            Update All Keys
          </Button>
        </div>
      )}

      {sources.length === 0 && (
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Close
          </Button>
        </div>
      )}
    </div>
  )
}
