import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  MessageSquareText,
  GitBranch,
  Users,
  Send,
  BarChart3,
  Settings,
  Sparkles,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { brandsAPI } from '@/lib/api'
import type { BrandProfile } from '@/lib/supabase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/DropdownMenu'

const tabs = [
  { name: 'Chat', href: '/chat', icon: MessageSquareText },
  { name: 'Pipeline', href: '/pipeline', icon: GitBranch },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Send },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function TopNav() {
  const { client, user, signOut } = useAuth()
  const navigate = useNavigate()
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [currentBrand, setCurrentBrand] = useState<BrandProfile | null>(null)
  const location = useLocation()

  useEffect(() => {
    if (!client?.id) return
    brandsAPI.list(client.id).then(({ data }) => {
      setBrands(data || [])
      if (data?.length > 0 && !currentBrand) {
        setCurrentBrand(data[0])
      }
    })
  }, [client?.id])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'OB'

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2.5 mr-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-foreground to-foreground/70 shadow-sm">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <span className="text-sm font-bold text-foreground hidden sm:inline tracking-tight">Outbound Engine</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.href}
              to={tab.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                  isActive || (tab.href === '/chat' && location.pathname === '/')
                    ? 'bg-accent text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )
              }
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {brands.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="truncate max-w-[140px]">
                {currentBrand?.brand_name || brands[0]?.brand_name || 'Select brand'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {brands.map((brand) => (
                <DropdownMenuItem
                  key={brand.id}
                  onClick={() => setCurrentBrand(brand)}
                  className={cn(
                    'flex items-center gap-2.5',
                    currentBrand?.id === brand.id && 'bg-accent font-medium'
                  )}
                >
                  <span className={cn(
                    'h-1.5 w-1.5 rounded-full shrink-0',
                    currentBrand?.id === brand.id ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                  )} />
                  <span className="truncate">{brand.brand_name || brand.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-foreground to-foreground/70 text-[11px] font-bold text-background">
              {initials}
            </div>
            <span className="hidden lg:inline text-sm max-w-[120px] truncate">
              {user?.name || user?.email}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="h-4 w-4 mr-2" />
              Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
