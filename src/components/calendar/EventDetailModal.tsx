import { useState } from 'react'
import { Clock, MapPin, Sparkles, User as UserIcon } from 'lucide-react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { useDeleteEvent } from '../../hooks/useEvents'
import { EventFormModal } from './EventFormModal'
import type { CalendarEvent } from '../../types'

interface EventDetailModalProps {
  groupId: number
  event: CalendarEvent
  onClose: () => void
}

function formatRange(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const dateLabel = start.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  const timeFormat = (d: Date) => d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })
  return `${dateLabel} · ${timeFormat(start)} - ${timeFormat(end)}`
}

export function EventDetailModal({ groupId, event, onClose }: EventDetailModalProps) {
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const deleteEvent = useDeleteEvent(groupId)

  if (editing) {
    return <EventFormModal groupId={groupId} event={event} onClose={onClose} />
  }

  return (
    <Modal
      title="일정"
      onClose={onClose}
      footer={
        confirmingDelete ? (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmingDelete(false)}>
              취소
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              isLoading={deleteEvent.isPending}
              onClick={() => deleteEvent.mutate(event.id, { onSuccess: onClose })}
            >
              삭제 확인
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setEditing(true)}>
              수정
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => setConfirmingDelete(true)}>
              삭제
            </Button>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
          {event.placeId && (
            <span className="flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-600">
              <Sparkles className="h-3 w-3" />
              AI 추천
            </span>
          )}
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          {formatRange(event.startTime, event.endTime)}
        </div>
        {event.location && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            {event.location}
          </div>
        )}
        {event.description && <p className="whitespace-pre-wrap text-sm text-gray-500">{event.description}</p>}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <UserIcon className="h-3.5 w-3.5" />
          {event.creator.name}님이 등록
        </div>
      </div>
    </Modal>
  )
}
