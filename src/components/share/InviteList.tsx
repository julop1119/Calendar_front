import { Check, X } from 'lucide-react'
import { useMyInvites, useRespondInvite } from '../../hooks/useInvites'
import { EmptyState } from '../common/EmptyState'
import { Mail } from 'lucide-react'
import { Spinner } from '../common/Spinner'

export function InviteList() {
  const { data: invites, isLoading } = useMyInvites()
  const { accept, decline } = useRespondInvite()

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    )
  }

  if (!invites || invites.length === 0) {
    return <EmptyState icon={Mail} title="받은 초대가 없습니다" />
  }

  return (
    <div className="flex flex-col gap-2">
      {invites.map((invite) => (
        <div key={invite.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-gray-900">{invite.groupTitle}</p>
            <p className="text-xs text-gray-500">캘린더 공유 초대가 도착했어요</p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => decline.mutate(invite.id)}
              disabled={decline.isPending || accept.isPending}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              aria-label="거절"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={() => accept.mutate(invite.id)}
              disabled={decline.isPending || accept.isPending}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700"
              aria-label="수락"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
