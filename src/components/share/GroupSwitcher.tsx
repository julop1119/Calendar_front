import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useGroupContext } from '../../context/GroupContext'
import { CreateGroupModal } from './CreateGroupModal'
import { useTranslation, format } from '../../i18n/useTranslation'

export function GroupSwitcher() {
  const { t } = useTranslation()
  const { groups, selectedGroup, selectGroup } = useGroupContext()
  const [open, setOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg px-2 py-1 text-left hover:bg-gray-100"
      >
        <span className="max-w-40 truncate text-base font-semibold text-gray-900">
          {selectedGroup?.title ?? t.groupSwitcher.defaultName}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-20 mt-1 w-56 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  selectGroup(group.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  group.id === selectedGroup?.id ? 'font-semibold text-primary-700' : 'text-gray-700'
                }`}
              >
                <span className="truncate">{group.title}</span>
                <span className="text-xs text-gray-400">{format(t.groupSwitcher.memberCount, { count: group.memberCount })}</span>
              </button>
            ))}
            <button
              onClick={() => {
                setOpen(false)
                setShowCreate(true)
              }}
              className="flex w-full items-center gap-1.5 border-t border-gray-100 px-3 py-2 text-left text-sm text-primary-600 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              {t.groupSwitcher.createNew}
            </button>
          </div>
        </>
      )}

      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={(groupId) => selectGroup(groupId)} />
      )}
    </div>
  )
}
