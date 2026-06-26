import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { computeSlotPrice, sportEmoji, formatTime } from '../../lib/booking'
import { colors, radius, spacing, typography } from '../../lib/theme'
import { SportField, FieldSlot, FieldReview } from '../../types'

const AMENITY_EMOJI: Record<string, string> = {
  spogliatoi: '🚪',
  docce: '🚿',
  parcheggio: '🅿️',
  bar: '🍺',
  'noleggio racchette': '🎾',
  'illuminazione LED': '💡',
}

// Genera i prossimi 7 giorni come { iso, label }
function nextDays(count: number) {
  const days = []
  const fmt = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric' })
  for (let i = 0; i < count; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({ iso: d.toISOString().slice(0, 10), label: fmt.format(d) })
  }
  return days
}

export default function FieldDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  const [field, setField] = useState<SportField | null>(null)
  const [slots, setSlots] = useState<FieldSlot[]>([])
  const [reviews, setReviews] = useState<FieldReview[]>([])
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)

  const days = useMemo(() => nextDays(7), [])
  const [selectedDate, setSelectedDate] = useState(days[0].iso)

  useEffect(() => {
    const load = async () => {
      try {
        const [fieldRes, reviewsRes] = await Promise.all([
          supabase.from('sports_fields').select('*').eq('id', id).single(),
          supabase.from('field_reviews').select('*').eq('field_id', id).order('created_at', { ascending: false }).limit(10),
        ])
        setField((fieldRes.data as SportField) ?? null)
        setReviews((reviewsRes.data as FieldReview[]) ?? [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!id) return
    const loadSlots = async () => {
      setSlotsLoading(true)
      try {
        const { data } = await supabase
          .from('field_slots')
          .select('*')
          .eq('field_id', id)
          .eq('date', selectedDate)
          .order('start_time')
        setSlots((data as FieldSlot[]) ?? [])
      } catch {
        setSlots([])
      } finally {
        setSlotsLoading(false)
      }
    }
    loadSlots()
  }, [id, selectedDate])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  if (!field) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={typography.body}>{t('booking.no_results')}</Text>
        <Pressable onPress={() => router.back()} style={styles.backInline}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </Pressable>
      </View>
    )
  }

  const mainSport = field.sport_types[0]

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hero / gallery */}
      <View style={styles.hero}>
        {field.photos?.length ? (
          <Image source={{ uri: field.photos[0] }} style={styles.heroImg} resizeMode="cover" />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroEmoji}>{sportEmoji(mainSport)}</Text>
          </View>
        )}
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + spacing.sm }]}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{field.name}</Text>
          <Text style={styles.rating}>⭐ {field.rating_avg.toFixed(1)}</Text>
        </View>
        <Text style={styles.address}>📍 {field.address}</Text>
        <View style={styles.tagRow}>
          {field.sport_types.map((s) => (
            <Text key={s} style={styles.tag}>
              {sportEmoji(s)} {t(`sports.${s}`)}
            </Text>
          ))}
          {field.surface_type ? <Text style={styles.tag}>🌱 {field.surface_type}</Text> : null}
        </View>

        {field.amenities?.length ? (
          <View style={styles.amenities}>
            {field.amenities.map((a) => (
              <View key={a} style={styles.amenityChip}>
                <Text style={styles.amenityText}>
                  {AMENITY_EMOJI[a] ?? '✓'} {a}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Date strip */}
        <Text style={styles.sectionTitle}>{t('booking.select_date')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateStrip}
          contentContainerStyle={styles.dateStripContent}
        >
          {days.map((d) => {
            const active = selectedDate === d.iso
            return (
              <Pressable
                key={d.iso}
                onPress={() => setSelectedDate(d.iso)}
                style={[styles.dateChip, active && styles.dateChipActive]}
              >
                <Text style={[styles.dateChipText, active && styles.dateChipTextActive]}>{d.label}</Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {/* Slots */}
        {slotsLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
        ) : slots.length === 0 ? (
          <Text style={styles.empty}>{t('booking.no_slots')}</Text>
        ) : (
          <View style={styles.slotList}>
            {slots.map((slot) => {
              const { basePrice, finalPrice, discountPercent } = computeSlotPrice(slot, field)
              const taken = !slot.is_available
              return (
                <View key={slot.id} style={[styles.slotRow, taken && styles.slotRowTaken]}>
                  <Text style={styles.slotTime}>{formatTime(slot.start_time)}</Text>
                  <View style={styles.slotPriceWrap}>
                    {discountPercent > 0 ? (
                      <>
                        <Text style={styles.slotPriceStrike}>€{basePrice.toFixed(0)}</Text>
                        <Text style={styles.slotPriceFinal}>€{finalPrice.toFixed(0)}</Text>
                      </>
                    ) : (
                      <Text style={styles.slotPriceFinal}>€{finalPrice.toFixed(0)}</Text>
                    )}
                  </View>
                  {taken ? (
                    <Text style={styles.slotTaken}>{t('booking.slot_taken')}</Text>
                  ) : (
                    <Pressable
                      style={styles.bookBtn}
                      onPress={() =>
                        router.push({
                          pathname: '/booking/checkout',
                          params: {
                            fieldId: field.id,
                            slotId: slot.id,
                            date: slot.date,
                            startTime: slot.start_time,
                            endTime: slot.end_time,
                          },
                        } as never)
                      }
                    >
                      <Text style={styles.bookBtnText}>{t('booking.book_slot')}</Text>
                    </Pressable>
                  )}
                </View>
              )
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>{t('booking.reviews_count', { count: field.rating_count })}</Text>
        {reviews.length === 0 ? (
          <Text style={styles.empty}>{t('booking.no_slots').replace('slot', 'recensioni')}</Text>
        ) : (
          reviews.map((review) => {
            const avg = ((review.rating_surface + review.rating_facilities + review.rating_structure + review.rating_value) / 4).toFixed(1)
            return (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewStars}>{'⭐'.repeat(Math.round(parseFloat(avg)))}</Text>
                  <Text style={styles.reviewScore}>{avg}</Text>
                </View>
                {review.comment ? (
                  <Text style={styles.reviewText}>"{review.comment}"</Text>
                ) : null}
                <Text style={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
            )
          })
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  backInline: { padding: spacing.md },
  backText: { ...typography.label, color: colors.primary },
  hero: { height: 240, backgroundColor: colors.primaryLight },
  heroImg: { width: '100%', height: '100%' },
  heroPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  heroEmoji: { fontSize: 80 },
  backBtn: {
    position: 'absolute',
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold' },
  body: { padding: spacing.lg, gap: spacing.sm },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...typography.h2, flex: 1 },
  rating: { ...typography.label, color: colors.textPrimary },
  address: { ...typography.bodySmall },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  tag: { ...typography.bodySmall, color: colors.textPrimary },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  amenityChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  amenityText: { ...typography.caption, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
  sectionTitle: { ...typography.h3, marginTop: spacing.lg },
  dateStrip: { marginHorizontal: -spacing.lg },
  dateStripContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  dateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateChipText: { ...typography.bodySmall, color: colors.textPrimary, fontFamily: 'Inter_600SemiBold', textTransform: 'capitalize' },
  dateChipTextActive: { color: '#fff' },
  empty: { ...typography.bodySmall, marginTop: spacing.md },
  slotList: { gap: spacing.sm, marginTop: spacing.sm },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  slotRowTaken: { opacity: 0.5 },
  slotTime: { ...typography.label, fontSize: 16, width: 56 },
  slotPriceWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  slotPriceStrike: { ...typography.bodySmall, textDecorationLine: 'line-through', color: colors.textSecondary },
  slotPriceFinal: { ...typography.label, color: colors.primary },
  slotTaken: { ...typography.bodySmall, color: colors.textSecondary },
  bookBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  bookBtnText: { ...typography.label, color: '#fff', fontSize: 14 },
  reviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reviewStars: { fontSize: 14, flex: 1 },
  reviewScore: { ...typography.label, color: colors.primary },
  reviewText: { ...typography.bodySmall, fontStyle: 'italic' },
  reviewDate: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
})
