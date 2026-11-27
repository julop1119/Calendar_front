import { CalendarDays, Mail, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from '../../i18n/useTranslation'

export function BottomNav() {
  const { t } = useTranslation()
  const TABS = [
    { to: '/', label: t.nav.calendar, icon: CalendarDays },
    { to: '/notes', label: t.nav.notes, icon: Mail },
    { to: '/share', label: t.nav.share, icon: Users },
  ]

  return (
    <nav className="sticky bottom-0 z-30 border-t border-gray-100 bg-white pb-safe">
      <div className="mx-auto flex max-w-xl">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
