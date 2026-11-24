import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Search, UserPlus } from 'lucide-react'
import { searchUsers } from '../../api/users'
import { useInviteMember } from '../../hooks/useInvites'
import { extractErrorMessage } from '../../api/client'
import { Button } from '../common/Button'
import type { UserSummary } from '../../types'

interface UserSearchProps {
  groupId: number
}

export function UserSearch({ groupId }: UserSearchProps) {
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [invitedIds, setInvitedIds] = useState<number[]>([])

  const search = useMutation({ mutationFn: (q: string) => searchUsers(q) })
  const invite = useInviteMember(groupId)

  const handleSearch = () => {
    if (!query.trim()) {
      return
    }
    setMessage(null)
    search.mutate(query.trim())
  }

  const handleInvite = (user: UserSummary) => {
    setMessage(null)
    invite.mutate(user.email, {
      onSuccess: () => {
        setInvitedIds((ids) => [...ids, user.id])
        setMessage(`${user.name}님을 초대했습니다`)
      },
      onError: (err) => setMessage(extractErrorMessage(err, '초대에 실패했습니다')),
    })
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="이메일 또는 이름으로 검색"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
        <Button variant="secondary" isLoading={search.isPending} onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {message && <p className="mt-2 text-xs text-gray-500">{message}</p>}

      <div className="mt-3 flex flex-col gap-1">
        {search.data?.length === 0 && <p className="py-4 text-center text-xs text-gray-400">검색 결과가 없습니다</p>}
        {search.data?.map((user) => (
          <div key={user.id} className="flex items-center justify-between rounded-xl px-2 py-2 hover:bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              disabled={invitedIds.includes(user.id)}
              isLoading={invite.isPending && invite.variables === user.email}
              onClick={() => handleInvite(user)}
            >
              <UserPlus className="h-4 w-4" />
              {invitedIds.includes(user.id) ? '초대됨' : '초대'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
