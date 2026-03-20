import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'es', 'pt', 'fr', 'de', 'it', 'nl', 'pl', 'ru', 'zh', 'ja', 'ko', 'ar', 'tr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
