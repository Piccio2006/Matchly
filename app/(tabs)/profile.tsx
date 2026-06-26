import React, { useCallback, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar } from '../../components/ui/Avatar'
import { MatchlyScoreBadge } from '../../components/features/profile/MatchlyScoreBadge'
import { BookingItem } from '../../components/features/booking/BookingItem'
import { useUser } from '../../hooks/useUser'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { colors, spacing, typography, radius } from '../../lib/theme'
import { Booking, Level } from '../../types'

const STAT_KEYS = ['velocita', 'resistenza', 'tecnica', 'fisico', 'senso_del_gol', 'fairplay', 'leadership', 'carisma'] as const
const STAT_EMOJIS: Record<string, string> = {
  velocita: '⚡',
  resistenza: '🫀',
  tecnica: '🎯',
  fisico: '💪',
  senso_del_gol: '⚽',
  fairplay: '🤝',
  leadership: '👑',
  carisma: '✨',
}

export default function ProfileScreen() {
  const { t } = useTranslation()
  const { profile, stats } = useUser()
  const { signOut } = useAuth()
  const { session } = useAuthStore()
  const insets = useSafeAreaInsets()

  const [bookings, setBookings] = useState<(Booking & { sports_fields?: { name: string } })[]>([])

  // Ricarica le prenotazioni a ogni focus (es. dopo aver prenotato)
  useFocusEffect(
    useCallback(() => {
      if (!session?.user) return
      let active = true
      supabase
        .from('bookings')
        .select('*, sports_fields(name)')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .limit(3)
        .then(({ data }) => {
          if (active) setBookings((data as never) ?? [])
        })
      return () => {
        active = false
      }
    }, [session?.user?.id])
  )

  const attendance =
    stats && stats.total_matches > 0
      ? Math.round((stats.attended_matches / stats.total_matches) * 100)
      : 0

  const handleLogout = () => {
    Alert.alert(t('profile.logout'), t('profile.logout_confirm'), [
      { text: t('common.back'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: signOut },
    ])
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={80} />
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{profile?.full_name ?? '—'}</Text>
          <Text style={styles.username}>@{profile?.username ?? '—'}</Text>
          {profile?.city ? <Text style={styles.city}>📍 {profile.city}</Text> : null}
        </View>
      </View>

      <View style={styles.scoreSection}>
        <Text style={styles.sectionLabel}>{t('profile.my_score')}</Text>
        <View style={styles.scoreRow}>
          <MatchlyScoreBadge
            score={stats?.matchly_score ?? 5.0}
            level={(stats?.level ?? 'bronze') as Level}
          />
          <View style={styles.counters}>
            <View style={styles.counter}>
              <Text style={styles.counterValue}>{stats?.total_matches ?? 0}</Text>
              <Text style={styles.counterLabel}>{t('profile.matches_played')}</Text>
            </View>
            <View style={styles.counter}>
              <Text style={styles.counterValue}>{attendance}%</Text>
              <Text style={styles.counterLabel}>{t('profile.attendance')}</Text>
            </View>
          </View>
        </View>
      </View>

      {stats && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionLabel}>{t('profile.my_stats')}</Text>
          <View style={styles.statBars}>
            {STAT_KEYS.map((key) => {
              const val = stats[key] as number
              const pct = (val / 10) * 100
              return (
                <View key={key} style={styles.statRow}>
                  <Text style={styles.statLabel}>{STAT_EMOJIS[key]} {t(`stats.${key}`)}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.statValue}>{val.toFixed(1)}</Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      <View style={styles.bookingsSection}>
        <View style={styles.bookingsHeader}>
          <Text style={styles.sectionLabel}>{t('booking.my_bookings')}</Text>
          {bookings.length > 0 ? (
            <Pressable onPress={() => router.push('/bookings' as never)}>
              <Text style={styles.seeAll}>{t('booking.see_all')}</Text>
            </Pressable>
          ) : null}
        </View>
        {bookings.length > 0 ? (
          <View style={styles.bookingsList}>
            {bookings.map((b) => (
              <BookingItem key={b.id} booking={b} />
            ))}
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{t('booking.no_bookings')}</Text>
          </View>
        )}
      </View>

      <View style={styles.menuSection}>
        <Pressable style={styles.menuItem} onPress={() => router.push('/leaderboard' as never)}>
          <Text style={styles.menuIcon}>🏆</Text>
          <Text style={styles.menuLabel}>Classifica giocatori</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => router.push('/match-history' as never)}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuLabel}>{t('profile.match_history')}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable style={styles.menuItem} onPress={() => router.push('/settings' as never)}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuLabel}>{t('profile.settings')}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuLabel, styles.logoutLabel]}>{t('profile.logout')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 48, gap: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nameBlock: { flex: 1, gap: 2 },
  name: { ...typography.h2 },
  username: { ...typography.bodySmall, color: colors.textSecondary },
  city: { ...typography.bodySmall, color: colors.primary, marginTop: spacing.xs },
  scoreSection: { gap: spacing.sm },
  sectionLabel: { ...typography.label },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  counters: { flex: 1, gap: spacing.md },
  counter: { gap: 2 },
  counterValue: { fontFamily: 'Inter_700Bold', fontSize: 24, color: colors.textPrimary },
  counterLabel: { ...typography.caption },
  statsSection: { gap: spacing.sm },
  statBars: { gap: spacing.sm },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statLabel: { ...typography.bodySmall, width: 110 },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  statValue: { ...typography.label, color: colors.primary, width: 28, textAlign: 'right' },
  bookingsSection: { gap: spacing.sm },
  bookingsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { ...typography.label, color: colors.primary, fontSize: 13 },
  bookingsList: { gap: spacing.sm },
  placeholder: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  placeholderText: { ...typography.bodySmall },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { ...typography.body, flex: 1 },
  chevron: { ...typography.h3, color: colors.textSecondary },
  logoutItem: { borderBottomWidth: 0 },
  logoutLabel: { color: colors.error },
})
