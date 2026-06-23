import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import it from '../locales/it.json'
import en from '../locales/en.json'

const languageCode = Localization.getLocales()[0]?.languageCode ?? 'it'

i18n.use(initReactI18next).init({
  resources: {
    it: { translation: it },
    en: { translation: en },
  },
  lng: languageCode === 'it' ? 'it' : 'en',
  fallbackLng: 'it',
  interpolation: { escapeValue: false },
})

export default i18n
