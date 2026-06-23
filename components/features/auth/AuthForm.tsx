import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { spacing } from '../../../lib/theme'
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
    if (mode === 'signup' && password !== confirm) {
      setLocalError(t('auth.passwords_no_match'))
      return
    }
    onSubmit(email, password)
  }

  return (
    <View style={styles.container}>
      <Input
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="nome@esempio.com"
      />
      <Input
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        placeholder="••••••••"
        error={error}
      />
      {mode === 'signup' && (
        <Input
          label={t('auth.confirm_password')}
          value={confirm}
          onChangeText={setConfirm}
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
})
