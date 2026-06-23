import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors, radius, spacing, typography } from '../../lib/theme'

interface BadgeProps {
  label: string
  color?: string
  textColor?: string
  style?: ViewStyle
}

export function Badge({ label, color = colors.primaryLight, textColor = colors.primary, style }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }, style]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
  },
})
