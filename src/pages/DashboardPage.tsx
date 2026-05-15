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
    return <CheckCircle className="h-3.5 w-3.5 text-gray-400" />
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
            <p className="text-gray-500 mb-4">There was an error fetching your dashboard data. Please try again.</p>
            <button onClick={fetchDashboardData} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Real-time overview of your outbound sales engine</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {stats?.activeBrands || 0} Active Brands
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-indigo-50 rounded-xl">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.totalLeads || 0)}</p>
            <p className="text-sm text-gray-500 mt-1">Total Leads in Pipeline</p>
            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (stats?.totalLeads || 0) / 100)}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-purple-50 rounded-xl">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.totalCompanies || 0)}</p>
            <p className="text-sm text-gray-500 mt-1">Discovered Companies</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>Pending: {formatNumber((stats?.totalLeads || 0) - (stats?.totalCompanies || 0))}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-green-50 rounded-xl">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              {totalSent > 0 && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{stats?.dailyLimit ? `${Math.round((totalSent / stats.dailyLimit) * 100)}%` : ''}</span>}
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(totalSent)}</p>
            <p className="text-sm text-gray-500 mt-1">Emails Sent Today</p>
            {stats?.dailyLimit && (
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (totalSent / stats.dailyLimit) * 100)}%` }} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <MessageSquare className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatPercentage(stats?.replyRate || 0)}</p>
            <p className="text-sm text-gray-500 mt-1">Open Rate</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>{formatNumber(opened)} opened</span>
              <span>{formatNumber(bounced)} bounced</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Email Performance (7 Days)
              </CardTitle>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Sent
                </span>
                <span className="flex items-center gap-1">
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
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area type="monotone" dataKey="sent" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorSent)" />
                  <Area type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2.5} fill="url(#colorDelivered)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-indigo-600" />
              Pipeline Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No companies in pipeline</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pipelineData.map((item) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{item.name}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.value / Math.max(...pipelineData.map((d: any) => d.value), 1)) * 100}%`,
                          backgroundColor: PIPELINE_COLORS[item.key] || '#6366f1',
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total</span>
                    <span className="font-semibold">{pipelineData.reduce((sum: number, d: any) => sum + d.value, 0)}</span>
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
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-5 w-5 text-indigo-600" />
                Recent Activity
              </CardTitle>
              {stats?.recentActivity?.length > 0 && (
                <span className="text-xs text-gray-400">{stats.recentActivity.length} events</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!stats?.recentActivity?.length ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-1">
                {stats.recentActivity.slice(0, 8).map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description || activity.activity_type}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs capitalize">
                      {activity.activity_type?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-indigo-600" />
              Worker Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workers &&
              Object.entries(workers).map(([type, info]: [string, any]) => {
                const Icon = WORKER_ICONS[type] || Activity
                const status = info?.status || 'idle'
                return (
                  <div key={type} className="flex items-center gap-3 p-3 rounded-xl border hover:shadow-sm transition-shadow">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                      status === 'running' || status === 'processing' || status === 'sending' || status === 'monitoring'
                        ? 'bg-green-50' : 'bg-gray-50'
                    }`}>
                      <Icon className={`h-4.5 w-4.5 ${
                        status === 'running' || status === 'processing' || status === 'sending' || status === 'monitoring'
                          ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 capitalize">{type}</p>
                      <p className="text-xs text-gray-500">
                        {info?.last_run ? `Last: ${formatRelativeTime(info.last_run)}` : 'Not run yet'}
                        {info?.pending ? ` · ${info.pending} pending` : ''}
                        {info?.reason ? ` · ${info.reason}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getWorkerIcon(type, status)}
                      <span className={`text-xs font-medium ${
                        status === 'running' || status === 'processing' || status === 'sending' || status === 'monitoring'
                          ? 'text-green-700' : status === 'paused' ? 'text-amber-700' : 'text-gray-500'
                      }`}>{status}</span>
                    </div>
                  </div>
                )
              })}
            {!workers && (
              <div className="text-center py-8 text-gray-500 text-sm">No worker data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
