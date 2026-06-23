import '../lib/i18n'
import 'react-native-reanimated'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useEffect } from 'react'
import { router, Slot, SplashScreen } from 'expo-router'
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { StyleSheet } from 'react-native'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { setSession, setProfile, setStats, setLoading, isLoading } = useAuthStore()

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) setProfile(profile)

        const { data: stats } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', session.user.id)
          .single()
        if (stats) setStats(stats)
      }

      setLoading(false)
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(profile ?? null)

        const { data: stats } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', session.user.id)
          .single()
        setStats(stats ?? null)
      } else {
        setProfile(null)
        setStats(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!fontsLoaded || isLoading) return
    SplashScreen.hideAsync()
  }, [fontsLoaded, isLoading])

  if (!fontsLoaded || isLoading) return null

  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthGate />
    </GestureHandlerRootView>
  )
}

function AuthGate() {
  const { session, profile } = useAuthStore()

  useEffect(() => {
    if (!session) {
      router.replace('/(auth)/welcome')
    } else if (!profile?.onboarding_completed) {
      router.replace('/(onboarding)/profile')
    } else {
      router.replace('/(tabs)')
    }
  }, [session, profile])

  return <Slot />
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
