import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  const { session, user, profile, isLoading, setSession, setProfile, setStats, reset } = useAuthStore()

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    reset()
  }, [reset])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) setProfile(profileData)

    const { data: statsData } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', user.id)
      .single()

    if (statsData) setStats(statsData)
  }, [user, setProfile, setStats])

  return {
    session,
    user,
    profile,
    isLoading,
    isAuthenticated: !!session,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    refreshProfile,
  }
}
