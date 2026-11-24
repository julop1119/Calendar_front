import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNoteTracking, fetchReceivedNotes, fetchSentNotes, sendNote, updateMyLocation } from '../api/notes'
import type { NoteSendInput } from '../types'

export function useSentNotes() {
  return useQuery({
    queryKey: ['notes', 'sent'],
    queryFn: fetchSentNotes,
    refetchInterval: 15_000,
  })
}

export function useReceivedNotes() {
  return useQuery({
    queryKey: ['notes', 'received'],
    queryFn: fetchReceivedNotes,
    refetchInterval: 15_000,
  })
}

export function useNoteTracking(noteId: number | null) {
  return useQuery({
    queryKey: ['notes', noteId, 'tracking'],
    queryFn: () => fetchNoteTracking(noteId as number),
    enabled: noteId != null,
    refetchInterval: (query) => (query.state.data?.status === 'IN_TRANSIT' ? 2_000 : false),
  })
}

export function useSendNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NoteSendInput) => sendNote(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', 'sent'] }),
  })
}

export function useUpdateMyLocation() {
  return useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
      updateMyLocation(latitude, longitude),
  })
}
