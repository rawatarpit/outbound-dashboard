import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { type BrandProfile, type BrandIntent, SIGNAL_TYPES } from '@/lib/supabase'
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
  Play,
  Pause,
  Plus,
  Trash2,
  Clock,
  Target,
  X,
  Sparkles,
  Activity,
  Shield,
  Brain,
  Zap,
  Gauge,
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
      setIntentForm({ intent: intent.intent, signals: [...intent.signals], priority: intent.priority })
    } else {
      setEditingIntent(null)
      setIntentForm({ intent: '', signals: [], priority: 0 })
    }
    setIsIntentDrawerOpen(true)
  }

  const toggleSignal = (signal: string) => {
    setIntentForm(prev => ({
      ...prev,
      signals: prev.signals.includes(signal)
        ? prev.signals.filter(s => s !== signal)
        : [...prev.signals, signal]
    }))
  }

  const handleSaveIntent = async () => {
    if (!id) return
    if (!intentForm.intent.trim()) {
      toast.error('Intent description is required')
      return
    }
    try {
      if (editingIntent) {
        const { error } = await brandIntentsAPI.update(editingIntent.id, intentForm)
        if (error) throw error
        toast.success('Intent updated')
      } else {
        const { error } = await brandIntentsAPI.create({ ...intentForm, brand_id: id })
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
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-slate-200 border-t-indigo-500"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-indigo-500/5"></div>
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10">
          <Search className="h-8 w-8 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Brand not found</h2>
        <p className="text-slate-400 mb-6">The brand you're looking for doesn't exist or has been removed</p>
        <Button onClick={() => navigate('/brands')} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/25 rounded-xl px-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Brands
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-10">

      {/* ───── Premium Header Card ───── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800 p-8 shadow-2xl shadow-indigo-500/15 border border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M0 0h1v1H0z\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/brands')}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-indigo-200/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-indigo-300/40 text-[11px] font-semibold tracking-[0.2em] uppercase">Brand Profile</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-4xl font-extrabold tracking-tight text-white">{brand.brand_name}</h1>
                <div className="flex items-center gap-2">
                  {brand.is_active ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-3 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                  {brand.is_paused && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Paused
                    </span>
                  )}
                  {brand.auto_paused && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                      Auto-Paused
                    </span>
                  )}
                </div>
              </div>
              <p className="text-lg text-indigo-200/60 font-medium">{brand.product}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 rounded-xl backdrop-blur-sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Brand
              </Button>
              {brand.discovery_enabled && (
                <Button
                  onClick={handleTriggerDiscovery}
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/30 rounded-xl font-semibold"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Run Discovery
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ───── System Toggle Panel ───── */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
          <Card className="relative border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-lg hover:border-indigo-200/50 transition-all duration-300 rounded-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 shadow-lg shadow-indigo-500/20">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Discovery Engine</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">Automated company discovery</p>
                    </div>
                    <Switch
                      checked={brand.discovery_enabled}
                      onCheckedChange={handleToggleDiscovery}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
          <Card className="relative border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-lg hover:border-emerald-200/50 transition-all duration-300 rounded-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 shadow-lg shadow-emerald-500/20">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Outbound Engine</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">Automated email sending</p>
                    </div>
                    <Switch
                      checked={brand.outbound_enabled}
                      onCheckedChange={handleToggleOutbound}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
          <Card className="relative border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-lg hover:border-amber-200/50 transition-all duration-300 rounded-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-3 shadow-lg shadow-amber-500/20">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">System Status</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${brand.is_paused ? 'text-amber-600' : 'text-emerald-600'}`}>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${brand.is_paused ? 'bg-amber-500' : 'bg-emerald-500'} shadow-[0_0_6px_rgba(52,211,153,0.4)]`} />
                          {brand.is_paused ? 'Paused' : 'Active'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleTogglePause}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                        brand.is_paused
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {brand.is_paused ? 'Resume' : 'Pause'}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ───── Tabs ───── */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 p-1.5 shadow-sm">
          <TabsList className="w-full bg-transparent gap-1">
            {[
              { value: 'overview', label: 'Overview', icon: BarChart3 },
              { value: 'discovery', label: 'Discovery', icon: Radio },
              { value: 'intents', label: 'Intents & Signals', icon: Target },
              { value: 'settings', label: 'Email', icon: Mail },
              { value: 'llm', label: 'LLM', icon: Brain },
            ].map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 sm:flex-none rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-indigo-500/20 text-slate-500 hover:text-slate-700 px-5 py-2.5 text-sm font-semibold transition-all duration-200"
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Brand Information</h3>
                  <p className="text-xs text-slate-400">Core brand configuration</p>
                </div>
              </div>
              <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
                <CardContent className="p-0 divide-y divide-slate-100">
                  {[
                    { label: 'Product', value: brand.product },
                    { label: 'Positioning', value: brand.positioning || 'Not set' },
                    { label: 'Tone', value: brand.tone || 'Not set', capitalize: true },
                    { label: 'Target Audience', value: brand.audience || 'Not set' },
                  ].map(({ label, value, capitalize }) => (
                    <div key={label} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                      <span className="text-sm font-medium text-slate-400">{label}</span>
                      <span className={`text-sm font-bold text-slate-800 text-right max-w-[55%] truncate ${capitalize ? 'capitalize' : ''}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Send Statistics</h3>
                  <p className="text-xs text-slate-400">Delivery performance metrics</p>
                </div>
              </div>
              <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Sent', value: brand.sent_count || 0, accent: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { label: 'Bounces', value: brand.bounce_count || 0, accent: 'text-rose-600', bg: 'bg-rose-50' },
                      { label: 'Complaints', value: brand.complaint_count || 0, accent: 'text-rose-600', bg: 'bg-rose-50' },
                      { label: 'Bounce Rate', value: brand.sent_count ? `${((brand.bounce_count || 0) / brand.sent_count * 100).toFixed(1)}%` : '0%', accent: (brand.bounce_count || 0) > 0 ? 'text-rose-600' : 'text-emerald-600', bg: (brand.bounce_count || 0) > 0 ? 'bg-rose-50' : 'bg-emerald-50' },
                    ].map(({ label, value, accent, bg }) => (
                      <div key={label} className={`${bg} rounded-xl p-4 border border-slate-100/50`}>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                        <p className={`text-2xl font-extrabold ${accent}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
                    {[
                      { label: 'Daily Limit', value: brand.daily_send_limit || 'Unlimited' },
                      { label: 'Hourly Limit', value: brand.hourly_send_limit || 'Unlimited' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-400">{label}</span>
                        <span className="text-sm font-bold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: Discovery Sources ── */}
        <TabsContent value="discovery" className="mt-8">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Radio className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Discovery Sources</h3>
                  <p className="text-xs text-slate-400">{discoverySources.length} source{discoverySources.length !== 1 ? 's' : ''} configured</p>
                </div>
              </div>
              <Button onClick={() => setIsSourceModalOpen(true)} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/25 rounded-xl font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </div>
            {discoverySources.length === 0 ? (
              <Card className="border-slate-200/60 shadow-sm rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-5 shadow-inner">
                    <Radio className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-base font-semibold text-slate-600 mb-1">No discovery sources configured</p>
                  <p className="text-sm text-slate-400 mb-6">Add a data source to begin discovering companies</p>
                  <Button onClick={() => setIsSourceModalOpen(true)} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/25 rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Source
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {discoverySources.map((source, idx) => (
                      <div
                        key={source.id}
                        className="group flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-violet-50/50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/10 border border-violet-200/50 shrink-0">
                            <Search className="h-4 w-4 text-violet-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-700 truncate">{source.name}</p>
                            <p className="text-xs text-slate-400 capitalize mt-0.5">{source.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          {source.is_running && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
                              Running
                            </span>
                          )}
                          {source.last_run_at && (
                            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(source.last_run_at)}
                            </span>
                          )}
                          {source.last_status && (
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                              source.last_status === 'success'
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                : 'text-rose-700 bg-rose-50 border-rose-200'
                            }`}>
                              {source.last_status}
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteSource(source)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Intents & Signals ── */}
        <TabsContent value="intents" className="mt-8">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Brand Intents</h3>
                  <p className="text-xs text-slate-400">{intents.length} intent{intents.length !== 1 ? 's' : ''} · Signals define when each intent triggers</p>
                </div>
              </div>
              <Button onClick={() => openIntentDrawer()} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/25 rounded-xl font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Add Intent
              </Button>
            </div>
            {intents.length === 0 ? (
              <Card className="border-slate-200/60 shadow-sm rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-5 shadow-inner">
                    <Target className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-base font-semibold text-slate-600 mb-1">No intents configured</p>
                  <p className="text-sm text-slate-400 mb-6">Create intents to define which prospects to target</p>
                  <Button onClick={() => openIntentDrawer()} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/25 rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Intent
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {intents.map((intent, idx) => (
                  <div
                    key={intent.id}
                    className="group relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-indigo-200/50 transition-all duration-300"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 via-violet-500 to-indigo-500" />
                    <div className="absolute top-4 right-4 w-48 h-48 bg-gradient-to-br from-indigo-500/[0.03] to-violet-500/[0.03] rounded-full blur-2xl pointer-events-none" />
                    <div className="p-6 pl-7 relative">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 shrink-0">
                              {idx + 1}
                            </span>
                            <p className="font-bold text-slate-800 truncate text-base">{intent.intent}</p>
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 border ${
                              intent.priority <= 1
                                ? 'text-rose-700 bg-rose-50 border-rose-200'
                                : intent.priority <= 3
                                ? 'text-amber-700 bg-amber-50 border-amber-200'
                                : 'text-slate-500 bg-slate-50 border-slate-200'
                            }`}>
                              <Sparkles className={`h-3 w-3 ${intent.priority <= 1 ? 'text-rose-500' : intent.priority <= 3 ? 'text-amber-500' : 'text-slate-400'}`} />
                              Priority {intent.priority}{intent.priority === 0 ? ' (highest)' : ''}
                            </span>
                            <div className="hidden sm:flex items-center ml-auto">
                              <Switch
                                checked={intent.is_active}
                                onCheckedChange={() => handleToggleIntentActive(intent)}
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {SIGNAL_TYPES.map((signal) => {
                              const active = intent.signals.includes(signal)
                              return (
                                <span
                                  key={signal}
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize border transition-all duration-200 ${
                                    active
                                      ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border-indigo-200 shadow-sm'
                                      : 'bg-transparent text-slate-200 border-slate-100'
                                  }`}
                                >
                                  {active ? (
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 mr-1.5 shadow-[0_0_4px_rgba(99,102,241,0.4)]" />
                                  ) : null}
                                  {signal.replace(/_/g, ' ')}
                                </span>
                              )
                            })}
                          </div>
                          <div className="flex sm:hidden items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                            <Switch
                              checked={intent.is_active}
                              onCheckedChange={() => handleToggleIntentActive(intent)}
                            />
                            <span className="text-xs text-slate-400 font-medium">Active</span>
                            <div className="flex-1" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openIntentDrawer(intent)}
                              className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteIntent(intent.id)}
                              className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openIntentDrawer(intent)}
                            className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteIntent(intent.id)}
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Email Configuration</h3>
                <p className="text-xs text-slate-400">SMTP and sending settings</p>
              </div>
            </div>
            <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-sky-500 via-sky-400 to-sky-500" />
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: 'Provider', value: brand.provider || 'SMTP', capitalize: true },
                    { label: 'Transport Mode', value: brand.transport_mode || 'mailbox', capitalize: true },
                    { label: 'SMTP Host', value: brand.smtp_host || 'Not configured' },
                    { label: 'SMTP Port', value: brand.smtp_port || 'Not configured' },
                    { label: 'From Email', value: brand.smtp_email || 'Not configured' },
                    { label: 'Sending Domain', value: brand.sending_domain || 'Not configured' },
                  ].map(({ label, value, capitalize }) => (
                    <div key={label} className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50/70 border border-slate-100/80 hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{label}</span>
                      <span className={`text-sm font-bold text-slate-800 ${capitalize ? 'capitalize' : ''}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: LLM Settings ── */}
        <TabsContent value="llm" className="mt-8">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">LLM Configuration</h3>
                <p className="text-xs text-slate-400">AI model overrides for this brand</p>
              </div>
            </div>
            <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500" />
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { label: 'Model Override', value: brand.llm_model_override || 'Using default' },
                    { label: 'Temperature', value: brand.llm_temperature ?? 'Using default' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-1 p-4 rounded-xl bg-slate-50/70 border border-slate-100/80 hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{label}</span>
                      <span className="text-sm font-bold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Intent Description</label>
            <textarea
              value={intentForm.intent}
              onChange={e => setIntentForm(prev => ({ ...prev, intent: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] resize-none"
              placeholder="e.g., Companies hiring for senior engineering roles"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-bold text-slate-700">Signals</label>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{intentForm.signals.length} selected</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Select which signals trigger this intent</p>
            <div className="flex flex-wrap gap-2">
              {SIGNAL_TYPES.map((signal) => {
                const selected = intentForm.signals.includes(signal)
                return (
                  <button
                    key={signal}
                    type="button"
                    onClick={() => toggleSignal(signal)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 capitalize ${
                      selected
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-transparent shadow-lg shadow-indigo-500/25 scale-[1.02]'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 hover:shadow-sm'
                    }`}
                  >
                    {signal.replace(/_/g, ' ')}
                    {selected && <X className="h-3.5 w-3.5" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Priority Level</label>
            <div className="grid grid-cols-6 gap-2.5">
              {[0, 1, 2, 3, 4, 5].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setIntentForm(prev => ({ ...prev, priority: p }))}
                  className={`py-3 rounded-xl text-sm font-bold border transition-all duration-200 ${
                    intentForm.priority === p
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-transparent shadow-lg shadow-indigo-500/25 scale-105'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-emerald-600 font-semibold">← Highest</span>
              <span className="text-xs text-slate-400 font-medium">0 = most urgent</span>
              <span className="text-xs text-slate-400 font-semibold">Lowest →</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsIntentDrawerOpen(false)}
              className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 font-semibold px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveIntent}
              className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/25 rounded-xl font-semibold px-6"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {editingIntent ? 'Save Changes' : 'Create Intent'}
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  )
}
