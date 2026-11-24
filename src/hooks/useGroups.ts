import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createGroup, fetchGroupMembers, fetchMyGroups } from '../api/groups'

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: fetchMyGroups,
  })
}

export function useGroupMembers(groupId: number | null) {
  return useQuery({
    queryKey: ['groups', groupId, 'members'],
    queryFn: () => fetchGroupMembers(groupId as number),
    enabled: groupId != null,
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => createGroup(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
