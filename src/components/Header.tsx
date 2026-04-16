import { Bell, LogOut, User, ChevronDown, Sparkles } from 'lucide-react'
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
import { Tooltip } from './ui/Tooltip'

export default function Header() {
  const { user, member, signOut } = useAuth()

  return (
    <header className="flex h-18 items-center justify-between border-b border-slate-200/50 bg-white/60 backdrop-blur-xl px-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">AI Agent Running</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Tooltip content="Notifications">
          <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
        </Tooltip>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-100 transition-all">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20">
              {getInitials(member?.name || user?.email || 'U')}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{member?.name || 'User'}</p>
              <p className="text-xs text-slate-500 capitalize">{member?.role || 'Member'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 bg-white/95 backdrop-blur-xl border-slate-200/50 shadow-xl shadow-slate-200/20">
            <DropdownMenuLabel className="p-3">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900">{member?.name || 'User'}</span>
                <span className="text-xs font-normal text-slate-500">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-slate-100" />
            <DropdownMenuItem className="rounded-lg px-3 py-2.5 cursor-pointer">
              <User className="mr-2 h-4 w-4 text-slate-500" />
              <span className="text-slate-700">Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-slate-100" />
            <DropdownMenuItem onClick={signOut} className="rounded-lg px-3 py-2.5 cursor-pointer text-red-600 hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
