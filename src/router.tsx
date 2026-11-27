import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { GroupProvider } from './context/GroupContext'
import { useOAuthDeepLink } from './native/oauthDeepLink'
import { FullScreenSpinner } from './components/common/Spinner'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { OAuthCallbackPage } from './pages/OAuthCallbackPage'
import { CalendarPage } from './pages/CalendarPage'
import { SharePage } from './pages/SharePage'
import { NotesPage } from './pages/NotesPage'
import { ProfilePage } from './pages/ProfilePage'

function ProtectedArea() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <FullScreenSpinner />
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return (
    <GroupProvider>
      <AppShell />
    </GroupProvider>
  )
}

export function AppRouter() {
  useOAuthDeepLink()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route element={<ProtectedArea />}>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
