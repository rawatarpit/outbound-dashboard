import { useState, useEffect } from 'react'
import { supabase, type BrandProfile, type SentMessage } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import {
  LineChart,
  Line,
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
import { BarChart3, TrendingUp, Mail, Users, MessageSquare, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatNumber, formatPercentage } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

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
    fetchAnalytics()
  }, [selectedBrand, dateRange])

  const fetchBrands = async () => {
    try {
      const { data } = await supabase.from('brand_profiles').select('*')
      setBrands(data || [])
      if (data?.length) {
        setSelectedBrand(data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('sent_messages')
        .select('status, created_at, brand_id')

      if (selectedBrand) {
        query = query.eq('brand_id', selectedBrand)
      }

      const { data, error } = await query
      if (error) throw error

      const messages = data || []
      const total = messages.length
      const delivered = messages.filter(m => ['delivered', 'opened', 'clicked'].includes(m.status)).length
      const opened = messages.filter(m => ['opened', 'clicked'].includes(m.status)).length
      const clicked = messages.filter(m => m.status === 'clicked').length
      const bounced = messages.filter(m => m.status === 'bounced').length

      const days = parseInt(dateRange)
      const timeSeriesData = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1 - i))
        const dateStr = date.toISOString().split('T')[0]
        const dayMessages = messages.filter(m => m.created_at.startsWith(dateStr))
        return {
          name: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          sent: dayMessages.filter(m => m.status === 'sent').length,
          delivered: dayMessages.filter(m => ['delivered', 'opened', 'clicked'].includes(m.status)).length,
          opened: dayMessages.filter(m => ['opened', 'clicked'].includes(m.status)).length
        }
      })

      const funnelData = [
        { name: 'Sent', value: messages.filter(m => m.status === 'sent').length },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Track your outbound performance</p>
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sent</p>
                <p className="text-2xl font-bold">{formatNumber(stats?.total || 0)}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivery Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(stats?.deliveryRate || 0)}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(stats?.openRate || 0)}</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Click Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(stats?.clickRate || 0)}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2">
                <MessageSquare className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Email Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.timeSeriesData || []}>
                      <defs>
                        <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey="sent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.timeSeriesData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="delivered" fill="#10b981" name="Delivered" />
                      <Bar dataKey="opened" fill="#8b5cf6" name="Opened" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
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
                      {stats?.funnelData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-4 md:grid-cols-4 mt-6">
                {stats?.funnelData.map((item: any, index: number) => (
                  <div key={item.name} className="text-center p-4 border rounded-lg">
                    <div
                      className="w-4 h-4 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <p className="font-medium">{item.name}</p>
                    <p className="text-2xl font-bold">{formatNumber(item.value)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Emails Sent</p>
                    <p className="text-sm text-gray-500">Total emails sent</p>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(stats?.total || 0)}</p>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Delivered</p>
                    <p className="text-sm text-gray-500">Successfully delivered</p>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(stats?.delivered || 0)}</p>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Opened</p>
                    <p className="text-sm text-gray-500">Opened by recipients</p>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(stats?.opened || 0)}</p>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Clicked</p>
                    <p className="text-sm text-gray-500">Clicked links</p>
                  </div>
                  <p className="text-2xl font-bold">{formatNumber(stats?.clicked || 0)}</p>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Bounced</p>
                    <p className="text-sm text-gray-500">Failed deliveries</p>
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
