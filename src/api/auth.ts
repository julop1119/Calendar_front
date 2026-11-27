import { apiClient } from './client'
import type { UserSummary } from '../types'

export function googleLoginUrl(platform?: string): string {
  const base = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`
  return platform ? `${base}?platform=${encodeURIComponent(platform)}` : base
}

export async function fetchMe(): Promise<UserSummary> {
  const { data } = await apiClient.get<UserSummary>('/api/auth/me')
  return data
}
