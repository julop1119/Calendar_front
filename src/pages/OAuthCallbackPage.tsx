import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FullScreenSpinner } from '../components/common/Spinner'
import { useTranslation } from '../i18n/useTranslation'

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) {
      return
    }
    handled.current = true

    const token = searchParams.get('token')
    if (!token) {
      setError(t.oauthCallback.noToken)
      return
    }
    login(token)
      .then(() => navigate('/', { replace: true }))
      .catch(() => setError(t.oauthCallback.error))
  }, [searchParams, login, navigate, t])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <p className="text-sm text-gray-600">{error}</p>
        <button
          className="text-sm font-medium text-primary-600"
          onClick={() => navigate('/login', { replace: true })}
        >
          {t.oauthCallback.backToLogin}
        </button>
      </div>
    )
  }

  return <FullScreenSpinner />
}
