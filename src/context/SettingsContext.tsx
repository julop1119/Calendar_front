import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Region } from '../lib/holidays'
import type { Language } from '../i18n/translations'

const LANGUAGE_STORAGE_KEY = 'calendar.language'
const REGION_STORAGE_KEY = 'calendar.region'

interface SettingsContextValue {
  language: Language
  region: Region
  setLanguage: (language: Language) => void
  setRegion: (region: Region) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  const stored = localStorage.getItem(key)
  return stored && (allowed as readonly string[]).includes(stored) ? (stored as T) : fallback
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() =>
    readStored(LANGUAGE_STORAGE_KEY, ['ko', 'en'] as const, 'ko'),
  )
  const [region, setRegionState] = useState<Region>(() => readStored(REGION_STORAGE_KEY, ['KR', 'CA'] as const, 'KR'))

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  useEffect(() => {
    localStorage.setItem(REGION_STORAGE_KEY, region)
  }, [region])

  return (
    <SettingsContext.Provider value={{ language, region, setLanguage: setLanguageState, setRegion: setRegionState }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return ctx
}
