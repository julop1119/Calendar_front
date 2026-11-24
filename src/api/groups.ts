import { apiClient } from './client'
import type { Group, Member } from '../types'

export async function fetchMyGroups(): Promise<Group[]> {
  const { data } = await apiClient.get<Group[]>('/api/groups/me')
  return data
}

export async function createGroup(title: string): Promise<Group> {
  const { data } = await apiClient.post<Group>('/api/groups', { title })
  return data
}

export async function fetchGroupMembers(groupId: number): Promise<Member[]> {
  const { data } = await apiClient.get<Member[]>(`/api/groups/${groupId}/members`)
  return data
}
