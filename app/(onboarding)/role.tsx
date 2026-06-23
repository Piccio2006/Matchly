import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { Button } from '../../components/ui/Button'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { colors, spacing, typography, radius, springs } from '../../lib/theme'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Role } from '../../types'

const ROLES: { key: Role; emoji: string }[] = [
  { key: 'portiere', emoji: '🧤' },
  { key: 'difensore', emoji: '🛡️' },
  { key: 'centrocampista', emoji: '⚙️' },
  { key: 'attaccante', emoji: '⚡' },
]

function RoleCard({
  roleKey,
  emoji,
  selected,
  onSelect,
}: {
  roleKey: Role
  emoji: string
  selected: boolean
  onSelect: () => void
}) {
  const { t } = useTranslation()
  const scale = useSharedValue(1)

  const handlePress = () => {
    scale.value = withSpring(0.96, springs.snappy, () => {
      scale.value = withSpring(1.02, springs.bouncy, () => {
        scale.value = withSpring(1.0, springs.gentle)
      })
    })
    onSelect()
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={[styles.card, selected && styles.cardSelected]}
        onPress={handlePress}
      >
        <Text style={styles.roleEmoji}>{emoji}</Text>
        <Text style={[styles.roleName, selected && styles.roleNameSelected]}>
          {t(`roles.${roleKey}`)}
        </Text>
        <Text style={styles.roleDesc}>{t(`roles.${roleKey}_desc`)}</Text>
      </Pressable>
    </Animated.View>
  )
}

export default function OnboardingRoleScreen() {
  const { t } = useTranslation()
  const { user, setProfile } = useAuthStore()
  const insets = useSafeAreaInsets()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    if (!user?.id) {
      Alert.alert(t('common.error'), t('auth.login_required'))
      return
    }

    if (!selectedRole) {
      Alert.alert(t('common.error'), t('onboarding.select_role'))
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .update({ preferred_role: selectedRole, onboarding_completed: true })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      Alert.alert(t('common.error'), error.message)
      setLoading(false)
      return
    }

    setProfile(data)
    setLoading(false)
    router.replace('/(tabs)')
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <ProgressBar current={3} total={3} />
        <Text style={styles.stepLabel}>{t('onboarding.step', { current: 3, total: 3 })}</Text>
        <Text style={styles.title}>{t('onboarding.role_title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.role_subtitle')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {ROLES.map(({ key, emoji }) => (
          <RoleCard
            key={key}
            roleKey={key}
            emoji={emoji}
            selected={selectedRole === key}
            onSelect={() => setSelectedRole(key)}
          />
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Button
          label={t('onboarding.complete')}
          onPress={handleComplete}
          loading={loading}
          disabled={!selectedRole}
          fullWidth
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: 0, gap: spacing.sm },
  stepLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  title: { ...typography.h2 },
  subtitle: { ...typography.body, color: colors.textSecondary },
  scroll: { flex: 1 },
  grid: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleEmoji: { fontSize: 32 },
  roleName: { ...typography.h3, textAlign: 'center' },
  roleNameSelected: { color: colors.primary },
  roleDesc: { ...typography.bodySmall, textAlign: 'center' },
  footer: {
    padding: spacing.lg,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
})
