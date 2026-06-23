import { useSharedValue, withSpring, withTiming, withDelay } from 'react-native-reanimated'
import { springs } from '../lib/theme'

export function usePressAnimation() {
  const scale = useSharedValue(1)

  const onPressIn = () => {
    scale.value = withSpring(0.97, springs.snappy)
  }

  const onPressOut = () => {
    scale.value = withSpring(1.0, springs.bouncy)
  }

  return { scale, onPressIn, onPressOut }
}

export function useFadeIn(delay = 0) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)

  const enter = () => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }))
    translateY.value = withDelay(delay, withSpring(0, springs.gentle))
  }

  return { opacity, translateY, enter }
}
