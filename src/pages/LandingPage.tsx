import { Link } from 'react-router-dom'
import { Rocket, Sparkles, Zap, Shield, BarChart3, ArrowRight, Mail, Search, Bot, CheckCircle } from 'lucide-react'

const features = [
  { icon: Search, title: 'Smart Discovery', description: 'AI-powered company and contact discovery from multiple data sources', color: '#6366f1' },
  { icon: Bot, title: 'AI Outreach', description: 'Personalized email generation using LLMs with brand-aware tone and positioning', color: '#a855f7' },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Real-time dashboards with deliverability tracking, funnel analysis, and KPIs', color: '#f59e0b' },
  { icon: Shield, title: 'Reputation Management', description: 'Automated bounce handling, complaint detection, and sender reputation monitoring', color: '#22c55e' },
  { icon: Zap, title: 'Pipeline Automation', description: 'End-to-end pipeline from discovery to outreach with automated enrichment', color: '#3b82f6' },
  { icon: Mail, title: 'Multi-Channel', description: 'SMTP and Resend support with daily/hourly quota management and IMAP reply detection', color: '#8b5cf6' },
]

const metrics = [
  { label: 'Companies Discovered', value: '50K+' },
  { label: 'Emails Sent', value: '1M+' },
  { label: 'Avg. Reply Rate', value: '12%' },
  { label: 'Pipeline Lift', value: '3.2x' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-foreground">
                <Sparkles className="h-5 w-5 text-background" />
              </div>
              <span className="text-lg font-bold text-foreground">Outbound Engine</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.04),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex justify-center mb-8">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-2xl shadow-foreground/20">
                <Rocket className="h-8 w-8" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Automate Your Outbound{' '}
              <span className="bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                Sales Engine
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover companies, enrich contacts, generate personalized outreach, and manage your entire pipeline
              — powered by AI and built for scale.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-8 py-3.5 text-base font-semibold hover:opacity-90 shadow-lg shadow-foreground/10 transition-all"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm px-8 py-3.5 text-base font-semibold text-foreground hover:bg-accent transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics ── */}
      <section className="border-b border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-3xl font-extrabold text-foreground">{m.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Everything you need to scale outbound
            </h2>
            <p className="mt-4 text-muted-foreground">
              From discovery to delivery — a complete platform for your outbound sales operations.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-lg hover:border-border transition-all duration-300"
                >
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `${f.color}12` }}>
                    <Icon className="h-6 w-6" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden border-t border-border/50 py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Ready to transform your outbound?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Join teams using Outbound Engine to discover, engage, and close more deals.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-8 py-3.5 text-base font-semibold hover:opacity-90 shadow-lg shadow-foreground/10 transition-all"
              >
                <Sparkles className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Outbound Engine
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Outbound Engine. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
