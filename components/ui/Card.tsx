import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, radius, spacing } from '../../lib/theme'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  variant?: 'default' | 'dark'
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.card, variant === 'dark' && styles.dark, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dark: {
    backgroundColor: colors.darkSurface,
    borderColor: '#2E3822',
  },
})
