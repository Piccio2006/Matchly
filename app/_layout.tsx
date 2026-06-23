import '../lib/i18n'
import 'react-native-reanimated'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useEffect } from 'react'
import { router, Stack, SplashScreen, useSegments } from 'expo-router'
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { Platform, StyleSheet } from 'react-native'

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => null)
}

export default function RootLayout() {
  const { setSession, setProfile, setStats, setLoading, isLoading } = useAuthStore()

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  useEffect(() => {
    const loadSession = async () => {
      try {
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
      } catch {
        // Supabase unreachable (e.g. no credentials configured) — treat as logged out
      } finally {
        setLoading(false)
      }
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
    if ((!fontsLoaded && !fontError) || isLoading) return
    if (Platform.OS !== 'web') {
      SplashScreen.hideAsync().catch(() => null)
    }
  }, [fontsLoaded, fontError, isLoading])

  if ((!fontsLoaded && !fontError) || isLoading) return null

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthGate />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

function AuthGate() {
  const { session, profile } = useAuthStore()
  const segments = useSegments()
  const activeGroup = segments[0]

  useEffect(() => {
    const inAuthGroup = activeGroup === '(auth)'
    const inOnboardingGroup = activeGroup === '(onboarding)'

    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/welcome')
      return
    }

    if (!profile?.onboarding_completed) {
      if (!inOnboardingGroup) router.replace('/(onboarding)/profile')
      return
    }

    if (inAuthGroup || inOnboardingGroup || !activeGroup) {
      router.replace('/(tabs)')
    }
  }, [session, profile?.onboarding_completed, activeGroup])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="field/[id]" />
      <Stack.Screen name="booking/checkout" />
      <Stack.Screen name="booking/confirmation" />
      <Stack.Screen name="bookings/index" />
    </Stack>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
