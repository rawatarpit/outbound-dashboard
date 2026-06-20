import { Building2, ExternalLink, Mail, Eye, EyeOff, Plus } from 'lucide-react'
import type { LeadCardData } from '@/types/chat'

export default function LeadCard({
  lead,
  onAddToPipeline,
  onDraftEmail,
}: {
  lead: LeadCardData
  onAddToPipeline?: () => void
  onDraftEmail?: () => void
}) {
  const scoreColor =
    lead.fit_score >= 80
      ? 'text-green-500'
      : lead.fit_score >= 60
        ? 'text-yellow-500'
        : 'text-red-500'

  return (
    <div className="my-3 rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground/5">
              <Building2 className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">{lead.company_name}</h4>
              {lead.industry && (
                <p className="text-xs text-muted-foreground">{lead.industry}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <FitScoreBar score={lead.fit_score} />
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          {lead.signal && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Signal:</span> {lead.signal}
            </p>
          )}
          {lead.pain_points && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Pain:</span> {lead.pain_points}
            </p>
          )}
          {lead.contact_name && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Contact:</span> {lead.contact_name}
              {lead.contact_title && ` (${lead.contact_title})`}
              {lead.contact_email && ` — ${lead.contact_email}`}
              {lead.contact_confidence && (
                <span className="text-muted-foreground/60"> [{Math.round(lead.contact_confidence * 100)}% confidence]</span>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddToPipeline}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            <Plus className="h-3 w-3" />
            Add to Pipeline
          </button>
          <button
            onClick={onDraftEmail}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground bg-accent hover:bg-accent/80 transition-colors"
          >
            <Mail className="h-3 w-3" />
            Draft Email
          </button>
        </div>
      </div>
    </div>
  )
}

export function FitScoreBar({ score }: { score: number }) {
  const barColor =
    score >= 80
      ? 'bg-green-500'
      : score >= 60
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-semibold ${score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
        {score}/100
      </span>
    </div>
  )
}
