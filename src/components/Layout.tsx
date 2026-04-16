import { type ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { TooltipProvider } from './ui/Tooltip'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
