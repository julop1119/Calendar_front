import { useMutation, useQueryClient } from '@tanstack/react-query'
import { confirmAiEvent, parseEventIntent } from '../api/ai'
import type { EventConfirmInput } from '../types'

export function useParseEventIntent(groupId: number) {
  return useMutation({
    mutationFn: (text: string) => parseEventIntent(groupId, text),
  })
}

export function useConfirmAiEvent(groupId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: EventConfirmInput) => confirmAiEvent(groupId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', groupId] }),
  })
}
