import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useGroups } from '../hooks/useGroups'
import type { Group } from '../types'

const SELECTED_GROUP_STORAGE_KEY = 'calendar.selectedGroupId'

interface GroupContextValue {
  groups: Group[]
  selectedGroup: Group | null
  selectedGroupId: number | null
  selectGroup: (groupId: number) => void
  isLoading: boolean
}

const GroupContext = createContext<GroupContextValue | null>(null)

export function GroupProvider({ children }: { children: ReactNode }) {
  const { data: groups = [], isLoading } = useGroups()
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(() => {
    const stored = localStorage.getItem(SELECTED_GROUP_STORAGE_KEY)
    return stored ? Number(stored) : null
  })

  useEffect(() => {
    if (groups.length === 0) {
      return
    }
    const stillValid = groups.some((group) => group.id === selectedGroupId)
    if (!stillValid) {
      setSelectedGroupId(groups[0].id)
    }
  }, [groups, selectedGroupId])

  const selectGroup = (groupId: number) => {
    setSelectedGroupId(groupId)
    localStorage.setItem(SELECTED_GROUP_STORAGE_KEY, String(groupId))
  }

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  )

  return (
    <GroupContext.Provider value={{ groups, selectedGroup, selectedGroupId, selectGroup, isLoading }}>
      {children}
    </GroupContext.Provider>
  )
}

export function useGroupContext(): GroupContextValue {
  const ctx = useContext(GroupContext)
  if (!ctx) {
    throw new Error('useGroupContext는 GroupProvider 내부에서만 사용할 수 있습니다')
  }
  return ctx
}
