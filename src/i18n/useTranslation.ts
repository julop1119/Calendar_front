import { useSettings } from '../context/SettingsContext'
import { translations, type TranslationDict } from './translations'

export function useTranslation(): { t: TranslationDict; language: ReturnType<typeof useSettings>['language'] } {
  const { language } = useSettings()
  return { t: translations[language], language }
}

export function format(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key]
    return value === undefined ? match : String(value)
  })
}
