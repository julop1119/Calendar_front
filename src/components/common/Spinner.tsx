import { useTranslation } from '../../i18n/useTranslation'

export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <div
      className={`${className} animate-spin rounded-full border-2 border-gray-300 border-t-primary-600`}
      role="status"
      aria-label={t.common.loading}
    />
  )
}

export function FullScreenSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Spinner className="h-8 w-8" />
    </div>
  )
}
