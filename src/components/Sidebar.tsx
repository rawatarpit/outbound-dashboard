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
    <aside className="flex w-64 flex-col bg-card border-r border-border h-full">
      <div className="flex h-14 items-center gap-3 px-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-foreground">
          <Sparkles className="h-5 w-5 text-background" />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground">Outbound</h1>
          <p className="text-xs text-muted-foreground">Engine</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-0.5">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-card">
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
                  'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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
