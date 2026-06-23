import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { colors, spacing, typography, springs } from '../../lib/theme'

export default function WelcomeScreen() {
  const { t } = useTranslation()

  const logoY = useSharedValue(-60)
  const logoOpacity = useSharedValue(0)
  const btn1Y = useSharedValue(40)
  const btn1Opacity = useSharedValue(0)
  const btn2Y = useSharedValue(40)
  const btn2Opacity = useSharedValue(0)

  useEffect(() => {
    logoY.value = withSpring(0, springs.gentle)
    logoOpacity.value = withTiming(1, { duration: 400 })

    btn1Y.value = withDelay(300, withSpring(0, springs.gentle))
    btn1Opacity.value = withDelay(300, withTiming(1, { duration: 300 }))

    btn2Y.value = withDelay(500, withSpring(0, springs.gentle))
    btn2Opacity.value = withDelay(500, withTiming(1, { duration: 300 }))
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoY.value }],
    opacity: logoOpacity.value,
  }))

  const btn1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: btn1Y.value }],
    opacity: btn1Opacity.value,
  }))

  const btn2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: btn2Y.value }],
    opacity: btn2Opacity.value,
  }))

  return (
    <View style={styles.container}>
      <View style={styles.logoSection}>
        <Animated.View style={logoStyle}>
          <Text style={styles.logo}>Matchly</Text>
          <Text style={styles.tagline}>
            {t('auth.welcome_subtitle')}
          </Text>
          <Text style={styles.slogan}>Prenota. Gioca. Vinci.</Text>
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <Animated.View style={btn1Style}>
          <Button
            label={t('auth.signup')}
            onPress={() => router.push('/(auth)/signup')}
            fullWidth
          />
        </Animated.View>

        <Animated.View style={[btn2Style, styles.secondaryRow]}>
          <Text style={styles.secondaryText}>{t('auth.already_account')} </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.link}>{t('auth.login')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 60,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'Inter_700Bold',
    fontSize: 52,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: -1,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  slogan: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: colors.primaryDark,
    textAlign: 'center',
    marginTop: spacing.lg,
    letterSpacing: 0.5,
  },
  actions: {
    gap: spacing.md,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    ...typography.bodySmall,
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
})
