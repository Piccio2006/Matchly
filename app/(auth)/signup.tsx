import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { AuthForm } from '../../components/features/auth/AuthForm'
import { SocialLoginButton } from '../../components/features/auth/SocialLoginButton'
import { colors, radius, spacing, typography } from '../../lib/theme'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function SignupScreen() {
  const { t } = useTranslation()
  const { signUpWithEmail } = useAuth()
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const showComingSoon = () => {
    Alert.alert(t('common.coming_soon'), t('auth.social_coming_soon'))
  }

  const handleSignup = async (email: string, password: string) => {
    setError('')
    setMessage('')
    if (!isSupabaseConfigured) {
      setError(t('auth.supabase_not_configured'))
      return
    }

    setLoading(true)
    try {
      const data = await signUpWithEmail(email, password)
      if (!data.session) {
        setMessage(t('auth.check_email'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.signup_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.lg }]}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← {t('common.back')}</Text>
      </Pressable>

      <Text style={styles.title}>{t('auth.signup')}</Text>
      <Text style={styles.subtitle}>{t('auth.welcome_subtitle')}</Text>

      <View style={styles.form}>
        {message ? (
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>{message}</Text>
          </View>
        ) : null}

        <AuthForm mode="signup" onSubmit={handleSignup} loading={loading} error={error} />

        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.orText}>{t('auth.or')}</Text>
          <View style={styles.line} />
        </View>

        <SocialLoginButton
          provider="google"
          label={`${t('auth.continue_google')} · ${t('common.soon')}`}
          onPress={showComingSoon}
          disabled
        />
        {Platform.OS === 'ios' && (
          <SocialLoginButton
            provider="apple"
            label={`${t('auth.continue_apple')} · ${t('common.soon')}`}
            onPress={showComingSoon}
            disabled
          />
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.bodySmall}>{t('auth.already_account')} </Text>
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.link}>{t('auth.login')}</Text>
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
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  backBtn: { marginBottom: spacing.sm },
  backText: { ...typography.bodySmall, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, color: colors.textSecondary },
  form: { marginTop: spacing.lg, gap: spacing.md },
  infoBanner: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryMedium,
    padding: spacing.md,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.primaryDark,
    fontFamily: 'Inter_600SemiBold',
  },
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
