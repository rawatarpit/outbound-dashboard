import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Settings, UserCog, Webhook, Key, Activity, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const settingsNav = [
  { name: 'General', href: '/settings', icon: Settings, end: true },
  { name: 'Team', href: '/settings/team', icon: UserCog },
  { name: 'Webhooks', href: '/settings/webhooks', icon: Webhook },
  { name: 'API Keys', href: '/settings/api-keys', icon: Key },
  { name: 'Reputation', href: '/settings/reputation', icon: Activity },
  { name: 'System Flags', href: '/settings/system-flags', icon: Shield },
]

export default function SettingsLayout() {
  const location = useLocation()

  return (
    <div className="flex h-full">
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card p-3">
        <div className="px-3 mb-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Settings</h2>
          <p className="text-[11px] text-muted-foreground/50 mt-0.5">Manage your workspace</p>
        </div>
        <nav className="space-y-0.5 flex-1">
          {settingsNav.map((item) => {
            const Icon = item.icon
            const isActive = item.end
              ? location.pathname === '/settings'
              : location.pathname.startsWith(item.href)

            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.end}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-accent text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-foreground' : 'text-muted-foreground')} />
                {item.name}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-16 left-0 right-0 bg-card border-t border-border flex overflow-x-auto px-2 py-2 gap-1 z-40">
        {settingsNav.map((item) => {
          const Icon = item.icon
          const isActive = item.end
            ? location.pathname === '/settings'
            : location.pathname.startsWith(item.href)

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
                isActive
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.name}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
