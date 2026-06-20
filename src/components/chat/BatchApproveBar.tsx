import { Check, X } from 'lucide-react'

export default function BatchApproveBar({
  count,
  onApproveAll,
  onHide,
}: {
  count: number
  onApproveAll: () => void
  onHide: () => void
}) {
  if (count === 0) return null

  return (
    <div className="border-t border-border bg-card px-4 py-2">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        <span className="text-sm text-muted-foreground">
          {count} draft{count > 1 ? 's' : ''} pending review
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onApproveAll}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <Check className="h-3 w-3" />
            Approve All
          </button>
          <button
            onClick={onHide}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Hide
          </button>
        </div>
      </div>
    </div>
  )
}
