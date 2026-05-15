import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-foreground/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-all duration-200',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground/60',
          'hover:border-white/[0.14] hover:bg-white/[0.06]',
          'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 focus-visible:border-primary/60 focus-visible:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_0_20px_-4px_rgba(99,102,241,0.15)]',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-white/[0.02]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
