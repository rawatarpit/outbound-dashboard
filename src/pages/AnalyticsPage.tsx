import { useState, useEffect } from 'react'
import { type BrandProfile, supabase as supabaseClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { TrendingUp, Mail, Users, MessageSquare, Sparkles, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatNumber, formatPercentage } from '@/lib/utils'
import { brandsAPI } from '@/lib/api'
import { Link } from 'react-router-dom'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AnalyticsPage() {
  const { client } = useAuth()
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [dateRange, setDateRange] = useState('30')
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0].id)
    }
  }, [brands, selectedBrand])

  useEffect(() => {
    if (selectedBrand) {
      fetchAnalytics()
    }
  }, [selectedBrand, dateRange])

  const fetchBrands = async () => {
    try {
      const { data } = await brandsAPI.list(client?.id)
      setBrands(data || [])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      let query = supabaseClient
        .from('sent_messages')
        .select('status, created_at, brand_id')

      if (selectedBrand) {
        query = query.eq('brand_id', selectedBrand)
      }

      const { data, error } = await query
      if (error) throw error

      const messages = data || []
      const total = messages.length
      const delivered = messages.filter((m: { status: string }) => ['delivered', 'opened', 'clicked'].includes(m.status)).length
      const opened = messages.filter((m: { status: string }) => ['opened', 'clicked'].includes(m.status)).length
      const clicked = messages.filter((m: { status: string }) => m.status === 'clicked').length
      const bounced = messages.filter((m: { status: string }) => m.status === 'bounced').length

      const days = parseInt(dateRange)
      const timeSeriesData = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1 - i))
        const dateStr = date.toISOString().split('T')[0]
        const dayMessages = messages.filter((m: { created_at: string }) => m.created_at.startsWith(dateStr))
        return {
          name: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          sent: dayMessages.filter((m: { status: string }) => m.status === 'sent').length,
          delivered: dayMessages.filter((m: { status: string }) => ['delivered', 'opened', 'clicked'].includes(m.status)).length,
          opened: dayMessages.filter((m: { status: string }) => ['opened', 'clicked'].includes(m.status)).length
        }
      })

      const funnelData = [
        { name: 'Sent', value: messages.filter((m: { status: string }) => m.status === 'sent').length },
        { name: 'Delivered', value: delivered },
        { name: 'Opened', value: opened },
        { name: 'Clicked', value: clicked }
      ]

      setStats({
        total,
        delivered,
        opened,
        clicked,
        bounced,
        deliveryRate: total ? delivered / total : 0,
        openRate: delivered ? opened / delivered : 0,
        clickRate: delivered ? clicked / delivered : 0,
        bounceRate: total ? bounced / total : 0,
        timeSeriesData,
        funnelData
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (brands.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500">Track your outbound performance</p>
        </div>
        
        <Card className="border-slate-200/50 shadow-xl shadow-slate-200/20">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-6">
                <Building2 className="h-16 w-16 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Brands Configured</h3>
            <p className="text-slate-500 text-center max-w-md mb-6">
              Create your first brand profile to start tracking analytics and monitoring your outbound performance.
            </p>
            <Link
              to="/brands"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Create Brand
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500">Track your outbound performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.brand_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-indigo-50 p-3">
                <Mail className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex items-center text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                +12.5%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">{formatNumber(stats?.total || 0)}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Total Sent</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex items-center text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                +5.2%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">{formatPercentage(stats?.deliveryRate || 0)}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Delivery Rate</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-purple-50 p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-center text-sm font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                -2.1%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">{formatPercentage(stats?.openRate || 0)}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Open Rate</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-amber-50 p-3">
                <MessageSquare className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex items-center text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                +1.8%
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">{formatPercentage(stats?.clickRate || 0)}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">Click Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-100/80 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="funnel" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Funnel</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Email Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.timeSeriesData || []}>
                      <defs>
                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                      <Area type="monotone" dataKey="sent" stroke="#6366f1" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.timeSeriesData || []}>
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
                      <Bar dataKey="delivered" fill="#10b981" name="Delivered" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="opened" fill="#8b5cf6" name="Opened" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel">
          <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.funnelData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats?.funnelData.map((_: unknown, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-4 md:grid-cols-4 mt-6">
                {stats?.funnelData.map((item: { name: string; value: number }, index: number) => (
                  <div key={item.name} className="text-center p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                    <div
                      className="w-4 h-4 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <p className="font-medium text-slate-700">{item.name}</p>
                    <p className="text-2xl font-bold text-slate-900">{formatNumber(item.value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="border-slate-200/50 shadow-lg shadow-slate-200/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Detailed Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div>
                    <p className="font-semibold text-slate-900">Emails Sent</p>
                    <p className="text-sm text-slate-500">Total emails sent</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{formatNumber(stats?.total || 0)}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div>
                    <p className="font-semibold text-slate-900">Delivered</p>
                    <p className="text-sm text-slate-500">Successfully delivered</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{formatNumber(stats?.delivered || 0)}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div>
                    <p className="font-semibold text-slate-900">Opened</p>
                    <p className="text-sm text-slate-500">Opened by recipients</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{formatNumber(stats?.opened || 0)}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div>
                    <p className="font-semibold text-slate-900">Clicked</p>
                    <p className="text-sm text-slate-500">Clicked links</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{formatNumber(stats?.clicked || 0)}</p>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div>
                    <p className="font-semibold text-slate-900">Bounced</p>
                    <p className="text-sm text-slate-500">Failed deliveries</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{formatNumber(stats?.bounced || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}