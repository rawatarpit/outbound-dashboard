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
  Rocket,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip } from './ui/Tooltip'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, tooltip: 'Overview & insights' },
  { name: 'Brands', href: '/brands', icon: Building2, tooltip: 'Manage brand profiles' },
  { name: 'Leads', href: '/leads', icon: Users, tooltip: 'View & manage leads' },
  { name: 'Pipeline', href: '/pipeline', icon: GitBranch, tooltip: 'Sales pipeline' },
  { name: 'Discovery', href: '/discovery', icon: Search, tooltip: 'Data sources & enrichment' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, tooltip: 'Performance metrics' },
  { name: 'Settings', href: '/settings', icon: Settings, tooltip: 'Configure workspace' },
  { name: 'Team', href: '/team', icon: UserCog, tooltip: 'Manage team members' },
  { name: 'Webhooks', href: '/webhooks', icon: Webhook, tooltip: 'Webhook endpoints' },
  { name: 'API Keys', href: '/api-keys', icon: Key, tooltip: 'API key management' },
]

export default function Sidebar() {
  return (
    <aside className="flex w-64 flex-col bg-white/80 backdrop-blur-xl border-r border-slate-200/50 shadow-xl shadow-slate-200/20">
      <div className="flex h-18 items-center gap-3 px-6 border-b border-slate-200/50 py-5">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-sm opacity-75"></div>
          <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-2">
            <Rocket className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Outbound</h1>
          <p className="text-xs text-slate-500 font-medium">AI Engine</p>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {navigation.slice(0, 6).map((item) => (
          <Tooltip key={item.name} content={item.tooltip} side="right">
            <NavLink
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          </Tooltip>
        ))}
        
        <div className="pt-4 pb-2">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-4"></div>
        </div>
        
        <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Configuration</p>
        
        {navigation.slice(6).map((item) => (
          <Tooltip key={item.name} content={item.tooltip} side="right">
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          </Tooltip>
        ))}
      </nav>
      
      <div className="border-t border-slate-200/50 p-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 border border-indigo-100/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <p className="text-sm font-semibold text-indigo-900">AI Agent Active</p>
          </div>
          <p className="text-xs text-indigo-700/70">
            Your agent is continuously enriching and discovering new leads
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-indigo-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-[75%] animate-pulse"></div>
            </div>
            <span className="text-xs font-medium text-indigo-600">75%</span>
          </div>
        </div>
      </div>
    </aside>
  )
}