import { Sparkles, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ChatSidebar() {
  const { member, user } = useAuth()

  return (
    <aside className="hidden lg:flex w-[280px] shrink-0 flex-col border-r border-border bg-card overflow-y-auto">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-foreground to-foreground/70 shadow-sm">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground tracking-tight">Outbound Engine</h2>
            <p className="text-[11px] text-muted-foreground truncate">{member?.name || user?.email}</p>
          </div>
        </div>
      </div>

      {/* Pipeline quick-summary */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline</h3>
          <a href="/pipeline" className="text-xs font-medium text-primary hover:underline">View all</a>
        </div>
        <div className="space-y-1.5">
          {[
            { label: 'Researching', count: 4, pct: 80 },
            { label: 'Qualified', count: 1, pct: 20 },
            { label: 'Draft Ready', count: 2, pct: 40 },
            { label: 'Sent', count: 1, pct: 20 },
            { label: 'Replied', count: 0, pct: 0 },
          ].map((stage) => (
            <button
              key={stage.label}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent/50 transition-colors group"
            >
              <span className="flex-1 text-left text-muted-foreground group-hover:text-foreground transition-colors">{stage.label}</span>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground/30 transition-all"
                  style={{ width: `${stage.pct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground w-4 text-right">{stage.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Saved Queries */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saved Queries</h3>
        </div>
        <div className="space-y-1">
          {[
            { name: 'Weekly SaaS Hunt', enabled: false },
            { name: 'Enterprise Leads', enabled: true },
            { name: 'Y Combinator Batch', enabled: false },
          ].map((q) => (
            <label
              key={q.name}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={q.enabled}
                onChange={() => {}}
                className="rounded border-muted-foreground/30 text-foreground focus:ring-0"
              />
              <span className="text-muted-foreground truncate">{q.name}</span>
            </label>
          ))}
        </div>
        <button className="mt-2 w-full rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
          + New
        </button>
      </div>

      {/* Session Info */}
      <div className="px-5 py-5 mt-auto border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Session</h3>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>Started: Just now</p>
          <p>Messages: 0</p>
        </div>
        <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
          <Trash2 className="h-3 w-3" />
          Clear Chat
        </button>
      </div>
    </aside>
  )
}
