import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { type BrandProfile, type BrandIntent } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import Drawer from '@/components/Drawer'
import BrandForm from '@/components/forms/BrandForm'
import DiscoverySourceForm from '@/components/forms/DiscoverySourceForm'
import {
  ArrowLeft,
  Mail,
  Search,
  Settings,
  Plus,
  Trash2,
  Clock,
  Target,
  Sparkles,
  Activity,
  Brain,
  Zap,
  Radio,
  BarChart3,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime } from '@/lib/utils'
import { brandsAPI, discoverySourcesAPI, brandIntentsAPI } from '@/lib/api'
import type { BrandDiscoverySource } from '@/lib/supabase'

export default function BrandDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [brand, setBrand] = useState<BrandProfile | null>(null)
  const [discoverySources, setDiscoverySources] = useState<BrandDiscoverySource[]>([])
  const [intents, setIntents] = useState<BrandIntent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false)
  const [isIntentDrawerOpen, setIsIntentDrawerOpen] = useState(false)
  const [editingIntent, setEditingIntent] = useState<BrandIntent | null>(null)
  const [intentForm, setIntentForm] = useState({ intent: '', signals: [] as string[], priority: 0 })

  useEffect(() => {
    if (id) {
      fetchBrand()
      fetchDiscoverySources()
      fetchIntents()
    }
  }, [id])

  const fetchBrand = async () => {
    try {
      const { data, error } = await brandsAPI.get(id!)
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
      const { data, error } = await discoverySourcesAPI.list(id)
      if (error) throw error
      setDiscoverySources(data)
    } catch (error: any) {
      console.error('Failed to fetch discovery sources:', error)
    }
  }

  const fetchIntents = async () => {
    if (!id) return
    try {
      const { data, error } = await brandIntentsAPI.list(id)
      if (error) throw error
      setIntents(data as BrandIntent[])
    } catch (error: any) {
      console.error('Failed to fetch intents:', error)
    }
  }

  const openIntentDrawer = (intent?: BrandIntent) => {
    if (intent) {
      setEditingIntent(intent)
      setIntentForm({ intent: intent.intent, signals: [...intent.signals], priority: intent.priority - 1 })
    } else {
      setEditingIntent(null)
      setIntentForm({ intent: '', signals: [], priority: 0 })
    }
    setIsIntentDrawerOpen(true)
  }

  const handleSaveIntent = async () => {
    if (!id) return
    if (!intentForm.intent.trim()) {
      toast.error('Intent description is required')
      return
    }
    try {
      const payload = {
        intent: intentForm.intent,
        signals: intentForm.signals,
        priority: intentForm.priority + 1,
      }
      if (editingIntent) {
        const { error } = await brandIntentsAPI.update(editingIntent.id, payload)
        if (error) throw error
        toast.success('Intent updated')
      } else {
        const { error } = await brandIntentsAPI.create({ ...payload, brand_id: id })
        if (error) throw error
        toast.success('Intent created')
      }
      setIsIntentDrawerOpen(false)
      fetchIntents()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save intent')
    }
  }

  const handleDeleteIntent = async (intentId: string) => {
    if (!confirm('Delete this intent?')) return
    try {
      const { error } = await brandIntentsAPI.delete(intentId)
      if (error) throw error
      toast.success('Intent deleted')
      fetchIntents()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete intent')
    }
  }

  const handleToggleIntentActive = async (intent: BrandIntent) => {
    try {
      const { error } = await brandIntentsAPI.update(intent.id, { is_active: !intent.is_active })
      if (error) throw error
      toast.success(`Intent ${intent.is_active ? 'disabled' : 'enabled'}`)
      fetchIntents()
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle intent')
    }
  }

  const handleToggleDiscovery = async (enabled: boolean) => {
    if (!brand) return
    try {
      const { error } = await brandsAPI.update(brand.id, { discovery_enabled: enabled })
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
      const { error } = await brandsAPI.update(brand.id, { outbound_enabled: enabled, send_enabled: enabled })
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
      const { error } = await brandsAPI.update(brand.id, { is_paused: !brand.is_paused })
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
      const { error } = await brandsAPI.triggerDiscovery(brand.id)
      if (error) throw error
      toast.success('Discovery triggered')
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
      fetchDiscoverySources()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete source')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-foreground" />
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6 shadow-inner">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Brand not found</h2>
        <p className="text-muted-foreground mb-8">The brand you're looking for doesn't exist or has been removed</p>
        <button
          onClick={() => navigate('/brands')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-primary-foreground hover:opacity-90 shadow-md text-sm font-bold transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Brands
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-10 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ───── Header ───── */}
        <div className="relative overflow-hidden rounded-2xl bg-card p-8 shadow-lg border border-border">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate('/brands')}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-accent border border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-foreground/20 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="h-px flex-1 bg-border" />
              <span className="text-muted-foreground/30 text-[11px] font-semibold tracking-[0.25em] uppercase">Brand Profile</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{brand.brand_name}</h1>
                  <div className="flex items-center gap-2">
                    {brand.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-foreground/5 border border-foreground/10 px-3 py-1 rounded-full tracking-wide uppercase">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground bg-muted border border-border px-3 py-1 rounded-full tracking-wide uppercase">
                        Inactive
                      </span>
                    )}
                    {brand.is_paused && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground bg-muted border border-border px-3 py-1 rounded-full tracking-wide uppercase">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />
                        Paused
                      </span>
                    )}
                    {brand.auto_paused && (
                      <span className="inline-flex items-center text-[11px] font-semibold text-muted-foreground bg-muted border border-border px-3 py-1 rounded-full tracking-wide uppercase">
                        Auto-Paused
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-base text-muted-foreground font-medium">{brand.product}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent border border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-foreground/20 text-sm font-semibold transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                  Edit Brand
                </button>
                {brand.discovery_enabled && (
                  <button
                    onClick={handleTriggerDiscovery}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-primary-foreground hover:opacity-90 shadow-md text-sm font-bold transition-all duration-200"
                  >
                    <Zap className="h-4 w-4" />
                    Run Discovery
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ───── Engine Toggle Cards ───── */}
        <div className="grid gap-5 md:grid-cols-3">
          <div className="group relative">
            <div className="relative rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-muted p-3 shadow-sm shrink-0">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground tracking-[0.15em] uppercase mb-1">Discovery Engine</p>
                    <p className="text-[11px] text-muted-foreground/60 mb-3">Automated company discovery</p>
                    <Switch
                      checked={brand.discovery_enabled}
                      onCheckedChange={handleToggleDiscovery}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="relative rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-muted p-3 shadow-sm shrink-0">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground tracking-[0.15em] uppercase mb-1">Outbound Engine</p>
                    <p className="text-[11px] text-muted-foreground/60 mb-3">Automated email sending</p>
                    <Switch
                      checked={brand.outbound_enabled}
                      onCheckedChange={handleToggleOutbound}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative">
            <div className="relative rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-muted p-3 shadow-sm shrink-0">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-muted-foreground tracking-[0.15em] uppercase mb-1">System Status</p>
                    <p className="text-[11px] text-muted-foreground/60 mb-3">
                      <span className={`inline-flex items-center gap-1.5 font-semibold ${brand.is_paused ? 'text-muted-foreground' : 'text-foreground'}`}>
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${brand.is_paused ? 'bg-muted-foreground' : 'bg-foreground'}`} />
                        {brand.is_paused ? 'Paused' : 'Active'}
                      </span>
                    </p>
                    <button
                      onClick={handleTogglePause}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                        brand.is_paused
                          ? 'text-foreground bg-foreground/5 border-foreground/10 hover:bg-foreground/10'
                          : 'text-muted-foreground bg-muted border-border hover:bg-accent'
                      }`}
                    >
                      {brand.is_paused ? 'Resume' : 'Pause'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ───── Tabs ───── */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="rounded-2xl bg-muted border border-border p-1.5 shadow-sm">
            <TabsList className="w-full bg-transparent gap-1">
              {[
                { value: 'overview', label: 'Overview' },
                { value: 'discovery', label: 'Discovery' },
                { value: 'intents', label: 'Intents & Signals' },
                { value: 'settings', label: 'Email' },
                { value: 'llm', label: 'LLM' },
              ].map(({ value, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex-1 sm:flex-none rounded-xl data-[state=active]:bg-foreground data-[state=active]:text-background text-muted-foreground hover:text-foreground px-5 py-2.5 text-sm font-semibold transition-all duration-200"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Tab: Overview ── */}
          <TabsContent value="overview" className="mt-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shadow-sm">
                    <Brain className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Brand Information</h3>
                    <p className="text-xs text-muted-foreground">Core brand configuration</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                  <div className="p-0 divide-y divide-border">
                    {[
                      { label: 'Product', value: brand.product },
                      { label: 'Positioning', value: brand.positioning || 'Not set' },
                      { label: 'Tone', value: brand.tone || 'Not set', capitalize: true },
                      { label: 'Target Audience', value: brand.audience || 'Not set' },
                    ].map(({ label, value, capitalize }) => (
                      <div key={label} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors">
                        <span className="text-sm font-medium text-muted-foreground">{label}</span>
                        <span className={`text-sm font-bold text-foreground text-right max-w-[55%] truncate ${capitalize ? 'capitalize' : ''}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shadow-sm">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Send Statistics</h3>
                    <p className="text-xs text-muted-foreground">Delivery performance metrics</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Sent', value: brand.sent_count || 0, accent: 'text-foreground' },
                        { label: 'Bounces', value: brand.bounce_count || 0, accent: 'text-foreground' },
                        { label: 'Complaints', value: brand.complaint_count || 0, accent: 'text-foreground' },
                        { label: 'Bounce Rate', value: brand.sent_count ? `${((brand.bounce_count || 0) / brand.sent_count * 100).toFixed(1)}%` : '0%', accent: 'text-foreground' },
                      ].map(({ label, value, accent }) => (
                        <div key={label} className="rounded-xl bg-muted border border-border p-4">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
                          <p className={`text-2xl font-extrabold ${accent}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-5 border-t border-border space-y-3">
                      {[
                        { label: 'Daily Limit', value: brand.daily_send_limit || 'Unlimited' },
                        { label: 'Hourly Limit', value: brand.hourly_send_limit || 'Unlimited' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">{label}</span>
                          <span className="text-sm font-bold text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Discovery Sources ── */}
          <TabsContent value="discovery" className="mt-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shadow-sm">
                    <Radio className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Discovery Sources</h3>
                    <p className="text-xs text-muted-foreground">{discoverySources.length} source{discoverySources.length !== 1 ? 's' : ''} configured</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSourceModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-primary-foreground hover:opacity-90 shadow-sm text-sm font-bold transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Source
                </button>
              </div>

              {discoverySources.length === 0 ? (
                <div className="rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6 shadow-inner">
                      <Radio className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-base font-bold text-foreground mb-1">No discovery sources configured</p>
                    <p className="text-sm text-muted-foreground mb-8">Add a data source to begin discovering companies</p>
                    <button
                      onClick={() => setIsSourceModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-primary-foreground hover:opacity-90 shadow-sm text-sm font-bold transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Source
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                  <div className="p-2">
                    <div className="space-y-0.5">
                      {discoverySources.map((source) => (
                        <div
                          key={source.id}
                          className="group flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-all duration-200"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted border border-border shrink-0">
                              <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">{source.name}</p>
                              <p className="text-xs text-muted-foreground capitalize mt-0.5">{source.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            {source.is_running && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-foreground/5 border border-foreground/10 px-3 py-1 rounded-full">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
                                Running
                              </span>
                            )}
                            {source.last_run_at && (
                              <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(source.last_run_at)}
                              </span>
                            )}
                            {source.last_status && (
                              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                                source.last_status === 'success'
                                  ? 'text-foreground bg-foreground/5 border-foreground/10'
                                  : 'text-muted-foreground bg-muted border-border'
                              }`}>
                                {source.last_status}
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteSource(source)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab: Intents & Signals ── */}
          <TabsContent value="intents" className="mt-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shadow-sm">
                    <Target className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Brand Intents</h3>
                    <p className="text-xs text-muted-foreground">{intents.length} intent{intents.length !== 1 ? 's' : ''} · Signals define when each intent triggers</p>
                  </div>
                </div>
                <button
                  onClick={() => openIntentDrawer()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-primary-foreground hover:opacity-90 shadow-sm text-sm font-bold transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Intent
                </button>
              </div>

              {intents.length === 0 ? (
                <div className="rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6 shadow-inner">
                      <Target className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-base font-bold text-foreground mb-1">No intents configured</p>
                    <p className="text-sm text-muted-foreground mb-8">Create intents to define which prospects to target</p>
                    <button
                      onClick={() => openIntentDrawer()}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-primary-foreground hover:opacity-90 shadow-sm text-sm font-bold transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Intent
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {intents.map((intent, idx) => (
                    <div
                      key={intent.id}
                      className="group relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-border transition-all duration-300"
                    >
                      <div className="p-6 relative">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-foreground text-primary-foreground text-xs font-bold shadow-sm shrink-0">
                                {idx + 1}
                              </span>
                              <p className="font-bold text-foreground truncate text-base">{intent.intent}</p>
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 border ${
                                intent.priority <= 1
                                  ? 'text-foreground bg-foreground/5 border-foreground/10'
                                  : intent.priority <= 3
                                  ? 'text-muted-foreground bg-muted border-border'
                                  : 'text-muted-foreground/50 bg-muted border-border'
                              }`}>
                                <Sparkles className="h-3 w-3 text-muted-foreground" />
                                P{intent.priority}
                              </span>
                              <div className="hidden sm:flex items-center ml-auto">
                                <Switch
                                  checked={intent.is_active}
                                  onCheckedChange={() => handleToggleIntentActive(intent)}
                                />
                              </div>
                            </div>
                            {intent.signals.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {intent.signals.map((signal) => (
                                  <span
                                    key={signal}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-accent text-foreground border-border shadow-sm"
                                  >
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground mr-1.5" />
                                    {signal}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex sm:hidden items-center gap-2 mt-4 pt-4 border-t border-border">
                              <Switch
                                checked={intent.is_active}
                                onCheckedChange={() => handleToggleIntentActive(intent)}
                              />
                              <span className="text-xs text-muted-foreground font-medium">Active</span>
                              <div className="flex-1" />
                              <button
                                onClick={() => openIntentDrawer(intent)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteIntent(intent.id)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openIntentDrawer(intent)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteIntent(intent.id)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tab: Email Settings ── */}
          <TabsContent value="settings" className="mt-8">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shadow-sm">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Email Configuration</h3>
                  <p className="text-xs text-muted-foreground">SMTP and sending settings</p>
                </div>
              </div>
              <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[
                      { label: 'Provider', value: brand.provider || 'SMTP', capitalize: true },
                      { label: 'Transport Mode', value: brand.transport_mode || 'mailbox', capitalize: true },
                      { label: 'SMTP Host', value: brand.smtp_host || 'Not configured' },
                      { label: 'SMTP Port', value: brand.smtp_port || 'Not configured' },
                      { label: 'From Email', value: brand.smtp_email || 'Not configured' },
                      { label: 'Sending Domain', value: brand.sending_domain || 'Not configured' },
                    ].map(({ label, value, capitalize }) => (
                      <div key={label} className="flex flex-col gap-1 p-4 rounded-xl bg-muted border border-border hover:bg-accent/50 transition-colors">
                        <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">{label}</span>
                        <span className={`text-sm font-bold text-foreground ${capitalize ? 'capitalize' : ''}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: LLM Settings ── */}
          <TabsContent value="llm" className="mt-8">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shadow-sm">
                  <Brain className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">LLM Configuration</h3>
                  <p className="text-xs text-muted-foreground">AI model overrides for this brand</p>
                </div>
              </div>
              <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { label: 'Model Override', value: brand.llm_model_override || 'Using default' },
                      { label: 'Temperature', value: brand.llm_temperature ?? 'Using default' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col gap-1 p-4 rounded-xl bg-muted border border-border hover:bg-accent/50 transition-colors">
                        <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">{label}</span>
                        <span className="text-sm font-bold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ───── Drawers ───── */}
        <Drawer
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
        </Drawer>

        <Drawer
          isOpen={isSourceModalOpen}
          onClose={() => setIsSourceModalOpen(false)}
          title="Add Discovery Source"
          size="md"
        >
          <DiscoverySourceForm
            brandId={brand.id}
            existingKeys={Object.fromEntries(
              discoverySources
                .filter(s => s.config)
                .map(s => [s.type, (s.config as Record<string, any>).api_key || (s.config as Record<string, any>).token || ''])
                .filter(([, key]) => key)
            )}
            onSuccess={() => {
              setIsSourceModalOpen(false)
              fetchDiscoverySources()
            }}
            onCancel={() => setIsSourceModalOpen(false)}
          />
        </Drawer>

        <Drawer
          isOpen={isIntentDrawerOpen}
          onClose={() => setIsIntentDrawerOpen(false)}
          title={editingIntent ? 'Edit Intent' : 'Add Intent'}
          size="md"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Intent Description</label>
              <textarea
                value={intentForm.intent}
                onChange={e => setIntentForm(prev => ({ ...prev, intent: e.target.value }))}
                className="w-full rounded-xl bg-muted border border-border px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all min-h-[100px] resize-none"
                placeholder="e.g., Companies hiring for senior engineering roles"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Signals</label>
              <p className="text-xs text-muted-foreground mb-3">Comma-separated signals that trigger this intent (e.g. hiring, funding, tech_stack)</p>
              <textarea
                value={intentForm.signals.join(', ')}
                onChange={e => setIntentForm(prev => ({ ...prev, signals: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                className="w-full rounded-xl bg-muted border border-border px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
                placeholder="hiring, funding, tech_stack, partnership"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-3">Priority Level</label>
              <div className="grid grid-cols-6 gap-2.5">
                {[1, 2, 3, 4, 5, 6].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setIntentForm(prev => ({ ...prev, priority: p - 1 }))}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all duration-200 ${
                      intentForm.priority === p - 1
                        ? 'bg-foreground text-primary-foreground border-transparent shadow-sm scale-105'
                        : 'bg-muted text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground hover:shadow-sm'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-foreground font-semibold">← Highest</span>
                <span className="text-xs text-muted-foreground font-medium">1 = most urgent</span>
                <span className="text-xs text-muted-foreground font-semibold">Lowest →</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <button
                onClick={() => setIsIntentDrawerOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-sm font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIntent}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-foreground text-primary-foreground hover:opacity-90 shadow-sm text-sm font-bold transition-all duration-200"
              >
                <Sparkles className="h-4 w-4" />
                {editingIntent ? 'Save Changes' : 'Create Intent'}
              </button>
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  )
}
