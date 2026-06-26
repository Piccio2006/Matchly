import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, typography, radius } from '../lib/theme'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { Booking } from '../types'

type BookingWithField = Booking & { sports_fields?: { name: string; address: string } }

export default function MatchHistoryScreen() {
  const insets = useSafeAreaInsets()
  const { session } = useAuthStore()
  const [bookings, setBookings] = useState<BookingWithField[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) { setLoading(false); return }
    supabase
      .from('bookings')
      .select('*, sports_fields(name, address)')
      .eq('user_id', session.user.id)
      .in('status', ['completed', 'no_show'])
      .order('date', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setBookings((data as BookingWithField[]) ?? [])
        setLoading(false)
      })
  }, [session?.user?.id])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Storico partite</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.msg}>Caricamento...</Text>
        ) : bookings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>Nessuna partita giocata</Text>
            <Text style={styles.emptySubtitle}>Le partite completate appariranno qui</Text>
          </View>
        ) : (
          bookings.map((b) => (
            <View key={b.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardField}>{b.sports_fields?.name ?? 'Campo'}</Text>
                <Text style={styles.cardDate}>
                  {new Date(b.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}{b.start_time.slice(0, 5)}
                </Text>
              </View>
              <View style={[styles.statusBadge, b.status === 'no_show' && styles.statusBadgeNoShow]}>
                <Text style={styles.statusText}>
                  {b.status === 'completed' ? 'Completata' : 'No show'}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  backText: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.textPrimary },
  title: { ...typography.h2 },
  list: { padding: spacing.lg, gap: spacing.sm, paddingBottom: 40 },
  msg: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  empty: { alignItems: 'center', marginTop: spacing.xl * 2, gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h3 },
  emptySubtitle: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardLeft: { flex: 1 },
  cardField: { ...typography.label },
  cardDate: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  statusBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusBadgeNoShow: { backgroundColor: colors.border },
  statusText: { ...typography.caption, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
})
