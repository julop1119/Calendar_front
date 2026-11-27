import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { TextField, TextAreaField } from '../common/Field'
import { useCreateEvent, useUpdateEvent } from '../../hooks/useEvents'
import { extractErrorMessage } from '../../api/client'
import { dateToInputValue, inputValueToIso, isoToInputValue } from '../../utils/date'
import { useTranslation } from '../../i18n/useTranslation'
import type { CalendarEvent } from '../../types'

interface EventFormModalProps {
  groupId: number
  onClose: () => void
  event?: CalendarEvent
  defaultStart?: Date
  defaultEnd?: Date
}

export function EventFormModal({ groupId, onClose, event, defaultStart, defaultEnd }: EventFormModalProps) {
  const { t } = useTranslation()
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
      setError(t.eventForm.titleRequired)
      return
    }
    if (!startTime || !endTime) {
      setError(t.eventForm.timeRequired)
      return
    }
    const input = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      startTime: inputValueToIso(startTime),
      endTime: inputValueToIso(endTime),
    }
    const onError = (err: unknown) => setError(extractErrorMessage(err, t.eventForm.saveFailed))

    if (isEdit) {
      updateEvent.mutate({ eventId: event.id, input }, { onSuccess: onClose, onError })
    } else {
      createEvent.mutate(input, { onSuccess: onClose, onError })
    }
  }

  return (
    <Modal
      title={isEdit ? t.eventForm.editTitle : t.eventForm.createTitle}
      onClose={onClose}
      footer={
        <Button className="w-full" isLoading={isSaving} onClick={handleSubmit}>
          {t.common.save}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <TextField label={t.eventForm.titleLabel} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        <TextField
          label={t.eventForm.locationLabel}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t.eventForm.optionalPlaceholder}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={t.eventForm.startLabel}
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <TextField
            label={t.eventForm.endLabel}
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <TextAreaField
          label={t.eventForm.memoLabel}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.eventForm.optionalPlaceholder}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </Modal>
  )
}
