import { NavLink } from 'react-router-dom'
import {
  MessageSquareText,
  GitBranch,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { name: 'Chat', href: '/chat', icon: MessageSquareText },
  { name: 'Pipeline', href: '/pipeline', icon: GitBranch },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium transition-colors',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground'
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  )
}
