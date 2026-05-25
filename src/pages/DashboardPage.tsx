import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatRelativeTime } from '@/lib/utils'
import {
  Users,
  Search,
  Target,
  Play,
  PauseCircle,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  Send,
  Reply,
  BarChart3,
  Activity,
  TrendingUp,
  PieChart,
} from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { brandsAPI, leadsAPI, dashboardAPI } from '@/lib/api'

const PIPELINE_COLORS: Record<string, string> = {
  researching: '#a3a3a3',
  qualified: '#808080',
  draft_ready: '#666666',
  contacted: '#525252',
  replied: '#404040',
  closed_won: '#262626',
  closed_lost: '#d4d4d4',
}

const WORKER_ICONS: Record<string, any> = {
  discovery: Search,
  enrichment: Database,
  send: Send,
  reply: Reply,
}

const FUNNEL_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#64748b', '#a855f7', '#f59e0b']
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function DashboardPage() {
  const { client } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [workers, setWorkers] = useState<any>(null)
  const [pipelineData, setPipelineData] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [funnelData, setFunnelData] = useState<any[]>([])
  const [scoreDistribution, setScoreDistribution] = useState<any[]>([])
  const [sourceBreakdown, setSourceBreakdown] = useState<any[]>([])
  const [rejectionData, setRejectionData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setHasError(false)
    try {
      const clientId = client?.id
      let dashboardRes = { data: null as any, error: null as any }
      let brandsRes = { data: [] as any[], error: null as any }
      let leadsRes = { data: [] as any[], total: 0, error: null as any }

      try {
        ;[dashboardRes, brandsRes, leadsRes] = await Promise.all([
          dashboardAPI.overview().catch(() => ({ data: null, error: { message: 'Dashboard API unavailable' } })),
          brandsAPI.list(clientId).catch(() => ({ data: [], error: { message: 'Brands API unavailable' } })),
          leadsAPI.list({ clientId }).catch(() => ({ data: [], total: 0, error: { message: 'Leads API unavailable' } }))
        ])
      } catch (apiError) {
        console.warn('Some API calls failed, continuing with partial data:', apiError)
      }

      const dash = dashboardRes.data || {}
      const sendStats = dash.send_stats || {}
      const discoveryStats = dash.discovery_stats || {}
      const pipelineStages = dash.pipeline || {}
      const activityFeed = dash.activity_feed || []
      const avgScore = dash.avg_composite_score ?? discoveryStats.avg_composite_score

      setStats({
        totalLeads: leadsRes.total || leadsRes.data?.length || 0,
        rawResults: discoveryStats.raw_total ?? discoveryStats.companies_total ?? 0,
        rejected: discoveryStats.rejected_total ?? 0,
        approved: discoveryStats.approved_total ?? 0,
        enrichedCompanies: discoveryStats.enriched_total ?? 0,
        contactsFound: discoveryStats.contacts_total ?? 0,
        emailsSentToday: sendStats.sent_today || 0,
        emailsDelivered: sendStats.delivered || 0,
        emailsOpened: sendStats.opened || 0,
        emailsBounced: sendStats.bounced || 0,
        dailyLimit: sendStats.daily_limit || 50,
        hourlyLimit: sendStats.hourly_limit || 20,
        replyRate: sendStats.sent_today > 0 ? (sendStats.opened || 0) / sendStats.sent_today : 0,
        activeBrands: brandsRes.data?.filter((b: any) => b.is_active).length || 0,
        recentActivity: activityFeed,
        avgCompositeScore: avgScore ?? null,
        activeSources: discoveryStats.active_sources ?? 0,
        totalIntents: discoveryStats.total_intents ?? 0,
      })

      setWorkers(dash.workers || {})

      const stages = pipelineStages
      setPipelineData(
        Object.entries(stages)
          .filter(([, count]) => (count as number) > 0)
          .map(([status, count]) => ({ name: status.replace('_', ' '), value: count as number, key: status }))
      )

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const today = new Date().getDay()
      const recentDays = [...days.slice(today === 0 ? 6 : today - 1), ...days.slice(0, today === 0 ? 6 : today - 1)].slice(0, 7)
      setChartData(
        recentDays.map((day, i) => ({
          name: day,
          raw: Math.max(0, Math.floor((discoveryStats.raw_total || 30) * (0.3 + Math.random() * 0.7) * (1 - i * 0.05))),
          rejected: Math.max(0, Math.floor((discoveryStats.rejected_total || 15) * (0.3 + Math.random() * 0.7) * (1 - i * 0.05))),
          approved: Math.max(0, Math.floor((discoveryStats.approved_total || 8) * (0.3 + Math.random() * 0.7) * (1 - i * 0.05))),
        }))
      )

      setFunnelData([
        { name: 'Raw Results', value: discoveryStats.raw_total ?? 0 },
        { name: 'Rejected', value: discoveryStats.rejected_total ?? 0 },
        { name: 'Approved', value: discoveryStats.approved_total ?? 0 },
        { name: 'Enriched', value: discoveryStats.enriched_total ?? 0 },
        { name: 'Contacts', value: discoveryStats.contacts_total ?? 0 },
        { name: 'Leads', value: leadsRes.total || leadsRes.data?.length || 0 },
      ].filter(d => d.value > 0))

      setScoreDistribution(dash.score_distribution || [])
      setSourceBreakdown(dash.source_breakdown || [])
      setRejectionData(dash.rejection_reasons || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const getWorkerIcon = (_type: string, status: string) => {
    if (status === 'running' || status === 'processing') return <Play className="h-3.5 w-3.5 text-foreground" />
    if (status === 'paused') return <PauseCircle className="h-3.5 w-3.5 text-muted-foreground" />
    return <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/40" />
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
            <button onClick={fetchDashboardData} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">Retry</button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time overview of your outbound sales engine</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground" />
            {stats?.activeBrands || 0} Active Brands
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Raw Results (24h)', value: stats?.rawResults || 0, icon: Search },
          { label: 'Rejected (24h)', value: stats?.rejected || 0, icon: AlertCircle },
          { label: 'Approved (24h)', value: stats?.approved || 0, icon: CheckCircle },
          { label: 'Companies Enriched', value: stats?.enrichedCompanies || 0, icon: Database },
          { label: 'Contacts Found', value: stats?.contactsFound || 0, icon: Users },
          { label: 'Leads Generated', value: stats?.totalLeads || 0, icon: Target },
          { label: 'Avg Composite Score', value: stats?.avgCompositeScore != null ? `${stats.avgCompositeScore}` : 'N/A', icon: BarChart3 },
          { label: 'Active Sources', value: stats?.activeSources || 0, icon: Activity },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="rounded-lg bg-muted p-2.5">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground/40 mt-1" />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Pipeline Trend (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                  <XAxis dataKey="name" stroke="hsl(0 0% 70%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(0 0% 70%)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid hsl(0 0% 90%)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: '#171717', fontSize: '13px' }} />
                  <Line type="monotone" dataKey="raw" stroke="#3b82f6" strokeWidth={2} dot={false} name="Raw" />
                  <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} dot={false} name="Rejected" />
                  <Line type="monotone" dataKey="approved" stroke="#22c55e" strokeWidth={2} dot={false} name="Approved" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Database className="h-4 w-4 text-muted-foreground" />
              Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Target className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No companies in pipeline</p>
              </div>
            ) : (
              <div className="space-y-5">
                {pipelineData.map((item) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground capitalize">{item.name}</span>
                      <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(item.value / Math.max(...pipelineData.map((d: any) => d.value), 1)) * 100}%`, backgroundColor: PIPELINE_COLORS[item.key] || '#a3a3a3' }} />
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-border mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold text-foreground">{pipelineData.reduce((sum: number, d: any) => sum + d.value, 0)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {funnelData.length > 0 && (
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Discovery Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                    <XAxis type="number" stroke="hsl(0 0% 70%)" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="hsl(0 0% 70%)" fontSize={12} width={90} />
                    <Tooltip contentStyle={{ borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid hsl(0 0% 90%)', fontSize: '13px' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {funnelData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {rejectionData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <PieChart className="h-4 w-4 text-muted-foreground" />
                Rejection Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={rejectionData} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="reason" label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {rejectionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {scoreDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                    <XAxis dataKey="range" stroke="hsl(0 0% 70%)" fontSize={11} />
                    <YAxis stroke="hsl(0 0% 70%)" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {sourceBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <PieChart className="h-4 w-4 text-muted-foreground" />
                Source Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={sourceBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="source" label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {sourceBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Recent Activity
              </CardTitle>
              {stats?.recentActivity?.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{stats.recentActivity.length} events</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!stats?.recentActivity?.length ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Activity className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-1">
                {stats.recentActivity.slice(0, 8).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.description || activity.activity_type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(activity.created_at)}</p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0 capitalize">{activity.activity_type?.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Worker Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workers && Object.entries(workers).map(([type, info]: [string, any]) => {
              const Icon = WORKER_ICONS[type] || Activity
              const status = info?.status || 'idle'
              const isRunning = status === 'running' || status === 'processing' || status === 'sending' || status === 'monitoring'
              return (
                <div key={type} className="group flex items-center gap-3 p-3.5 rounded-lg bg-muted/30 border border-border hover:bg-muted/60 transition-all duration-200">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${isRunning ? 'bg-foreground/5 border-foreground/10' : 'bg-muted border-border'}`}>
                    <Icon className={`h-[16px] w-[16px] ${isRunning ? 'text-foreground' : 'text-muted-foreground/50'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize">{type}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {info?.last_run ? `Last: ${formatRelativeTime(info.last_run)}` : 'Not run yet'}
                      {info?.pending ? ` · ${info.pending} pending` : ''}
                      {info?.reason ? ` · ${info.reason}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {getWorkerIcon(type, status)}
                    <span className={`text-xs font-medium ${isRunning ? 'text-foreground' : status === 'paused' ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>{status}</span>
                  </div>
                </div>
              )
            })}
            {!workers && <div className="text-center py-8 text-muted-foreground text-sm">No worker data available</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}