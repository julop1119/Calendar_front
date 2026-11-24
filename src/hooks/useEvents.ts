import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createEvent, deleteEvent, fetchEvents, updateEvent } from '../api/events'
import type { EventInput } from '../types'

export function useEvents(groupId: number | null) {
  return useQuery({
    queryKey: ['events', groupId],
    queryFn: () => fetchEvents(groupId as number),
    enabled: groupId != null,
  })
}

export function useCreateEvent(groupId: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: EventInput) => createEvent(groupId as number, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', groupId] }),
  })
}

export function useUpdateEvent(groupId: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, input }: { eventId: number; input: EventInput }) => updateEvent(eventId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', groupId] }),
  })
}

export function useDeleteEvent(groupId: number | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: number) => deleteEvent(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', groupId] }),
  })
}
