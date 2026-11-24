import { apiClient } from './client'
import type { Note, NoteSendInput, NoteTracking } from '../types'

export async function updateMyLocation(latitude: number, longitude: number): Promise<void> {
  await apiClient.put('/api/users/me/location', { latitude, longitude })
}

export async function sendNote(input: NoteSendInput): Promise<Note> {
  const { data } = await apiClient.post<Note>('/api/notes', input)
  return data
}

export async function fetchSentNotes(): Promise<Note[]> {
  const { data } = await apiClient.get<Note[]>('/api/notes/sent')
  return data
}

export async function fetchReceivedNotes(): Promise<Note[]> {
  const { data } = await apiClient.get<Note[]>('/api/notes/received')
  return data
}

export async function fetchNoteTracking(noteId: number): Promise<NoteTracking> {
  const { data } = await apiClient.get<NoteTracking>(`/api/notes/${noteId}/tracking`)
  return data
}
