import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { AlertTriangle, Shield, Send, Search, Mail, Loader2, CheckCircle, AlertCircle, ShieldAlert, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { systemAPI } from '@/lib/api'
import { AnimatedCounter, SectionHeader, StatCard } from '@/components/DashboardComponents'

interface SystemFlag {
  key: string
  label: string
  description: string
  value: boolean
  icon: any
}

export default function SystemFlagsPage() {
  const { member } = useAuth()
  const [flags, setFlags] = useState<SystemFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const canManage = member?.role === 'owner' || member?.role === 'admin'

  useEffect(() => {
    fetchFlags()
  }, [])

  const fetchFlags = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await systemAPI.flags()
      if (error) throw error

      const flagDefs: SystemFlag[] = [
        { key: 'automation_enabled', label: 'Automation', description: 'Master switch — when off, all workers (discovery, enrichment, send) stop', value: false, icon: Shield },
        { key: 'send_enabled', label: 'Email Sending', description: 'When off, no emails are sent but discovery and enrichment continue', value: false, icon: Send },
        { key: 'discovery_enabled', label: 'Discovery', description: 'When off, no new search queries are executed', value: false, icon: Search },
        { key: 'imap_enabled', label: 'Reply Detection', description: 'When off, IMAP reply detection is disabled', value: false, icon: Mail },
      ]

      setFlags(flagDefs.map(f => ({
        ...f,
        value: data?.[f.key] ?? false,
      })))
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch flags')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (key: string, value: boolean) => {
    if (!canManage) {
      toast.error('Only admins can modify system flags')
      return
    }

    setToggling(key)
    try {
      const { error } = await systemAPI.updateFlag(key, value)
      if (error) throw error
      toast.success(`${key.replace('_', ' ')} ${value ? 'enabled' : 'disabled'}`)
      setFlags(prev => prev.map(f => f.key === key ? { ...f, value } : f))
    } catch (error: any) {
      toast.error(error.message || 'Failed to update flag')
    } finally {
      setToggling(null)
    }
  }

  const enabledCount = flags.filter(f => f.value).length
  const disabledCount = flags.filter(f => !f.value).length
  const allEnabled = disabledCount === 0
  const healthStatus = allEnabled ? 'good' : 'warning'

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">System Flags</span>
          </h1>
          <p className="text-muted-foreground mt-1">Master switches that control the entire system</p>
        </div>
      </div>

      {/* Health Banner */}
      <div className={`relative overflow-hidden rounded-xl border p-5 ${
        healthStatus === 'good'
          ? 'bg-gradient-to-r from-green-500/5 to-green-500/10 border-green-500/20'
          : 'bg-gradient-to-r from-amber-500/5 to-amber-500/10 border-amber-500/20'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
            healthStatus === 'good' ? 'bg-green-500/15' : 'bg-amber-500/15'
          }`}>
            {healthStatus === 'good' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {healthStatus === 'good' ? 'All System Flags Active' : 'Some Flags Disabled'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {healthStatus === 'good' ? 'All system controls are enabled and operational' : `${disabledCount} flag(s) are currently turned off`}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatCard icon={ToggleRight} label="Total Flags" value={<AnimatedCounter value={flags.length} />}
          subvalue="System controls" color="#6366f1" />
        <StatCard icon={CheckCircle} label="Enabled" value={<AnimatedCounter value={enabledCount} />}
          subvalue={`${flags.length > 0 ? Math.round((enabledCount / flags.length) * 100) : 0}% active`} color="#22c55e" />
        <StatCard icon={ToggleLeft} label="Disabled" value={<AnimatedCounter value={disabledCount} />}
          subvalue={disabledCount === 0 ? 'All active' : `${disabledCount} inactive`} color="#a3a3a3" />
      </div>

      {!canManage && (
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Only owners and admins can modify system flags</p>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <SectionHeader icon={Shield} title="System Controls" subtitle="Toggle system-wide features. Turning off automation will pause all workers." />
        </CardHeader>
        <CardContent className="space-y-4">
          {flags.map((flag) => {
            const Icon = flag.icon
            return (
              <div key={flag.key} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: flag.value ? '#22c55e12' : '#a3a3a312' }}>
                    <Icon className="h-5 w-5" style={{ color: flag.value ? '#22c55e' : '#a3a3a3' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{flag.label}</h3>
                      <Badge variant={flag.value ? 'success' : 'secondary'}>
                        {flag.value ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{flag.description}</p>
                  </div>
                </div>
                <Switch
                  checked={flag.value}
                  disabled={!canManage || toggling === flag.key}
                  onCheckedChange={(v) => handleToggle(flag.key, v)}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
