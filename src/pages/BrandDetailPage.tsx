import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, type BrandProfile } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import Modal from '@/components/Modal'
import BrandForm from '@/components/forms/BrandForm'
import DiscoverySourceForm from '@/components/forms/DiscoverySourceForm'
import {
  ArrowLeft,
  Building2,
  Mail,
  Search,
  Settings,
  BarChart3,
  Play,
  Pause,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime } from '@/lib/utils'
import type { BrandDiscoverySource } from '@/lib/supabase'

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [brand, setBrand] = useState<BrandProfile | null>(null)
  const [discoverySources, setDiscoverySources] = useState<BrandDiscoverySource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false)

  useEffect(() => {
    if (id) {
      fetchBrand()
      fetchDiscoverySources()
    }
  }, [id])

  const fetchBrand = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setBrand(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch brand')
      navigate('/brands')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDiscoverySources = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_discovery_sources')
        .select('*')
        .eq('brand_id', id)

      if (error) throw error
      setDiscoverySources(data || [])
    } catch (error: any) {
      console.error('Failed to fetch discovery sources:', error)
    }
  }

  const handleToggleDiscovery = async (enabled: boolean) => {
    if (!brand) return
    try {
      const { error } = await supabase
        .from('brand_profiles')
        .update({ discovery_enabled: enabled })
        .eq('id', brand.id)

      if (error) throw error
      setBrand({ ...brand, discovery_enabled: enabled })
      toast.success(`Discovery ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update brand')
    }
  }

  const handleToggleOutbound = async (enabled: boolean) => {
    if (!brand) return
    try {
      const { error } = await supabase
        .from('brand_profiles')
        .update({ outbound_enabled: enabled, send_enabled: enabled })
        .eq('id', brand.id)

      if (error) throw error
      setBrand({ ...brand, outbound_enabled: enabled, send_enabled: enabled })
      toast.success(`Outbound ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update brand')
    }
  }

  const handleTogglePause = async () => {
    if (!brand) return
    try {
      const { error } = await supabase
        .from('brand_profiles')
        .update({ is_paused: !brand.is_paused })
        .eq('id', brand.id)

      if (error) throw error
      setBrand({ ...brand, is_paused: !brand.is_paused })
      toast.success(`${brand.is_paused ? 'Resumed' : 'Paused'}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update brand')
    }
  }

  const handleTriggerDiscovery = async () => {
    if (!brand) return
    try {
      const { error } = await supabase
        .from('brand_profiles')
        .update({ manual_discovery_requested: true })
        .eq('id', brand.id)

      if (error) throw error
      toast.success('Discovery triggered')
    } catch (error: any) {
      toast.error(error.message || 'Failed to trigger discovery')
    }
  }

  const handleDeleteSource = async (source: BrandDiscoverySource) => {
    if (!confirm(`Delete ${source.name}?`)) return
    try {
      const { error } = await supabase
        .from('brand_discovery_sources')
        .delete()
        .eq('id', source.id)

      if (error) throw error
      toast.success('Source deleted')
      fetchDiscoverySources()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete source')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Brand not found</p>
        <Button onClick={() => navigate('/brands')} className="mt-4">
          Back to Brands
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/brands')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{brand.brand_name}</h1>
            {brand.is_active ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
            {brand.is_paused && <Badge variant="warning">Paused</Badge>}
            {brand.auto_paused && <Badge variant="destructive">Auto-Paused</Badge>}
          </div>
          <p className="text-gray-500">{brand.product}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {brand.discovery_enabled && (
            <Button onClick={handleTriggerDiscovery}>
              <Play className="h-4 w-4 mr-2" />
              Run Discovery
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Discovery</p>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={brand.discovery_enabled}
                    onCheckedChange={handleToggleDiscovery}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Outbound</p>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={brand.outbound_enabled}
                    onCheckedChange={handleToggleOutbound}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-2">
                <Pause className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTogglePause}
                  className="h-auto p-0"
                >
                  {brand.is_paused ? 'Resume' : 'Pause'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="discovery">Discovery Sources</TabsTrigger>
          <TabsTrigger value="settings">Email Settings</TabsTrigger>
          <TabsTrigger value="llm">LLM Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Brand Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Product</p>
                  <p>{brand.product}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Positioning</p>
                  <p className="text-gray-700">{brand.positioning || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tone</p>
                  <p className="capitalize">{brand.tone || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Audience</p>
                  <p className="text-gray-700">{brand.audience || 'Not set'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Sent</span>
                  <span className="font-medium">{brand.sent_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bounce Count</span>
                  <span className="font-medium">{brand.bounce_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Complaint Count</span>
                  <span className="font-medium">{brand.complaint_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Daily Limit</span>
                  <span className="font-medium">{brand.daily_send_limit || 'Unlimited'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hourly Limit</span>
                  <span className="font-medium">{brand.hourly_send_limit || 'Unlimited'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="discovery">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Discovery Sources</CardTitle>
                <CardDescription>Configure data sources for company and contact discovery</CardDescription>
              </div>
              <Button onClick={() => setIsSourceModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </CardHeader>
            <CardContent>
              {discoverySources.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No discovery sources configured</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {discoverySources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-purple-50 p-2">
                          <Search className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{source.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {source.is_running && (
                          <Badge variant="warning">Running</Badge>
                        )}
                        {source.last_run_at && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {formatRelativeTime(source.last_run_at)}
                          </div>
                        )}
                        {source.last_status && (
                          <Badge
                            variant={source.last_status === 'success' ? 'success' : 'destructive'}
                          >
                            {source.last_status}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSource(source)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Provider</p>
                  <p className="capitalize">{brand.provider || 'SMTP'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Transport Mode</p>
                  <p className="capitalize">{brand.transport_mode || 'mailbox'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">SMTP Host</p>
                  <p>{brand.smtp_host || 'Not configured'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">SMTP Port</p>
                  <p>{brand.smtp_port || 'Not configured'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">From Email</p>
                  <p>{brand.smtp_email || 'Not configured'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sending Domain</p>
                  <p>{brand.sending_domain || 'Not configured'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llm">
          <Card>
            <CardHeader>
              <CardTitle>LLM Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Model Override</p>
                  <p>{brand.llm_model_override || 'Using default'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Temperature</p>
                  <p>{brand.llm_temperature ?? 'Using default'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Brand"
        size="lg"
      >
        <BrandForm
          brand={brand}
          onSuccess={() => {
            setIsEditModalOpen(false)
            fetchBrand()
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        title="Add Discovery Source"
        size="md"
      >
        <DiscoverySourceForm
          brandId={brand.id}
          onSuccess={() => {
            setIsSourceModalOpen(false)
            fetchDiscoverySources()
          }}
          onCancel={() => setIsSourceModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
