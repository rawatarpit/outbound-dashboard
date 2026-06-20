import { Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ChatSidebar() {
  const { member, user } = useAuth()

  return (
    <aside className="hidden lg:flex w-[280px] shrink-0 flex-col border-r border-border bg-card overflow-y-auto">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground">
            <Sparkles className="h-4 w-4 text-background" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Outbound Engine</h2>
            <p className="text-[11px] text-muted-foreground">{member?.name || user?.email}</p>
          </div>
        </div>
      </div>

      {/* Pipeline quick-summary */}
      <div className="px-4 py-4 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pipeline</h3>
        <div className="space-y-2">
          {[
            { label: 'Researching', count: 4, pct: 80 },
            { label: 'Qualified', count: 1, pct: 20 },
            { label: 'Draft Ready', count: 2, pct: 40 },
            { label: 'Sent', count: 1, pct: 20 },
            { label: 'Replied', count: 0, pct: 0 },
          ].map((stage) => (
            <button
              key={stage.label}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent/50 transition-colors"
            >
              <span className="flex-1 text-left text-muted-foreground">{stage.label}</span>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground/40 transition-all"
                  style={{ width: `${stage.pct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-4 text-right">{stage.count}</span>
            </button>
          ))}
        </div>
        <a href="/pipeline" className="mt-3 block text-xs font-medium text-primary hover:underline">
          View full pipeline →
        </a>
      </div>

      {/* Saved Queries */}
      <div className="px-4 py-4 border-b border-border">
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
      <div className="px-4 py-4 mt-auto">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Session</h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p>Started: Just now</p>
          <p>Messages: 0</p>
        </div>
        <button className="mt-3 w-full rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
          Clear Chat
        </button>
      </div>
    </aside>
  )
}
