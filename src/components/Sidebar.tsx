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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Brands', href: '/brands', icon: Building2 },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Pipeline', href: '/pipeline', icon: GitBranch },
  { name: 'Discovery', href: '/discovery', icon: Search },
  { name: 'Outreach Queue', href: '/outreach', icon: Send },
  { name: 'Campaigns', href: '/campaigns', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

const configNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'System Flags', href: '/system-flags', icon: Shield },
  { name: 'Reputation', href: '/reputation', icon: Activity },
  { name: 'Team', href: '/team', icon: UserCog },
  { name: 'Webhooks', href: '/webhooks', icon: Webhook },
  { name: 'API Keys', href: '/api-keys', icon: Key },
]

export default function Sidebar() {
  return (
    <aside className="flex w-64 flex-col bg-gradient-to-b from-card/95 to-card/90 border-r border-white/[0.06] backdrop-blur-2xl h-full">
      <div className="flex h-14 items-center gap-3 px-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/25">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Outbound</h1>
          <p className="text-xs text-muted-foreground">Engine</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div className="space-y-0.5">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-violet-500/20 text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_3px_rgba(0,0,0,0.2)] border border-primary/15'
                    : 'text-muted-foreground/80 hover:text-foreground hover:bg-white/[0.04] hover:border-transparent'
                )
              }
            >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs font-bold text-muted-foreground/50 uppercase tracking-wider bg-gradient-to-b from-card/95 to-card/90">
              Configuration
            </span>
          </div>
        </div>

        <div className="space-y-0.5">
          {configNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary/15 to-violet-500/15 text-primary shadow-sm border border-primary/10'
                    : 'text-muted-foreground/80 hover:text-foreground hover:bg-white/[0.04]'
                )
              }
            >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  )
}
