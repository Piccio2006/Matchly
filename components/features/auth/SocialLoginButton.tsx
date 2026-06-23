import React from 'react'
import { Pressable, Text, View, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { usePressAnimation } from '../../../hooks/useAnimations'
import { colors, radius, spacing, typography } from '../../../lib/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface SocialLoginButtonProps {
  provider: 'google' | 'apple'
  label: string
  onPress: () => void
  disabled?: boolean
}

export function SocialLoginButton({ provider, label, onPress, disabled = false }: SocialLoginButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressAnimation()
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={[
        animatedStyle,
        styles.button,
        provider === 'apple' ? styles.apple : styles.google,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.inner}>
        <Text style={styles.icon}>{provider === 'apple' ? '🍎' : '🔵'}</Text>
        <Text style={[styles.label, provider === 'apple' && styles.appleLabel]}>{label}</Text>
      </View>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  google: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  apple: {
    backgroundColor: '#000',
  },
  disabled: {
    opacity: 0.5,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    ...typography.label,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  appleLabel: {
    color: '#fff',
  },
})
