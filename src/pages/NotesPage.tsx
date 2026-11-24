import { useEffect, useState } from 'react'
import { Bus, Footprints, Mail, Plane, Plus, TrainFront } from 'lucide-react'
import { useReceivedNotes, useSentNotes, useUpdateMyLocation } from '../hooks/useNotes'
import { ComposeNoteModal } from '../components/notes/ComposeNoteModal'
import { NoteTrackingModal } from '../components/notes/NoteTrackingModal'
import { EmptyState } from '../components/common/EmptyState'
import { Spinner } from '../components/common/Spinner'
import type { Note, TransportMode } from '../types'

const MODE_ICON: Record<TransportMode, typeof Footprints> = {
  WALK: Footprints,
  BUS: Bus,
  SUBWAY: TrainFront,
  PLANE: Plane,
}

const STATUS_BADGE: Record<Note['status'], string> = {
  IN_TRANSIT: 'bg-blue-50 text-blue-600',
  DELIVERED: 'bg-green-50 text-green-600',
  LOST: 'bg-gray-100 text-gray-400',
}

const STATUS_LABEL: Record<Note['status'], string> = {
  IN_TRANSIT: '배송중',
  DELIVERED: '도착',
  LOST: '사라짐',
}

export function NotesPage() {
  const [tab, setTab] = useState<'received' | 'sent'>('received')
  const [composing, setComposing] = useState(false)
  const [trackingId, setTrackingId] = useState<number | null>(null)

  const updateLocation = useUpdateMyLocation()
  const received = useReceivedNotes()
  const sent = useSentNotes()

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => updateLocation.mutate({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => {
        /* 위치 권한을 거부하면 조용히 무시 */
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const notes = tab === 'received' ? received.data : sent.data
  const isLoading = tab === 'received' ? received.isLoading : sent.isLoading

  return (
    <div className="relative flex flex-1 flex-col pb-24">
      <div className="flex gap-1 px-4 pt-3">
        {(['received', 'sent'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              tab === key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {key === 'received' ? '받은 쪽지' : '보낸 쪽지'}
          </button>
        ))}
      </div>

      {!navigator.geolocation ? null : updateLocation.isError ? (
        <p className="px-4 pt-2 text-xs text-gray-400">위치 공유를 허용하면 쪽지를 주고받을 수 있어요</p>
      ) : null}

      <div className="flex flex-col gap-2 px-4 py-3">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : !notes || notes.length === 0 ? (
          <EmptyState
            icon={Mail}
            title={tab === 'received' ? '받은 쪽지가 없어요' : '보낸 쪽지가 없어요'}
            description="우하단 + 버튼으로 쪽지를 보내보세요"
          />
        ) : (
          notes.map((note) => {
            const Icon = MODE_ICON[note.transportMode]
            const other = tab === 'received' ? note.sender : note.recipient
            return (
              <button
                key={note.id}
                onClick={() => setTrackingId(note.id)}
                className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-left shadow-sm hover:bg-gray-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {tab === 'received' ? `${other.name}님이 보냄` : `${other.name}님에게`}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {note.content ?? (note.status === 'LOST' ? '내용을 다시 볼 수 없어요' : '내용은 도착해야 볼 수 있어요')}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[note.status]}`}>
                  {STATUS_LABEL[note.status]}
                </span>
              </button>
            )
          })
        )}
      </div>

      <button
        onClick={() => setComposing(true)}
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700"
        aria-label="쪽지 보내기"
      >
        <Plus className="h-6 w-6" />
      </button>

      {composing && <ComposeNoteModal onClose={() => setComposing(false)} />}
      {trackingId != null && <NoteTrackingModal noteId={trackingId} onClose={() => setTrackingId(null)} />}
    </div>
  )
}
