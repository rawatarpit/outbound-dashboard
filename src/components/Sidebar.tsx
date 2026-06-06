import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  GitBranch,
  Search,
  BarChart3,
  Settings,
  UserCog,
  Webhook,
  Key,
  Send,
  MessageSquare,
  Shield,
  Activity,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { sidebarAPI, brandsAPI, systemAPI } from '@/lib/api'
import type { BrandProfile } from '@/lib/supabase'

const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, countKey: undefined },
  { name: 'Discovered', href: '/discovered-companies', icon: Search, countKey: undefined },
  { name: 'Leads', href: '/leads', icon: Users, countKey: 'leads' as const },
  { name: 'Pipeline', href: '/pipeline', icon: GitBranch, countKey: 'pipeline' as const },
  { name: 'Discovery', href: '/discovery', icon: Activity, countKey: undefined },
  { name: 'Outreach Queue', href: '/outreach', icon: Send, countKey: 'outreach' as const },
  { name: 'Campaigns', href: '/campaigns', icon: MessageSquare, countKey: undefined },
]

const monitoringNav = [
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Reputation', href: '/reputation', icon: Activity },
]

const configNav = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'System Flags', href: '/system-flags', icon: Shield, hasDot: true },
  { name: 'Team', href: '/team', icon: UserCog },
  { name: 'Webhooks', href: '/webhooks', icon: Webhook },
  { name: 'API Keys', href: '/api-keys', icon: Key },
]

function ShimmerDot() {
  return (
    <span className="inline-block h-5 w-8 rounded bg-muted animate-pulse" />
  )
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-foreground/10 px-1.5 text-[11px] font-semibold text-foreground/70 tabular-nums">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function StatusDot({ enabled }: { enabled?: boolean }) {
  return (
    <span
      className={cn(
        'ml-auto inline-block h-2 w-2 rounded-full',
        enabled ? 'bg-emerald-500' : 'bg-muted-foreground/30'
      )}
    />
  )
}

function SectionHeader({ children }: { children: string }) {
  return (
    <div className="relative my-2 first:mt-0">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/60" />
      </div>
      <div className="relative flex justify-start">
        <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 bg-card">
          {children}
        </span>
      </div>
    </div>
  )
}

function NavItem({
  href,
  icon: Icon,
  children,
  end,
  badge,
  dot,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  end?: boolean
  badge?: number
  dot?: boolean | 'enabled'
}) {
  return (
    <NavLink
      to={href}
      end={end}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-accent text-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        )
      }
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="truncate">{children}</span>
      {badge !== undefined && <CountBadge count={badge} />}
      {dot === 'enabled' && <StatusDot enabled />}
      {dot === true && <StatusDot />}
    </NavLink>
  )
}

function BrandItem({ brand }: { brand: BrandProfile }) {
  return (
    <NavLink
      to={`/brands/${brand.id}`}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-accent/60 text-foreground font-medium'
            : 'text-muted-foreground/70 hover:text-foreground hover:bg-accent/30'
        )
      }
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/30" />
      <span className="truncate">{brand.brand_name || brand.name}</span>
    </NavLink>
  )
}

export default function Sidebar() {
  const { client } = useAuth()
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [brands, setBrands] = useState<BrandProfile[]>([])
  const [brandsOpen, setBrandsOpen] = useState(false)
  const [flagsOk, setFlagsOk] = useState<boolean | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!client?.id) return
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      const [countsRes, brandsRes, flagsRes] = await Promise.all([
        sidebarAPI.counts(),
        brandsAPI.list(client.id),
        systemAPI.flags(),
      ])

      if (cancelled) return

      if (!countsRes.error && countsRes.data) {
        setCounts({
          leads: countsRes.data.leads ?? 0,
          pipeline: countsRes.data.pipeline ?? 0,
          outreach: countsRes.data.outreach ?? 0,
        })
      }

      if (!brandsRes.error) {
        setBrands(brandsRes.data)
      }

      if (!flagsRes.error && flagsRes.data?.flags) {
        const hasIssues = Object.values(flagsRes.data.flags).some(
          (f: any) => f.enabled === false
        )
        setFlagsOk(!hasIssues)
      }

      setLoading(false)
    }

    fetchData()
    return () => { cancelled = true }
  }, [client?.id])

  return (
    <aside className="flex w-64 flex-col bg-card border-r border-border h-full overflow-hidden">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-3 px-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-foreground">
          <Sparkles className="h-5 w-5 text-background" />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground leading-tight">Outbound</h1>
          <p className="text-[11px] text-muted-foreground leading-tight">Engine</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
        {/* Main */}
        <div>
          {mainNav.map((item) => {
            if (item.name === 'Brands') return null
            return (
              <NavItem
                key={item.name}
                href={item.href}
                icon={item.icon}
                end={item.href === '/'}
                badge={item.countKey ? counts[item.countKey] : undefined}
              >
                {item.name}
              </NavItem>
            )
          })}
        </div>

        {/* Brands expandable */}
        <div className="space-y-0.5">
          <button
            onClick={() => setBrandsOpen(!brandsOpen)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
              'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            <Building2 className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">Brands</span>
            {brandsOpen ? (
              <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground/60" />
            ) : (
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/60" />
            )}
          </button>
          {brandsOpen && (
            <div className="ml-1 space-y-0.5 border-l border-border/50 pl-2">
              <NavLink
                to="/brands"
                end
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-accent/60 text-foreground font-medium'
                      : 'text-muted-foreground/70 hover:text-foreground hover:bg-accent/30'
                  )
                }
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                <span className="truncate">All Brands</span>
              </NavLink>
              {brands.length === 0 && loading && (
                <div className="px-3 py-1.5 space-y-1.5">
                  <ShimmerDot />
                  <ShimmerDot />
                </div>
              )}
              {brands.map((brand) => (
                <BrandItem key={brand.id} brand={brand} />
              ))}
            </div>
          )}
        </div>

        {/* Monitoring */}
        <SectionHeader>Monitoring</SectionHeader>
        <div>
          {monitoringNav.map((item) => (
            <NavItem key={item.name} href={item.href} icon={item.icon}>
              {item.name}
            </NavItem>
          ))}
        </div>

        {/* Configuration */}
        <SectionHeader>Configuration</SectionHeader>
        <div>
          {configNav.map((item) => {
            const isFlags = item.name === 'System Flags'
            return (
              <NavItem
                key={item.name}
                href={item.href}
                icon={item.icon}
                dot={isFlags ? (flagsOk === undefined ? true : flagsOk ? 'enabled' : true) : undefined}
              >
                {item.name}
              </NavItem>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
