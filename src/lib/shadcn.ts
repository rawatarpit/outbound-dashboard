import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { cva, type VariantProps } from 'class-variance-authority'

export { clsx, type ClassValue }
export { twMerge }

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary to-violet-500 text-primary-foreground shadow-[0_2px_10px_-2px_rgba(99,102,241,0.3),0_4px_20px_-4px_rgba(99,102,241,0.2)] hover:shadow-[0_4px_16px_-2px_rgba(99,102,241,0.4),0_8px_32px_-4px_rgba(99,102,241,0.25)] hover:from-primary/90 hover:to-violet-500/90 active:scale-[0.97]',
        destructive: 'bg-gradient-to-r from-destructive to-rose-600 text-destructive-foreground shadow-[0_2px_10px_-2px_rgba(239,68,68,0.3),0_4px_20px_-4px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_16px_-2px_rgba(239,68,68,0.4),0_8px_32px_-4px_rgba(239,68,68,0.25)] hover:from-destructive/90 hover:to-rose-600/90 active:scale-[0.97]',
        outline: 'border border-white/[0.08] bg-white/[0.04] text-foreground/80 hover:bg-white/[0.08] hover:text-foreground hover:border-white/[0.14] shadow-sm active:scale-[0.97]',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'text-foreground/60 hover:text-foreground hover:bg-white/[0.06]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type ButtonVariant = VariantProps<typeof buttonVariants>
