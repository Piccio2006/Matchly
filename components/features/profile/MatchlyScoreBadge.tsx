import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Level } from '../../../types'
import { levelColors } from '../../../lib/theme'
import { radius, spacing, typography } from '../../../lib/theme'

interface MatchlyScoreBadgeProps {
  score: number
  level: Level
}

export function MatchlyScoreBadge({ score, level }: MatchlyScoreBadgeProps) {
  const color = levelColors[level] ?? '#CD7F32'
  const levelLabel = level.charAt(0).toUpperCase() + level.slice(1)

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <Text style={[styles.score, { color }]}>{score.toFixed(1)}</Text>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.level}>{levelLabel}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderRadius: radius.full,
    width: 96,
    height: 96,
    gap: spacing.xs,
  },
  score: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    lineHeight: 32,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  level: {
    ...typography.caption,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
  },
})
