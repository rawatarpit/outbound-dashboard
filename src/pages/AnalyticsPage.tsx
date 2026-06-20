import { useState, useEffect, useMemo } from 'react'
import { type BrandProfile } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, Mail, Users, MessageSquare, Building2, Send, MailOpen, AlertCircle, Target, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatNumber, formatPercentage } from '@/lib/utils'
import { AnimatedCounter } from '@/components/DashboardComponents'
import { brandsAPI, analyticsAPI } from '@/lib/api'
import { Link } from 'react-router-dom'

const FUNNEL_COLORS = ['#6366f1', '#10b981', '#a855f7']

export default function AnalyticsPage() {
  const { client } = useAuth()
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [dateRange, setDateRange] = useState('30')
  const [overview, setOverview] = useState<any>(null)
  const [timeSeries, setTimeSeries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchBrands() }, [])

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
      const o = overviewRes.data
      const raw = chartRes.data || []
      const days = parseInt(dateRange)
      const series = Array.from({ length: days }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (days - 1 - i))
        const dateStr = date.toISOString().split('T')[0]
        const entry = raw.find((d: any) => d.date === dateStr)
        return {
          name: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          sent: entry?.sent || 0,
          replied: entry?.replied || 0,
        }
      })
      setOverview(o)
      setTimeSeries(series)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch analytics')
    } finally {
      setIsLoading(false)
    }
  }

  const m = useMemo(() => {
    const sent = overview?.sentCount || overview?.sent_count || 0
    const bouncePct = parseFloat(overview?.bounceRate || overview?.bounce_rate || '0')
    const replyPct = parseFloat(overview?.replyRate || overview?.reply_rate || '0')
    const bounces = Math.round(sent * bouncePct / 100)
    return {
      sent,
      delivered: sent - bounces,
      replied: Math.round(sent * replyPct / 100),
      bounces,
      bouncePct,
      replyPct,
      totalLeads: overview?.totalLeads || overview?.total_leads || 0,
      newLeads: overview?.newLeads || overview?.new_leads || 0,
      contactedLeads: overview?.contactedLeads || overview?.contacted_leads || 0,
      qualifiedLeads: overview?.qualifiedLeads || overview?.qualified_leads || 0,
      totalCampaigns: overview?.totalCampaigns || overview?.total_campaigns || 0,
      activeCampaigns: overview?.activeCampaigns || overview?.active_campaigns || 0,
    }
  }, [overview])

  const deliveryRate = m.sent > 0 ? m.delivered / m.sent : 0
  const funnelMax = Math.max(m.sent, m.delivered, m.replied, 1)

  const funnelStages = [
    { name: 'Sent', value: m.sent, color: FUNNEL_COLORS[0], icon: Send },
    { name: 'Delivered', value: m.delivered, color: FUNNEL_COLORS[1], icon: MailOpen },
    { name: 'Replied', value: m.replied, color: FUNNEL_COLORS[2], icon: MessageSquare },
  ]

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
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-1">Track your outbound performance</p>
        </div>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
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
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Track your outbound performance</p>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6366f112' }}>
                <Mail className="h-[18px] w-[18px]" style={{ color: '#6366f1' }} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Sent</p>
            <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={m.sent} /></p>
            <p className="text-xs text-muted-foreground mt-1">Emails sent in period</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22c55e12' }}>
                <TrendingUp className="h-[18px] w-[18px]" style={{ color: '#22c55e' }} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Delivery Rate</p>
            <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={deliveryRate * 100} decimals={1} suffix="%" /></p>
            <p className="text-xs text-muted-foreground mt-1"><AnimatedCounter value={m.delivered} /> delivered</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#a855f712' }}>
                <MessageSquare className="h-[18px] w-[18px]" style={{ color: '#a855f7' }} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Reply Rate</p>
            <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={m.replyPct} decimals={1} suffix="%" /></p>
            <p className="text-xs text-muted-foreground mt-1"><AnimatedCounter value={m.replied} /> replies</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ef444412' }}>
                <AlertCircle className="h-[18px] w-[18px]" style={{ color: '#ef4444' }} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Bounce Rate</p>
            <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={m.bouncePct} decimals={1} suffix="%" /></p>
            <p className="text-xs text-muted-foreground mt-1"><AnimatedCounter value={m.bounces} /> bounced</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b12' }}>
                <Target className="h-[18px] w-[18px]" style={{ color: '#f59e0b' }} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Campaigns</p>
            <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={m.totalCampaigns} /></p>
            <p className="text-xs text-muted-foreground mt-1">Total campaigns</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf612' }}>
                <Send className="h-[18px] w-[18px]" style={{ color: '#8b5cf6' }} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Active</p>
            <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={m.activeCampaigns} /></p>
            <p className="text-xs text-muted-foreground mt-1">Active campaigns</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6366f112' }}>
                <Users className="h-[18px] w-[18px]" style={{ color: '#6366f1' }} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Leads</p>
            <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={m.totalLeads} /></p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-foreground font-medium"><AnimatedCounter value={m.newLeads} /></span> new this period
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf612' }}>
                <Send className="h-[18px] w-[18px]" style={{ color: '#8b5cf6' }} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Contacted</p>
            <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={m.contactedLeads} /></p>
            <p className="text-xs text-muted-foreground mt-1">Leads reached out to</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22c55e12' }}>
                <Target className="h-[18px] w-[18px]" style={{ color: '#22c55e' }} />
              </div>
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Qualified</p>
            <p className="text-2xl font-bold text-foreground tracking-tight"><AnimatedCounter value={m.qualifiedLeads} /></p>
            <p className="text-xs text-muted-foreground mt-1">Qualified leads</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-muted/70 border border-border/50 p-0.5">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="funnel" className="text-xs">Funnel</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Send Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeSeries.some(d => d.sent > 0) ? (
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeries}>
                      <defs>
                        <linearGradient id="analyticsSentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="analyticsRepliedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                      <XAxis dataKey="name" stroke="hsl(0 0% 70%)" fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis stroke="hsl(0 0% 70%)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(0 0% 90%)' }} />
                      <Area type="monotone" dataKey="sent" stroke="#6366f1" fillOpacity={1} fill="url(#analyticsSentGrad)" strokeWidth={2} dot={false} name="Sent" />
                      <Area type="monotone" dataKey="replied" stroke="#10b981" fillOpacity={1} fill="url(#analyticsRepliedGrad)" strokeWidth={2} dot={false} name="Replied" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <Mail className="h-8 w-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No send data for this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-muted-foreground" />
                Email Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              {m.sent > 0 ? (
                <div className="space-y-8">
                  {funnelStages.map((stage, i) => {
                    const barWidth = (stage.value / funnelMax) * 100
                    const prevValue = i > 0 ? funnelStages[i - 1].value : stage.value
                    const conversion = prevValue > 0 ? Math.round((stage.value / prevValue) * 100) : 0
                    const overallConversion = m.sent > 0 ? Math.round((stage.value / m.sent) * 100) : 0
                    return (
                      <div key={stage.name}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stage.color}15` }}>
                              <stage.icon className="h-4 w-4" style={{ color: stage.color }} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{stage.name}</p>
                              {i > 0 && (
                                <p className="text-[11px] text-muted-foreground">
                                  {conversion}% of {funnelStages[i - 1].name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">{formatNumber(stage.value)}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {overallConversion}% of all sent
                            </p>
                          </div>
                        </div>
                        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.max(barWidth, 2)}%`, backgroundColor: stage.color }}
                          />
                        </div>
                        {i < funnelStages.length - 1 && conversion > 0 && (
                          <div className="flex justify-center mt-1.5">
                            <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {conversion}% conversion → {funnelStages[i + 1].name}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <Target className="h-8 w-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No email data to build funnel</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Rate Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <MailOpen className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-sm font-medium text-foreground">Delivery Rate</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{formatPercentage(deliveryRate)}</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${deliveryRate * 100}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{formatNumber(m.delivered)} of {formatNumber(m.sent)} delivered</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
                      <span className="text-sm font-medium text-foreground">Reply Rate</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{formatPercentage(m.replyPct / 100)}</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${Math.min(m.replyPct, 100)}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{formatNumber(m.replied)} of {formatNumber(m.delivered)} delivered replied</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-sm font-medium text-foreground">Bounce Rate</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{formatPercentage(m.bouncePct / 100)}</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${Math.min(m.bouncePct, 100)}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{formatNumber(m.bounces)} of {formatNumber(m.sent)} bounced</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Lead Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {m.totalLeads > 0 ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-foreground">New Leads</span>
                        <span className="text-sm font-bold text-foreground">{formatNumber(m.newLeads)}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(m.newLeads / m.totalLeads) * 100}%` }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{Math.round((m.newLeads / m.totalLeads) * 100)}% of total leads</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-foreground">Contacted Leads</span>
                        <span className="text-sm font-bold text-foreground">{formatNumber(m.contactedLeads)}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${(m.contactedLeads / m.totalLeads) * 100}%` }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{Math.round((m.contactedLeads / m.totalLeads) * 100)}% of total leads</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-foreground">Qualified Leads</span>
                        <span className="text-sm font-bold text-foreground">{formatNumber(m.qualifiedLeads)}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(m.qualifiedLeads / m.totalLeads) * 100}%` }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{Math.round((m.qualifiedLeads / m.totalLeads) * 100)}% of total leads</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Users className="h-8 w-8 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">No lead data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
