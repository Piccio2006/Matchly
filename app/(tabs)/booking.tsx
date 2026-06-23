import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, spacing, typography } from '../../lib/theme'

export default function BookingScreen() {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📅</Text>
      <Text style={styles.title}>{t('booking.title')}</Text>
      <Text style={styles.badge}>{t('booking.coming_soon')}</Text>
      <Text style={styles.subtitle}>{t('booking.subtitle')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  icon: { fontSize: 64 },
  title: { ...typography.h2, textAlign: 'center' },
  badge: {
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 99,
    overflow: 'hidden',
  },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
})
