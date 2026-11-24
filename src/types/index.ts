export type MemberRole = 'OWNER' | 'MEMBER'
export type MemberStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

export interface UserSummary {
  id: number
  email: string
  name: string
  profileImageUrl: string | null
}

export interface Group {
  id: number
  title: string
  myRole: MemberRole
  memberCount: number
  createdAt: string
}

export interface Member {
  id: number
  user: UserSummary
  role: MemberRole
  status: MemberStatus
  groupId: number
  groupTitle: string
}

export interface CalendarEvent {
  id: number
  title: string
  description: string | null
  location: string | null
  placeId: string | null
  latitude: number | null
  longitude: number | null
  startTime: string
  endTime: string
  groupId: number
  creator: UserSummary
}

export interface EventInput {
  title: string
  description?: string | null
  location?: string | null
  startTime: string
  endTime: string
}

export interface PlaceCandidate {
  placeId: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  rating: number | null
}

export interface AiParseResult {
  title: string
  startTime: string | null
  endTime: string | null
  candidates: PlaceCandidate[]
}

export interface EventConfirmInput {
  title: string
  description?: string | null
  startTime: string
  endTime: string
  placeId: string
  placeName: string
  address?: string | null
  latitude?: number | null
  longitude?: number | null
}

export interface ApiError {
  message: string
}

export type TransportMode = 'WALK' | 'BUS' | 'SUBWAY' | 'PLANE'
export type NoteStatus = 'IN_TRANSIT' | 'DELIVERED' | 'LOST'

export interface NoteSendInput {
  recipientId: number
  content: string
  transportMode: TransportMode
}

export interface Note {
  id: number
  sender: UserSummary
  recipient: UserSummary
  transportMode: TransportMode
  distanceKm: number
  sentAt: string
  status: NoteStatus
  progressPercent: number
  content: string | null
}

export interface NoteTracking {
  id: number
  transportMode: TransportMode
  status: NoteStatus
  distanceKm: number
  progressPercent: number
  elapsedSeconds: number
  remainingSeconds: number
  currentLatitude: number | null
  currentLongitude: number | null
  originLatitude: number
  originLongitude: number
  destinationLatitude: number
  destinationLongitude: number
}
