import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, Image,
} from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import * as ImagePicker from 'expo-image-picker'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { colors, spacing, typography, radius } from '../../lib/theme'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Sport } from '../../types'

const SPORTS: Sport[] = ['calcetto', 'calciotto', 'padel', 'tennis']

export default function OnboardingProfileScreen() {
  const { t } = useTranslation()
  const { user, setProfile } = useAuthStore()
  const insets = useSafeAreaInsets()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [city, setCity] = useState('')
  const [selectedSports, setSelectedSports] = useState<Sport[]>([])
  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState('')
  const [loading, setLoading] = useState(false)

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri)
    }
  }

  const toggleSport = (sport: Sport) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    )
  }

  const handleContinue = async () => {
    if (!user?.id) {
      Alert.alert(t('common.error'), t('auth.login_required'))
      return
    }

    if (!fullName.trim() || !username.trim() || !city.trim()) {
      Alert.alert(t('common.error'), t('onboarding.fill_all_fields'))
      return
    }
    if (selectedSports.length === 0) {
      Alert.alert(t('common.error'), t('onboarding.select_sport'))
      return
    }

    setLoading(true)
    setUsernameError('')

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase().trim())
      .neq('id', user?.id ?? '')
      .single()

    if (existing) {
      setUsernameError(t('onboarding.username_taken'))
      setLoading(false)
      return
    }

    const profileData = {
      id: user.id,
      full_name: fullName.trim(),
      username: username.toLowerCase().trim(),
      city: city.trim(),
      preferred_sports: selectedSports,
      avatar_url: avatarUri,
      onboarding_completed: false,
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single()

    if (error) {
      Alert.alert(t('common.error'), error.message)
      setLoading(false)
      return
    }

    setProfile(data)
    setLoading(false)
    router.push('/(onboarding)/stats')
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <ProgressBar current={1} total={3} />
        <Text style={styles.stepLabel}>{t('onboarding.step', { current: 1, total: 3 })}</Text>
        <Text style={styles.title}>{t('onboarding.profile_title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.profile_subtitle')}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.avatarPicker} onPress={pickAvatar}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.cameraIcon}>📷</Text>
              <Text style={styles.avatarHint}>{t('onboarding.add_photo')}</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.fields}>
          <Input
            label={t('onboarding.full_name')}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Mario Rossi"
            autoCapitalize="words"
          />
          <Input
            label={t('onboarding.username')}
            value={username}
            onChangeText={(v) => { setUsername(v); setUsernameError('') }}
            placeholder="mario_rossi"
            autoCapitalize="none"
            error={usernameError}
          />
          <Input
            label={t('onboarding.city')}
            value={city}
            onChangeText={setCity}
            placeholder="Roma"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.sportsSection}>
          <Text style={styles.sectionLabel}>{t('onboarding.sports_title')}</Text>
          <View style={styles.chips}>
            {SPORTS.map((sport) => (
              <Pressable
                key={sport}
                style={[styles.chip, selectedSports.includes(sport) && styles.chipSelected]}
                onPress={() => toggleSport(sport)}
              >
                <Text style={[styles.chipText, selectedSports.includes(sport) && styles.chipTextSelected]}>
                  {t(`sports.${sport}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Button label={t('common.continue')} onPress={handleContinue} loading={loading} fullWidth />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: 0, gap: spacing.sm },
  stepLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  title: { ...typography.h2 },
  subtitle: { ...typography.body, color: colors.textSecondary },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 120 },
  avatarPicker: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarImage: { width: 100, height: 100 },
  avatarPlaceholder: { alignItems: 'center', gap: spacing.xs },
  cameraIcon: { fontSize: 28 },
  avatarHint: { ...typography.caption, color: colors.textSecondary },
  fields: { gap: spacing.md },
  sportsSection: { gap: spacing.sm },
  sectionLabel: { ...typography.label },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  chipText: { ...typography.label, color: colors.textSecondary },
  chipTextSelected: { color: colors.primary },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: 40,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
})
