import { useState, useEffect } from 'react'
import { type ActivityLog } from '@/lib/supabase'
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
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  Zap
} from 'lucide-react'
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { brandsAPI, leadsAPI, companiesAPI, messagesAPI, activityAPI } from '@/lib/api'
import { Tooltip as UITooltip } from '@/components/ui/Tooltip'

interface DashboardStats {
  totalLeads: number
  totalCompanies: number
  emailsSentToday: number
  emailsSentWeek: number
  replyRate: number
  conversionRate: number
  activeBrands: number
  recentActivity: ActivityLog[]
}

interface ChartData {
  name: string
  sent: number
  delivered: number
  replied: number
}

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ElementType
  tooltip?: string
  gradient: string
  iconBg: string
}

function StatCard({ title, value, change, trend, icon: Icon, tooltip, gradient, iconBg }: StatCardProps) {
  const card = (
    <Card className="relative overflow-hidden border-slate-200/50 shadow-lg shadow-slate-200/20 hover:shadow-xl transition-all duration-300 group">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className={`rounded-2xl p-3 ${iconBg}`}>
            <Icon className="h-6 w-6" />
          </div>
          {change && (
            <div className={`flex items-center text-sm font-semibold px-2.5 py-1 rounded-full ${
              trend === 'up' ? 'text-emerald-600 bg-emerald-50' : trend === 'down' ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-100'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> : trend === 'down' ? <ArrowDownRight className="h-3.5 w-3.5 mr-1" /> : null}
              {change}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
  
  return tooltip ? <UITooltip content={tooltip}>{card}</UITooltip> : card
}

export default function DashboardPage() {
  const { client } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [pipelineData, setPipelineData] = useState<{ status: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const clientId = client?.id
      const [brandsRes, leadsRes, companiesRes, messagesRes, activityRes] = await Promise.all([
        brandsAPI.list(clientId),
        leadsAPI.list({ clientId }),
        companiesAPI.list({ clientId }),
        messagesAPI.list({ clientId }),
        activityAPI.list(clientId, 10)
      ])

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      const sentToday = messagesRes.data.filter(m => {
        const sentDate = new Date(m.created_at)
        return m.status === 'sent' && sentDate >= today
      }).length

      const sentWeek = messagesRes.data.filter(m => {
        const sentDate = new Date(m.created_at)
        return m.status === 'sent' && sentDate >= weekAgo
      }).length

      const totalSent = messagesRes.data.filter(m => m.status === 'sent').length || 1
      const totalReplied = messagesRes.data.filter(m => m.status === 'opened').length || 0

      setStats({
        totalLeads: leadsRes.total,
        totalCompanies: companiesRes.data.length,
        emailsSentToday: sentToday,
        emailsSentWeek: sentWeek,
        replyRate: totalReplied / totalSent,
        conversionRate: 0.05,
        activeBrands: brandsRes.data.filter(b => b.is_active).length,
        recentActivity: activityRes.data
      })

      const pipelineCounts: Record<string, number> = {}
      companiesRes.data.forEach(c => {
        pipelineCounts[c.status] = (pipelineCounts[c.status] || 0) + 1
      })
      setPipelineData(Object.entries(pipelineCounts).map(([status, count]) => ({ status, count })))

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const mockChartData = days.map((day, i) => ({
        name: day,
        sent: Math.floor(Math.random() * 50) + 20,
        delivered: Math.floor(Math.random() * 45) + 18,
        replied: Math.floor(Math.random() * 10) + 2
      }))
      setChartData(mockChartData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards: StatCardProps[] = [
    {
      title: 'Total Leads',
      value: formatNumber(stats?.totalLeads || 0),
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      tooltip: 'Total leads in your database',
      gradient: 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10',
      iconBg: 'bg-blue-50'
    },
    {
      title: 'Companies',
      value: formatNumber(stats?.totalCompanies || 0),
      change: '+8.2%',
      trend: 'up',
      icon: Building2,
      tooltip: 'Total companies in pipeline',
      gradient: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
      iconBg: 'bg-purple-50'
    },
    {
      title: 'Emails Sent Today',
      value: stats?.emailsSentToday || 0,
      change: '+23.1%',
      trend: 'up',
      icon: Mail,
      tooltip: 'Emails sent in the last 24 hours',
      gradient: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10',
      iconBg: 'bg-emerald-50'
    },
    {
      title: 'Reply Rate',
      value: formatPercentage(stats?.replyRate || 0),
      change: '-2.3%',
      trend: 'down',
      icon: MessageSquare,
      tooltip: 'Percentage of recipients who replied',
      gradient: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10',
      iconBg: 'bg-amber-50'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <UITooltip content="AI-powered insights">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-700">AI Insights</span>
              </div>
            </UITooltip>
          </div>
          <p className="text-slate-500 mt-1">Overview of your outbound performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <Zap className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">AI Agent Active</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Email Performance
            </CardTitle>
            <UITooltip content="Email delivery trends over the past week">
              <div className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
                <Activity className="h-4 w-4 text-slate-400" />
              </div>
            </UITooltip>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Area type="monotone" dataKey="sent" stroke="#6366f1" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} name="Sent" />
                  <Area type="monotone" dataKey="delivered" stroke="#10b981" fillOpacity={1} fill="url(#colorDelivered)" strokeWidth={2} name="Delivered" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Pipeline Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineData.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No pipeline data yet</p>
                </div>
              ) : (
                pipelineData.map((item) => {
                  const maxCount = Math.max(...pipelineData.map(d => d.count), 1)
                  const stageColors: Record<string, string> = {
                    researching: 'bg-blue-500',
                    qualified: 'bg-emerald-500',
                    icp_passed: 'bg-purple-500',
                    contacted: 'bg-amber-500',
                    replied: 'bg-teal-500',
                    negotiating: 'bg-orange-500',
                    closed_won: 'bg-green-500',
                    closed_lost: 'bg-red-500'
                  }
                  return (
                    <div key={item.status} className="flex items-center gap-4 group">
                      <div className="w-32 text-sm font-medium text-slate-700 capitalize">
                        {item.status.replace('_', ' ')}
                      </div>
                      <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${stageColors[item.status] || 'bg-slate-500'} rounded-full transition-all duration-500 group-hover:opacity-80`}
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-bold text-slate-900 text-right">
                        {item.count}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Recent Activity
          </CardTitle>
          <UITooltip content="Latest actions from your AI agent">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-50">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-xs font-medium text-indigo-600">Live</span>
            </div>
          </UITooltip>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No recent activity</p>
              </div>
            ) : (
              stats?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 -mx-4 px-4 rounded-lg transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {activity.description || activity.activity_type}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-medium">
                    {activity.activity_type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}