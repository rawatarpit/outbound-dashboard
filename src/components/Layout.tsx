import { type ReactNode } from 'react'
import TopNav from './TopNav'
import MobileNav from './MobileNav'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <TopNav />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
