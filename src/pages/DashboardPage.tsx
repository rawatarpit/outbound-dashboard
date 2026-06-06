import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatRelativeTime, formatCurrency, formatNumber } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import {
  Activity, AlertCircle, BarChart3, Building2, CheckCircle, Database, Mail,
  MailOpen, MailWarning, PieChart, Search, Send, Shield, ShieldAlert,
  Target, TrendingUp, Users, Zap, Reply, Hash, Globe, Lock,
  MessageSquare, Sparkles, ArrowUp, ArrowDown,
  GitBranch, UserCheck, AlertTriangle, Radio,
  Loader2
} from 'lucide-react'
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts'
import { dashboardAPI } from '@/lib/api'

const FUNNEL_COLORS = ['#6366f1', '#22c55e', '#a855f7', '#f59e0b', '#10b981']
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']
const STATUS_COLORS: Record<string, string> = {
  researching: '#a3a3a3', qualified: '#6366f1', draft_ready: '#8b5cf6',
  contacted: '#3b82f6', replied: '#22c55e', closed_won: '#10b981', closed_lost: '#ef4444'
}

function AnimatedCounter({ value, suffix = '', prefix = '', decimals = 0 }: { value: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<ReturnType<typeof requestAnimationFrame>>()
  const startVal = useRef(0)
  const startTime = useRef(0)

  useEffect(() => {
    startVal.current = display
    startTime.current = Date.now()
    const duration = 800

    function animate() {
      const elapsed = Date.now() - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startVal.current + (value - startVal.current) * eased
      setDisplay(current)
      if (progress < 1) ref.current = requestAnimationFrame(animate)
    }
    ref.current = requestAnimationFrame(animate)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [value])

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()
  return <>{prefix}{formatted}{suffix}</>
}

function TrendBadge({ value, inverse = false }: { value: number; inverse?: boolean }) {
  const isGood = inverse ? value < 0 : value >= 0
  if (value === 0) return null
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isGood ? 'text-green-600' : 'text-red-500'}`}>
      {isGood ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  )
}

function MiniSparkline({ data, color = '#6366f1' }: { data: { value: number }[]; color?: string }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.value), 1)
  const min = Math.min(...data.map(d => d.value), 0)
  const range = max - min || 1
  const w = 80, h = 28
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((d.value - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} className="shrink-0" viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  )
}

function SectionHeader({ icon: Icon, title, subtitle, action }: { icon: any; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-foreground/5 to-foreground/10 flex items-center justify-center border border-border/50">
          <Icon className="h-[18px] w-[18px] text-foreground/70" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, subvalue, trend, color, chart, onClick }: {
  icon: any; label: string; value: React.ReactNode; subvalue?: string;
  trend?: number; color?: string; chart?: { value: number }[]; onClick?: () => void
}) {
  const accent = color || '#6366f1'
  return (
    <button onClick={onClick} className="relative group w-full text-left">
      <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 hover:border-border hover:shadow-sm hover:bg-card transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <Icon className="h-[18px] w-[18px]" style={{ color: accent }} />
          </div>
          {chart && <MiniSparkline data={chart} color={accent} />}
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          {trend !== undefined && <TrendBadge value={trend} />}
        </div>
        {subvalue && <p className="text-xs text-muted-foreground mt-1">{subvalue}</p>}
      </div>
    </button>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const fetchDashboard = useCallback(async () => {
    setHasError(false)
    setIsLoading(true)
    try {
      const res = await dashboardAPI.overview()
      setData(res.data || {})
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-[1.5px] border-border border-t-foreground/80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-foreground/5 animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="max-w-md w-full border-destructive/20">
          <CardContent className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <ShieldAlert className="h-7 w-7 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Unable to load dashboard</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">There was an error fetching your dashboard data. Please try again.</p>
            <button
              onClick={fetchDashboard}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all"
            >
              <Loader2 className="h-4 w-4" />
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const d = data
  const funnel = d?.funnel
  const pipeline = d?.pipeline
  const sendHealth = d?.send_health
  const leadsData = d?.leads
  const workers = d?.workers
  const activityFeed = d?.activity_feed || []
  const brand = d?.brand
  const avgScore = d?.avg_composite_score
  const rejectionBreakdown = d?.rejection_breakdown || []
  const sourcePerformance = d?.source_performance || []
  const scoreDistribution = d?.score_distribution || []
  const signalDistribution = d?.signal_distribution || []

  const industryBreakdown = d?.industry_breakdown || []
  const brandPerformance = d?.brand_performance || []
  const teamStats = d?.team
  const campaignSummary = d?.campaign_summary
  const discoveryMetrics = d?.discovery
  const replies = d?.replies
  const deadLetters = d?.dead_letters
  const suppression = d?.suppression
  const sendingDomains = d?.sending_domains
  const circuitBreakers = d?.circuit_breakers
  const bounceByDomain = d?.bounce_by_domain || []
  const sendTrend14 = d?.send_health?.last_14_days || []
  const leadTrend = d?.leads?.trend_14d || []

  // ── Health status ──
  let healthIssues = 0, healthWarnings = 0
  if (workers) {
    Object.values(workers).forEach((w: any) => {
      if (w?.circuit_breaker) healthIssues++
      else if (w?.status === 'idle' || w?.status === 'paused') healthWarnings++
    })
  }
  if (circuitBreakers?.open > 0) healthIssues += circuitBreakers.open
  if (deadLetters?.unresolved > 0) healthWarnings += Math.min(deadLetters.unresolved, 5)
  if (sendHealth) {
    const dPct = sendHealth.daily.used / Math.max(sendHealth.daily.limit, 1)
    const hPct = sendHealth.hourly.used / Math.max(sendHealth.hourly.limit, 1)
    if (dPct >= 1) healthIssues++
    else if (dPct >= 0.8) healthWarnings++
    if (hPct >= 1) healthIssues++
    else if (hPct >= 0.8) healthWarnings++
  }
  const healthStatus = healthIssues > 0 ? 'critical' : healthWarnings > 0 ? 'warning' : 'good'

  const pipelineValueTotal = pipeline?.total || 0
  const pipelineActive = pipelineValueTotal - (pipeline?.stages?.closed_lost || 0) - (pipeline?.stages?.closed_won || 0)

  const deliveryRate = sendHealth
    ? Math.round((sendHealth.delivered_today / Math.max(sendHealth.sent_today, 1)) * 100) : null
  const openRate = sendHealth
    ? Math.round((sendHealth.opened_today / Math.max(sendHealth.delivered_today, 1)) * 100) : null
  const replyRate = sendHealth
    ? Math.round((sendHealth.replied_today / Math.max(sendHealth.sent_today, 1)) * 100) : null

  const sendChartData = sendTrend14.map((d: any) => ({ date: d.date, sent: d.sent, delivered: d.delivered, opened: d.opened }))
  const leadChartData = leadTrend.map((d: any) => ({ date: d.date, created: d.created, contacted: d.contacted }))

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Dashboard</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time overview of your outbound sales engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          {brand && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/80 px-3 py-1.5 rounded-full border border-border/50">
                <span className="inline-block h-2 w-2 rounded-full bg-foreground/70" />
                {brand.name}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
                brand.outbound_enabled
                  ? 'text-green-600 bg-green-500/10 border-green-500/20'
                  : 'text-muted-foreground bg-muted/80 border-border/50'
              }`}>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${brand.outbound_enabled ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                {brand.outbound_enabled ? 'Active' : 'Paused'}
              </span>
            </div>
          )}
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted transition-all"
          >
            <Loader2 className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Main Tabs ── */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-muted/70 border border-border/50 p-0.5">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
          <TabsTrigger value="health" className="text-xs">System Health</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
        </TabsList>

        {/* ════════════ OVERVIEW TAB ════════════ */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Health Banner */}
          <div className={`relative overflow-hidden rounded-xl border p-5 ${
            healthStatus === 'critical' ? 'bg-gradient-to-r from-red-500/5 to-red-500/10 border-red-500/20' :
            healthStatus === 'warning' ? 'bg-gradient-to-r from-amber-500/5 to-amber-500/10 border-amber-500/20' :
            'bg-gradient-to-r from-green-500/5 to-green-500/10 border-green-500/20'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <div className="relative flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                healthStatus === 'critical' ? 'bg-red-500/15' :
                healthStatus === 'warning' ? 'bg-amber-500/15' :
                'bg-green-500/15'
              }`}>
                {healthStatus === 'critical' ? <ShieldAlert className="h-5 w-5 text-red-500" /> :
                 healthStatus === 'warning' ? <AlertCircle className="h-5 w-5 text-amber-500" /> :
                 <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {healthStatus === 'critical' ? 'Action Required' :
                   healthStatus === 'warning' ? 'Attention Needed' :
                   'All Systems Operational'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {healthStatus === 'critical' ? `${healthIssues} issue(s) need immediate attention` :
                   healthStatus === 'warning' ? `${healthWarnings} item(s) to review` :
                   'Everything is running smoothly'}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" />{pipelineActive} active</span>
                <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" />{formatCurrency(pipelineActive * 500)} est.</span>
                {deliveryRate != null && (
                  <span className={`flex items-center gap-1.5 font-medium ${
                    deliveryRate >= 90 ? 'text-green-600' : deliveryRate >= 70 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    <MailOpen className="h-3.5 w-3.5" />{deliveryRate}% delivery
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* KPI Ribbon */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            <StatCard icon={Search} label="Raw (24h)" value={<AnimatedCounter value={funnel?.raw_24h || 0} />}
              subvalue={funnel ? `${funnel.stages?.[0]?.dropRate || 0}% approval rate` : undefined} color="#6366f1" />
            <StatCard icon={CheckCircle} label="Approved" value={<AnimatedCounter value={funnel?.approved || 0} />}
              subvalue={funnel ? `${funnel.rejected} rejected` : undefined} color="#22c55e" />
            <StatCard icon={Database} label="Enriched" value={<AnimatedCounter value={funnel?.enriched || 0} />}
              subvalue={`${funnel?.contacts || 0} contacts`} color="#a855f7" />
            <StatCard icon={Target} label="Leads" value={<AnimatedCounter value={funnel?.leads || 0} />}
              subvalue={funnel?.contacts > 0 ? `${Math.round((funnel.leads / funnel.contacts) * 100)}% conversion` : undefined} color="#f59e0b" />
            <StatCard icon={BarChart3} label="Avg Score" value={avgScore != null ? <AnimatedCounter value={avgScore} /> : '—'}
              subvalue={`${funnel?.pending || 0} pending`} color="#8b5cf6" />
            <StatCard icon={Send} label="Sent Today" value={<AnimatedCounter value={sendHealth?.sent_today || 0} />}
              subvalue={`${sendHealth?.daily.used || 0}/${sendHealth?.daily.limit || 50} daily`} color="#3b82f6" />
          </div>

          {/* Daily Stats Bar */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl px-5 py-3 border border-border/50">
            {funnel && (
              <>
                <span><span className="font-semibold text-foreground">{formatNumber(funnel.raw_24h)}</span> <span className="text-muted-foreground">discovered</span></span>
                <span className="text-muted-foreground/30 hidden sm:inline">|</span>
                <span><span className="font-semibold text-foreground">{formatNumber(funnel.approved)}</span> <span className="text-muted-foreground">approved</span></span>
                <span className="text-muted-foreground/30 hidden sm:inline">|</span>
              </>
            )}
            <span><span className="font-semibold text-foreground">{formatNumber(sendHealth?.sent_today || 0)}</span> <span className="text-muted-foreground">sent</span></span>
            {deliveryRate != null && (
              <>
                <span className="text-muted-foreground/30 hidden sm:inline">|</span>
                <span><span className={`font-semibold ${deliveryRate >= 90 ? 'text-green-600' : deliveryRate >= 70 ? 'text-amber-600' : 'text-red-500'}`}>{deliveryRate}%</span> <span className="text-muted-foreground">delivery</span></span>
              </>
            )}
            {openRate != null && (
              <>
                <span className="text-muted-foreground/30 hidden sm:inline">|</span>
                <span><span className={`font-semibold ${openRate >= 40 ? 'text-green-600' : openRate >= 20 ? 'text-amber-600' : 'text-red-500'}`}>{openRate}%</span> <span className="text-muted-foreground">open</span></span>
              </>
            )}
            {replyRate != null && (
              <>
                <span className="text-muted-foreground/30 hidden sm:inline">|</span>
                <span><span className="font-semibold text-green-600">{replyRate}%</span> <span className="text-muted-foreground">reply rate</span></span>
              </>
            )}
            {leadsData?.with_replies > 0 && (
              <>
                <span className="text-muted-foreground/30 hidden sm:inline">|</span>
                <span><span className="font-semibold text-foreground">{leadsData.with_replies}</span> <span className="text-muted-foreground">replied</span></span>
              </>
            )}
          </div>

          {/* Funnel + Pipeline */}
          <div className="grid gap-6 lg:grid-cols-7">
            {/* Discovery Funnel */}
            <Card className="lg:col-span-4 border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={BarChart3} title="Discovery Funnel" subtitle="End-to-end discovery pipeline" />
              </CardHeader>
              <CardContent>
                {funnel?.stages?.some((s: any) => s.count > 0) ? (
                  <div className="space-y-5">
                    {funnel.stages.map((stage: any, i: number) => {
                      const barWidth = stage.count > 0 ? Math.max(6, (stage.count / Math.max(funnel.stages[0]?.count, 1)) * 100) : 0
                      const prevCount = i > 0 ? funnel.stages[i - 1].count : stage.count
                      const conversionRate = prevCount > 0 ? Math.round((stage.count / prevCount) * 100) : 0
                      return (
                        <div key={stage.name} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{stage.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-foreground">{formatNumber(stage.count)}</span>
                              {i > 0 && (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  conversionRate >= 50 ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
                                }`}>
                                  {conversionRate}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${barWidth}%`, backgroundColor: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }}
                            />
                          </div>
                          {i < funnel.stages.length - 1 && stage.dropRate != null && (
                            <p className="text-[11px] text-muted-foreground ml-0.5">
                              {stage.dropRate}% → {funnel.stages[i + 1]?.name}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Search className="h-6 w-6 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No discovery data yet</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">Data will appear once discovery is configured</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pipeline Distribution */}
            <Card className="lg:col-span-3 border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={GitBranch} title="Pipeline" subtitle="Deal stages distribution" />
              </CardHeader>
              <CardContent>
                {pipeline && pipeline.total > 0 ? (
                  <>
                    <div className="space-y-4">
                      {Object.entries(pipeline.stages).filter(([, c]) => (c as number) > 0).map(([status, count]) => (
                        <div key={status}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-foreground capitalize">{status.replace('_', ' ')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{count as number}</span>
                              <span className="text-xs text-muted-foreground">{Math.round(((count as number) / pipeline.total) * 100)}%</span>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${((count as number) / pipeline.total) * 100}%`, backgroundColor: STATUS_COLORS[status] || '#a3a3a3' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-5 border-t border-border mt-5">
                      <div className="text-center p-3 rounded-lg bg-muted/40">
                        <p className="text-lg font-bold text-foreground">{pipeline.total}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/40">
                        <p className="text-lg font-bold text-foreground">{pipelineActive}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-green-500/5">
                        <p className="text-lg font-bold text-green-600">{formatCurrency(pipeline.won_revenue)}</p>
                        <p className="text-xs text-muted-foreground">Won</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Target className="h-6 w-6 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No pipeline data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Send Health + Lead Status */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* Send Health */}
            <Card className="xl:col-span-2 border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={Send} title="Send Health" subtitle="Email deliverability & quotas" />
              </CardHeader>
              <CardContent className="space-y-5">
                {sendHealth ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Daily Quota</span>
                          <span className="text-xs font-semibold text-foreground">{sendHealth.daily.used}/{sendHealth.daily.limit}</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{
                            width: `${Math.min((sendHealth.daily.used / Math.max(sendHealth.daily.limit, 1)) * 100, 100)}%`,
                            backgroundColor: sendHealth.daily.used >= sendHealth.daily.limit ? '#ef4444' : sendHealth.daily.used >= sendHealth.daily.limit * 0.8 ? '#f59e0b' : '#3b82f6'
                          }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-muted-foreground">Hourly Quota</span>
                          <span className="text-xs font-semibold text-foreground">{sendHealth.hourly.used}/{sendHealth.hourly.limit}</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{
                            width: `${Math.min((sendHealth.hourly.used / Math.max(sendHealth.hourly.limit, 1)) * 100, 100)}%`,
                            backgroundColor: sendHealth.hourly.used >= sendHealth.hourly.limit ? '#ef4444' : sendHealth.hourly.used >= sendHealth.hourly.limit * 0.8 ? '#f59e0b' : '#f59e0b'
                          }} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Sent', value: sendHealth.sent_today, icon: Send, color: '#6366f1' },
                        { label: 'Delivered', value: sendHealth.delivered_today, icon: MailOpen, color: '#22c55e' },
                        { label: 'Opened', value: sendHealth.opened_today, icon: Mail, color: '#10b981' },
                        { label: 'Bounced', value: sendHealth.bounced_today, icon: MailWarning, color: '#ef4444' },
                      ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
                          <Icon className="h-4 w-4 mx-auto mb-1.5" style={{ color }} />
                          <p className="text-lg font-bold text-foreground"><AnimatedCounter value={value} /></p>
                          <p className="text-[11px] text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 text-xs">
                      {deliveryRate != null && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                          <span className={`h-1.5 w-1.5 rounded-full ${deliveryRate >= 90 ? 'bg-green-500' : deliveryRate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className="text-muted-foreground">Delivery: <strong className="text-foreground">{deliveryRate}%</strong></span>
                        </div>
                      )}
                      {openRate != null && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                          <span className={`h-1.5 w-1.5 rounded-full ${openRate >= 40 ? 'bg-green-500' : openRate >= 20 ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className="text-muted-foreground">Open: <strong className="text-foreground">{openRate}%</strong></span>
                        </div>
                      )}
                    </div>

                    {sendChartData.length > 0 && (
                      <div className="h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sendChartData}>
                            <defs>
                              <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="delGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                            <XAxis dataKey="date" tickFormatter={(d) => {
                              const dt = new Date(d + 'T00:00:00')
                              return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
                            }} stroke="hsl(0 0% 70%)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(0 0% 90%)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                            <Area type="monotone" dataKey="sent" stroke="#6366f1" fill="url(#sentGrad)" strokeWidth={2} dot={false} name="Sent" />
                            <Area type="monotone" dataKey="delivered" stroke="#22c55e" fill="url(#delGrad)" strokeWidth={2} dot={false} name="Delivered" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Send className="h-6 w-6 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No send data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lead Status + Workers */}
            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={Users} title="Lead Status" subtitle={`${leadsData?.total || 0} total leads`} />
                </CardHeader>
                <CardContent>
                  {leadsData && leadsData.total > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(leadsData.status_breakdown || {}).filter(([, c]) => (c as number) > 0).map(([status, count]) => (
                        <div key={status}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-foreground capitalize">{status}</span>
                            <span className="text-sm font-semibold text-foreground">{count as number}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${((count as number) / leadsData.total) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border mt-3">
                        <div className="text-center p-2 rounded-lg bg-green-500/5">
                          <p className="text-sm font-bold text-green-600">{leadsData.with_replies || 0}</p>
                          <p className="text-[11px] text-muted-foreground">Replied</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-red-500/5">
                          <p className="text-sm font-bold text-red-500">{leadsData.with_bounces || 0}</p>
                          <p className="text-[11px] text-muted-foreground">Bounced</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Users className="h-5 w-5 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No leads yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={Zap} title="Workers" subtitle="System worker status" />
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {workers ? (
                    Object.entries(workers).map(([type, info]: [string, any]) => {
                      const icons: Record<string, any> = { discovery: Search, enrichment: Database, send: Send, reply: Reply }
                      const Icon = icons[type] || Activity
                      const isRunning = ['running', 'processing', 'sending', 'monitoring'].includes(info?.status)
                      const cbTripped = info?.circuit_breaker === true
                      return (
                        <div key={type} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isRunning ? 'bg-foreground/5' : 'bg-muted'}`}>
                            <Icon className={`h-4 w-4 ${isRunning ? 'text-foreground' : 'text-muted-foreground/50'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-foreground capitalize">{type}</p>
                              {cbTripped && <ShieldAlert className="h-3 w-3 text-destructive" />}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {cbTripped ? 'Circuit breaker open' : info?.status || 'idle'}
                              {info?.pending ? ` · ${info.pending} pending` : ''}
                            </p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                            cbTripped ? 'bg-destructive/10 text-destructive' :
                            isRunning ? 'bg-green-500/10 text-green-600' :
                            info?.status === 'paused' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {cbTripped ? 'Tripped' : info?.status || 'idle'}
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">No worker data</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════════ ANALYTICS TAB ════════════ */}
        <TabsContent value="analytics" className="mt-6 space-y-6">
          {/* Trends Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={TrendingUp} title="Send Activity (14 Days)" subtitle="Daily sent, delivered & opened" />
              </CardHeader>
              <CardContent>
                {sendChartData.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sendChartData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                        <XAxis dataKey="date" tickFormatter={(d) => {
                          const dt = new Date(d + 'T00:00:00')
                          return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        }} stroke="hsl(0 0% 70%)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(0 0% 70%)" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(0 0% 90%)' }} />
                        <Bar dataKey="sent" fill="#6366f1" radius={[3, 3, 0, 0]} name="Sent" />
                        <Bar dataKey="delivered" fill="#22c55e" radius={[3, 3, 0, 0]} name="Delivered" />
                        <Bar dataKey="opened" fill="#10b981" radius={[3, 3, 0, 0]} name="Opened" opacity={0.7} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">No data</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={Users} title="Lead Creation (14 Days)" subtitle="New leads & contacted trends" />
              </CardHeader>
              <CardContent>
                {leadChartData.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={leadChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                        <XAxis dataKey="date" tickFormatter={(d) => {
                          const dt = new Date(d + 'T00:00:00')
                          return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        }} stroke="hsl(0 0% 70%)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(0 0% 70%)" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(0 0% 90%)' }} />
                        <Line type="monotone" dataKey="created" stroke="#6366f1" strokeWidth={2} dot={false} name="Created" />
                        <Line type="monotone" dataKey="contacted" stroke="#22c55e" strokeWidth={2} dot={false} name="Contacted" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">No data</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Source Performance + Score Distribution */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            <Card className="xl:col-span-2 border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={PieChart} title="Source Performance" subtitle="Discovery sources by volume" />
              </CardHeader>
              <CardContent>
                {sourcePerformance.length > 0 ? (
                  <div className="space-y-3">
                    {sourcePerformance.slice(0, 8).map((src: any, i: number) => (
                      <div key={src.source} className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-foreground capitalize truncate">{src.source}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-muted-foreground">{src.total}</span>
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                src.approval_rate >= 50 ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
                              }`}>{src.approval_rate}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${src.approval_rate}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Activity className="h-5 w-5 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No source data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score Distribution or Rejection */}
            {scoreDistribution.length > 0 ? (
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={BarChart3} title="Score Distribution" subtitle="Composite score ranges" />
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scoreDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                        <XAxis dataKey="range" stroke="hsl(0 0% 70%)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(0 0% 70%)" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : rejectionBreakdown.length > 0 ? (
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={AlertCircle} title="Rejection Reasons" subtitle="Why companies are rejected" />
                </CardHeader>
                <CardContent>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie data={rejectionBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="reason"
                          label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {rejectionBreakdown.map((_: any, i: number) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Signal or Industry Distribution */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={Radio} title="Signal Types" subtitle="Discovery signal breakdown" />
              </CardHeader>
              <CardContent>
                {signalDistribution.length > 0 ? (
                  <div className="space-y-2.5">
                    {signalDistribution.slice(0, 6).map((sig: any, i: number) => (
                      <div key={sig.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="text-sm text-foreground capitalize">{sig.name}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{sig.value}</span>
                      </div>
                    ))}
                    {signalDistribution.length > 6 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        +{signalDistribution.length - 6} more signals
                      </p>
                    )}
                  </div>
                ) : industryBreakdown.length > 0 ? (
                  <div className="space-y-2.5">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Industries</p>
                    {industryBreakdown.slice(0, 6).map((ind: any) => (
                      <div key={ind.industry} className="flex items-center justify-between">
                        <span className="text-sm text-foreground truncate">{ind.industry}</span>
                        <span className="text-sm font-medium text-foreground">{ind.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Radio className="h-5 w-5 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No signal data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Brand Performance + Industry / Campaign Summary */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={Building2} title="Brand Performance" subtitle="Per-brand comparison" />
              </CardHeader>
              <CardContent>
                {brandPerformance.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">Brand</th>
                          <th className="text-right py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">Companies</th>
                          <th className="text-right py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">Leads</th>
                          <th className="text-right py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">Sent</th>
                          <th className="text-center py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brandPerformance.map((b: any) => (
                          <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                  <Building2 className="h-3 w-3 text-indigo-500" />
                                </div>
                                <span className="font-medium text-foreground">{b.name}</span>
                              </div>
                            </td>
                            <td className="text-right py-2.5 px-2 text-foreground">{b.companies}</td>
                            <td className="text-right py-2.5 px-2 text-foreground">{b.leads}</td>
                            <td className="text-right py-2.5 px-2 text-foreground">{b.sent}</td>
                            <td className="text-center py-2.5 px-2">
                              <div className="flex items-center justify-center gap-1">
                                <span className={`h-1.5 w-1.5 rounded-full ${b.is_active ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                                <span className="text-xs text-muted-foreground">{b.is_active ? 'Active' : 'Inactive'}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">No brands configured</div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={MessageSquare} title="Campaign Summary" subtitle="Last 7 days" />
                </CardHeader>
                <CardContent>
                  {campaignSummary?.total_campaigns > 0 ? (
                    <div className="space-y-3">
                      {[
                        { label: 'Campaigns', value: campaignSummary.total_campaigns, color: '#6366f1' },
                        { label: 'Sent', value: campaignSummary.total_sent, color: '#3b82f6' },
                        { label: 'Delivered', value: campaignSummary.total_delivered, color: '#22c55e' },
                        { label: 'Opened', value: campaignSummary.total_opened, color: '#10b981' },
                        { label: 'Replied', value: campaignSummary.total_replied, color: '#06b6d4' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className="text-sm font-semibold text-foreground"><AnimatedCounter value={item.value} /></span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <MessageSquare className="h-5 w-5 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No campaigns</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={Hash} title="Discovery Metrics" subtitle="Last 7 days" />
                </CardHeader>
                <CardContent>
                  {discoveryMetrics && discoveryMetrics.runs > 0 ? (
                    <div className="space-y-3">
                      {[
                        { label: 'Runs', value: discoveryMetrics.runs, color: '#6366f1' },
                        { label: 'Success Rate', value: `${discoveryMetrics.success_rate}%`, color: '#22c55e' },
                        { label: 'Companies Found', value: discoveryMetrics.companies_discovered, color: '#a855f7' },
                        { label: 'Contacts Found', value: discoveryMetrics.contacts_discovered, color: '#f59e0b' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className="text-sm font-semibold text-foreground">
                            {typeof item.value === 'number' ? <AnimatedCounter value={item.value} /> : item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Search className="h-5 w-5 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No discovery runs</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════════ HEALTH TAB ════════════ */}
        <TabsContent value="health" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {/* Circuit Breakers */}
            <Card className="xl:col-span-2 border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={Shield} title="Circuit Breakers" subtitle="System protection status"
                  action={circuitBreakers?.open > 0 && (
                    <Badge variant="destructive" className="text-xs">{circuitBreakers.open} open</Badge>
                  )}
                />
              </CardHeader>
              <CardContent>
                {circuitBreakers?.items?.length > 0 ? (
                  <div className="space-y-2.5">
                    {(circuitBreakers.items as any[]).slice(0, 10).map((cb: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          cb.state === 'open' ? 'bg-red-500/10' : cb.state === 'half-open' ? 'bg-amber-500/10' : 'bg-green-500/10'
                        }`}>
                          {cb.state === 'open' ? <ShieldAlert className="h-4 w-4 text-red-500" /> :
                           cb.state === 'half-open' ? <AlertTriangle className="h-4 w-4 text-amber-500" /> :
                           <CheckCircle className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground capitalize">{cb.entity_type}</p>
                          <p className="text-xs text-muted-foreground">{cb.failure_count} failures{cb.last_failure_reason ? ` · ${cb.last_failure_reason}` : ''}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                          cb.state === 'open' ? 'bg-red-500/10 text-red-500' :
                          cb.state === 'half-open' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-green-500/10 text-green-600'
                        }`}>{cb.state}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                    <p className="text-sm font-medium text-foreground">All circuit breakers closed</p>
                    <p className="text-xs text-muted-foreground mt-1">No system protection issues</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dead Letters + Suppression */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={AlertTriangle} title="Dead Letters" subtitle="Failed processing queue"
                  action={deadLetters?.unresolved > 0 && (
                    <Badge variant="destructive" className="text-xs">{deadLetters.unresolved} unresolved</Badge>
                  )}
                />
              </CardHeader>
              <CardContent>
                {deadLetters && deadLetters.total > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm text-foreground">Total</span>
                      <span className="text-lg font-bold text-foreground">{deadLetters.total}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5">
                      <span className="text-sm text-foreground">Unresolved</span>
                      <span className="text-lg font-bold text-red-500">{deadLetters.unresolved}</span>
                    </div>
                    {Object.entries(deadLetters.by_type || {}).length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-2">By type</p>
                        {Object.entries(deadLetters.by_type).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between py-1">
                            <span className="text-sm text-muted-foreground capitalize">{type}</span>
                            <span className="text-sm font-medium text-foreground">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                    <p className="text-sm font-medium text-foreground">No dead letters</p>
                    <p className="text-xs text-muted-foreground mt-1">All processing running smoothly</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={Lock} title="Suppression" subtitle="Blocked & blacklisted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-foreground">Suppressed</span>
                    <span className="text-lg font-bold text-foreground">{suppression?.suppressed || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-foreground">Blacklisted</span>
                    <span className="text-lg font-bold text-foreground">{suppression?.blacklisted || 0}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">Emails and domains that have been suppressed or blacklisted from outbound</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sending Domains + Bounce by Domain */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={Globe} title="Sending Domains" subtitle="Domain deliverability health"
                  action={sendingDomains?.disabled > 0 && (
                    <Badge variant="destructive" className="text-xs">{sendingDomains.disabled} disabled</Badge>
                  )}
                />
              </CardHeader>
              <CardContent>
                {sendingDomains?.domains?.length > 0 ? (
                  <div className="space-y-3">
                    {(sendingDomains.domains as any[]).map((sd: any) => (
                      <div key={sd.domain} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          sd.is_active ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                          <Globe className={`h-4 w-4 ${sd.is_active ? 'text-green-500' : 'text-red-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{sd.domain}</span>
                            {!sd.is_active && sd.disabled_reason && (
                              <span className="text-xs text-muted-foreground">({sd.disabled_reason})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{sd.sent_today}/{sd.daily_limit} today</span>
                            <span>{sd.total_sent} total</span>
                            <span>{sd.bounce_count} bounces</span>
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                          sd.is_active ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'
                        }`}>{sd.is_active ? 'Active' : 'Disabled'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Globe className="h-6 w-6 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No sending domains configured</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={MailWarning} title="Bounce by Domain" subtitle="Top bounces by recipient domain" />
              </CardHeader>
              <CardContent>
                {bounceByDomain.length > 0 ? (
                  <div className="space-y-3">
                    {bounceByDomain.map((bd: any, i: number) => {
                      const maxBounce = Math.max(...bounceByDomain.map((b: any) => b.count), 1)
                      return (
                        <div key={bd.domain} className="flex items-center gap-3">
                          <span className="text-sm text-foreground w-6 text-right font-medium">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-foreground truncate">{bd.domain}</span>
                              <span className="text-sm font-semibold text-foreground">{bd.count}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-red-500" style={{ width: `${(bd.count / maxBounce) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
                    <p className="text-sm font-medium text-foreground">No bounces today</p>
                    <p className="text-xs text-muted-foreground mt-1">All emails delivered successfully</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Team + Discovery */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={UserCheck} title="Team" subtitle="Active members" />
              </CardHeader>
              <CardContent>
                {teamStats ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-lg font-bold text-foreground">{teamStats.total}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-green-500/5">
                        <p className="text-lg font-bold text-green-600">{teamStats.active}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">Admins</span>
                      <span className="font-medium text-foreground">{teamStats.admins}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-medium text-foreground">{teamStats.members}</span>
                    </div>
                    {teamStats.recent_joins > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Joined (7d)</span>
                        <span className="font-medium text-green-600">+{teamStats.recent_joins}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Users className="h-5 w-5 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No team data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="xl:col-span-3 border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={Activity} title="Health Summary" subtitle="Quick overview of system status" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Workers', value: workers ? Object.values(workers).filter((w: any) => w?.status === 'running' || w?.status?.includes('ing')).length : 0, total: workers ? Object.keys(workers).length : 0, color: '#6366f1' },
                    { label: 'Circuit Breakers', value: circuitBreakers?.total || 0, total: 0, color: circuitBreakers?.open > 0 ? '#ef4444' : '#22c55e' },
                    { label: 'Dead Letters', value: deadLetters?.unresolved || 0, total: 0, color: deadLetters?.unresolved > 0 ? '#ef4444' : '#22c55e' },
                    { label: 'Sending Domains', value: sendingDomains?.active || 0, total: sendingDomains?.active + sendingDomains?.disabled || 0, color: sendingDomains?.disabled > 0 ? '#f59e0b' : '#22c55e' },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-2xl font-bold text-foreground">
                        <AnimatedCounter value={item.value} />
                        {item.total > 0 && <span className="text-sm text-muted-foreground font-normal">/{item.total}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════ ACTIVITY TAB ════════════ */}
        <TabsContent value="activity" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Activity Feed */}
            <Card className="lg:col-span-2 border-border/50 shadow-sm">
              <CardHeader>
                <SectionHeader icon={Activity} title="Activity Feed" subtitle={`${activityFeed.length} recent events`} />
              </CardHeader>
              <CardContent>
                {activityFeed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Activity className="h-6 w-6 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {activityFeed.map((activity: any) => {
                      const iconMap: Record<string, any> = {
                        discovery_enabled: Search, discovery_disabled: Search,
                        outbound_enabled: Send, outbound_disabled: Send,
                        company_created: Building2, company_enriched: Database,
                        lead_created: Users, email_sent: Mail, email_opened: MailOpen,
                        email_bounced: MailWarning, email_replied: Reply,
                      }
                      const colorMap: Record<string, string> = {
                        discovery_enabled: '#6366f1', discovery_disabled: '#ef4444',
                        outbound_enabled: '#22c55e', outbound_disabled: '#ef4444',
                        company_created: '#a3a3a3', company_enriched: '#a855f7',
                        lead_created: '#f59e0b', email_sent: '#6366f1',
                        email_opened: '#10b981', email_bounced: '#ef4444',
                        email_replied: '#22c55e',
                      }
                      const Icon = iconMap[activity.activity_type] || Activity
                      const color = colorMap[activity.activity_type] || '#666'

                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                            <Icon className="h-4 w-4" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{activity.description || activity.activity_type}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(activity.created_at)}</p>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0 capitalize">
                            {activity.activity_type?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Recent Replies */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={Reply} title="Recent Replies" subtitle={`${replies?.today || 0} today`}
                    action={replies?.meetings_requested > 0 && (
                      <Badge variant="success" className="text-xs">{replies.meetings_requested} meetings</Badge>
                    )}
                  />
                </CardHeader>
                <CardContent>
                  {replies?.recent?.length > 0 ? (
                    <div className="space-y-2.5">
                      {(replies.recent as any[]).map((r: any) => (
                        <div key={r.id} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                              r.sentiment === 'positive' ? 'bg-green-500/10 text-green-600' :
                              r.sentiment === 'negative' ? 'bg-red-500/10 text-red-500' :
                              'bg-muted text-muted-foreground'
                            }`}>{r.sentiment || 'unknown'}</span>
                            {r.meeting_requested && <Badge variant="success" className="text-[10px]">Meeting</Badge>}
                            {r.objection_detected && <Badge variant="destructive" className="text-[10px]">Objection</Badge>}
                          </div>
                          <p className="text-sm text-foreground truncate">{r.summary || r.intent || 'No summary'}</p>
                          <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(r.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Reply className="h-5 w-5 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No replies yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={Sparkles} title="Quick Stats" subtitle="At a glance" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Avg Lead Score', value: leadsData?.avg_lead_score ?? '—', icon: BarChart3 },
                      { label: 'Avg Deal Value', value: leadsData?.avg_deal_value ? formatCurrency(leadsData.avg_deal_value) : '—', icon: TrendingUp },
                      { label: 'Avg Composite Score', value: avgScore ?? '—', icon: Target },
                      { label: 'Leads Replied', value: leadsData?.with_replies ?? 0, icon: Reply },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {typeof item.value === 'number' ? <AnimatedCounter value={item.value} /> : item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
