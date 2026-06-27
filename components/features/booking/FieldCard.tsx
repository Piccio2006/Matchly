import React from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { usePressAnimation } from '../../../hooks/useAnimations'
import { sportEmoji, approxDistanceKm, FIRENZE_CENTER } from '../../../lib/booking'
import { colors, radius, spacing, typography } from '../../../lib/theme'
import { SportField } from '../../../types'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface FieldCardProps {
  field: SportField
  onPress: () => void
  hasOffer?: boolean
}

export function FieldCard({ field, onPress, hasOffer = false }: FieldCardProps) {
  const { t } = useTranslation()
  const { scale, onPressIn, onPressOut } = usePressAnimation()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const mainSport = field.sport_types[0]
  const distance = approxDistanceKm(
    FIRENZE_CENTER.latitude,
    FIRENZE_CENTER.longitude,
    field.latitude,
    field.longitude
  )

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[animatedStyle, styles.card]}
    >
      <View style={styles.imageWrap}>
        {field.photos?.length ? (
          <Image source={{ uri: field.photos[0] }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>{sportEmoji(mainSport)}</Text>
          </View>
        )}
        {hasOffer ? (
          <View style={styles.offerBadge}>
            <Text style={styles.offerText}>{t('booking.offer_badge')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {field.name}
        </Text>
        <Text style={styles.sport}>
          {sportEmoji(mainSport)} {t(`sports.${mainSport}`)}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.rating}>
            ⭐ {(field.rating_avg ?? 0).toFixed(1)} ({field.rating_count ?? 0})
          </Text>
          {distance != null ? <Text style={styles.distance}>📍 {distance} km</Text> : null}
        </View>
        <Text style={styles.price}>{t('booking.from_price', { price: field.price_per_slot.toFixed(0) })}</Text>
      </View>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  imageWrap: {
    width: 110,
    height: 110,
  },
  image: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 40 },
  offerBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  offerText: {
    ...typography.caption,
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  info: {
    flex: 1,
    padding: spacing.md,
    gap: 2,
    justifyContent: 'center',
  },
  name: { ...typography.label, fontSize: 16 },
  sport: { ...typography.bodySmall },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: 2 },
  rating: { ...typography.caption, color: colors.textPrimary },
  distance: { ...typography.caption },
  price: {
    ...typography.label,
    color: colors.primary,
    marginTop: spacing.xs,
  },
})
