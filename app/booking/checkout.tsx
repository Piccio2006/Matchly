import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import {
  computeSlotPrice,
  computeCommission,
  generateBookingCode,
  mockPayment,
  sportEmoji,
  formatTime,
} from '../../lib/booking'
import { useAuthStore } from '../../stores/authStore'
import { colors, radius, spacing, typography } from '../../lib/theme'
import { SportField, FieldSlot } from '../../types'

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{
    fieldId: string
    slotId: string
    date: string
    startTime: string
    endTime: string
  }>()
  const { t, i18n } = useTranslation()
  const insets = useSafeAreaInsets()
  const { session } = useAuthStore()

  const [field, setField] = useState<SportField | null>(null)
  const [slot, setSlot] = useState<FieldSlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [fieldRes, slotRes] = await Promise.all([
          supabase.from('sports_fields').select('*').eq('id', params.fieldId).single(),
          supabase.from('field_slots').select('*').eq('id', params.slotId).single(),
        ])
        setField((fieldRes.data as SportField) ?? null)
        setSlot((slotRes.data as FieldSlot) ?? null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.fieldId, params.slotId])

  if (loading || !field || !slot) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  const { basePrice, finalPrice, discountPercent } = computeSlotPrice(slot, field)
  const sport = field.sport_types[0]

  const dateLabel = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(params.date))

  const handlePay = async () => {
    if (!session?.user) {
      setError(t('booking.generic_error'))
      return
    }
    setError(null)
    setPaying(true)
    try {
      // 1. Mock pagamento (TODO: Stripe reale)
      const { paymentIntentId } = await mockPayment()

      // 2. Re-check disponibilità slot (race condition)
      const { data: fresh } = await supabase
        .from('field_slots')
        .select('is_available')
        .eq('id', slot.id)
        .single()
      if (!fresh || fresh.is_available === false) {
        setError(t('booking.slot_taken_error'))
        setPaying(false)
        return
      }

      // 3. Crea la prenotazione
      const commission = computeCommission(finalPrice)
      const code = generateBookingCode()
      const { data: booking, error: insErr } = await supabase
        .from('bookings')
        .insert({
          booking_code: code,
          field_id: field.id,
          user_id: session.user.id,
          slot_id: slot.id,
          sport,
          date: params.date,
          start_time: params.startTime,
          end_time: params.endTime,
          price_paid: finalPrice,
          commission_amount: commission,
          discount_applied: discountPercent,
          status: 'confirmed',
          payment_intent_id: paymentIntentId,
          payment_method: 'card',
        })
        .select('id')
        .single()
      if (insErr || !booking) throw insErr ?? new Error('insert failed')

      // 4. Marca lo slot come occupato
      await supabase.from('field_slots').update({ is_available: false }).eq('id', slot.id)

      // 5. Vai alla conferma
      router.replace({ pathname: '/booking/confirmation', params: { bookingId: booking.id } } as never)
    } catch {
      setError(t('booking.generic_error'))
      setPaying(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} disabled={paying}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={styles.title}>{t('booking.checkout_title')}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Row label={t('booking.title')} value={field.name} />
          <Row label="Sport" value={`${t(`sports.${sport}`)} ${sportEmoji(sport)}`} />
          <Row label={t('booking.select_date')} value={dateLabel} capitalize />
          <Row label="Orario" value={`${formatTime(params.startTime)} → ${formatTime(params.endTime)}`} />
          <Row
            label="Durata"
            value={t('booking.duration_minutes', { minutes: field.slot_duration_minutes })}
          />
        </View>

        <View style={styles.priceBlock}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t('booking.price_slot')}</Text>
            <Text style={styles.priceValue}>€{basePrice.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t('booking.discount', { percent: discountPercent })}</Text>
            <Text style={styles.priceValue}>-€{(basePrice - finalPrice).toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>{t('booking.total')}</Text>
            <Text style={styles.totalValue}>€{finalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Metodi di pagamento — solo carta attiva (mock). TODO: Stripe + wallet */}
        <View style={styles.payMethods}>
          <View style={[styles.payMethod, styles.payMethodActive]}>
            <Text style={styles.payMethodText}>💳 {t('booking.pay_card')}</Text>
          </View>
          <View style={[styles.payMethod, styles.payMethodDisabled]}>
            <Text style={styles.payMethodTextDisabled}>{t('booking.pay_wallet')}</Text>
          </View>
        </View>

        <Text style={styles.policy}>⚠️ {t('booking.cancel_policy')}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          label={paying ? t('booking.payment_loading') : t('booking.confirm_pay')}
          onPress={handlePay}
          loading={paying}
          fullWidth
        />
      </View>
    </View>
  )
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, capitalize && styles.capitalize]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, paddingBottom: 120, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  back: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.textPrimary },
  title: { ...typography.h2, flex: 1 },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  rowLabel: { ...typography.bodySmall },
  rowValue: { ...typography.label, flexShrink: 1, textAlign: 'right' },
  capitalize: { textTransform: 'capitalize' },
  priceBlock: { gap: spacing.sm },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { ...typography.body, color: colors.textSecondary },
  priceValue: { ...typography.body },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  totalLabel: { ...typography.h3 },
  totalValue: { ...typography.h3, color: colors.primary },
  payMethods: { gap: spacing.sm },
  payMethod: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payMethodActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  payMethodDisabled: { borderColor: colors.border, backgroundColor: colors.surface, opacity: 0.5 },
  payMethodText: { ...typography.label, color: colors.primary },
  payMethodTextDisabled: { ...typography.label, color: colors.textSecondary },
  policy: { ...typography.bodySmall, color: colors.textSecondary },
  error: { ...typography.bodySmall, color: colors.error, textAlign: 'center' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
})
