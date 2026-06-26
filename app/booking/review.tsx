import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { colors, radius, spacing, typography } from '../../lib/theme'
import { Button } from '../../components/ui/Button'

const CRITERIA = [
  { key: 'rating_surface', label: 'Manto/Superficie', emoji: '🌱' },
  { key: 'rating_facilities', label: 'Spogliatoi/Servizi', emoji: '🚿' },
  { key: 'rating_structure', label: 'Struttura', emoji: '🏟️' },
  { key: 'rating_value', label: 'Rapporto qualità-prezzo', emoji: '💰' },
] as const

type RatingKey = typeof CRITERIA[number]['key']

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)} style={styles.starBtn}>
          <Text style={[styles.star, n <= value && styles.starActive]}>★</Text>
        </Pressable>
      ))}
    </View>
  )
}

export default function ReviewScreen() {
  const { bookingId, fieldId, fieldName } = useLocalSearchParams<{
    bookingId: string
    fieldId: string
    fieldName: string
  }>()
  const insets = useSafeAreaInsets()
  const { session } = useAuthStore()

  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    rating_surface: 0,
    rating_facilities: 0,
    rating_structure: 0,
    rating_value: 0,
  })
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const allRated = Object.values(ratings).every((v) => v > 0)

  const handleSubmit = async () => {
    if (!allRated || !session?.user) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('field_reviews').insert({
        booking_id: bookingId,
        field_id: fieldId,
        user_id: session.user.id,
        ...ratings,
        comment: comment.trim() || null,
      })
      if (error) throw error
      Alert.alert('Grazie!', 'La tua recensione è stata inviata.', [
        { text: 'Ok', onPress: () => router.replace('/(tabs)/' as never) },
      ])
    } catch {
      Alert.alert('Errore', 'Non è stato possibile inviare la recensione. Riprova.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.skipBtn}>
            <Text style={styles.skipText}>Salta</Text>
          </Pressable>
        </View>

        <Text style={styles.emoji}>⭐</Text>
        <Text style={styles.title}>Com'è andata?</Text>
        <Text style={styles.subtitle}>Recensisci {fieldName ?? 'il campo'}</Text>

        <View style={styles.criteriaList}>
          {CRITERIA.map(({ key, label, emoji }) => (
            <View key={key} style={styles.criteriaRow}>
              <Text style={styles.criteriaLabel}>{emoji} {label}</Text>
              <StarPicker
                value={ratings[key]}
                onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
              />
            </View>
          ))}
        </View>

        <Text style={styles.commentLabel}>Commento (opzionale)</Text>
        <TextInput
          style={styles.commentInput}
          multiline
          numberOfLines={4}
          placeholder="Condividi la tua esperienza..."
          placeholderTextColor={colors.textSecondary}
          value={comment}
          onChangeText={setComment}
          maxLength={500}
        />
        <Text style={styles.charCount}>{comment.length}/500</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          label={submitting ? 'Invio...' : 'Invia recensione'}
          onPress={handleSubmit}
          loading={submitting}
          disabled={!allRated}
          fullWidth
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 120, gap: spacing.md },
  header: { alignItems: 'flex-end' },
  skipBtn: { padding: spacing.sm },
  skipText: { ...typography.label, color: colors.textSecondary },
  emoji: { fontSize: 48, textAlign: 'center' },
  title: { ...typography.h2, textAlign: 'center' },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
  criteriaList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  criteriaLabel: { ...typography.body, flex: 1 },
  stars: { flexDirection: 'row', gap: 4 },
  starBtn: { padding: 4 },
  star: { fontSize: 28, color: colors.border },
  starActive: { color: '#F5A623' },
  commentLabel: { ...typography.label, marginTop: spacing.sm },
  commentInput: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: { ...typography.caption, color: colors.textSecondary, textAlign: 'right', marginTop: -spacing.xs },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
})
