import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { Button } from '../../components/ui/Button'
import { colors, spacing, typography, radius } from '../../lib/theme'
import { supabase } from '../../lib/supabase'
import { useUser } from '../../hooks/useUser'

const NUM_PARTICLES = 12

function Particle({ index }: { index: number }) {
  const x = useSharedValue(Math.random() * 300 - 150)
  const y = useSharedValue(Math.random() * 500 - 250)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(Math.random() * 0.6 + 0.4)

  useEffect(() => {
    const duration = 2000 + Math.random() * 2000
    const delay = index * 200

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(0.6, { duration: duration / 2 }), withTiming(0.1, { duration: duration / 2 })),
        -1,
        false
      )
    )

    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(y.value - 30, { duration: duration }),
          withTiming(y.value + 30, { duration: duration })
        ),
        -1,
        true
      )
    )

    return () => {
      cancelAnimation(opacity)
      cancelAnimation(y)
    }
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        styles.particle,
        style,
        { left: '50%', top: '50%' },
      ]}
    />
  )
}

export default function MatchScreen() {
  const { t } = useTranslation()
  const { profile } = useUser()
  const [email, setEmail] = useState(profile ? '' : '')
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    supabase
      .from('matchmaking_waitlist')
      .select('id', { count: 'exact', head: true })
      .then(({ count: c }) => setCount(c ?? 0))
  }, [])

  const handleJoin = async () => {
    if (!email.trim()) return
    setLoading(true)

    const { error } = await supabase.from('matchmaking_waitlist').upsert({
      email: email.trim().toLowerCase(),
      player_id: profile?.id ?? null,
      city: profile?.city ?? null,
    })

    setLoading(false)
    if (error && !error.message.includes('unique')) {
      Alert.alert(t('common.error'), error.message)
      return
    }

    setJoined(true)
    setCount((c) => c + 1)
  }

  return (
    <View style={styles.container}>
      <View style={styles.particles} pointerEvents="none">
        {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </View>

      <View style={styles.content}>
        <Text style={styles.logo}>Matchly</Text>
        <Text style={styles.title}>{t('match.coming_soon_title')}</Text>
        <Text style={styles.subtitle}>{t('match.coming_soon_subtitle')}</Text>

        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {t('match.waitlist_count', { count })}
          </Text>
        </View>

        {joined ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✅ {t('match.waitlist_success')}</Text>
          </View>
        ) : (
          <View style={styles.waitlistForm}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('match.waitlist_placeholder')}
              placeholderTextColor={colors.darkAccent}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button
              label={t('match.waitlist_cta')}
              onPress={handleJoin}
              loading={loading}
              variant="dark"
              fullWidth
            />
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.darkAccent,
  },
  content: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
    width: '100%',
  },
  logo: {
    fontFamily: 'Inter_700Bold',
    fontSize: 42,
    color: colors.darkAccent,
    letterSpacing: -1,
    textShadowColor: colors.darkAccent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  title: {
    ...typography.h2,
    color: colors.darkText,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.darkAccent,
    textAlign: 'center',
    opacity: 0.8,
  },
  counter: {
    backgroundColor: colors.darkSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.darkAccent,
  },
  counterText: {
    ...typography.label,
    color: colors.darkAccent,
  },
  waitlistForm: {
    width: '100%',
    gap: spacing.sm,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.darkAccent,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.darkSurface,
    color: colors.darkText,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  successBox: {
    backgroundColor: colors.darkSurface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.darkAccent,
  },
  successText: {
    ...typography.body,
    color: colors.darkAccent,
    textAlign: 'center',
  },
})
