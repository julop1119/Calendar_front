import { useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useTranslation } from '../i18n/useTranslation'
import { resizeImageToDataUrl } from '../lib/resizeImage'
import type { Language } from '../i18n/translations'
import type { Region } from '../lib/holidays'

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
        selected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="px-5 py-4">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <p className="mb-3 mt-0.5 text-xs text-gray-400">{description}</p>
      <div className="flex gap-2">{children}</div>
    </section>
  )
}

function NoteCharacterSection() {
  const { noteCharacterIcon, setNoteCharacterIcon } = useSettings()
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    try {
      const dataUrl = await resizeImageToDataUrl(file, 64)
      setNoteCharacterIcon(dataUrl)
      setError(null)
    } catch {
      setError(t.settings.imageTooLarge)
    }
  }

  return (
    <section className="px-5 py-4">
      <h2 className="text-sm font-semibold text-gray-900">{t.settings.noteCharacter}</h2>
      <p className="mb-3 mt-0.5 text-xs text-gray-400">{t.settings.noteCharacterDescription}</p>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
          {noteCharacterIcon ? (
            <img src={noteCharacterIcon} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400">?</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-200"
          >
            {t.settings.chooseImage}
          </button>
          {noteCharacterIcon && (
            <button
              onClick={() => setNoteCharacterIcon(null)}
              className="rounded-lg px-3 py-1.5 text-left text-xs font-medium text-gray-400 hover:bg-gray-50"
            >
              {t.settings.useDefault}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleFile(file)
            }
            e.target.value = ''
          }}
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </section>
  )
}

export function SettingsPage() {
  const { language, region, setLanguage, setRegion } = useSettings()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const languageOptions: { value: Language; label: string }[] = [
    { value: 'ko', label: t.settings.korean },
    { value: 'en', label: t.settings.english },
  ]
  const regionOptions: { value: Region; label: string }[] = [
    { value: 'KR', label: t.settings.korea },
    { value: 'CA', label: t.settings.canada },
  ]

  return (
    <div className="pb-24">
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          aria-label={t.settings.back}
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">{t.settings.title}</h1>
      </div>

      <SettingsSection title={t.settings.language} description={t.settings.languageDescription}>
        {languageOptions.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={language === option.value}
            onClick={() => setLanguage(option.value)}
          />
        ))}
      </SettingsSection>

      <SettingsSection title={t.settings.region} description={t.settings.regionDescription}>
        {regionOptions.map((option) => (
          <OptionButton
            key={option.value}
            label={option.label}
            selected={region === option.value}
            onClick={() => setRegion(option.value)}
          />
        ))}
      </SettingsSection>

      <NoteCharacterSection />
    </div>
  )
}
