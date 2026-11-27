import { useState } from 'react'
import { ArrowLeft, MapPin, Sparkles, Star } from 'lucide-react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { TextAreaField, TextField } from '../common/Field'
import { useConfirmAiEvent, useParseEventIntent } from '../../hooks/useAi'
import { extractErrorMessage } from '../../api/client'
import { dateToInputValue, inputValueToIso, isoToInputValue } from '../../utils/date'
import { useTranslation, format } from '../../i18n/useTranslation'
import type { AiParseResult, PlaceCandidate } from '../../types'

interface AiPlannerModalProps {
  groupId: number
  onClose: () => void
}

type Step =
  | { kind: 'input' }
  | { kind: 'candidates'; result: AiParseResult }
  | { kind: 'confirm'; result: AiParseResult; candidate: PlaceCandidate }

export function AiPlannerModal({ groupId, onClose }: AiPlannerModalProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [step, setStep] = useState<Step>({ kind: 'input' })
  const [error, setError] = useState<string | null>(null)

  const parseIntent = useParseEventIntent(groupId)
  const confirmEvent = useConfirmAiEvent(groupId)

  const handleParse = () => {
    if (!text.trim()) {
      setError(t.ai.contentRequired)
      return
    }
    setError(null)
    parseIntent.mutate(text.trim(), {
      onSuccess: (result) => setStep({ kind: 'candidates', result }),
      onError: (err) => setError(extractErrorMessage(err, t.ai.parseFailed)),
    })
  }

  if (step.kind === 'input') {
    return (
      <Modal
        title={t.ai.modalTitle}
        onClose={onClose}
        footer={
          <Button className="w-full" isLoading={parseIntent.isPending} onClick={handleParse}>
            <Sparkles className="h-4 w-4" />
            {t.ai.recommend}
          </Button>
        }
      >
        <TextAreaField
          label={t.ai.contentLabel}
          rows={3}
          autoFocus
          placeholder={t.ai.contentPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </Modal>
    )
  }

  if (step.kind === 'candidates') {
    return (
      <Modal title={t.ai.candidatesTitle} onClose={onClose}>
        <p className="mb-3 text-sm text-gray-500">{format(t.ai.candidatesHint, { title: step.result.title })}</p>
        {step.result.candidates.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">{t.ai.noCandidates}</p>
        )}
        <div className="flex flex-col gap-2">
          {step.result.candidates.map((candidate) => (
            <button
              key={candidate.placeId}
              onClick={() => setStep({ kind: 'confirm', result: step.result, candidate })}
              className="flex flex-col gap-1 rounded-xl border border-gray-100 px-4 py-3 text-left hover:border-primary-300 hover:bg-primary-50/40"
            >
              <span className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{candidate.name}</span>
                {candidate.rating != null && (
                  <span className="flex items-center gap-0.5 text-xs text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {candidate.rating.toFixed(1)}
                  </span>
                )}
              </span>
              {candidate.address && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {candidate.address}
                </span>
              )}
            </button>
          ))}
        </div>
      </Modal>
    )
  }

  return (
    <ConfirmStep
      groupId={groupId}
      result={step.result}
      candidate={step.candidate}
      onBack={() => setStep({ kind: 'candidates', result: step.result })}
      onClose={onClose}
      confirmEvent={confirmEvent}
    />
  )
}

interface ConfirmStepProps {
  groupId: number
  result: AiParseResult
  candidate: PlaceCandidate
  onBack: () => void
  onClose: () => void
  confirmEvent: ReturnType<typeof useConfirmAiEvent>
}

function ConfirmStep({ result, candidate, onBack, onClose, confirmEvent }: ConfirmStepProps) {
  const { t } = useTranslation()
  const now = new Date()
  const [title, setTitle] = useState(result.title)
  const [startTime, setStartTime] = useState(
    result.startTime ? isoToInputValue(result.startTime) : dateToInputValue(now),
  )
  const [endTime, setEndTime] = useState(
    result.endTime ? isoToInputValue(result.endTime) : dateToInputValue(new Date(now.getTime() + 60 * 60 * 1000)),
  )
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = () => {
    if (!title.trim() || !startTime || !endTime) {
      setError(t.ai.checkTitleAndTime)
      return
    }
    confirmEvent.mutate(
      {
        title: title.trim(),
        startTime: inputValueToIso(startTime),
        endTime: inputValueToIso(endTime),
        placeId: candidate.placeId,
        placeName: candidate.name,
        address: candidate.address,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
      },
      {
        onSuccess: onClose,
        onError: (err) => setError(extractErrorMessage(err, t.ai.registerFailed)),
      },
    )
  }

  return (
    <Modal
      title={t.ai.confirmTitle}
      onClose={onClose}
      footer={
        <Button className="w-full" isLoading={confirmEvent.isPending} onClick={handleConfirm}>
          {t.ai.registerHere}
        </Button>
      }
    >
      <button onClick={onBack} className="mb-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.ai.pickAnother}
      </button>
      <div className="mb-4 rounded-xl bg-gray-50 px-4 py-3">
        <p className="font-medium text-gray-900">{candidate.name}</p>
        {candidate.address && <p className="text-xs text-gray-500">{candidate.address}</p>}
      </div>
      <div className="flex flex-col gap-3">
        <TextField label={t.ai.titleLabel} value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={t.ai.startLabel}
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <TextField label={t.ai.endLabel} type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </Modal>
  )
}
