import { useEffect, useState } from 'react'
import { Bus, Footprints, Mail, MapPin, Plane, Plus, TrainFront } from 'lucide-react'
import { Geolocation } from '@capacitor/geolocation'
import { useReceivedNotes, useSentNotes, useUpdateMyLocation } from '../hooks/useNotes'
import { ComposeNoteModal } from '../components/notes/ComposeNoteModal'
import { NoteTrackingModal } from '../components/notes/NoteTrackingModal'
import { EmptyState } from '../components/common/EmptyState'
import { Spinner } from '../components/common/Spinner'
import { useTranslation, format } from '../i18n/useTranslation'
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

export function NotesPage() {
  const { t } = useTranslation()
  const STATUS_LABEL: Record<Note['status'], string> = {
    IN_TRANSIT: t.notesPage.statusInTransit,
    DELIVERED: t.notesPage.statusDelivered,
    LOST: t.notesPage.statusLost,
  }
  const [tab, setTab] = useState<'received' | 'sent'>('received')
  const [composing, setComposing] = useState(false)
  const [trackingId, setTrackingId] = useState<number | null>(null)

  const updateLocation = useUpdateMyLocation()
  const received = useReceivedNotes()
  const sent = useSentNotes()
  const [locationGranted, setLocationGranted] = useState(false)
  const [locationDenied, setLocationDenied] = useState(false)

  const shareLocation = async () => {
    try {
      const permission = await Geolocation.requestPermissions()
      if (permission.location !== 'granted' && permission.coarseLocation !== 'granted') {
        setLocationDenied(true)
        return
      }
      const position = await Geolocation.getCurrentPosition()
      updateLocation.mutate({ latitude: position.coords.latitude, longitude: position.coords.longitude })
      setLocationGranted(true)
      setLocationDenied(false)
    } catch {
      setLocationDenied(true)
    }
  }

  useEffect(() => {
    // 이미 허용된 상태라면 화면 진입 시마다 자동으로 최신 위치로 갱신한다.
    Geolocation.checkPermissions()
      .then((permission) => {
        if (permission.location === 'granted' || permission.coarseLocation === 'granted') {
          shareLocation()
        }
      })
      .catch(() => {
        /* 권한 확인 자체가 안 되는 환경이면 버튼으로 직접 요청하게 둔다 */
      })
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
            {key === 'received' ? t.notesPage.received : t.notesPage.sent}
          </button>
        ))}
      </div>

      {!locationGranted && (
        <button
          onClick={shareLocation}
          className="mx-4 mt-2 flex items-center gap-1.5 rounded-xl bg-primary-50 px-3 py-2 text-left text-xs font-medium text-primary-700"
        >
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {locationDenied ? t.notesPage.locationDenied : t.notesPage.locationHint}
        </button>
      )}

      <div className="flex flex-col gap-2 px-4 py-3">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : !notes || notes.length === 0 ? (
          <EmptyState
            icon={Mail}
            title={tab === 'received' ? t.notesPage.emptyReceived : t.notesPage.emptySent}
            description={t.notesPage.emptyDescription}
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
                    {tab === 'received'
                      ? format(t.notesPage.fromSomeone, { name: other.name })
                      : format(t.notesPage.toSomeone, { name: other.name })}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {note.content ??
                      (note.status === 'LOST' ? t.notesPage.contentHiddenLost : t.notesPage.contentHiddenInTransit)}
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
        aria-label={t.notesPage.sendNote}
      >
        <Plus className="h-6 w-6" />
      </button>

      {composing && <ComposeNoteModal onClose={() => setComposing(false)} />}
      {trackingId != null && <NoteTrackingModal noteId={trackingId} onClose={() => setTrackingId(null)} />}
    </div>
  )
}
