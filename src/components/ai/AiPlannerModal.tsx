import { useState } from 'react'
import { ArrowLeft, MapPin, Sparkles, Star } from 'lucide-react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { TextAreaField, TextField } from '../common/Field'
import { useConfirmAiEvent, useParseEventIntent } from '../../hooks/useAi'
import { extractErrorMessage } from '../../api/client'
import { dateToInputValue, inputValueToIso, isoToInputValue } from '../../utils/date'
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
  const [text, setText] = useState('')
  const [step, setStep] = useState<Step>({ kind: 'input' })
  const [error, setError] = useState<string | null>(null)

  const parseIntent = useParseEventIntent(groupId)
  const confirmEvent = useConfirmAiEvent(groupId)

  const handleParse = () => {
    if (!text.trim()) {
      setError('약속 내용을 입력해주세요')
      return
    }
    setError(null)
    parseIntent.mutate(text.trim(), {
      onSuccess: (result) => setStep({ kind: 'candidates', result }),
      onError: (err) => setError(extractErrorMessage(err, 'AI 추천에 실패했습니다')),
    })
  }

  if (step.kind === 'input') {
    return (
      <Modal
        title="AI로 약속 잡기"
        onClose={onClose}
        footer={
          <Button className="w-full" isLoading={parseIntent.isPending} onClick={handleParse}>
            <Sparkles className="h-4 w-4" />
            추천받기
          </Button>
        }
      >
        <TextAreaField
          label="약속 내용을 말해주세요"
          rows={3}
          autoFocus
          placeholder="예: 벤쿠버 다운타운에서 한식집 7시 약속"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </Modal>
    )
  }

  if (step.kind === 'candidates') {
    return (
      <Modal title="추천 장소" onClose={onClose}>
        <p className="mb-3 text-sm text-gray-500">"{step.result.title}" 후보 중 하나를 골라주세요</p>
        {step.result.candidates.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">추천할 장소를 찾지 못했어요</p>
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
      setError('제목과 시간을 확인해주세요')
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
        onError: (err) => setError(extractErrorMessage(err, '일정을 등록하지 못했습니다')),
      },
    )
  }

  return (
    <Modal
      title="일정 확인"
      onClose={onClose}
      footer={
        <Button className="w-full" isLoading={confirmEvent.isPending} onClick={handleConfirm}>
          이 장소로 일정 등록
        </Button>
      }
    >
      <button onClick={onBack} className="mb-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
        <ArrowLeft className="h-3.5 w-3.5" />
        다른 장소 고르기
      </button>
      <div className="mb-4 rounded-xl bg-gray-50 px-4 py-3">
        <p className="font-medium text-gray-900">{candidate.name}</p>
        {candidate.address && <p className="text-xs text-gray-500">{candidate.address}</p>}
      </div>
      <div className="flex flex-col gap-3">
        <TextField label="제목" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="시작"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <TextField label="종료" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </Modal>
  )
}
