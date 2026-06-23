import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { colors, spacing, radius, typography } from '../../../lib/theme'
import { useTranslation } from 'react-i18next'

interface AuthFormProps {
  mode: 'login' | 'signup'
  onSubmit: (email: string, password: string) => void
  loading?: boolean
  error?: string
}

export function AuthForm({ mode, onSubmit, loading, error }: AuthFormProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = () => {
    setLocalError('')
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedEmail || !password.trim()) {
      setLocalError(t('auth.fill_email_password'))
      return
    }

    if (mode === 'signup' && password !== confirm) {
      setLocalError(t('auth.passwords_no_match'))
      return
    }
    onSubmit(trimmedEmail, password)
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Input
        label={t('auth.email')}
        value={email}
        onChangeText={(value) => {
          setEmail(value)
          setLocalError('')
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="nome@esempio.com"
      />
      <Input
        label={t('auth.password')}
        value={password}
        onChangeText={(value) => {
          setPassword(value)
          setLocalError('')
        }}
        secureTextEntry
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        placeholder="••••••••"
        error={mode === 'login' ? localError : undefined}
      />
      {mode === 'signup' && (
        <Input
          label={t('auth.confirm_password')}
          value={confirm}
          onChangeText={(value) => {
            setConfirm(value)
            setLocalError('')
          }}
          secureTextEntry
          placeholder="••••••••"
          error={localError}
        />
      )}
      <Button
        label={mode === 'login' ? t('auth.login') : t('auth.signup')}
        onPress={handleSubmit}
        loading={loading}
        fullWidth
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  errorBanner: {
    backgroundColor: '#FDE8E6',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    fontFamily: 'Inter_600SemiBold',
  },
})
