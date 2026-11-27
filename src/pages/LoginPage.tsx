import { CalendarHeart } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'
import { googleLoginUrl } from '../api/auth'
import { Button } from '../components/common/Button'
import { useTranslation } from '../i18n/useTranslation'

function startGoogleLogin() {
  if (Capacitor.isNativePlatform()) {
    Browser.open({ url: googleLoginUrl(Capacitor.getPlatform()) })
    return
  }
  window.location.href = googleLoginUrl()
}

export function LoginPage() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 pb-safe pt-safe">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <CalendarHeart className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">{t.login.title}</h1>
        <p className="mt-2 text-sm text-gray-500">{t.login.subtitle}</p>
        <Button className="mt-6 w-full" onClick={startGoogleLogin}>
          {t.login.button}
        </Button>
      </div>
    </div>
  )
}
