import { apiClient } from './client'
import type { AiParseResult, CalendarEvent, EventConfirmInput } from '../types'

export async function parseEventIntent(groupId: number, text: string): Promise<AiParseResult> {
  const { data } = await apiClient.post<AiParseResult>(`/api/groups/${groupId}/ai/events/parse`, { text })
  return data
}

export async function confirmAiEvent(groupId: number, input: EventConfirmInput): Promise<CalendarEvent> {
  const { data } = await apiClient.post<CalendarEvent>(`/api/groups/${groupId}/ai/events/confirm`, input)
  return data
}
