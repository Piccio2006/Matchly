import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
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
import { useUser } from '../../hooks/useUser'
import { supabase } from '../../lib/supabase'
import { FieldCard } from '../../components/features/booking/FieldCard'
import { sportEmoji, FIRENZE_CENTER } from '../../lib/booking'
import { colors, spacing, typography, radius } from '../../lib/theme'
import { SportField, FieldSlot } from '../../types'

type SlotWithField = FieldSlot & { sports_fields: SportField }

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

  return <Animated.View style={[styles.skeletonCard, animStyle]} />
}

function getGreeting(t: (key: string) => string) {
  const hour = new Date().getHours()
  if (hour < 12) return t('home.greeting_morning')
  if (hour < 18) return t('home.greeting_afternoon')
  return t('home.greeting_evening')
}

export default function HomeScreen() {
  const { t } = useTranslation()
  const { profile } = useUser()
  const insets = useSafeAreaInsets()

  const [fields, setFields] = useState<SportField[]>([])
  const [offers, setOffers] = useState<SlotWithField[]>([])
  const [loading, setLoading] = useState(true)

  const firstName = profile?.full_name?.split(' ')[0]
  const greetingText = firstName
    ? `${getGreeting(t)}, ${firstName} 👋`
    : `${getGreeting(t)} 👋`

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)

    const loadData = async () => {
      try {
        const [fieldsRes, offersRes] = await Promise.all([
          supabase
            .from('sports_fields')
            .select('*')
            .eq('is_active', true)
            .order('rating_avg', { ascending: false })
            .limit(6),
          supabase
            .from('field_slots')
            .select('*, sports_fields(*)')
            .eq('date', today)
            .gt('discount_percent', 0)
            .eq('is_available', true)
            .limit(5),
        ])
        setFields((fieldsRes.data as SportField[]) ?? [])
        setOffers((offersRes.data as SlotWithField[]) ?? [])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greetingText}</Text>
            <View style={styles.cityRow}>
              <Text style={styles.cityDot}>●</Text>
              <Text style={styles.city}>{profile?.city ?? 'Firenze'}</Text>
            </View>
          </View>
          <Pressable
            style={styles.notifBtn}
            onPress={() => router.push('/notifications' as never)}
          >
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </Pressable>
        </View>
      </View>

      {/* Campi vicino a te */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.fields_nearby')}</Text>
        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontal}>
            <View style={styles.skeletonRow}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          </ScrollView>
        ) : fields.length === 0 ? (
          <Text style={styles.emptyText}>{t('booking.no_results')}</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontal} contentContainerStyle={styles.horizontalContent}>
            {fields.map((field) => (
              <View key={field.id} style={styles.fieldCardWrap}>
                <FieldCard
                  field={field}
                  onPress={() => router.push({ pathname: '/field/[id]', params: { id: field.id } } as never)}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Offerte del giorno */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('home.offers_today')}</Text>
        </View>
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : offers.length === 0 ? (
          <View style={styles.emptyOffers}>
            <Text style={styles.emptyOffersEmoji}>🎯</Text>
            <Text style={styles.emptyOffersText}>Nessuna offerta per oggi</Text>
            <Text style={styles.emptyOffersSubtext}>Torna domani per nuove offerte last-minute!</Text>
          </View>
        ) : (
          <View style={styles.offerList}>
            {offers.map((slot) => (
              <Pressable
                key={slot.id}
                style={styles.offerCard}
                onPress={() =>
                  router.push({
                    pathname: '/field/[id]',
                    params: { id: slot.field_id },
                  } as never)
                }
              >
                <View style={styles.offerLeft}>
                  <Text style={styles.offerEmoji}>{sportEmoji(slot.sports_fields.sport_types[0])}</Text>
                </View>
                <View style={styles.offerInfo}>
                  <Text style={styles.offerName} numberOfLines={1}>{slot.sports_fields.name}</Text>
                  <Text style={styles.offerTime}>{slot.start_time.slice(0, 5)} · {slot.date}</Text>
                </View>
                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>-{slot.discount_percent}%</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 32, gap: spacing.lg },
  header: { gap: spacing.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { ...typography.h2, color: colors.textPrimary },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  cityDot: { color: colors.success, fontSize: 10 },
  city: { ...typography.bodySmall },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: { gap: spacing.sm },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { ...typography.h3 },
  horizontal: { marginHorizontal: -spacing.lg },
  horizontalContent: { paddingHorizontal: spacing.lg, gap: spacing.md },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  skeletonCard: {
    width: 220,
    height: 110,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  fieldCardWrap: { width: 280 },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary },
  emptyOffers: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  emptyOffersEmoji: { fontSize: 32 },
  emptyOffersText: { ...typography.label },
  emptyOffersSubtext: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.lg },
  offerList: { gap: spacing.sm },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  offerLeft: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerEmoji: { fontSize: 22 },
  offerInfo: { flex: 1 },
  offerName: { ...typography.label },
  offerTime: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  offerBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  offerBadgeText: { ...typography.caption, color: '#fff', fontFamily: 'Inter_600SemiBold' },
})
