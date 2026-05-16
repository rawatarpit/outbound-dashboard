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
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-8">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Welcome back, {member?.name || user?.email?.split('@')[0]}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent transition-all duration-200">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
              {getInitials(member?.name || user?.email || 'U')}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-foreground">{member?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{member?.role || 'Member'}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-foreground">{member?.name || 'User'}</span>
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
