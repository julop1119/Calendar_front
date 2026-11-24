import { useGroupMembers } from '../../hooks/useGroups'
import { Spinner } from '../common/Spinner'

const STATUS_LABEL: Record<string, string> = {
  ACCEPTED: '참여 중',
  PENDING: '초대중',
  DECLINED: '거절함',
}

export function MemberList({ groupId }: { groupId: number }) {
  const { data: members, isLoading } = useGroupMembers(groupId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {members?.map((member) => (
        <div key={member.id} className="flex items-center justify-between rounded-xl px-2 py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
              {member.user.profileImageUrl ? (
                <img src={member.user.profileImageUrl} alt={member.user.name} className="h-full w-full object-cover" />
              ) : (
                member.user.name?.[0] ?? '?'
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
              <p className="text-xs text-gray-500">{member.user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {member.role === 'OWNER' && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-600">방장</span>}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">
              {STATUS_LABEL[member.status] ?? member.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
