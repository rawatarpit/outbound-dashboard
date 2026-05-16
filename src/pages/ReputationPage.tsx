import { useState, useEffect } from 'react'
import { type BrandProfile } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  AlertTriangle,
  Shield,
  Mail,
  TrendingUp,
  Activity,
  RefreshCw,
  Ban,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
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

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-foreground font-bold'
    if (score >= 50) return 'text-foreground'
    return 'text-muted-foreground'
  }

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/5 border-green-500/20'
    if (score >= 50) return 'bg-muted border-border'
    return 'bg-red-500/5 border-red-500/20'
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
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Ban className="h-5 w-5 text-red-400" />
              <div>
                <p className="font-medium text-red-400">Auto-Paused</p>
                <p className="text-sm text-red-400">Sending has been automatically paused due to reputation issues</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleUnpause}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Un-pause
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className={`text-3xl font-bold ${getHealthColor(deliverabilityScore)}`}>
              {deliverabilityScore}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Health Score</p>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: `${deliverabilityScore}%` }}
              />
            </div>
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
              <AlertCircle className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className={`text-3xl font-bold ${bounceRate > 5 ? 'text-red-600' : 'text-foreground'}`}>
              {formatPercentage(bounceRate / 100)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Bounce Rate ({formatNumber(bounceCount)} total)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className={`text-3xl font-bold ${complaintCount > 0 ? 'text-red-600' : 'text-foreground'}`}>
              {formatNumber(complaintCount)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Complaints</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Domain Details</CardTitle>
          <CardDescription>
            Sending domain: {brand?.sending_domain || brand?.smtp_email?.split('@')[1] || 'Not configured'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className={`p-4 border border-border rounded-xl ${getHealthBg(deliverabilityScore)}`}>
              <div className="flex items-center gap-2 mb-2">
                {deliverabilityScore >= 80 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <h3 className="font-medium">Deliverability</h3>
              </div>
              <p className={`text-2xl font-bold ${getHealthColor(deliverabilityScore)}`}>
                {deliverabilityScore}/100
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {deliverabilityScore >= 80 ? 'Good' : deliverabilityScore >= 50 ? 'Fair' : 'Poor'}
              </p>
            </div>

            <div className="p-4 border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">Send Statistics</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sent</span>
                  <span className="font-medium">{formatNumber(sentCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bounced</span>
                  <span className="font-medium">{formatNumber(bounceCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Complaints</span>
                  <span className="font-medium">{formatNumber(complaintCount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bounce Rate</span>
                  <span className="font-medium">{formatPercentage(bounceRate / 100)}</span>
                </div>
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
            <p className="mt-4 text-xs text-muted-foreground/50">
              Last check: {new Date(brand.last_deliverability_check).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
