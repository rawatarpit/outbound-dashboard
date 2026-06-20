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
    <div className="flex justify-end mb-4">
      <div className="max-w-[70%]">
        <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-1 px-1">
          <span className="text-[11px] text-muted-foreground">{time}</span>
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
    <div className="flex mb-4">
      <div className="max-w-[80%]">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-foreground/10 shrink-0 mt-0.5">
            <Sparkles className="h-3.5 w-3.5 text-foreground/60" />
          </div>
          <div className="min-w-0">
            <div className="bg-muted/50 rounded-2xl rounded-bl-md px-4 py-2.5">
              <div className="text-sm text-foreground whitespace-pre-wrap">{content}</div>
              {children}
            </div>
            <div className="flex items-center gap-1.5 mt-1 px-1">
              <span className="text-[11px] text-muted-foreground">{time}</span>
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
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-foreground/5 mb-4">
          <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">How can I help you?</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Ask me to find leads, research companies, draft emails, or check your pipeline.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
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
  )
}
