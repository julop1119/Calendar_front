import { apiClient } from './client'
import type { Member } from '../types'

export async function inviteMember(groupId: number, email: string): Promise<Member> {
  const { data } = await apiClient.post<Member>(`/api/groups/${groupId}/invites`, { email })
  return data
}

export async function fetchMyInvites(): Promise<Member[]> {
  const { data } = await apiClient.get<Member[]>('/api/invites/me')
  return data
}

export async function acceptInvite(memberId: number): Promise<Member> {
  const { data } = await apiClient.post<Member>(`/api/invites/${memberId}/accept`)
  return data
}

export async function declineInvite(memberId: number): Promise<Member> {
  const { data } = await apiClient.post<Member>(`/api/invites/${memberId}/decline`)
  return data
}
