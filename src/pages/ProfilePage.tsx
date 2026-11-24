import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/common/Button'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
      <Button
        variant="secondary"
        className="w-full max-w-xs"
        onClick={() => {
          logout()
          navigate('/login', { replace: true })
        }}
      >
        <LogOut className="h-4 w-4" />
        로그아웃
      </Button>
    </div>
  )
}
