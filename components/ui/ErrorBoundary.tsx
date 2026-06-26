import React, { Component, ReactNode } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { colors, spacing, typography, radius } from '../../lib/theme'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev; in production hook into Sentry/Bugsnag here
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Qualcosa è andato storto</Text>
          <Text style={styles.message} numberOfLines={3}>
            {this.state.error?.message ?? 'Errore sconosciuto'}
          </Text>
          <Pressable style={styles.btn} onPress={this.reset}>
            <Text style={styles.btnText}>Riprova</Text>
          </Pressable>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  emoji: { fontSize: 48 },
  title: { ...typography.h3, textAlign: 'center' },
  message: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  btnText: { ...typography.label, color: '#fff' },
})
