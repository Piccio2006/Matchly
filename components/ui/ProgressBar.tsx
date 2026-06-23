import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated'
import { colors, radius, springs } from '../../lib/theme'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const width = useSharedValue(0)

  useEffect(() => {
    width.value = withSpring((current / total) * 100, springs.gentle)
  }, [current, total])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }))

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
})
