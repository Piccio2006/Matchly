import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { FieldCard } from '../components/features/booking/FieldCard'
import { colors, spacing, typography } from '../lib/theme'
import { SportField } from '../types'

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets()
  const { session } = useAuthStore()
  const [fields, setFields] = useState<SportField[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user) { setLoading(false); return }
    supabase
      .from('field_favorites')
      .select('sports_fields(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setFields(((data ?? []).map((r: any) => r.sports_fields).filter(Boolean)) as SportField[])
        setLoading(false)
      })
  }, [session?.user?.id])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>❤️ Preferiti</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : fields.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>❤️</Text>
          <Text style={styles.emptyTitle}>Nessun preferito ancora</Text>
          <Text style={styles.emptySubtitle}>Salva i campi che ami per trovarli subito</Text>
          <Pressable style={styles.exploreBtn} onPress={() => router.push('/(tabs)/booking' as never)}>
            <Text style={styles.exploreBtnText}>Scopri i campi</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {fields.map((f) => (
            <FieldCard
              key={f.id}
              field={f}
              onPress={() => router.push({ pathname: '/field/[id]', params: { id: f.id } } as never)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  backText: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.textPrimary },
  title: { ...typography.h2 },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h3 },
  emptySubtitle: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
  exploreBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  exploreBtnText: { ...typography.label, color: '#fff' },
})
