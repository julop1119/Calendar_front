import { Link } from 'react-router-dom'
import { GroupSwitcher } from '../share/GroupSwitcher'
import { useAuth } from '../../context/AuthContext'

export function TopBar() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 pt-safe backdrop-blur">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
        <GroupSwitcher />
        <Link
          to="/profile"
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-sm font-semibold text-primary-700"
        >
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user?.name?.[0] ?? '?'
          )}
        </Link>
      </div>
    </header>
  )
}
