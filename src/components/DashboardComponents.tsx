import { useState, useEffect, useRef } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

export function AnimatedCounter({ value, suffix = '', prefix = '', decimals = 0 }: { value: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<ReturnType<typeof requestAnimationFrame>>()
  const startVal = useRef(0)
  const startTime = useRef(0)

  useEffect(() => {
    startVal.current = display
    startTime.current = Date.now()
    const duration = 800

    function animate() {
      const elapsed = Date.now() - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startVal.current + (value - startVal.current) * eased
      setDisplay(current)
      if (progress < 1) ref.current = requestAnimationFrame(animate)
    }
    ref.current = requestAnimationFrame(animate)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [value])

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()
  return <>{prefix}{formatted}{suffix}</>
}

export function TrendBadge({ value, inverse = false }: { value: number; inverse?: boolean }) {
  const isGood = inverse ? value < 0 : value >= 0
  if (value === 0) return null
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isGood ? 'text-green-600' : 'text-red-500'}`}>
      {isGood ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  )
}

export function MiniSparkline({ data, color = '#6366f1' }: { data: { value: number }[]; color?: string }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.value), 1)
  const min = Math.min(...data.map(d => d.value), 0)
  const range = max - min || 1
  const w = 80, h = 28
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((d.value - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} className="shrink-0" viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  )
}

export function SectionHeader({ icon: Icon, title, subtitle, action }: { icon: any; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-foreground/5 to-foreground/10 flex items-center justify-center border border-border/50">
          <Icon className="h-[18px] w-[18px] text-foreground/70" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, subvalue, trend, color, chart, onClick }: {
  icon: any; label: string; value: React.ReactNode; subvalue?: string;
  trend?: number; color?: string; chart?: { value: number }[]; onClick?: () => void
}) {
  const accent = color || '#6366f1'
  return (
    <button onClick={onClick} className="relative group w-full text-left">
      <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 hover:border-border hover:shadow-sm hover:bg-card transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}12` }}>
            <Icon className="h-[18px] w-[18px]" style={{ color: accent }} />
          </div>
          {chart && <MiniSparkline data={chart} color={accent} />}
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
          {trend !== undefined && <TrendBadge value={trend} />}
        </div>
        {subvalue && <p className="text-xs text-muted-foreground mt-1">{subvalue}</p>}
      </div>
    </button>
  )
}
