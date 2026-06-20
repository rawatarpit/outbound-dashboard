import { MessageSquare, Sparkles } from 'lucide-react'

export default function UserMessage({
  content,
  timestamp,
}: {
  content: string
  timestamp: string
}) {
  const time = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="flex justify-end mb-5">
      <div className="max-w-[75%] md:max-w-[65%]">
        <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-3 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-1.5 px-1">
          <span className="text-[11px] text-muted-foreground/60">{time}</span>
        </div>
      </div>
    </div>
  )
}

export function AssistantMessage({
  content,
  timestamp,
  children,
}: {
  content: string
  timestamp: string
  children?: React.ReactNode
}) {
  const time = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="flex mb-5">
      <div className="max-w-[85%] md:max-w-[75%]">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/5 shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="h-4 w-4 text-foreground/50" />
          </div>
          <div className="min-w-0">
            <div className="bg-muted/40 rounded-2xl rounded-bl-md px-4 py-3 border border-border/30 shadow-sm">
              <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{content}</div>
              {children}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 px-1">
              <span className="text-[11px] text-muted-foreground/60">{time}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MessageList({
  messages,
  processing,
  children,
}: {
  messages: Array<{ id: string; role: string; content: string; timestamp: string }>
  processing: React.ReactNode
  children?: React.ReactNode
}) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10 mb-5 shadow-sm">
          <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1.5">How can I help you?</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
          Ask me to find leads, research companies, draft emails, or check your pipeline.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-1">
      <div className="max-w-3xl mx-auto">
        {messages.map((msg) =>
          msg.role === "user" ? (
            <UserMessage key={msg.id} content={msg.content} timestamp={msg.timestamp} />
          ) : (
            <AssistantMessage key={msg.id} content={msg.content} timestamp={msg.timestamp} />
          )
        )}
        {processing}
        {children}
      </div>
    </div>
  )
}
