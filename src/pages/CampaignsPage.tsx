import { useState, useEffect } from 'react'
import { type BrandProfile, type SentMessage } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Mail, MessageSquare, ExternalLink, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import { brandsAPI, messagesAPI, analyticsAPI } from '@/lib/api'
import { Input } from '@/components/ui/Input'

const STATUS_COLORS: Record<string, string> = {
  sent: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  opened: 'bg-purple-100 text-purple-800',
  bounced: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  replied: 'bg-emerald-100 text-emerald-800',
}

export default function CampaignsPage() {
  const { client } = useAuth()
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [brandFilter, setBrandFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [brandFilter])

  const fetchBrands = async () => {
    try {
      const { data } = await brandsAPI.list(client?.id)
      setBrands(data)
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const { data } = await messagesAPI.list({ brandId: brandFilter || undefined })
      const filtered = Array.isArray(data)
        ? data.filter((m: any) => m.direction === 'outbound' || !m.direction)
        : []
      setMessages(filtered)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch messages')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMessages = messages.filter(msg => {
    if (statusFilter && msg.status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const subject = (msg.subject || '').toLowerCase()
      const toEmail = (msg.to_email || '').toLowerCase()
      if (!subject.includes(q) && !toEmail.includes(q)) return false
    }
    return true
  })

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
          <h1 className="text-2xl font-bold text-gray-900">Sent Campaigns</h1>
          <p className="text-gray-500">Track all sent emails and their delivery status</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by subject or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                {brands.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>{brand.brand_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No emails sent yet</h3>
              <p className="text-gray-500">Campaigns will appear here after sending begins</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="font-medium max-w-[250px] truncate">
                      {msg.subject || 'No subject'}
                    </TableCell>
                    <TableCell className="text-gray-500">{msg.to_email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[msg.status] || ''}>
                        {msg.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {msg.sent_at ? formatRelativeTime(msg.sent_at) : formatRelativeTime(msg.created_at)}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {msg.delivered_at ? formatRelativeTime(msg.delivered_at) : '-'}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {msg.opened_at ? formatRelativeTime(msg.opened_at) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
