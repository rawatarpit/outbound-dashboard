import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onCheckedChange?.(e.target.checked)
    }

    return (
      <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
        <span className={cn(
          'peer inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
          'peer-checked:bg-primary',
          className
        )}>
          <span className={cn(
            'inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
            'translate-x-1',
            'peer-checked:translate-x-6'
          )} />
        </span>
      </label>
    )
  }
)
Switch.displayName = 'Switch'

export { Switch }
