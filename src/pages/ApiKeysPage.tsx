import { useState, useEffect } from 'react'
import { type ClientApiKey } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import Modal from '@/components/Modal'
import {
  Plus,
  Key,
  Trash2,
  Copy,
  MoreHorizontal,
  Eye,
  EyeOff,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, formatNumber, copyToClipboard } from '@/lib/utils'
import { apiKeysAPI } from '@/lib/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

export default function ApiKeysPage() {
  const { client } = useAuth()
  const [apiKeys, setApiKeys] = useState<ClientApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newKey, setNewKey] = useState<{ name: string; key: string } | null>(null)

  useEffect(() => {
    fetchApiKeys()
  }, [client])

  const fetchApiKeys = async () => {
    if (!client?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await apiKeysAPI.list(client.id)
      if (error) throw error
      setApiKeys(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch API keys')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateKey = async (formData: { name: string; rate_limit_per_minute: number; rate_limit_per_day: number }) => {
    if (!client?.id) return

    try {
      const { data, error } = await apiKeysAPI.create({
        client_id: client.id,
        name: formData.name,
        rate_limit_per_minute: formData.rate_limit_per_minute,
        rate_limit_per_day: formData.rate_limit_per_day
      })

      if (error) throw error

      const rawKey = data[0]?._rawKey
      if (rawKey) {
        setNewKey({ name: formData.name, key: rawKey })
        toast.success('API key created - copy it now, you won\'t see it again!')
      }
      fetchApiKeys()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create API key')
    }
  }

  const handleDeleteKey = async (key: ClientApiKey) => {
    if (!confirm(`Delete API key "${key.name}"? This action cannot be undone.`)) return

    try {
      const { error } = await apiKeysAPI.delete(key.id)
      if (error) throw error
      toast.success('API key deleted')
      fetchApiKeys()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete API key')
    }
  }

  const handleCopyKey = async (key: string) => {
    await copyToClipboard(key)
    toast.success('Copied to clipboard')
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
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-500">Manage API keys for programmatic access</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {newKey && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-green-800">API Key Created!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Copy your new API key now. You won't be able to see it again.
                </p>
                <code className="block mt-2 p-2 bg-white rounded border text-sm font-mono break-all">
                  {newKey.key}
                </code>
              </div>
              <Button onClick={() => handleCopyKey(newKey.key)} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <Button
              onClick={() => setNewKey(null)}
              variant="ghost"
              className="mt-2 text-green-700"
            >
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {apiKeys.length === 0 && !newKey ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Key className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No API keys yet</h3>
            <p className="text-gray-500 mb-4">Create an API key to access the outbound engine programmatically</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {apiKeys.map((key) => (
            <Card key={key.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Key className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{key.name}</CardTitle>
                      <p className="text-sm text-gray-500">
                        Created {formatRelativeTime(key.created_at)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal className="h-5 w-5 text-gray-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeleteKey(key)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={key.is_active ? 'success' : 'secondary'}>
                    {key.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {key.expires_at && (
                    <Badge variant="warning">
                      Expires {formatRelativeTime(key.expires_at)}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Rate Limit (min)</p>
                    <p className="font-medium">{key.rate_limit_per_minute} req</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rate Limit (day)</p>
                    <p className="font-medium">{formatNumber(key.rate_limit_per_day)} req</p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Usage Count</span>
                    <span className="font-medium">{formatNumber(key.usage_count)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Used</span>
                    <span className="font-medium">
                      {key.last_used_at ? formatRelativeTime(key.last_used_at) : 'Never'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 font-mono">
                  Key ID: {key.id.slice(0, 8)}...
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(data) => {
          handleCreateKey(data)
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}

interface CreateApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: { name: string; rate_limit_per_minute: number; rate_limit_per_day: number }) => void
}

function CreateApiKeyModal({ isOpen, onClose, onSuccess }: CreateApiKeyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    rate_limit_per_minute: 60,
    rate_limit_per_day: 1000
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSuccess(formData)
    setFormData({
      name: '',
      rate_limit_per_minute: 60,
      rate_limit_per_day: 1000
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create API Key"
      description="Generate a new API key for programmatic access"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="key_name" required>Name</Label>
          <Input
            id="key_name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Production API"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rate_per_min">Rate Limit (per minute)</Label>
            <Input
              id="rate_per_min"
              type="number"
              value={formData.rate_limit_per_minute}
              onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: parseInt(e.target.value) })}
              min={1}
              max={1000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate_per_day">Rate Limit (per day)</Label>
            <Input
              id="rate_per_day"
              type="number"
              value={formData.rate_limit_per_day}
              onChange={(e) => setFormData({ ...formData, rate_limit_per_day: parseInt(e.target.value) })}
              min={100}
              max={100000}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!formData.name}>
            Create Key
          </Button>
        </div>
      </form>
    </Modal>
  )
}
