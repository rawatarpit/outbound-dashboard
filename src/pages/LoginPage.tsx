import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Rocket, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  if (user) {
    navigate('/')
    return null
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent_60%)]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl shadow-primary/30">
              <Rocket className="h-10 w-10" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Outbound Engine</h1>
          <p className="mt-2 text-muted-foreground">Sign in to your dashboard</p>
        </div>

        <div className="rounded-2xl bg-card p-8 shadow-xl ring-1 ring-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" required>Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" required>Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account?</span>{' '}
            <Link to="/signup" className="font-semibold text-primary transition-colors hover:text-primary/80">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
