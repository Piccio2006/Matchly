import React, { useState } from 'react'
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated'
import { colors, radius, spacing, typography } from '../../lib/theme'

interface StatSliderProps {
  label: string
  emoji: string
  value: number
  onChange: (value: number) => void
}

const THUMB_SIZE = 24
const MIN = 1
const MAX = 10
const STEP = 0.5

function clamp(val: number, min: number, max: number) {
  'worklet'
  return Math.min(Math.max(val, min), max)
}

function snapToStep(val: number, step: number) {
  'worklet'
  return Math.round(val / step) * step
}

export function StatSlider({ label, emoji, value, onChange }: StatSliderProps) {
  const [trackWidth, setTrackWidth] = useState(200)
  const trackWidthShared = useSharedValue(200)

  const initialX = ((value - MIN) / (MAX - MIN)) * trackWidth
  const thumbX = useSharedValue(initialX)
  const startX = useSharedValue(initialX)

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    setTrackWidth(w)
    trackWidthShared.value = w
    // Reposition thumb to match current value on layout
    thumbX.value = ((value - MIN) / (MAX - MIN)) * w
    startX.value = thumbX.value
  }

  const updateValue = (x: number, tw: number) => {
    const ratio = x / tw
    const raw = MIN + ratio * (MAX - MIN)
    const snapped = snapToStep(clamp(raw, MIN, MAX), STEP)
    onChange(Math.round(snapped * 10) / 10)
  }

  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = thumbX.value
    })
    .onUpdate((e) => {
      const tw = trackWidthShared.value
      const next = clamp(startX.value + e.translationX, 0, tw)
      thumbX.value = next
      runOnJS(updateValue)(next, tw)
    })

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - THUMB_SIZE / 2 }],
  }))

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value,
  }))

  return (
    <View style={styles.row}>
      <View style={styles.labelContainer}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
      </View>
      <View style={styles.sliderWrapper} onLayout={onTrackLayout}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.thumb, thumbStyle]} />
          </GestureDetector>
        </View>
      </View>
      <Text style={styles.value}>{value.toFixed(1)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    width: 110,
    flexShrink: 0,
  },
  emoji: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  label: {
    ...typography.label,
    fontSize: 13,
    flex: 1,
  },
  sliderWrapper: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    position: 'relative',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: -(THUMB_SIZE / 2 - 3),
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  value: {
    ...typography.label,
    color: colors.primary,
    width: 32,
    textAlign: 'right',
    flexShrink: 0,
  },
})
