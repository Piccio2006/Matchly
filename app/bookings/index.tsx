import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { sportEmoji, formatTime } from '../../lib/booking'
import { colors, radius, spacing, typography } from '../../lib/theme'
import { Booking, BookingStatus } from '../../types'

type BookingRow = Booking & { sports_fields?: { name: string; address: string } }

const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  confirmed: { bg: colors.primaryLight, text: colors.primary },
  completed: { bg: '#E6EFE0', text: colors.primaryDark },
  cancelled: { bg: '#F7E2DE', text: colors.error },
  no_show: { bg: '#F4E9CE', text: colors.warning },
}

export default function AllBookingsScreen() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { session } = useAuthStore()

  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const load = () => {
    if (!session?.user) { setLoading(false); return }
    supabase
      .from('bookings')
      .select('*, sports_fields(name, address)')
      .eq('user_id', session.user.id)
      .order('date', { ascending: false })
      .then(({ data }) => {
        setBookings((data as BookingRow[]) ?? [])
        setLoading(false)
      })
  }

  useEffect(load, [session?.user?.id])

  const handleCancel = (b: BookingRow) => {
    const dt = new Date(`${b.date}T${b.start_time}`)
    const hoursUntil = (dt.getTime() - Date.now()) / 3_600_000
    const isFree = hoursUntil > 2

    Alert.alert(
      'Annulla prenotazione',
      isFree
        ? 'Cancellazione gratuita. Sei sicuro di voler annullare?'
        : `Mancano meno di 2 ore all'inizio. La cancellazione potrebbe comportare una penale. Continuare?`,
      [
        { text: 'No, tienila', style: 'cancel' },
        {
          text: 'Sì, annulla',
          style: 'destructive',
          onPress: async () => {
            setCancelling(b.id)
            const { error } = await supabase
              .from('bookings')
              .update({ status: 'cancelled' })
              .eq('id', b.id)
              .eq('user_id', session!.user.id)
            setCancelling(null)
            if (!error) {
              setBookings((prev) =>
                prev.map((x) => x.id === b.id ? { ...x, status: 'cancelled' } : x)
              )
            }
          },
        },
      ]
    )
  }

  const upcoming = bookings.filter(
    (b) => new Date(`${b.date}T${b.start_time}`).getTime() > Date.now() && b.status !== 'cancelled'
  ).sort((a, b) => `${a.date}T${a.start_time}` < `${b.date}T${b.start_time}` ? -1 : 1)

  const past = bookings.filter(
    (b) => new Date(`${b.date}T${b.start_time}`).getTime() <= Date.now() || b.status === 'cancelled'
  )

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
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyText}>{t('booking.no_bookings')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {upcoming.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>In programma</Text>
              {upcoming.map((b) => renderCard(b))}
            </>
          )}
          {past.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, upcoming.length > 0 && { marginTop: spacing.lg }]}>
                Passate
              </Text>
              {past.map((b) => renderCard(b))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  )

  function renderCard(b: BookingRow) {
    const dt = new Date(`${b.date}T${b.start_time}`)
    const hoursUntil = (dt.getTime() - Date.now()) / 3_600_000
    const canCancel = hoursUntil > 0 && (b.status === 'confirmed')
    const statusColor = STATUS_COLORS[b.status] ?? { bg: colors.surface, text: colors.textSecondary }

    return (
      <View key={b.id} style={styles.card}>
        <View style={styles.cardMain}>
          <View style={styles.sportIcon}>
            <Text style={styles.sportEmoji}>{sportEmoji(b.sport)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.fieldName} numberOfLines={1}>
              {b.sports_fields?.name ?? b.booking_code}
            </Text>
            <Text style={styles.meta}>
              {new Date(b.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
              {' · '}{formatTime(b.start_time)}
            </Text>
            <Text style={styles.code}>#{b.booking_code}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.badgeText, { color: statusColor.text }]}>
              {t(`booking.status_${b.status}`)}
            </Text>
          </View>
        </View>

        {canCancel && (
          <Pressable
            style={styles.cancelBtn}
            disabled={cancelling === b.id}
            onPress={() => handleCancel(b)}
          >
            <Text style={styles.cancelText}>
              {cancelling === b.id ? 'Annullamento...' : '✕ Annulla prenotazione'}
            </Text>
          </Pressable>
        )}
        {b.status === 'completed' && (
          <Pressable
            style={styles.reviewBtn}
            onPress={() =>
              router.push({
                pathname: '/booking/review',
                params: {
                  bookingId: b.id,
                  fieldId: b.field_id,
                  fieldName: b.sports_fields?.name ?? '',
                },
              } as never)
            }
          >
            <Text style={styles.reviewText}>⭐ Recensisci il campo</Text>
          </Pressable>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  back: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.textPrimary },
  title: { ...typography.h2 },
  list: { padding: spacing.lg, paddingTop: 0, gap: spacing.sm, paddingBottom: 40 },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyText: { ...typography.bodySmall },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  sportIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportEmoji: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  fieldName: { ...typography.label, fontSize: 15 },
  meta: { ...typography.caption },
  code: { ...typography.caption, color: colors.textSecondary, fontFamily: 'Inter_600SemiBold' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  badgeText: { ...typography.caption, fontFamily: 'Inter_600SemiBold' },
  cancelBtn: {
    borderTopWidth: 1,
    borderTopColor: colors.error + '33',
    backgroundColor: colors.error + '0A',
    padding: spacing.sm,
    alignItems: 'center',
  },
  cancelText: { ...typography.bodySmall, color: colors.error, fontFamily: 'Inter_600SemiBold' },
  reviewBtn: {
    borderTopWidth: 1,
    borderTopColor: colors.primary + '33',
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    alignItems: 'center',
  },
  reviewText: { ...typography.bodySmall, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
})
