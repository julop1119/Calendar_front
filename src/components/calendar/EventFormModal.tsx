import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { TextField, TextAreaField } from '../common/Field'
import { useCreateEvent, useUpdateEvent } from '../../hooks/useEvents'
import { extractErrorMessage } from '../../api/client'
import { dateToInputValue, inputValueToIso, isoToInputValue } from '../../utils/date'
import type { CalendarEvent } from '../../types'

interface EventFormModalProps {
  groupId: number
  onClose: () => void
  event?: CalendarEvent
  defaultStart?: Date
  defaultEnd?: Date
}

export function EventFormModal({ groupId, onClose, event, defaultStart, defaultEnd }: EventFormModalProps) {
  const isEdit = !!event
  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [location, setLocation] = useState(event?.location ?? '')
  const [startTime, setStartTime] = useState(
    event ? isoToInputValue(event.startTime) : dateToInputValue(defaultStart ?? new Date()),
  )
  const [endTime, setEndTime] = useState(
    event
      ? isoToInputValue(event.endTime)
      : dateToInputValue(defaultEnd ?? new Date((defaultStart ?? new Date()).getTime() + 60 * 60 * 1000)),
  )
  const [error, setError] = useState<string | null>(null)

  const createEvent = useCreateEvent(groupId)
  const updateEvent = useUpdateEvent(groupId)
  const isSaving = createEvent.isPending || updateEvent.isPending

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('제목을 입력해주세요')
      return
    }
    if (!startTime || !endTime) {
      setError('시작/종료 시간을 입력해주세요')
      return
    }
    const input = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      startTime: inputValueToIso(startTime),
      endTime: inputValueToIso(endTime),
    }
    const onError = (err: unknown) => setError(extractErrorMessage(err, '일정을 저장하지 못했습니다'))

    if (isEdit) {
      updateEvent.mutate({ eventId: event.id, input }, { onSuccess: onClose, onError })
    } else {
      createEvent.mutate(input, { onSuccess: onClose, onError })
    }
  }

  return (
    <Modal
      title={isEdit ? '일정 수정' : '일정 추가'}
      onClose={onClose}
      footer={
        <Button className="w-full" isLoading={isSaving} onClick={handleSubmit}>
          저장
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <TextField label="제목" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        <TextField label="장소" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="선택 입력" />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="시작"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <TextField label="종료" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        <TextAreaField
          label="메모"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="선택 입력"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </Modal>
  )
}
