import { apiClient } from './client'
import type { UserSummary } from '../types'

export async function searchUsers(query: string): Promise<UserSummary[]> {
  const { data } = await apiClient.get<UserSummary[]>('/api/users/search', { params: { q: query } })
  return data
}
