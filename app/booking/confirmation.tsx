import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Share, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { sportEmoji, formatTime } from '../../lib/booking'
import { springs, colors, radius, spacing, typography } from '../../lib/theme'
import { Booking } from '../../types'

function CodeDigit({ char, index }: { char: string; index: number }) {
  const scale = useSharedValue(0)
  const opacity = useSharedValue(0)
  useEffect(() => {
    scale.value = withDelay(index * 80, withSpring(1, springs.bouncy))
    opacity.value = withDelay(index * 80, withTiming(1, { duration: 200 }))
  }, [])
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }))
  return (
    <Animated.View style={style}>
      <Text style={styles.codeChar}>{char}</Text>
    </Animated.View>
  )
}

export default function ConfirmationScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>()
  const { t, i18n } = useTranslation()
  const insets = useSafeAreaInsets()

  const [booking, setBooking] = useState<(Booking & { sports_fields?: { name: string } }) | null>(null)
  const [loading, setLoading] = useState(true)

  const checkScale = useSharedValue(0)
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }))

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('bookings')
          .select('*, sports_fields(name, address)')
          .eq('id', bookingId)
          .single()
        setBooking(data as never)
      } finally {
        setLoading(false)
        checkScale.value = withSpring(1, springs.bouncy)
      }
    }
    load()
  }, [bookingId])

  if (loading || !booking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  const fieldName = booking.sports_fields?.name ?? ''
  const dateLabel = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(booking.date))

  const onShare = async () => {
    try {
      await Share.share({
        message: t('booking.share_message', {
          field: fieldName,
          date: dateLabel,
          time: formatTime(booking.start_time),
          code: booking.booking_code,
        }),
      })
    } catch {
      // utente ha annullato
    }
  }

  const onAddCalendar = () => {
    // TODO(Codex): integrare expo-calendar per creare l'evento reale.
    Alert.alert('Matchly', t('booking.add_calendar') + ' — coming soon')
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.checkCircle, checkStyle]}>
        <Text style={styles.check}>✓</Text>
      </Animated.View>

      <Text style={styles.title}>{t('booking.confirmed_title')}</Text>
      <Text style={styles.subtitle}>{t('booking.confirmed_subtitle')}</Text>

      <View style={styles.codeCard}>
        <View style={styles.codeRow}>
          {booking.booking_code.split('').map((c, i) => (
            <CodeDigit key={i} char={c} index={i} />
          ))}
        </View>
        {/* QR placeholder — TODO(Codex): react-native-qrcode-svg con booking_code */}
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrText}>QR</Text>
          <Text style={styles.qrCode}>{booking.booking_code}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailLine}>📍 {fieldName}</Text>
        <Text style={[styles.detailLine, styles.capitalize]}>📅 {dateLabel}</Text>
        <Text style={styles.detailLine}>
          ⏰ {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
        </Text>
        <Text style={styles.detailLine}>
          {sportEmoji(booking.sport)} {t(`sports.${booking.sport}`)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryBtn} onPress={onAddCalendar}>
          <Text style={styles.secondaryBtnText}>📅 {t('booking.add_calendar')}</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={onShare}>
          <Text style={styles.secondaryBtnText}>📤 {t('booking.share')}</Text>
        </Pressable>
      </View>

      <Button label={t('booking.back_home')} onPress={() => router.replace('/(tabs)')} fullWidth />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40, alignItems: 'center', gap: spacing.md },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: '#fff', fontSize: 48, fontFamily: 'Inter_700Bold' },
  title: { ...typography.h1, textAlign: 'center' },
  subtitle: { ...typography.bodySmall, textAlign: 'center' },
  codeCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  codeRow: { flexDirection: 'row', gap: 2 },
  codeChar: { fontSize: 32, fontFamily: 'Inter_700Bold', color: colors.primaryDark, letterSpacing: 2 },
  qrPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  qrText: { fontSize: 40, fontFamily: 'Inter_700Bold', color: colors.primary },
  qrCode: { ...typography.caption, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
  details: { width: '100%', gap: spacing.sm, marginTop: spacing.sm },
  detailLine: { ...typography.body },
  capitalize: { textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: spacing.md, width: '100%', marginTop: spacing.sm },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  secondaryBtnText: { ...typography.label, color: colors.textPrimary, fontSize: 13 },
})
