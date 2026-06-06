import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatRelativeTime } from '@/lib/utils'
import {
  Users, Search, Target, Play, PauseCircle, CheckCircle, AlertCircle, Database,
  Send, Reply, BarChart3, Activity, TrendingUp, PieChart, Mail, MailOpen, MailWarning,
  Zap, ShieldAlert,
} from 'lucide-react'
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { dashboardAPI } from '@/lib/api'

const PIPELINE_COLORS: Record<string, string> = {
  researching: '#a3a3a3', qualified: '#808080', draft_ready: '#666666',
  contacted: '#525252', replied: '#404040', closed_won: '#262626', closed_lost: '#d4d4d4',
}
const FUNNEL_BG_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#10b981']
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const ACTIVITY_ICONS: Record<string, any> = {
  discovery_enabled: Search, discovery_disabled: Search,
  outbound_enabled: Send, outbound_disabled: Send,
  company_created: Users, company_enriched: Database,
  lead_created: Target, email_sent: Mail, email_opened: MailOpen,
  email_bounced: MailWarning, email_replied: Reply,
}

const ACTIVITY_COLORS: Record<string, string> = {
  discovery_enabled: '#3b82f6', discovery_disabled: '#ef4444',
  outbound_enabled: '#22c55e', outbound_disabled: '#ef4444',
  company_created: '#a3a3a3', company_enriched: '#a855f7',
  lead_created: '#f59e0b', email_sent: '#6366f1',
  email_opened: '#10b981', email_bounced: '#ef4444',
  email_replied: '#22c55e',
}

function getActivityIcon(type: string) {
  return ACTIVITY_ICONS[type] || Activity
}

function getActivityColor(type: string) {
  return ACTIVITY_COLORS[type] || '#666666'
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => { fetchDashboard() }, [])

  const fetchDashboard = async () => {
    setHasError(false)
    try {
      const res = await dashboardAPI.overview()
      setData(res.data || {})
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-border border-t-foreground" />
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Unable to load dashboard</h2>
            <p className="text-sm text-muted-foreground mb-6">There was an error fetching your dashboard data.</p>
            <button onClick={fetchDashboard} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">Retry</button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const funnel = data?.funnel
  const pipeline = data?.pipeline
  const sendHealth = data?.send_health
  const rejectionBreakdown = data?.rejection_breakdown || []
  const sourcePerformance = data?.source_performance || []
  const scoreDistribution = data?.score_distribution || []
  const workers = data?.workers
  const activityFeed = data?.activity_feed || []
  const brand = data?.brand
  const avgScore = data?.avg_composite_score

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time overview of your outbound sales engine</p>
        </div>
        {brand && (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
              {brand.name}
            </span>
          </div>
        )}
      </div>

      {/* KPI Ribbon */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Raw (24h)</p>
              <Search className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
            <p className="text-2xl font-bold text-foreground">{formatNumber(funnel?.raw_24h || 0)}</p>
            {funnel && (
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-[#22c55e] font-medium">{funnel.stages?.[0]?.dropRate || 0}%</span> approval rate
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approved</p>
              <CheckCircle className="h-3.5 w-3.5 text-[#22c55e]/50" />
            </div>
            <p className="text-2xl font-bold text-foreground">{formatNumber(funnel?.approved || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-muted-foreground">{formatNumber(funnel?.rejected || 0)}</span> rejected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Enriched</p>
              <Database className="h-3.5 w-3.5 text-[#a855f7]/50" />
            </div>
            <p className="text-2xl font-bold text-foreground">{formatNumber(funnel?.enriched || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatNumber(funnel?.contacts || 0)} contacts found</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Leads</p>
              <Target className="h-3.5 w-3.5 text-[#f59e0b]/50" />
            </div>
            <p className="text-2xl font-bold text-foreground">{formatNumber(funnel?.leads || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {funnel?.contacts > 0 ? `${Math.round((funnel.leads / funnel.contacts) * 100)}%` : '0%'} contact-to-lead
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Score</p>
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
            <p className="text-2xl font-bold text-foreground">{avgScore != null ? avgScore : '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatNumber(funnel?.pending || 0)} pending enrichment</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel + Pipeline */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Discovery Funnel */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Discovery Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {funnel?.stages && funnel.stages.some((s: any) => s.count > 0) ? (
              <div className="space-y-4">
                {funnel.stages.map((stage: any, i: number) => {
                  const barWidth = stage.count > 0 ? Math.max(8, (stage.count / Math.max(funnel.stages[0]?.count, 1)) * 100) : 0
                  const prevCount = i > 0 ? funnel.stages[i - 1].count : stage.count
                  const conversionRate = prevCount > 0 ? Math.round((stage.count / prevCount) * 100) : 0
                  return (
                    <div key={stage.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{stage.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-foreground">{formatNumber(stage.count)}</span>
                          {i > 0 && (
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {conversionRate}% ↓
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${barWidth}%`, backgroundColor: FUNNEL_BG_COLORS[i % FUNNEL_BG_COLORS.length] }}
                        />
                      </div>
                      {i < funnel.stages.length - 1 && stage.dropRate != null && (
                        <p className="text-[11px] text-muted-foreground ml-0.5">
                          {stage.dropRate}% of {stage.name} → {funnel.stages[i + 1].name}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="h-5 w-5 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No discovery data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipeline && pipeline.total > 0 ? (
              <>
                <div className="space-y-4">
                  {Object.entries(pipeline.stages).filter(([, c]) => (c as number) > 0).map(([status, count]) => (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-foreground capitalize">{status.replace('_', ' ')}</span>
                        <span className="text-sm font-semibold text-foreground">{count as number}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${((count as number) / pipeline.total) * 100}%`,
                            backgroundColor: PIPELINE_COLORS[status] || '#a3a3a3'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border mt-4 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Companies</span>
                    <span className="font-semibold text-foreground">{pipeline.total}</span>
                  </div>
                  {pipeline.won_revenue > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Won Revenue</span>
                      <span className="font-semibold text-[#22c55e]">{formatCurrency(pipeline.won_revenue)}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Target className="h-5 w-5 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No companies in pipeline</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Send Health + Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {/* Send Health */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Send className="h-4 w-4 text-muted-foreground" />
              Send Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sendHealth ? (
              <div className="space-y-5">
                {/* Quota bars */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Daily Quota</span>
                      <span className="text-xs font-semibold text-foreground">{sendHealth.daily.used}/{sendHealth.daily.limit}</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((sendHealth.daily.used / Math.max(sendHealth.daily.limit, 1)) * 100, 100)}%`,
                          backgroundColor: sendHealth.daily.used >= sendHealth.daily.limit ? '#ef4444' : '#3b82f6'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Hourly Quota</span>
                      <span className="text-xs font-semibold text-foreground">{sendHealth.hourly.used}/{sendHealth.hourly.limit}</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min((sendHealth.hourly.used / Math.max(sendHealth.hourly.limit, 1)) * 100, 100)}%`,
                          backgroundColor: sendHealth.hourly.used >= sendHealth.hourly.limit ? '#ef4444' : '#f59e0b'
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* Today's stats */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Sent', value: sendHealth.sent_today, icon: Send, color: '#6366f1' },
                    { label: 'Delivered', value: sendHealth.delivered_today, icon: MailOpen, color: '#22c55e' },
                    { label: 'Opened', value: sendHealth.opened_today, icon: Mail, color: '#10b981' },
                    { label: 'Bounced', value: sendHealth.bounced_today, icon: MailWarning, color: '#ef4444' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="text-center p-3 rounded-lg bg-muted/30 border border-border">
                      <Icon className="h-4 w-4 mx-auto mb-1.5" style={{ color }} />
                      <p className="text-lg font-bold text-foreground">{value}</p>
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
                {/* 7-day trend */}
                {sendHealth.last_7_days?.length > 0 && (
                  <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sendHealth.last_7_days}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                        <XAxis dataKey="date" tickFormatter={(d) => {
                          const dt = new Date(d + 'T00:00:00')
                          return dt.toLocaleDateString('en-US', { weekday: 'short' })
                        }} stroke="hsl(0 0% 70%)" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="sent" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} dot={false} name="Sent" />
                        <Area type="monotone" dataKey="delivered" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} dot={false} name="Delivered" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Send className="h-5 w-5 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No send data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              Source Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sourcePerformance.length > 0 ? (
              <div className="space-y-3">
                {sourcePerformance.slice(0, 6).map((src: any, i: number) => (
                  <div key={src.source} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground capitalize truncate">{src.source}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground">{src.total}</span>
                          <span className={`text-xs font-medium ${src.approval_rate >= 50 ? 'text-[#22c55e]' : 'text-[#f59e0b]'}`}>{src.approval_rate}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${src.approval_rate}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Activity className="h-5 w-5 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No source data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rejection Breakdown */}
        {rejectionBreakdown.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                Rejection Reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={rejectionBreakdown} cx="50%" cy="50%" outerRadius={75} dataKey="count" nameKey="reason" label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
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
        ) : scoreDistribution.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                    <XAxis dataKey="range" stroke="hsl(0 0% 70%)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(0 0% 70%)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Activity + Workers + Score Distribution fallback */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Recent Activity
              </CardTitle>
              {activityFeed.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{activityFeed.length} events</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activityFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Activity className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-1">
                {activityFeed.slice(0, 10).map((activity: any) => {
                  const Icon = getActivityIcon(activity.activity_type)
                  const accent = getActivityColor(activity.activity_type)
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}15` }}>
                        <Icon className="h-4 w-4" style={{ color: accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{activity.description || activity.activity_type}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(activity.created_at)}</p>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0 capitalize">{activity.activity_type?.replace(/_/g, ' ')}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Worker Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Zap className="h-4 w-4 text-muted-foreground" />
              Worker Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workers ? (
              Object.entries(workers).map(([type, info]: [string, any]) => {
                const icons: Record<string, any> = { discovery: Search, enrichment: Database, send: Send, reply: Reply }
                const Icon = icons[type] || Activity
                const status = info?.status || 'idle'
                const isRunning = ['running', 'processing', 'sending', 'monitoring'].includes(status)
                const cbTripped = info?.circuit_breaker === true
                return (
                  <div key={type} className="group flex items-center gap-3 p-3.5 rounded-lg bg-muted/30 border border-border hover:bg-muted/60 transition-all duration-200">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${isRunning ? 'bg-foreground/5 border-foreground/10' : 'bg-muted border-border'}`}>
                      <Icon className={`h-[16px] w-[16px] ${isRunning ? 'text-foreground' : 'text-muted-foreground/50'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground capitalize">{type}</p>
                        {cbTripped && <ShieldAlert className="h-3 w-3 text-destructive" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {info?.last_run ? `Last: ${formatRelativeTime(info.last_run)}` : 'Not run yet'}
                        {info?.pending ? ` · ${info.pending} pending` : ''}
                        {info?.reason ? ` · ${info.reason}` : ''}
                        {cbTripped ? ' · Circuit open' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {cbTripped ? (
                        <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                      ) : isRunning ? (
                        <Play className="h-3.5 w-3.5 text-foreground" />
                      ) : status === 'paused' ? (
                        <PauseCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/40" />
                      )}
                      <span className={`text-xs font-medium ${cbTripped ? 'text-destructive' : isRunning ? 'text-foreground' : status === 'paused' ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                        {cbTripped ? 'tripped' : status}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No worker data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
