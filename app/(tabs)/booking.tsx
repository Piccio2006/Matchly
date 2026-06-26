import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { FieldCard } from '../../components/features/booking/FieldCard'
import { supabase } from '../../lib/supabase'
import { approxDistanceKm, computeSlotPrice, FIRENZE_CENTER } from '../../lib/booking'
import { colors, radius, spacing, typography } from '../../lib/theme'
import { SportField, SportType } from '../../types'

const SPORT_FILTERS: (SportType | 'all')[] = ['all', 'calcetto', 'padel', 'tennis', 'calciotto']
const PRICE_OPTIONS: Array<number | null> = [null, 60, 35, 25] // null = tutti i prezzi

function SkeletonCard() {
  const opacity = useSharedValue(0.4)
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.4, { duration: 700 })),
      -1,
      false
    )
  }, [])
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return <Animated.View style={[styles.skeleton, animStyle]} />
}

export default function BookingScreen() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  const [fields, setFields] = useState<SportField[]>([])
  const [offerFieldIds, setOfferFieldIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [sport, setSport] = useState<SportType | 'all'>('all')
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [onlyOffers, setOnlyOffers] = useState(false)

  // Determina quali campi hanno almeno uno slot scontato disponibile oggi.
  const loadOffers = async (list: SportField[]) => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const { data } = await supabase
        .from('field_slots')
        .select('field_id, discount_percent, discount_expires_at, is_available, price_override')
        .eq('date', today)
        .eq('is_available', true)
        .gt('discount_percent', 0)
      const ids = new Set<string>()
      for (const s of data ?? []) {
        const field = list.find((f) => f.id === s.field_id)
        if (!field) continue
        const { discountPercent } = computeSlotPrice(s as never, field)
        if (discountPercent > 0) ids.add(s.field_id as string)
      }
      setOfferFieldIds(ids)
    } catch {
      setOfferFieldIds(new Set())
    }
  }

  const loadFields = async () => {
    try {
      const { data, error } = await supabase
        .from('sports_fields')
        .select('*')
        .eq('is_active', true)
        .eq('city', 'Firenze')
      if (error) throw error
      const list = (data ?? []) as SportField[]
      setFields(list)
      await loadOffers(list)
    } catch {
      setFields([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadFields()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return fields
      .filter((f) => (sport === 'all' ? true : f.sport_types.includes(sport)))
      .filter((f) => maxPrice === null || f.price_per_slot <= maxPrice)
      .filter((f) => !onlyOffers || offerFieldIds.has(f.id))
      .filter((f) =>
        q ? f.name.toLowerCase().includes(q) || f.address.toLowerCase().includes(q) : true
      )
      .sort((a, b) => {
        if (b.rating_avg !== a.rating_avg) return b.rating_avg - a.rating_avg
        const da =
          approxDistanceKm(FIRENZE_CENTER.latitude, FIRENZE_CENTER.longitude, a.latitude, a.longitude) ?? 999
        const db =
          approxDistanceKm(FIRENZE_CENTER.latitude, FIRENZE_CENTER.longitude, b.latitude, b.longitude) ?? 999
        return da - db
      })
  }, [fields, search, sport, maxPrice, onlyOffers, offerFieldIds])

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true)
            loadFields()
          }}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={styles.title}>{t('booking.title')}</Text>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('booking.search_placeholder')}
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        {SPORT_FILTERS.map((s) => {
          const active = sport === s
          return (
            <Pressable key={s} onPress={() => setSport(s)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t(`booking.filter_${s === 'all' ? 'all' : s}`)}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        {PRICE_OPTIONS.map((p) => {
          const active = maxPrice === p
          return (
            <Pressable key={p ?? 'all'} onPress={() => setMaxPrice(p)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {p === null ? 'Tutti i prezzi' : `≤ €${p}`}
              </Text>
            </Pressable>
          )
        })}
        <Pressable onPress={() => setOnlyOffers((v) => !v)} style={[styles.chip, onlyOffers && styles.chipOffer]}>
          <Text style={[styles.chipText, onlyOffers && styles.chipTextActive]}>🏷️ Solo offerte</Text>
        </Pressable>
      </ScrollView>

      {loading ? (
        <View style={styles.list}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <>
          <Text style={styles.results}>
            {filtered.length > 0
              ? t('booking.results', { count: filtered.length })
              : t('booking.no_results')}
          </Text>
          <View style={styles.list}>
            {filtered.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                hasOffer={offerFieldIds.has(field.id)}
                onPress={() => router.push(`/field/${field.id}` as never)}
              />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 32, gap: spacing.md },
  title: { ...typography.h2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },
  chipsRow: { marginHorizontal: -spacing.lg },
  chipsContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipOffer: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.bodySmall, color: colors.textPrimary, fontFamily: 'Inter_600SemiBold' },
  chipTextActive: { color: '#fff' },
  results: { ...typography.label, color: colors.textSecondary, marginTop: spacing.xs },
  list: { gap: spacing.md },
  skeleton: { height: 110, borderRadius: radius.lg, backgroundColor: colors.border },
})
