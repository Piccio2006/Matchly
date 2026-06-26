import React from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, typography, radius } from '../lib/theme'
import { useAuthStore } from '../stores/authStore'
import { useUser } from '../hooks/useUser'

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const { session } = useAuthStore()
  const { profile } = useUser()

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Impostazioni</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.groupLabel}>ACCOUNT</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{session?.user?.email ?? '—'}</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Username</Text>
            <Text style={styles.rowValue}>@{profile?.username ?? '—'}</Text>
          </View>
        </View>

        <Text style={styles.groupLabel}>NOTIFICHE</Text>
        <View style={styles.group}>
          <View style={styles.rowSwitch}>
            <Text style={styles.rowLabel}>Promemoria partita</Text>
            <Switch value={true} onValueChange={() => {}} />
          </View>
          <View style={[styles.rowSwitch, styles.rowLast]}>
            <Text style={styles.rowLabel}>Offerte last-minute</Text>
            <Switch value={true} onValueChange={() => {}} />
          </View>
        </View>

        <Text style={styles.groupLabel}>APP</Text>
        <View style={styles.group}>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Versione</Text>
            <Text style={styles.rowValue}>1.0.0 (Blocco 3)</Text>
          </View>
        </View>
      </ScrollView>
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
  content: { padding: spacing.lg, gap: spacing.xs, paddingBottom: 40 },
  groupLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { ...typography.body },
  rowValue: { ...typography.bodySmall, color: colors.textSecondary },
})
