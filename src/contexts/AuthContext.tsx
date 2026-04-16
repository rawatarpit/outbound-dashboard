import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Client, ClientMember } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  clientId: string
  clientName: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  client: Client | null
  member: ClientMember | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, companyName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshClient: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [member, setMember] = useState<ClientMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchClientAndMember = async (userId: string, clientId: string, storedToken: string) => {
    try {
      const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${storedToken}`,
        'Content-Type': 'application/json',
      }

      const [memberRes, clientRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/client_members?user_id=eq.${userId}&client_id=eq.${clientId}&limit=1`, { headers }),
        fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${clientId}`, { headers })
      ])

      const memberData = await memberRes.json()
      if (memberData?.[0]) {
        setMember(memberData[0])
      }

      const clientData = await clientRes.json()
      if (clientData?.[0]) {
        setClient(clientData[0])
      }
    } catch (error) {
      console.error('Error fetching client:', error)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('outbound_token')
    const storedUser = localStorage.getItem('outbound_user')

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
        fetchClientAndMember(parsedUser.id, parsedUser.clientId, storedToken)
      } catch {
        localStorage.removeItem('outbound_token')
        localStorage.removeItem('outbound_user')
      }
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Login failed')
    }

    console.log('Login response:', data)

    const { token: newToken, user: newUser } = data

    localStorage.setItem('outbound_token', newToken)
    localStorage.setItem('outbound_user', JSON.stringify(newUser))

    setToken(newToken)
    setUser(newUser)
    
    if (newUser.clientId) {
      await fetchClientAndMember(newUser.id, newUser.clientId, newToken)
    }
    
    toast.success('Signed in successfully')
  }

  const signUp = async (email: string, password: string, name: string, companyName: string) => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ email, password, name, company: companyName }),
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Signup failed')
    }

    toast.success('Account created! Please sign in.')
  }

  const signOut = async () => {
    localStorage.removeItem('outbound_token')
    localStorage.removeItem('outbound_user')
    setToken(null)
    setUser(null)
    setClient(null)
    setMember(null)
    toast.success('Signed out successfully')
  }

  const refreshClient = async () => {
    if (token && user?.id && user?.clientId) {
      await fetchClientAndMember(user.id, user.clientId, token)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      client,
      member,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshClient
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
