import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FullScreenSpinner } from '../components/common/Spinner'

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) {
      return
    }
    handled.current = true

    const token = searchParams.get('token')
    if (!token) {
      setError('로그인 토큰을 받지 못했습니다. 다시 로그인해주세요.')
      return
    }
    login(token)
      .then(() => navigate('/', { replace: true }))
      .catch(() => setError('로그인 처리 중 오류가 발생했습니다. 다시 로그인해주세요.'))
  }, [searchParams, login, navigate])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <p className="text-sm text-gray-600">{error}</p>
        <button
          className="text-sm font-medium text-primary-600"
          onClick={() => navigate('/login', { replace: true })}
        >
          로그인 화면으로
        </button>
      </div>
    )
  }

  return <FullScreenSpinner />
}
