import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'
import { colors, spacing, typography, radius } from '../lib/theme'
import { Avatar } from '../components/ui/Avatar'
import { Level } from '../types'

type LeaderEntry = {
  player_id: string
  matchly_score: number
  total_matches: number
  level: Level
  profiles: { full_name: string; avatar_url: string | null; username: string | null } | null
}

const LEVEL_EMOJI: Record<Level, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  elite: '👑',
}

const RANK_COLORS = ['#F5A623', '#9B9B9B', '#CD7F32']

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets()
  const [entries, setEntries] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('player_stats')
      .select('player_id, matchly_score, total_matches, level, profiles(full_name, avatar_url, username)')
      .order('matchly_score', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setEntries((data as LeaderEntry[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>🏆 Classifica</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🏆</Text>
          <Text style={styles.emptyTitle}>Nessun giocatore ancora</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {entries.map((entry, idx) => {
            const rank = idx + 1
            const name = entry.profiles?.full_name ?? 'Giocatore'
            const username = entry.profiles?.username ? `@${entry.profiles.username}` : ''
            const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : colors.textSecondary

            return (
              <View key={entry.player_id} style={[styles.row, rank <= 3 && styles.rowTop]}>
                <Text style={[styles.rank, { color: rankColor }]}>
                  {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
                </Text>
                <Avatar uri={entry.profiles?.avatar_url} name={name} size={40} />
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>{name}</Text>
                  {username ? <Text style={styles.username}>{username}</Text> : null}
                </View>
                <View style={styles.scoreWrap}>
                  <Text style={styles.levelEmoji}>{LEVEL_EMOJI[entry.level]}</Text>
                  <Text style={styles.score}>{entry.matchly_score.toFixed(1)}</Text>
                  <Text style={styles.matches}>{entry.total_matches} partite</Text>
                </View>
              </View>
            )
          })}
        </ScrollView>
      )}
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
  empty: { alignItems: 'center', marginTop: spacing.xl * 2, gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h3 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rowTop: { borderColor: colors.primary + '40', backgroundColor: colors.primaryLight },
  rank: { width: 32, textAlign: 'center', fontSize: 18, fontFamily: 'Inter_700Bold' },
  info: { flex: 1 },
  name: { ...typography.label },
  username: { ...typography.caption, color: colors.textSecondary },
  scoreWrap: { alignItems: 'flex-end', gap: 2 },
  levelEmoji: { fontSize: 16 },
  score: { fontFamily: 'Inter_700Bold', fontSize: 18, color: colors.primary },
  matches: { ...typography.caption, color: colors.textSecondary },
})
