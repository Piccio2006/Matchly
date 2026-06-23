import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { BookingItem } from '../../components/features/booking/BookingItem'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { colors, spacing, typography } from '../../lib/theme'
import { Booking } from '../../types'

export default function AllBookingsScreen() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { session } = useAuthStore()

  const [bookings, setBookings] = useState<(Booking & { sports_fields?: { name: string } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) {
      setLoading(false)
      return
    }
    supabase
      .from('bookings')
      .select('*, sports_fields(name)')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
      .then(({ data }) => {
        setBookings((data as never) ?? [])
        setLoading(false)
      })
  }, [session?.user?.id])

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Text style={styles.title}>{t('booking.all_bookings_title')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : bookings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('booking.no_bookings')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {bookings.map((b) => (
            <BookingItem key={b.id} booking={b} />
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  back: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.textPrimary },
  title: { ...typography.h2 },
  list: { padding: spacing.lg, paddingTop: 0, gap: spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { ...typography.bodySmall },
})
