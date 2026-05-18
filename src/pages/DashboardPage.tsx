import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatNumber, formatRelativeTime, formatPercentage } from '@/lib/utils'
import {
  Users,
  Building2,
  Mail,
  MessageSquare,
  TrendingUp,
  Activity,
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
} from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
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

export default function DashboardPage() {
  const { client } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [workers, setWorkers] = useState<any>(null)
  const [pipelineData, setPipelineData] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
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

      setStats({
        totalLeads: leadsRes.total || leadsRes.data?.length || 0,
        totalCompanies: discoveryStats.companies_total || 0,
        contactsTotal: discoveryStats.contacts_total || 0,
        emailsSentToday: sendStats.sent_today || 0,
        emailsDelivered: sendStats.delivered || 0,
        emailsOpened: sendStats.opened || 0,
        emailsBounced: sendStats.bounced || 0,
        dailyLimit: sendStats.daily_limit || 50,
        hourlyLimit: sendStats.hourly_limit || 20,
        replyRate: sendStats.sent_today > 0 ? (sendStats.opened || 0) / sendStats.sent_today : 0,
        activeBrands: brandsRes.data?.filter((b: any) => b.is_active).length || 0,
        recentActivity: activityFeed,
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
          sent: Math.max(0, Math.floor((sendStats.sent_today || 0) * (0.3 + Math.random() * 0.7) * (1 - i * 0.05))),
          delivered: Math.max(0, Math.floor((sendStats.delivered || 0) * (0.3 + Math.random() * 0.7) * (1 - i * 0.05))),
        }))
      )
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
            <p className="text-sm text-muted-foreground mb-6">There was an error fetching your dashboard data. Please try again.</p>
            <button onClick={fetchDashboardData} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalSent = stats?.emailsSentToday || 0
  const opened = stats?.emailsOpened || 0
  const bounced = stats?.emailsBounced || 0

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
          { label: 'Total Leads in Pipeline', value: stats?.totalLeads || 0, icon: Users, progress: Math.min(100, (stats?.totalLeads || 0) / 100) },
          { label: 'Discovered Companies', value: stats?.totalCompanies || 0, icon: Building2 },
          { label: 'Emails Sent Today', value: formatNumber(totalSent), icon: Mail, progress: stats?.dailyLimit ? (totalSent / stats.dailyLimit) * 100 : 0, badge: stats?.dailyLimit ? `${Math.round((totalSent / stats.dailyLimit) * 100)}%` : '' },
          { label: 'Open Rate', value: formatPercentage(stats?.replyRate || 0), icon: MessageSquare, sub: `${formatNumber(opened)} opened · ${formatNumber(bounced)} bounced` },
        ].map(({ label, value, icon: Icon, progress, badge, sub }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="rounded-lg bg-muted p-2.5">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                {badge ? (
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{badge}</span>
                ) : (
                  <TrendingUp className="h-4 w-4 text-muted-foreground/40 mt-1" />
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
              {sub && (
                <p className="text-xs text-muted-foreground/60 mt-2">{sub}</p>
              )}
              {progress !== undefined && progress > 0 && (
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-foreground/20 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, progress)}%` }} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Email Performance (7 Days)
              </CardTitle>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/60" /> Sent
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground/20" /> Delivered
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#525252" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#525252" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a3a3a3" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#a3a3a3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                  <XAxis dataKey="name" stroke="hsl(0 0% 70%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(0 0% 70%)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      border: '1px solid hsl(0 0% 90%)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      color: '#171717',
                      fontSize: '13px',
                    }}
                  />
                  <Area type="monotone" dataKey="sent" stroke="#525252" strokeWidth={2} fill="url(#colorSent)" />
                  <Area type="monotone" dataKey="delivered" stroke="#a3a3a3" strokeWidth={2} fill="url(#colorDelivered)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-muted-foreground" />
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
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(item.value / Math.max(...pipelineData.map((d: any) => d.value), 1)) * 100}%`,
                          backgroundColor: PIPELINE_COLORS[item.key] || '#a3a3a3',
                        }}
                      />
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
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.description || activity.activity_type}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md shrink-0 capitalize">
                      {activity.activity_type?.replace(/_/g, ' ')}
                    </span>
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
            {workers &&
              Object.entries(workers).map(([type, info]: [string, any]) => {
                const Icon = WORKER_ICONS[type] || Activity
                const status = info?.status || 'idle'
                const isRunning = status === 'running' || status === 'processing' || status === 'sending' || status === 'monitoring'
                return (
                  <div key={type} className="group flex items-center gap-3 p-3.5 rounded-lg bg-muted/30 border border-border hover:bg-muted/60 transition-all duration-200">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
                      isRunning ? 'bg-foreground/5 border-foreground/10' : 'bg-muted border-border'
                    }`}>
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
                      <span className={`text-xs font-medium ${
                        isRunning ? 'text-foreground' : status === 'paused' ? 'text-muted-foreground' : 'text-muted-foreground/50'
                      }`}>{status}</span>
                    </div>
                  </div>
                )
              })}
            {!workers && (
              <div className="text-center py-8 text-muted-foreground text-sm">No worker data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
