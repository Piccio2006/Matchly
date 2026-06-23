import React from 'react'
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { usePressAnimation } from '../../hooks/useAnimations'
import { colors, radius, spacing, typography } from '../../lib/theme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark'
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  fullWidth?: boolean
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  const { scale, onPressIn, onPressOut } = usePressAnimation()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const isDisabled = disabled || loading

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={isDisabled}
      style={[animatedStyle, styles.base, styles[variant], fullWidth && styles.fullWidth, isDisabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'dark' ? '#fff' : colors.primary} size="small" />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles]]}>{label}</Text>
      )}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  dark: {
    backgroundColor: colors.darkAccent,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.label,
    fontSize: 16,
  },
  primaryLabel: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryLabel: {
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  outlineLabel: {
    color: colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  ghostLabel: {
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  darkLabel: {
    color: colors.darkBackground,
    fontFamily: 'Inter_600SemiBold',
  },
})
