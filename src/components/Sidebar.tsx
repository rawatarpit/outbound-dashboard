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
  Rocket
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Brands', href: '/brands', icon: Building2 },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Pipeline', href: '/pipeline', icon: GitBranch },
  { name: 'Discovery', href: '/discovery', icon: Search },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

const configNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Team', href: '/team', icon: UserCog },
  { name: 'Webhooks', href: '/webhooks', icon: Webhook },
  { name: 'API Keys', href: '/api-keys', icon: Key },
]

export default function Sidebar() {
  return (
    <aside className="flex w-64 flex-col bg-white border-r border-gray-200 h-full">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600">
          <Rocket className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Outbound</h1>
          <p className="text-xs text-gray-500">Engine</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </div>
        
        <div className="mt-6 mb-2 px-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Configuration</p>
        </div>
        
        <div className="space-y-1">
          {configNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  )
}