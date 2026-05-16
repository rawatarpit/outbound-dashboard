import { useState, useEffect } from 'react'
import { type BrandProfile } from '@/lib/supabase'
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
import { TrendingUp, Mail, Users, MessageSquare, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatNumber, formatPercentage } from '@/lib/utils'
import { brandsAPI, analyticsAPI } from '@/lib/api'
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
      const [overviewRes, chartRes] = await Promise.all([
        analyticsAPI.overview(),
        analyticsAPI.chart(parseInt(dateRange)),
      ])

      if (overviewRes.error) throw overviewRes.error

      const overview = overviewRes.data
      const chartData = chartRes.data || []

      const days = parseInt(dateRange)
      const timeSeriesData = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1 - i))
        const dateStr = date.toISOString().split('T')[0]
        const dayEntry = chartData.find((d: any) => d.date === dateStr)
        return {
          name: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          sent: dayEntry?.sent || 0,
          delivered: dayEntry?.sent || 0,
          opened: dayEntry?.replied || 0
        }
      })

      const total = overview.sentCount || 0
      const replied = parseInt(overview.replyRate || '0')
      const bounced = parseInt(overview.bounceRate || '0')
      const delivered = total - bounced
      const opened = replied

      const funnelData = [
        { name: 'Sent', value: total },
        { name: 'Delivered', value: delivered },
        { name: 'Opened', value: opened },
        { name: 'Replied', value: replied }
      ]

      setStats({
        total,
        delivered,
        opened,
        clicked: replied,
        bounced,
        deliveryRate: total ? delivered / total : 0,
        openRate: delivered ? opened / delivered : 0,
        clickRate: delivered ? replied / delivered : 0,
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
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-border border-t-primary shadow-2xl" />
          <div className="absolute inset-0 animate-pulse rounded-full h-10 w-10 bg-primary/5 blur-xl" />
        </div>
      </div>
    )
  }

  if (brands.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your outbound performance</p>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No Brands Configured</h3>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              Create your first brand profile to start tracking analytics
            </p>
            <Link to="/brands" className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90">
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
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your outbound performance</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(brand => (
                <SelectItem key={brand.id} value={brand.id}>{brand.brand_name}</SelectItem>
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
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{formatNumber(stats?.total || 0)}</p>
              <p className="text-sm text-muted-foreground">Total Sent</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{formatPercentage(stats?.deliveryRate || 0)}</p>
              <p className="text-sm text-muted-foreground">Delivery Rate</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-muted rounded-lg">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{formatPercentage(stats?.openRate || 0)}</p>
              <p className="text-sm text-muted-foreground">Open Rate</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-muted rounded-lg">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{formatPercentage(stats?.clickRate || 0)}</p>
              <p className="text-sm text-muted-foreground">Click Rate</p>
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
          <div className="grid gap-5 lg:grid-cols-2">
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
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
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
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.timeSeriesData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
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
                      {stats?.funnelData.map((_: unknown, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid gap-4 md:grid-cols-4 mt-5">
                {stats?.funnelData.map((item: { name: string; value: number }, index: number) => (
                  <div key={item.name} className="text-center p-4 border border-border rounded-xl">
                    <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: COLORS[index] }} />
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
                {['Emails Sent', 'Delivered', 'Opened', 'Clicked', 'Bounced'].map((label) => {
                  const key = label.toLowerCase().replace(' ', '')
                  const value = stats?.[key] || 0
                  const isLast = label === 'Bounced'
                  return (
                    <div key={label} className="flex items-center justify-between p-4 border border-border rounded-xl">
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">{label === 'Bounced' ? 'Failed deliveries' : `Total ${label.toLowerCase()}`}</p>
                      </div>
                      <p className={`text-2xl font-bold ${isLast ? 'text-red-400' : 'text-foreground'}`}>
                        {formatNumber(value)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
