import { useState, useEffect } from 'react'
import { supabase, type ClientMember } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import Modal from '@/components/Modal'
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
import {
  Plus,
  UserCog,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-amber-100 text-amber-800',
  admin: 'bg-purple-100 text-purple-800',
  member: 'bg-blue-100 text-blue-800'
}

export default function TeamPage() {
  const { client, member: currentMember, refreshClient } = useAuth()
  const [members, setMembers] = useState<ClientMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'member'
  })

  useEffect(() => {
    fetchMembers()
  }, [client])

  const fetchMembers = async () => {
    if (!client?.id) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('client_members')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMembers(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch team members')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!client?.id || !inviteData.email) return

    setIsInviting(true)
    try {
      const { error } = await supabase
        .from('client_members')
        .insert({
          client_id: client.id,
          email: inviteData.email,
          role: inviteData.role,
          invite_token: Math.random().toString(36).substring(2),
          invited_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success(`Invitation sent to ${inviteData.email}`)
      setIsModalOpen(false)
      setInviteData({ email: '', role: 'member' })
      fetchMembers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleUpdateRole = async (member: ClientMember, newRole: string) => {
    try {
      const { error } = await supabase
        .from('client_members')
        .update({ role: newRole })
        .eq('id', member.id)

      if (error) throw error
      toast.success(`Role updated to ${newRole}`)
      fetchMembers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role')
    }
  }

  const handleRemoveMember = async (member: ClientMember) => {
    if (!confirm(`Remove ${member.email} from the team?`)) return

    try {
      const { error } = await supabase
        .from('client_members')
        .delete()
        .eq('id', member.id)

      if (error) throw error
      toast.success('Member removed')
      fetchMembers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member')
    }
  }

  const handleResendInvite = async (member: ClientMember) => {
    try {
      const { error } = await supabase
        .from('client_members')
        .update({
          invite_token: Math.random().toString(36).substring(2),
          invited_at: new Date().toISOString()
        })
        .eq('id', member.id)

      if (error) throw error
      toast.success('Invitation resent')
      fetchMembers()
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend invitation')
    }
  }

  const canManage = currentMember?.role === 'owner' || currentMember?.role === 'admin'

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
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500">Manage your team members and roles</p>
        </div>
        {canManage && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            {client?.seats ? `${members.length} of ${client.seats} seats used` : `${members.length} members`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {getInitials(member.name || member.email)}
                      </div>
                      <div>
                        <p className="font-medium">{member.name || 'Pending'}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={ROLE_COLORS[member.role] || ''}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.joined_at ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Invited</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {member.last_login_at
                      ? formatRelativeTime(member.last_login_at)
                      : member.invited_at
                        ? `Invited ${formatRelativeTime(member.invited_at)}`
                        : 'Never'}
                  </TableCell>
                  <TableCell>
                    {canManage && member.id !== currentMember?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Select
                              value={member.role}
                              onValueChange={(v) => handleUpdateRole(member, v)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <Shield className="h-4 w-4 mr-2" />
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                              </SelectContent>
                            </Select>
                          </DropdownMenuItem>
                          {!member.joined_at && (
                            <DropdownMenuItem onClick={() => handleResendInvite(member)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Resend Invite
                            </DropdownMenuItem>
                          )}
                          {member.role !== 'owner' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleRemoveMember(member)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invite Team Member"
        description="Send an invitation to join your team"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite_email" required>Email Address</Label>
            <Input
              id="invite_email"
              type="email"
              value={inviteData.email}
              onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
              placeholder="colleague@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite_role">Role</Label>
            <Select
              value={inviteData.role}
              onValueChange={(v) => setInviteData({ ...inviteData, role: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <h4 className="font-medium mb-2">Role Permissions</h4>
            <div className="space-y-1 text-gray-600">
              <p><strong>Admin:</strong> Can manage settings, team, and brands</p>
              <p><strong>Member:</strong> Can view dashboard and manage leads</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} isLoading={isInviting} disabled={!inviteData.email}>
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
