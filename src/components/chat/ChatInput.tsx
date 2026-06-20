import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

export default function ChatInput({
  onSend,
  disabled,
  placeholder = "Type a message...",
}: {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [disabled])

  const handleSubmit = () => {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border bg-card px-4 md:px-6 py-4">
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 disabled:opacity-50 transition-colors shadow-sm"
            style={{ minHeight: "44px", maxHeight: "144px" }}
            onInput={(e) => {
              const el = e.currentTarget
              el.style.height = "auto"
              el.style.height = `${Math.min(el.scrollHeight, 144)}px`
            }}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-30 shrink-0 shadow-sm active:scale-95"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground/40 text-center mt-2">
        Enter to send · Shift+Enter for newline
      </p>
    </div>
  )
}
