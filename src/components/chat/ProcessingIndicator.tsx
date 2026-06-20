import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import type { ProcessingState, ProgressStep } from '@/types/chat'

export function ProcessingIndicator({ processing }: { processing: ProcessingState | null }) {
  if (!processing) return null

  const elapsed = formatElapsed(processing.elapsed)

  return (
    <div className="flex mb-4">
      <div className="max-w-[80%]">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-foreground/10 shrink-0 mt-0.5">
            <Loader2 className="h-3.5 w-3.5 text-foreground/60 animate-spin" />
          </div>
          <div className="min-w-0">
            <div className="bg-muted/30 rounded-2xl rounded-bl-md px-4 py-3 border border-border/50">
              <div className="space-y-2">
                {processing.steps.map((step) => (
                  <StepIndicator key={step.id} step={step} />
                ))}
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground/40 transition-all duration-500"
                    style={{ width: `${processing.progress}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 italic">{elapsed}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepIndicator({ step }: { step: ProgressStep }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {step.status === "done" ? (
        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
      ) : step.status === "error" ? (
        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
      ) : step.status === "running" ? (
        <Loader2 className="h-4 w-4 text-foreground/60 animate-spin shrink-0" />
      ) : (
        <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
      )}
      <span
        className={
          step.status === "done"
            ? "text-foreground"
            : step.status === "error"
              ? "text-red-500"
              : step.status === "running"
                ? "text-foreground"
                : "text-muted-foreground/50"
        }
      >
        {step.label}
      </span>
    </div>
  )
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `elapsed: ${s}s`
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `elapsed: ${m}m ${sec}s`
}
