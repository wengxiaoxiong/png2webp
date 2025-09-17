"use client"

import { useEffect } from 'react'
import i18n from '@/lib/i18n'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!i18n.isInitialized) {
      i18n.init({
        resources: {
          en: { translation: require('@/lib/locales/en.json') },
          zh: { translation: require('@/lib/locales/zh.json') }
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false
        }
      })
    }
  }, [])

  return <>{children}</>
}