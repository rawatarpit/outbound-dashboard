import { useState } from 'react'
import { Check, Edit3, X, ExternalLink, Loader2, Send } from 'lucide-react'

interface DraftCardProps {
  companyName: string
  subject: string
  body: string
  toEmail?: string
  status: "pending" | "editing" | "saving" | "approved" | "sent" | "rejected" | "error"
  onApprove?: () => void
  onReject?: () => void
  onSave?: (subject: string, body: string) => void
}

export default function DraftCard({
  companyName,
  subject: initialSubject,
  body: initialBody,
  toEmail,
  status,
  onApprove,
  onReject,
  onSave,
}: DraftCardProps) {
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState(initialBody)
  const [editing, setEditing] = useState(false)

  const statusBadge = () => {
    switch (status) {
      case "pending": return <span className="text-[11px] font-medium text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded-full">Pending</span>
      case "approved": return <span className="text-[11px] font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">Approved</span>
      case "sent": return <span className="text-[11px] font-medium text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">Sent</span>
      case "rejected": return <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Rejected</span>
      case "saving": return <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Saving...</span>
      case "error": return <span className="text-[11px] font-medium text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full">Error</span>
      default: return null
    }
  }

  return (
    <div className="my-3 rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Draft for {companyName}</span>
          </div>
          {statusBadge()}
        </div>

        <div className="space-y-2 mb-3">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Subject</label>
            {editing ? (
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
              />
            ) : (
              <p className="text-sm text-foreground mt-0.5">{subject}</p>
            )}
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Body</label>
            {editing ? (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
              />
            ) : (
              <div className="text-sm text-foreground mt-0.5 whitespace-pre-wrap line-clamp-4">{body}</div>
            )}
            <button className="text-xs text-primary hover:underline mt-1">Show full email</button>
          </div>
        </div>

        {status === "pending" && !editing && (
          <div className="flex items-center gap-2">
            <button
              onClick={onApprove}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              <Check className="h-3 w-3" />
              Approve
            </button>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground bg-accent hover:bg-accent/80 transition-colors"
            >
              <Edit3 className="h-3 w-3" />
              Edit
            </button>
            <button
              onClick={onReject}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="h-3 w-3" />
              Reject
            </button>
          </div>
        )}

        {editing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSave?.(subject, body)
                setEditing(false)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              <Check className="h-3 w-3" />
              Save
            </button>
            <button
              onClick={() => {
                setSubject(initialSubject)
                setBody(initialBody)
                setEditing(false)
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground bg-accent hover:bg-accent/80 transition-colors"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
