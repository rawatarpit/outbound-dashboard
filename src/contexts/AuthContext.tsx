import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, type Client, type ClientMember } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  client: Client | null
  member: ClientMember | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, companyName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshClient: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [member, setMember] = useState<ClientMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchClientAndMember = async (userId: string) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('client_members')
        .select('*, clients(*)')
        .eq('user_id', userId)
        .single()

      if (memberError) throw memberError

      setMember(memberData)
      setClient(memberData.clients || null)
    } catch (error) {
      console.error('Error fetching client:', error)
    }
  }

  const refreshClient = async () => {
    if (user) {
      await fetchClientAndMember(user.id)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchClientAndMember(session.user.id)
      }
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchClientAndMember(session.user.id)
        } else {
          setClient(null)
          setMember(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    toast.success('Signed in successfully')
  }

  const signUp = async (email: string, password: string, name: string, companyName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          company_name: companyName
        }
      }
    })
    if (error) throw error
    if (data.user) {
      toast.success('Account created! Please check your email to verify.')
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setClient(null)
    setMember(null)
    toast.success('Signed out successfully')
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
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
