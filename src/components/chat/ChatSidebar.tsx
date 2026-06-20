import { useEffect, useState } from 'react'
import { Sparkles, Trash2, BarChart2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useChat } from '@/contexts/ChatContext'
import { pipelineAPI } from '@/lib/api'
import { PIPELINE_STAGES } from '@/lib/supabase'

export default function ChatSidebar() {
  const { member, user } = useAuth()
  const { sessionId, messages, clearChat } = useChat()
  const [pipelineStats, setPipelineStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pipelineAPI.overview().then(({ data }) => {
      if (data?.stages) {
        setPipelineStats(data.stages)
      }
      setLoading(false)
    })
  }, [])

  const totalMessages = messages.length

  return (
    <aside className="hidden lg:flex w-[280px] shrink-0 flex-col border-r border-border bg-card overflow-y-auto">
      {/* Pipeline quick-summary */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline</h3>
          </div>
          <a href="/pipeline" className="text-xs font-medium text-primary hover:underline">View all</a>
        </div>
        {loading ? (
          <div className="space-y-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {PIPELINE_STAGES.map((stage) => {
              const count = pipelineStats[stage.id] || 0
              const total = Object.values(pipelineStats).reduce((a, b) => a + b, 0)
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <button
                  key={stage.id}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent/50 transition-colors group"
                >
                  <span className="flex-1 text-left text-muted-foreground group-hover:text-foreground transition-colors">{stage.label}</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-foreground/30 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground w-5 text-right">{count}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Session Info */}
      <div className="px-5 py-5 mt-auto border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Session</h3>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          {sessionId && <p>Session: {sessionId.slice(0, 8)}…</p>}
          <p>Messages: {totalMessages}</p>
        </div>
        <button
          onClick={clearChat}
          className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          Clear Chat
        </button>
      </div>
    </aside>
  )
}