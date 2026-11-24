import { Bus, Footprints, MapPin, Plane, TrainFront } from 'lucide-react'
import { Modal } from '../common/Modal'
import { Spinner } from '../common/Spinner'
import { useNoteTracking } from '../../hooks/useNotes'
import type { TransportMode } from '../../types'

interface NoteTrackingModalProps {
  noteId: number
  onClose: () => void
}

const MODE_META: Record<TransportMode, { label: string; icon: typeof Footprints }> = {
  WALK: { label: '걷는 중', icon: Footprints },
  BUS: { label: '버스로 이동 중', icon: Bus },
  SUBWAY: { label: '지하철로 이동 중', icon: TrainFront },
  PLANE: { label: '비행 중', icon: Plane },
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 1) return '곧'
  if (totalSeconds < 60) return `${totalSeconds}초`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return seconds > 0 ? `${minutes}분 ${seconds}초` : `${minutes}분`
}

export function NoteTrackingModal({ noteId, onClose }: NoteTrackingModalProps) {
  const { data: tracking, isLoading } = useNoteTracking(noteId)

  return (
    <Modal title="쪽지 상황" onClose={onClose}>
      {isLoading || !tracking ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <TrackingBody tracking={tracking} />
      )}
    </Modal>
  )
}

function TrackingBody({ tracking }: { tracking: NonNullable<ReturnType<typeof useNoteTracking>['data']> }) {
  const meta = MODE_META[tracking.transportMode]
  const Icon = meta.icon

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full ${
          tracking.status === 'LOST' ? 'bg-gray-100 text-gray-400' : 'bg-primary-50 text-primary-600'
        }`}
      >
        <Icon className="h-8 w-8" />
      </div>

      {tracking.status === 'IN_TRANSIT' && (
        <>
          <p className="text-sm font-medium text-gray-900">{meta.label}...</p>
          <div className="w-full">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-primary-600 transition-all"
                style={{ width: `${Math.min(100, tracking.progressPercent)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              {tracking.distanceKm.toFixed(1)}km 중 {Math.round(tracking.progressPercent)}% 이동 ·{' '}
              {formatDuration(tracking.remainingSeconds)} 남음
            </p>
          </div>
          {tracking.currentLatitude != null && tracking.currentLongitude != null && (
            <a
              href={`https://www.google.com/maps?q=${tracking.currentLatitude},${tracking.currentLongitude}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline"
            >
              <MapPin className="h-3.5 w-3.5" />
              현재 위치 지도에서 보기
            </a>
          )}
        </>
      )}

      {tracking.status === 'DELIVERED' && (
        <p className="text-sm font-medium text-gray-900">쪽지가 도착했어요! 📬</p>
      )}

      {tracking.status === 'LOST' && (
        <>
          <p className="text-sm font-medium text-gray-900">쪽지가 길을 잃고 사라졌어요... 💨</p>
          <p className="text-xs text-gray-400">아주 가끔 일어나는 일이에요</p>
        </>
      )}
    </div>
  )
}
