import { useState, useEffect } from 'react'
import { type BrandProfile } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { AlertTriangle, Shield, Mail, TrendingUp, Activity, RefreshCw, Ban, CheckCircle, AlertCircle, Gauge, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatNumber, formatPercentage } from '@/lib/utils'
import { brandsAPI } from '@/lib/api'

export default function ReputationPage() {
  const { client } = useAuth()
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [brand, setBrand] = useState<BrandProfile | null>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (brands.length > 0 && !selectedBrandId) {
      setSelectedBrandId(brands[0].id)
    }
  }, [brands])

  useEffect(() => {
    if (selectedBrandId) {
      const b = brands.find(b => b.id === selectedBrandId)
      setBrand(b || null)
    }
  }, [selectedBrandId, brands])

  const fetchBrands = async () => {
    try {
      const { data } = await brandsAPI.list(client?.id)
      setBrands(data)
      if (data && data.length > 0) {
        setSelectedBrandId(data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnpause = async () => {
    if (!brand) return
    try {
      const { error } = await brandsAPI.update(brand.id, { auto_paused: false, is_paused: false })
      if (error) throw error
      toast.success('Brand unpaused')
      fetchBrands()
    } catch (error: any) {
      toast.error(error.message || 'Failed to unpause')
    }
  }

  const deliverabilityScore = brand?.deliverability_score ?? 100
  const bounceRate = (brand?.sent_count && brand?.sent_count > 0)
    ? ((brand.bounce_count || 0) / brand.sent_count) * 100
    : 0
  const sentCount = brand?.sent_count || 0
  const bounceCount = brand?.bounce_count || 0
  const complaintCount = brand?.complaint_count || 0

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getHealthRingStroke = (score: number) => {
    if (score >= 80) return 'stroke-green-500'
    if (score >= 50) return 'stroke-yellow-500'
    return 'stroke-red-500'
  }

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Good'
    if (score >= 50) return 'Fair'
    return 'Poor'
  }

  const ringRadius = 42
  const ringCircumference = 2 * Math.PI * ringRadius

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
        <h1 className="text-2xl font-bold text-foreground">Reputation & Domain Health</h1>
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No brands configured yet
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reputation & Domain Health</h1>
          <p className="text-muted-foreground">Monitor sending reputation and deliverability</p>
        </div>
        <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.brand_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {brand?.auto_paused && (
        <Card className="border-red-500/40 bg-red-500/5 border-2">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 shrink-0">
                <Ban className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="font-bold text-red-400">Sending Auto-Paused</p>
                <p className="text-sm text-red-400/80">Sending has been automatically paused due to reputation issues</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleUnpause} className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-400">
              <RefreshCw className="h-4 w-4 mr-2" />
              Un-pause
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Gauge className="h-5 w-5 text-muted-foreground/50" />
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getHealthScoreColor(deliverabilityScore)} border-current/20 bg-current/5`}>
                {getHealthLabel(deliverabilityScore)}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={ringRadius} fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
                  <circle
                    cx="50"
                    cy="50"
                    r={ringRadius}
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringCircumference * (1 - deliverabilityScore / 100)}
                    className={getHealthRingStroke(deliverabilityScore)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${getHealthScoreColor(deliverabilityScore)}`}>
                    {deliverabilityScore}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-3">Health Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Mail className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="text-3xl font-bold text-foreground">{formatNumber(sentCount)}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ShieldAlert className="h-5 w-5 text-muted-foreground/50" />
              {bounceRate > 5 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Alert</Badge>
              )}
            </div>
            <p className={`text-3xl font-bold ${bounceRate > 5 ? 'text-red-500' : 'text-foreground'}`}>
              {formatPercentage(bounceRate / 100)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {bounceRate > 5 ? (
                <span className="flex items-center gap-1 text-red-500">
                  <AlertTriangle className="h-3 w-3" />
                  {formatNumber(bounceCount)} bounced
                </span>
              ) : (
                <>{formatNumber(bounceCount)} total bounces</>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground/50" />
              {complaintCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{complaintCount}</Badge>
              )}
            </div>
            <p className={`text-3xl font-bold ${complaintCount > 0 ? 'text-red-500' : 'text-foreground'}`}>
              {formatNumber(complaintCount)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Complaints</p>
          </CardContent>
        </Card>
      </div>

      {bounceRate > 5 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-500">High Bounce Rate</p>
                <p className="text-sm text-red-500/80">
                  Your bounce rate is {formatPercentage(bounceRate / 100)} ({formatNumber(bounceCount)} bounces out of {formatNumber(sentCount)} sent). Rates above 5% may harm your sender reputation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {complaintCount > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-yellow-500">Complaints Detected</p>
                <p className="text-sm text-yellow-500/80">
                  {formatNumber(complaintCount)} complaint{complaintCount !== 1 ? 's' : ''} reported. Any complaints can impact deliverability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Domain Details</CardTitle>
          <CardDescription>
            Detailed metrics for {brand?.sending_domain || brand?.smtp_email?.split('@')[1] || 'your sending domain'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border border-border rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Sending Domain</h3>
                {deliverabilityScore >= 80 ? (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-muted-foreground ml-auto" />
                )}
              </div>
              <p className="text-sm font-bold text-foreground truncate">
                {brand?.sending_domain || brand?.smtp_email?.split('@')[1] || 'Not configured'}
              </p>
              {brand?.smtp_email && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{brand.smtp_email}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/60" />
                <span className={`text-xs font-semibold ${getHealthScoreColor(deliverabilityScore)}`}>
                  {getHealthLabel(deliverabilityScore)} — {deliverabilityScore}/100
                </span>
              </div>
            </div>

            <div className="p-4 border border-border rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Bounce Stats</h3>
                {bounceRate > 5 && (
                  <Badge variant="destructive" className="ml-auto text-[10px]">High</Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sent</span>
                  <span className="font-medium">{formatNumber(sentCount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bounced</span>
                  <span className={`font-medium ${bounceRate > 5 ? 'text-red-500' : ''}`}>{formatNumber(bounceCount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className={`font-medium ${bounceRate > 5 ? 'text-red-500' : ''}`}>{formatPercentage(bounceRate / 100)}</span>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${bounceRate > 5 ? 'bg-red-500' : 'bg-foreground'}`}
                  style={{ width: `${Math.min(bounceRate, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 border border-border rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Complaint Stats</h3>
                {complaintCount > 0 && (
                  <Badge variant="destructive" className="ml-auto text-[10px]">{complaintCount}</Badge>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sent</span>
                  <span className="font-medium">{formatNumber(sentCount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Complaints</span>
                  <span className={`font-medium ${complaintCount > 0 ? 'text-red-500' : ''}`}>{formatNumber(complaintCount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className={`font-medium ${complaintCount > 0 ? 'text-red-500' : ''}`}>
                    {sentCount > 0 ? formatPercentage(complaintCount / sentCount) : '0%'}
                  </span>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${complaintCount > 0 ? 'bg-red-500' : 'bg-foreground'}`}
                  style={{ width: `${sentCount > 0 ? Math.min((complaintCount / sentCount) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          {brand?.is_paused && !brand?.auto_paused && (
            <div className="mt-4 p-3 bg-muted border border-border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Brand is manually paused</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleUnpause}>Resume</Button>
            </div>
          )}

          {brand?.last_deliverability_check && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                <Activity className="h-3 w-3" />
                <span>Last deliverability check: {new Date(brand.last_deliverability_check).toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
