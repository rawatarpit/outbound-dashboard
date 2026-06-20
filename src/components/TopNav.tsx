import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  MessageSquareText,
  GitBranch,
  Users,
  Send,
  BarChart3,
  Settings,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { brandsAPI } from '@/lib/api'
import type { BrandProfile } from '@/lib/supabase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const { client } = useAuth()
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

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-2.5 mr-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <span className="text-sm font-bold text-foreground hidden sm:inline">Outbound Engine</span>
        </div>
        <nav className="hidden md:flex items-center gap-0.5">
          {tabs.map((tab) => (
            <NavLink
              key={tab.href}
              to={tab.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                  isActive || (tab.href === '/chat' && location.pathname === '/')
                    ? 'bg-accent text-foreground'
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

      <div className="flex items-center gap-3">
        {brands.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/60" />
              <span className="hidden sm:inline truncate max-w-[140px]">
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
                    currentBrand?.id === brand.id && 'bg-accent font-medium'
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 shrink-0" />
                  <span className="truncate">{brand.brand_name || brand.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
