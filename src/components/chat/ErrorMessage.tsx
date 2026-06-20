import { AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react'

export function ErrorMessage({
  message,
  failedSteps,
  onRetry,
  onContinue,
}: {
  message: string
  failedSteps?: Array<{ tool: string; label: string }>
  onRetry?: () => void
  onContinue?: () => void
}) {
  return (
    <div className="flex mb-4">
      <div className="max-w-[80%]">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/10 shrink-0 mt-0.5">
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          </div>
          <div className="min-w-0">
            <div className="bg-red-500/5 rounded-2xl rounded-bl-md px-4 py-3 border border-red-500/20">
              <p className="text-sm text-foreground mb-2">{message}</p>

              {failedSteps && failedSteps.length > 0 && (
                <div className="space-y-1 mb-3">
                  {failedSteps.map((step) => (
                    <div key={step.tool} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-red-500">✗</span>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </button>
                )}
                {onContinue && (
                  <button
                    onClick={onContinue}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground bg-accent hover:bg-accent/80 transition-colors"
                  >
                    Continue
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
