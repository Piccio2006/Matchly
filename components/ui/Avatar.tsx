import React from 'react'
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native'
import { colors, radius } from '../../lib/theme'

interface AvatarProps {
  uri?: string | null
  name?: string
  size?: number
  style?: ViewStyle
}

export function Avatar({ uri, name, size = 48, style }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2 }, styles.container, style]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: colors.primary,
    fontFamily: 'Inter_700Bold',
  },
})
