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
  ArrowDownRight
} from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { brandsAPI, leadsAPI, companiesAPI, messagesAPI, activityAPI } from '@/lib/api'

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

export default function DashboardPage() {
  const { client } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<{ name: string; sent: number; delivered: number }[]>([])
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
      const mockData = days.map((day) => ({
        name: day,
        sent: Math.floor(Math.random() * 50) + 20,
        delivered: Math.floor(Math.random() * 45) + 18
      }))
      setChartData(mockData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your outbound performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-center text-sm font-medium text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +12.5%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.totalLeads || 0)}</p>
              <p className="text-sm text-gray-500">Total Leads</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex items-center text-sm font-medium text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +8.2%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.totalCompanies || 0)}</p>
              <p className="text-sm text-gray-500">Companies</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-50 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center text-sm font-medium text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +23.1%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{stats?.emailsSentToday || 0}</p>
              <p className="text-sm text-gray-500">Emails Sent Today</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-50 rounded-lg">
                <MessageSquare className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex items-center text-sm font-medium text-red-600">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                -2.3%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(stats?.replyRate || 0)}</p>
              <p className="text-sm text-gray-500">Reply Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Email Performance
            </CardTitle>
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
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sent" stroke="#6366f1" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineData.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pipeline data</p>
              ) : (
                pipelineData.map((item) => {
                  const maxCount = Math.max(...pipelineData.map(d => d.count), 1)
                  return (
                    <div key={item.status} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-700 capitalize">
                        {item.status.replace('_', ' ')}
                      </div>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-medium text-gray-900 text-right">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No recent activity</p>
            ) : (
              stats?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 py-3 border-b last:border-0">
                  <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description || activity.activity_type}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                  <Badge variant="secondary">{activity.activity_type}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}