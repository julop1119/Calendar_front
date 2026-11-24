import { apiClient } from './client'
import type { CalendarEvent, EventInput } from '../types'

export async function fetchEvents(groupId: number, from?: string, to?: string): Promise<CalendarEvent[]> {
  const { data } = await apiClient.get<CalendarEvent[]>(`/api/groups/${groupId}/events`, {
    params: from && to ? { from, to } : undefined,
  })
  return data
}

export async function createEvent(groupId: number, input: EventInput): Promise<CalendarEvent> {
  const { data } = await apiClient.post<CalendarEvent>(`/api/groups/${groupId}/events`, input)
  return data
}

export async function updateEvent(eventId: number, input: EventInput): Promise<CalendarEvent> {
  const { data } = await apiClient.put<CalendarEvent>(`/api/events/${eventId}`, input)
  return data
}

export async function deleteEvent(eventId: number): Promise<void> {
  await apiClient.delete(`/api/events/${eventId}`)
}
