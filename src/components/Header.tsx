import { Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getInitials } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/DropdownMenu'

export default function Header() {
  const { user, member, signOut } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium text-gray-900">
          Welcome back, {member?.name || user?.email?.split('@')[0]}
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-medium">
              {getInitials(member?.name || user?.email || 'U')}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{member?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{member?.role || 'Member'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{member?.name || 'User'}</span>
                <span className="text-xs font-normal text-gray-500">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}