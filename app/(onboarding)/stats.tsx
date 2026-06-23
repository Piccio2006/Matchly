import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StatSlider } from '../../components/ui/StatSlider'
import { Button } from '../../components/ui/Button'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { colors, spacing, typography } from '../../lib/theme'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { StatKey } from '../../types'

const STATS: StatKey[] = [
  { key: 'velocita', labelIt: 'Velocità', labelEn: 'Speed', emoji: '⚡' },
  { key: 'resistenza', labelIt: 'Resistenza', labelEn: 'Stamina', emoji: '🫀' },
  { key: 'tecnica', labelIt: 'Tecnica', labelEn: 'Technique', emoji: '🎯' },
  { key: 'fisico', labelIt: 'Fisico', labelEn: 'Physicality', emoji: '💪' },
  { key: 'senso_del_gol', labelIt: 'Senso del gol', labelEn: 'Finishing', emoji: '⚽' },
  { key: 'fairplay', labelIt: 'Fairplay', labelEn: 'Fair Play', emoji: '🤝' },
  { key: 'leadership', labelIt: 'Leadership', labelEn: 'Leadership', emoji: '👑' },
  { key: 'carisma', labelIt: 'Carisma', labelEn: 'Charisma', emoji: '✨' },
]

type StatsValues = Record<StatKey['key'], number>

const defaultStats: StatsValues = {
  velocita: 5.0,
  resistenza: 5.0,
  tecnica: 5.0,
  fisico: 5.0,
  senso_del_gol: 5.0,
  fairplay: 5.0,
  leadership: 5.0,
  carisma: 5.0,
}

export default function OnboardingStatsScreen() {
  const { t } = useTranslation()
  const { user, setStats } = useAuthStore()
  const [values, setValues] = useState<StatsValues>(defaultStats)
  const [loading, setLoading] = useState(false)

  const handleChange = (key: StatKey['key'], value: number) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleContinue = async () => {
    setLoading(true)
    const avg = Object.values(values).reduce((a, b) => a + b, 0) / 8
    const matchly_score = Math.round(avg * 10) / 10

    const level =
      matchly_score >= 9 ? 'elite' :
      matchly_score >= 7.5 ? 'platinum' :
      matchly_score >= 6 ? 'gold' :
      matchly_score >= 4.5 ? 'silver' : 'bronze'

    const { data, error } = await supabase
      .from('player_stats')
      .upsert({
        player_id: user?.id,
        ...values,
        matchly_score,
        level,
      })
      .select()
      .single()

    if (error) {
      Alert.alert(t('common.error'), error.message)
      setLoading(false)
      return
    }

    setStats(data)
    setLoading(false)
    router.push('/(onboarding)/role')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ProgressBar current={2} total={3} />
        <Text style={styles.stepLabel}>{t('onboarding.step', { current: 2, total: 3 })}</Text>
        <Text style={styles.title}>{t('onboarding.stats_title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.stats_subtitle')}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {STATS.map((stat) => (
          <StatSlider
            key={stat.key}
            label={t(`stats.${stat.key}`)}
            emoji={stat.emoji}
            value={values[stat.key]}
            onChange={(v) => handleChange(stat.key, v)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button label={t('common.continue')} onPress={handleContinue} loading={loading} fullWidth />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: 60, gap: spacing.sm },
  stepLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  title: { ...typography.h2 },
  subtitle: { ...typography.body, color: colors.textSecondary },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 120 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: 40,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
})
