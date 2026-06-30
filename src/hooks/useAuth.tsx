import { useQueryClient } from '@tanstack/react-query'
import type { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getSupabaseClient, isSupabaseConfigured } from '../api/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  email: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isConfigured: boolean
  authModalOpen: boolean
  openAuthModal: () => void
  closeAuthModal: () => void
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured())
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setIsLoading(false)
      return
    }

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)

      if (event === 'SIGNED_IN') {
        setAuthModalOpen(false)
        if (nextSession?.user?.id) {
          void queryClient.invalidateQueries({ queryKey: ['syncUserId'] })
          void queryClient.invalidateQueries({
            queryKey: ['history', nextSession.user.id],
          })
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  const openAuthModal = useCallback(() => setAuthModalOpen(true), [])
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), [])

  const signInWithMagicLink = useCallback(async (email: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error('Supabase is not configured')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      email: session?.user?.email ?? null,
      isAuthenticated: Boolean(session),
      isLoading,
      isConfigured: isSupabaseConfigured(),
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      signInWithMagicLink,
      signOut,
    }),
    [
      session,
      isLoading,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      signInWithMagicLink,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
