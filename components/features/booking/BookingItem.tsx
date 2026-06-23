import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { sportEmoji, formatTime } from '../../../lib/booking'
import { colors, radius, spacing, typography } from '../../../lib/theme'
import { Booking, BookingStatus } from '../../../types'

const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  confirmed: { bg: colors.primaryLight, text: colors.primary },
  completed: { bg: '#E6EFE0', text: colors.primaryDark },
  cancelled: { bg: '#F7E2DE', text: colors.error },
  no_show: { bg: '#F4E9CE', text: colors.warning },
}

export function BookingItem({ booking }: { booking: Booking & { sports_fields?: { name: string } } }) {
  const { t, i18n } = useTranslation()
  const statusColor = STATUS_COLORS[booking.status]
  const dateLabel = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'it-IT', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(booking.date))

  return (
    <View style={styles.item}>
      <View style={styles.sportIcon}>
        <Text style={styles.sportEmoji}>{sportEmoji(booking.sport)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.fieldName} numberOfLines={1}>
          {booking.sports_fields?.name ?? booking.booking_code}
        </Text>
        <Text style={styles.meta}>
          {dateLabel} · {formatTime(booking.start_time)}–{formatTime(booking.end_time)}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: statusColor.bg }]}>
        <Text style={[styles.badgeText, { color: statusColor.text }]}>
          {t(`booking.status_${booking.status}`)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
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
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  badgeText: { ...typography.caption, fontFamily: 'Inter_600SemiBold' },
})
