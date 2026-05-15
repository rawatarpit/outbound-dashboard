import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { AlertTriangle, Shield, Send, Search, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { systemAPI } from '@/lib/api'

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
        value: data?.[f.key] ?? true,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Flags</h1>
        <p className="text-gray-500">Master switches that control the entire system</p>
      </div>

      {!canManage && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800">Only owners and admins can modify system flags</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>System Controls</CardTitle>
          <CardDescription>
            Toggle system-wide features. Turning off automation will pause all workers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {flags.map((flag) => {
            const Icon = flag.icon
            return (
              <div key={flag.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${flag.value ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                    <Icon className={`h-5 w-5 ${flag.value ? 'text-indigo-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{flag.label}</h3>
                      <Badge variant={flag.value ? 'success' : 'secondary'}>
                        {flag.value ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{flag.description}</p>
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
