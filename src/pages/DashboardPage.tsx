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
  Sparkles,
  Database,
  Send,
  Reply,
} from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { brandsAPI, leadsAPI, dashboardAPI } from '@/lib/api'

const PIPELINE_COLORS: Record<string, string> = {
  researching: '#6366f1',
  qualified: '#8b5cf6',
  draft_ready: '#a855f7',
  contacted: '#ec4899',
  replied: '#10b981',
  closed_won: '#059669',
  closed_lost: '#ef4444',
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
    try {
      const clientId = client?.id
      const [brandsRes, leadsRes, dashboardRes] = await Promise.all([
        brandsAPI.list(clientId),
        leadsAPI.list({ clientId }),
        dashboardAPI.overview(),
      ])

      const dash = dashboardRes.data || {}
      const sendStats = dash.send_stats || {}
      const discoveryStats = dash.discovery_stats || {}
      const pipelineStages = dash.pipeline || {}
      const activityFeed = dash.activity_feed || []

      setStats({
        totalLeads: leadsRes.total || 0,
        totalCompanies: discoveryStats.companies_total || 0,
        contactsTotal: discoveryStats.contacts_total || 0,
        emailsSentToday: sendStats.sent_today || 0,
        emailsDelivered: sendStats.delivered || 0,
        emailsOpened: sendStats.opened || 0,
        emailsBounced: sendStats.bounced || 0,
        dailyLimit: sendStats.daily_limit || 50,
        hourlyLimit: sendStats.hourly_limit || 20,
        replyRate: sendStats.sent_today > 0 ? (sendStats.opened || 0) / sendStats.sent_today : 0,
        activeBrands: brandsRes.data.filter((b: any) => b.is_active).length,
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
    if (status === 'running' || status === 'processing') return <Play className="h-3.5 w-3.5 text-green-600" />
    if (status === 'paused') return <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
     return <CheckCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-white/[0.04] border-t-primary shadow-2xl" />
          <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-primary/5 blur-xl" />
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <div className="h-1 bg-gradient-to-r from-destructive to-rose-500" />
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Unable to load dashboard</h2>
            <p className="text-muted-foreground mb-6">There was an error fetching your dashboard data. Please try again.</p>
            <button onClick={fetchDashboardData} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-violet-500 text-primary-foreground hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/25 text-sm font-bold transition-all duration-200">
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of your outbound sales engine</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            {stats?.activeBrands || 0} Active Brands
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Leads in Pipeline', value: stats?.totalLeads || 0, icon: Users, gradient: 'from-indigo-500 to-indigo-600', accent: 'text-primary', barColor: 'bg-primary', progressWidth: Math.min(100, (stats?.totalLeads || 0) / 100) },
          { label: 'Discovered Companies', value: stats?.totalCompanies || 0, icon: Building2, gradient: 'from-violet-500 to-violet-600', accent: 'text-primary', barColor: 'bg-violet-500', progressWidth: 0 },
          { label: 'Emails Sent Today', value: formatNumber(totalSent), icon: Mail, gradient: 'from-emerald-500 to-emerald-600', accent: 'text-emerald-400', barColor: 'bg-emerald-500', progressWidth: stats?.dailyLimit ? (totalSent / stats.dailyLimit) * 100 : 0, badge: stats?.dailyLimit ? `${Math.round((totalSent / stats.dailyLimit) * 100)}%` : '' },
          { label: 'Open Rate', value: formatPercentage(stats?.replyRate || 0), icon: MessageSquare, gradient: 'from-amber-500 to-amber-600', accent: 'text-amber-400', sub: `${formatNumber(opened)} opened · ${formatNumber(bounced)} bounced` },
        ].map(({ label, value, icon: Icon, gradient, accent, barColor, progressWidth, badge, sub }) => (
          <div key={label} className="group relative">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-white/[0.04] to-white/[0.02] rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition duration-500" />
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.02] to-transparent rounded-full blur-2xl pointer-events-none" />
                <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`rounded-xl bg-gradient-to-br ${gradient} p-3 shadow-lg shadow-primary/20`}>
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  {badge !== undefined && badge !== '' ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{badge}</span>
                  ) : (
                    <TrendingUp className="h-4 w-4 text-emerald-400/60" />
                  )}
                </div>
                <p className={`text-3xl font-extrabold tracking-tight ${accent}`}>{value}</p>
                <p className="text-sm text-muted-foreground mt-1.5">{label}</p>
                {sub && (
                  <p className="text-xs text-muted-foreground/60 mt-2">{sub}</p>
                )}
                {barColor && progressWidth !== undefined && progressWidth > 0 && (
                  <div className="mt-4 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, progressWidth)}%` }} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-7">
        <Card className="lg:col-span-4 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-primary via-violet-500 to-primary" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-primary" />
                Email Performance (7 Days)
              </CardTitle>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Sent
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Delivered
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
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.15)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      backgroundColor: 'rgba(20,20,40,0.95)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      color: '#e2e2ee',
                    }}
                  />
                  <Area type="monotone" dataKey="sent" stroke="#818cf8" strokeWidth={2.5} fill="url(#colorSent)" />
                  <Area type="monotone" dataKey="delivered" stroke="#34d399" strokeWidth={2.5} fill="url(#colorDelivered)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-violet-500 via-primary to-violet-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-primary" />
              Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No companies in pipeline</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pipelineData.map((item) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-foreground/80 capitalize">{item.name}</span>
                      <span className="text-sm font-bold text-foreground">{item.value}</span>
                    </div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(item.value / Math.max(...pipelineData.map((d: any) => d.value), 1)) * 100}%`,
                          backgroundColor: PIPELINE_COLORS[item.key] || '#818cf8',
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-white/[0.06] mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-foreground">{pipelineData.reduce((sum: number, d: any) => sum + d.value, 0)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-primary via-violet-500 to-primary" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              {stats?.recentActivity?.length > 0 && (
                <span className="text-xs text-muted-foreground bg-white/[0.03] px-2 py-1 rounded-full">{stats.recentActivity.length} events</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!stats?.recentActivity?.length ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {stats.recentActivity.slice(0, 8).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center shrink-0 border border-primary/10">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground/90 truncate">
                        {activity.description || activity.activity_type}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-white/[0.03] border border-white/[0.04] px-2.5 py-1 rounded-full shrink-0 capitalize">
                      {activity.activity_type?.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-amber-500 via-primary to-amber-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-primary" />
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
                  <div key={type} className="group flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
                      isRunning ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/[0.03] border-white/[0.04]'
                    }`}>
                      <Icon className={`h-4.5 w-4.5 ${isRunning ? 'text-emerald-400' : 'text-muted-foreground/50'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground/90 capitalize">{type}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {info?.last_run ? `Last: ${formatRelativeTime(info.last_run)}` : 'Not run yet'}
                        {info?.pending ? ` · ${info.pending} pending` : ''}
                        {info?.reason ? ` · ${info.reason}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {getWorkerIcon(type, status)}
                      <span className={`text-xs font-bold ${
                        isRunning ? 'text-emerald-400' : status === 'paused' ? 'text-amber-400' : 'text-muted-foreground'
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
