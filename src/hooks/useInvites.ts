import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { acceptInvite, declineInvite, fetchMyInvites, inviteMember } from '../api/invites'

export function useMyInvites() {
  return useQuery({
    queryKey: ['invites', 'me'],
    queryFn: fetchMyInvites,
  })
}

export function useInviteMember(groupId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => inviteMember(groupId, email),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'members'] }),
  })
}

export function useRespondInvite() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['invites', 'me'] })
    queryClient.invalidateQueries({ queryKey: ['groups'] })
  }
  const accept = useMutation({
    mutationFn: (memberId: number) => acceptInvite(memberId),
    onSuccess: invalidate,
  })
  const decline = useMutation({
    mutationFn: (memberId: number) => declineInvite(memberId),
    onSuccess: invalidate,
  })
  return { accept, decline }
}
