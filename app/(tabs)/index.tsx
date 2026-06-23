import React, { useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
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
import { colors, spacing, typography, radius } from '../../lib/theme'

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

  return (
    <Animated.View style={[styles.skeletonCard, animStyle]} />
  )
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
  const firstName = profile?.full_name?.split(' ')[0]
  const greetingText = firstName
    ? `${getGreeting(t)}, ${firstName} 👋`
    : `${getGreeting(t)} 👋`

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greetingText}</Text>
            <View style={styles.cityRow}>
              <Text style={styles.cityDot}>●</Text>
              <Text style={styles.city}>{profile?.city ?? 'La tua città'}</Text>
            </View>
          </View>
          <Pressable style={styles.notifBtn}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.fields_nearby')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontal}>
          <View style={styles.skeletonRow}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{t('home.offers_today')}</Text>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>{t('home.coming_soon')}</Text>
          </View>
        </View>
        <SkeletonCard />
        <SkeletonCard />
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
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  skeletonCard: {
    width: 180,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  comingSoonBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  comingSoonText: { ...typography.caption, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
})
