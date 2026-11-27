import { LogOut, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common/Button'
import { useTranslation } from '../i18n/useTranslation'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-10">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-2xl font-semibold text-primary-700">
        {user?.profileImageUrl ? (
          <img src={user.profileImageUrl} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          user?.name?.[0] ?? '?'
        )}
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>
      <Link
        to="/settings"
        className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-200"
      >
        <Settings className="h-4 w-4" />
        {t.profile.settings}
      </Link>
      <Button
        variant="secondary"
        className="w-full max-w-xs"
        onClick={() => {
          logout()
          navigate('/login', { replace: true })
        }}
      >
        <LogOut className="h-4 w-4" />
        {t.profile.logout}
      </Button>
    </div>
  )
}
