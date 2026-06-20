import { Search, Building2, GitBranch, Bookmark } from 'lucide-react'

const defaultChips = [
  { label: 'Find leads', icon: Search, hint: 'Find me SaaS companies hiring SDRs' },
  { label: 'Research a company', icon: Building2, hint: 'Research Acme Corp for me' },
  { label: 'View pipeline', icon: GitBranch, hint: 'Show me my pipeline' },
  { label: 'Save this search', icon: Bookmark, hint: 'Save this as a recurring search' },
]

export default function SuggestionChips({
  onSelect,
  chips,
}: {
  onSelect: (text: string) => void
  chips?: Array<{ label: string; icon?: React.ComponentType<{ className?: string }>; hint: string }>
}) {
  const items = chips || defaultChips

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {items.map((chip) => {
        const Icon = chip.icon
        return (
          <button
            key={chip.label}
            onClick={() => onSelect(chip.hint)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
