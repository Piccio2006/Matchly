import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import { Profile, PlayerStats } from '../types'

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  stats: PlayerStats | null
  isLoading: boolean
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  setStats: (stats: PlayerStats | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  stats: null,
  isLoading: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ session: null, user: null, profile: null, stats: null, isLoading: false }),
}))
