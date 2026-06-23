import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { AuthForm } from '../../components/features/auth/AuthForm'
import { SocialLoginButton } from '../../components/features/auth/SocialLoginButton'
import { colors, spacing, typography } from '../../lib/theme'
import { useAuth } from '../../hooks/useAuth'

export default function LoginScreen() {
  const { t } = useTranslation()
  const { signInWithEmail } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (email: string, password: string) => {
    setError('')
    setLoading(true)
    try {
      await signInWithEmail(email, password)
    } catch {
      setError(t('auth.login_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{t('auth.login')}</Text>
      <Text style={styles.subtitle}>{t('auth.welcome_subtitle')}</Text>

      <View style={styles.form}>
        <AuthForm mode="login" onSubmit={handleLogin} loading={loading} error={error} />

        <Pressable style={styles.forgotRow}>
          <Text style={styles.link}>{t('auth.forgot_password')}</Text>
        </Pressable>

        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.orText}>{t('auth.or')}</Text>
          <View style={styles.line} />
        </View>

        <SocialLoginButton
          provider="google"
          label={t('auth.continue_google')}
          onPress={() => {}}
        />
        {Platform.OS === 'ios' && (
          <SocialLoginButton
            provider="apple"
            label={t('auth.continue_apple')}
            onPress={() => {}}
          />
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.bodySmall}>{t('auth.no_account')} </Text>
          <Pressable onPress={() => router.replace('/(auth)/signup')}>
            <Text style={styles.link}>{t('auth.signup')}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: {
    padding: spacing.lg,
    paddingTop: 80,
    gap: spacing.sm,
  },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, color: colors.textSecondary },
  form: { marginTop: spacing.lg, gap: spacing.md },
  forgotRow: { alignSelf: 'flex-end' },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { ...typography.caption, color: colors.textSecondary },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  bodySmall: { ...typography.bodySmall },
  link: { ...typography.bodySmall, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
})
