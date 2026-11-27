import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import { useAuth } from '../context/AuthContext'

const MOBILE_OAUTH_CALLBACK_PREFIX = 'com.example.calendar.app://oauth/callback'

/** 안드로이드/iOS에서 시스템 브라우저로 로그인 완료 후 돌아오는 딥링크를 처리한다. */
export function useOAuthDeepLink(): void {
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return
    }

    const listenerPromise = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      if (!url.startsWith(MOBILE_OAUTH_CALLBACK_PREFIX)) {
        return
      }
      Browser.close().catch(() => {})

      const queryStart = url.indexOf('?')
      const token = queryStart >= 0 ? new URLSearchParams(url.slice(queryStart + 1)).get('token') : null

      if (!token) {
        navigate('/login', { replace: true })
        return
      }
      login(token)
        .then(() => navigate('/', { replace: true }))
        .catch(() => navigate('/login', { replace: true }))
    })

    return () => {
      listenerPromise.then((handle) => handle.remove())
    }
  }, [login, navigate])
}
