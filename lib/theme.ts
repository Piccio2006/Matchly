export const colors = {
  background: '#FAFAF8',
  surface: '#FFFFFF',

  primary: '#5C6B3E',
  primaryMedium: '#8B9A6A',
  primaryLight: '#EDF0E6',
  primaryDark: '#3E4D28',

  textPrimary: '#1A1C18',
  textSecondary: '#6B7260',

  border: '#DDE3D3',

  warning: '#E8A830',
  error: '#D94F3D',
  success: '#5C6B3E',

  darkBackground: '#1A1F14',
  darkSurface: '#252C1C',
  darkAccent: '#8FAF6A',
  darkText: '#F4F7EE',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
}

export const typography = {
  h1: { fontFamily: 'Inter_700Bold', fontSize: 32, lineHeight: 40, color: colors.textPrimary },
  h2: { fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 32, color: colors.textPrimary },
  h3: { fontFamily: 'Inter_600SemiBold', fontSize: 20, lineHeight: 28, color: colors.textPrimary },
  body: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, color: colors.textPrimary },
  bodySmall: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 20, color: colors.textPrimary },
  caption: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 16, color: colors.textSecondary },
}

export const levelColors: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#9E9E9E',
  gold: '#FFD700',
  platinum: '#4FC3F7',
  elite: '#EF5350',
}

export const springs = {
  gentle: { damping: 20, stiffness: 200 },
  bouncy: { damping: 14, stiffness: 300 },
  snappy: { damping: 25, stiffness: 400 },
}
