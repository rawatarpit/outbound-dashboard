import { type ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_40%_40%_at_100%_80%,rgba(139,92,246,0.06),transparent)] pointer-events-none" />
      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-primary/20 via-violet-500/20 to-transparent" />
        <Sidebar />
      </div>
      <div className="relative flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
