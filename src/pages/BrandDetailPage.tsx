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
  Plus,
  Trash2,
  Clock,
  Target,
  X,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-14 w-14 border-[3px] border-white/[0.04] border-t-indigo-400 shadow-2xl" />
          <div className="absolute inset-0 animate-pulse rounded-full h-14 w-14 bg-indigo-500/5 blur-xl" />
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6 shadow-inner">
          <Search className="h-8 w-8 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-300 mb-2">Brand not found</h2>
        <p className="text-slate-600 mb-8">The brand you're looking for doesn't exist or has been removed</p>
        <button
          onClick={() => navigate('/brands')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-xl shadow-indigo-500/30 text-sm font-bold transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Brands
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-10 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ───── Header ───── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-slate-950/80 p-8 shadow-2xl shadow-indigo-500/20 border border-indigo-500/10 backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.2),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.1),transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate('/brands')}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.07] border border-white/[0.08] text-indigo-300/50 hover:text-white hover:bg-white/[0.12] hover:border-white/20 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="h-px flex-1 bg-gradient-to-r from-white/[0.08] to-transparent" />
              <span className="text-indigo-300/30 text-[11px] font-semibold tracking-[0.25em] uppercase">Brand Profile</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-4xl font-extrabold tracking-tight text-white">{brand.brand_name}</h1>
                  <div className="flex items-center gap-2">
                    {brand.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full tracking-wide uppercase">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-3 py-1 rounded-full tracking-wide uppercase">
                        Inactive
                      </span>
                    )}
                    {brand.is_paused && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full tracking-wide uppercase">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                        Paused
                      </span>
                    )}
                    {brand.auto_paused && (
                      <span className="inline-flex items-center text-[11px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full tracking-wide uppercase">
                        Auto-Paused
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-base text-indigo-300/50 font-medium">{brand.product}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-indigo-200/70 hover:text-white hover:bg-white/[0.10] hover:border-white/20 text-sm font-semibold transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                  Edit Brand
                </button>
                {brand.discovery_enabled && (
                  <button
                    onClick={handleTriggerDiscovery}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-xl shadow-indigo-500/30 text-sm font-bold transition-all duration-200"
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
            <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500/30 to-indigo-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
            <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.06] backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 shadow-lg shadow-indigo-500/25 shrink-0">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-indigo-300/60 tracking-[0.15em] uppercase mb-1">Discovery Engine</p>
                    <p className="text-[11px] text-slate-500 mb-3">Automated company discovery</p>
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
            <div className="absolute -inset-[2px] bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
            <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.06] backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 shadow-lg shadow-emerald-500/25 shrink-0">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-300/60 tracking-[0.15em] uppercase mb-1">Outbound Engine</p>
                    <p className="text-[11px] text-slate-500 mb-3">Automated email sending</p>
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
            <div className="absolute -inset-[2px] bg-gradient-to-r from-amber-500/30 to-amber-600/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
            <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.06] backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-3 shadow-lg shadow-amber-500/25 shrink-0">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-300/60 tracking-[0.15em] uppercase mb-1">System Status</p>
                    <p className="text-[11px] text-slate-500 mb-3">
                      <span className={`inline-flex items-center gap-1.5 font-semibold ${brand.is_paused ? 'text-amber-400' : 'text-emerald-400'}`}>
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${brand.is_paused ? 'bg-amber-400' : 'bg-emerald-400'} shadow-[0_0_8px_rgba(52,211,153,0.5)]`} />
                        {brand.is_paused ? 'Paused' : 'Active'}
                      </span>
                    </p>
                    <button
                      onClick={handleTogglePause}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                        brand.is_paused
                          ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'text-amber-300 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'
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
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-1.5 backdrop-blur-xl shadow-lg">
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
                  className="flex-1 sm:flex-none rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/25 text-slate-400 hover:text-slate-200 px-5 py-2.5 text-sm font-semibold transition-all duration-200"
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-200">Brand Information</h3>
                    <p className="text-xs text-slate-500">Core brand configuration</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] backdrop-blur-xl shadow-xl overflow-hidden">
                  <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
                  <div className="p-0 divide-y divide-white/[0.04]">
                    {[
                      { label: 'Product', value: brand.product },
                      { label: 'Positioning', value: brand.positioning || 'Not set' },
                      { label: 'Tone', value: brand.tone || 'Not set', capitalize: true },
                      { label: 'Target Audience', value: brand.audience || 'Not set' },
                    ].map(({ label, value, capitalize }) => (
                      <div key={label} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors">
                        <span className="text-sm font-medium text-slate-500">{label}</span>
                        <span className={`text-sm font-bold text-slate-300 text-right max-w-[55%] truncate ${capitalize ? 'capitalize' : ''}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-200">Send Statistics</h3>
                    <p className="text-xs text-slate-500">Delivery performance metrics</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] backdrop-blur-xl shadow-xl overflow-hidden">
                  <div className="h-[3px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Sent', value: brand.sent_count || 0, accent: 'text-indigo-400' },
                        { label: 'Bounces', value: brand.bounce_count || 0, accent: 'text-rose-400' },
                        { label: 'Complaints', value: brand.complaint_count || 0, accent: 'text-rose-400' },
                        { label: 'Bounce Rate', value: brand.sent_count ? `${((brand.bounce_count || 0) / brand.sent_count * 100).toFixed(1)}%` : '0%', accent: (brand.bounce_count || 0) > 0 ? 'text-rose-400' : 'text-emerald-400' },
                      ].map(({ label, value, accent }) => (
                        <div key={label} className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
                          <p className={`text-2xl font-extrabold ${accent}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-3">
                      {[
                        { label: 'Daily Limit', value: brand.daily_send_limit || 'Unlimited' },
                        { label: 'Hourly Limit', value: brand.hourly_send_limit || 'Unlimited' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-500">{label}</span>
                          <span className="text-sm font-bold text-slate-300">{value}</span>
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <Radio className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-200">Discovery Sources</h3>
                    <p className="text-xs text-slate-500">{discoverySources.length} source{discoverySources.length !== 1 ? 's' : ''} configured</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSourceModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/30 text-sm font-bold transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Source
                </button>
              </div>

              {discoverySources.length === 0 ? (
                <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] backdrop-blur-xl shadow-xl">
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6 shadow-inner">
                      <Radio className="h-8 w-8 text-slate-600" />
                    </div>
                    <p className="text-base font-bold text-slate-400 mb-1">No discovery sources configured</p>
                    <p className="text-sm text-slate-600 mb-8">Add a data source to begin discovering companies</p>
                    <button
                      onClick={() => setIsSourceModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/30 text-sm font-bold transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Source
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] backdrop-blur-xl shadow-xl overflow-hidden">
                  <div className="p-2">
                    <div className="space-y-0.5">
                      {discoverySources.map((source) => (
                        <div
                          key={source.id}
                          className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.03] transition-all duration-200"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0">
                              <Search className="h-4 w-4 text-violet-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-300 truncate">{source.name}</p>
                              <p className="text-xs text-slate-600 capitalize mt-0.5">{source.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            {source.is_running && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                Running
                              </span>
                            )}
                            {source.last_run_at && (
                              <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-white/[0.03] px-2.5 py-1 rounded-full">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(source.last_run_at)}
                              </span>
                            )}
                            {source.last_status && (
                              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                source.last_status === 'success'
                                  ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                                  : 'text-rose-300 bg-rose-500/10 border-rose-500/20'
                              }`}>
                                {source.last_status}
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteSource(source)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-200">Brand Intents</h3>
                    <p className="text-xs text-slate-500">{intents.length} intent{intents.length !== 1 ? 's' : ''} · Signals define when each intent triggers</p>
                  </div>
                </div>
                <button
                  onClick={() => openIntentDrawer()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/30 text-sm font-bold transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Intent
                </button>
              </div>

              {intents.length === 0 ? (
                <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] backdrop-blur-xl shadow-xl">
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6 shadow-inner">
                      <Target className="h-8 w-8 text-slate-600" />
                    </div>
                    <p className="text-base font-bold text-slate-400 mb-1">No intents configured</p>
                    <p className="text-sm text-slate-600 mb-8">Create intents to define which prospects to target</p>
                    <button
                      onClick={() => openIntentDrawer()}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/30 text-sm font-bold transition-all duration-200"
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
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.06] backdrop-blur-xl shadow-xl hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-300"
                    >
                      <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-indigo-500 via-violet-500 to-indigo-500" />
                      <div className="absolute top-4 right-4 w-48 h-48 bg-gradient-to-br from-indigo-500/[0.04] to-violet-500/[0.04] rounded-full blur-3xl pointer-events-none" />
                      <div className="p-6 pl-7 relative">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 shrink-0">
                                {idx + 1}
                              </span>
                              <p className="font-bold text-slate-200 truncate text-base">{intent.intent}</p>
                              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 border ${
                                intent.priority <= 1
                                  ? 'text-rose-300 bg-rose-500/10 border-rose-500/20'
                                  : intent.priority <= 3
                                  ? 'text-amber-300 bg-amber-500/10 border-amber-500/20'
                                  : 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                              }`}>
                                <Sparkles className={`h-3 w-3 ${intent.priority <= 1 ? 'text-rose-400' : intent.priority <= 3 ? 'text-amber-400' : 'text-slate-500'}`} />
                                P{intent.priority}
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
                                        ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/15 text-indigo-300 border-indigo-500/20 shadow-sm'
                                        : 'bg-transparent text-slate-700 border-white/[0.04]'
                                    }`}
                                  >
                                    {active ? (
                                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 mr-1.5 shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
                                    ) : null}
                                    {signal.replace(/_/g, ' ')}
                                  </span>
                                )
                              })}
                            </div>
                            <div className="flex sm:hidden items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                              <Switch
                                checked={intent.is_active}
                                onCheckedChange={() => handleToggleIntentActive(intent)}
                              />
                              <span className="text-xs text-slate-500 font-medium">Active</span>
                              <div className="flex-1" />
                              <button
                                onClick={() => openIntentDrawer(intent)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteIntent(intent.id)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openIntentDrawer(intent)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-200"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteIntent(intent.id)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200">Email Configuration</h3>
                  <p className="text-xs text-slate-500">SMTP and sending settings</p>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] backdrop-blur-xl shadow-xl overflow-hidden">
                <div className="h-[3px] bg-gradient-to-r from-sky-500 via-sky-400 to-sky-500" />
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
                      <div key={label} className="flex flex-col gap-1 p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-colors">
                        <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">{label}</span>
                        <span className={`text-sm font-bold text-slate-300 ${capitalize ? 'capitalize' : ''}`}>{value}</span>
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200">LLM Configuration</h3>
                  <p className="text-xs text-slate-500">AI model overrides for this brand</p>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] backdrop-blur-xl shadow-xl overflow-hidden">
                <div className="h-[3px] bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500" />
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { label: 'Model Override', value: brand.llm_model_override || 'Using default' },
                      { label: 'Temperature', value: brand.llm_temperature ?? 'Using default' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col gap-1 p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-colors">
                        <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">{label}</span>
                        <span className="text-sm font-bold text-slate-300">{value}</span>
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
              <label className="block text-sm font-bold text-slate-300 mb-2">Intent Description</label>
              <textarea
                value={intentForm.intent}
                onChange={e => setIntentForm(prev => ({ ...prev, intent: e.target.value }))}
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700/50 px-4 py-3 text-sm font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all min-h-[100px] resize-none"
                placeholder="e.g., Companies hiring for senior engineering roles"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-slate-300">Signals</label>
                <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{intentForm.signals.length} selected</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">Select which signals trigger this intent</p>
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
                          ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-transparent shadow-lg shadow-indigo-500/30 scale-[1.02]'
                          : 'bg-slate-900/50 text-slate-400 border-slate-700/50 hover:border-indigo-500/30 hover:text-indigo-300 hover:bg-slate-800/50 hover:shadow-sm'
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
              <label className="block text-sm font-bold text-slate-300 mb-3">Priority Level</label>
              <div className="grid grid-cols-6 gap-2.5">
                {[0, 1, 2, 3, 4, 5].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setIntentForm(prev => ({ ...prev, priority: p }))}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all duration-200 ${
                      intentForm.priority === p
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-transparent shadow-lg shadow-indigo-500/30 scale-105'
                        : 'bg-slate-900/50 text-slate-400 border-slate-700/50 hover:border-indigo-500/30 hover:text-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-emerald-400 font-semibold">← Highest</span>
                <span className="text-xs text-slate-600 font-medium">0 = most urgent</span>
                <span className="text-xs text-slate-500 font-semibold">Lowest →</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
              <button
                onClick={() => setIsIntentDrawerOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 text-sm font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIntent}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/30 text-sm font-bold transition-all duration-200"
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
