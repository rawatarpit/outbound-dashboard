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
    <header className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-card/40 backdrop-blur-xl px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold text-foreground/80">
          Welcome back, {member?.name || user?.email?.split('@')[0]}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-xl p-2.5 text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.06] transition-all duration-200">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/[0.06] transition-all duration-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-primary-foreground text-sm font-bold shadow-md shadow-primary/20">
              {getInitials(member?.name || user?.email || 'U')}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground/90">{member?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{member?.role || 'Member'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-foreground/90">{member?.name || 'User'}</span>
                <span className="text-xs font-normal text-muted-foreground">
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
            <DropdownMenuItem onClick={signOut} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
