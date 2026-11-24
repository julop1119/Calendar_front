import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Bus, Footprints, Plane, Search, TrainFront, X } from 'lucide-react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { TextAreaField } from '../common/Field'
import { searchUsers } from '../../api/users'
import { useSendNote } from '../../hooks/useNotes'
import { extractErrorMessage } from '../../api/client'
import type { TransportMode, UserSummary } from '../../types'

interface ComposeNoteModalProps {
  onClose: () => void
}

const MODE_OPTIONS: { mode: TransportMode; label: string; hint: string; icon: typeof Footprints }[] = [
  { mode: 'WALK', label: '걷기', hint: '6km/h · 1km당 10분', icon: Footprints },
  { mode: 'BUS', label: '버스', hint: '30km/h · 1km당 2분', icon: Bus },
  { mode: 'SUBWAY', label: '지하철', hint: '40km/h · 1km당 1.5분', icon: TrainFront },
  { mode: 'PLANE', label: '비행기', hint: '36000km/h · 1km당 0.1초', icon: Plane },
]

export function ComposeNoteModal({ onClose }: ComposeNoteModalProps) {
  const [recipient, setRecipient] = useState<UserSummary | null>(null)
  const [query, setQuery] = useState('')
  const [content, setContent] = useState('')
  const [mode, setMode] = useState<TransportMode>('WALK')
  const [error, setError] = useState<string | null>(null)

  const search = useMutation({ mutationFn: (q: string) => searchUsers(q) })
  const sendNote = useSendNote()

  const handleSearch = () => {
    if (!query.trim()) return
    search.mutate(query.trim())
  }

  const handleSend = () => {
    if (!recipient) {
      setError('받는 사람을 선택해주세요')
      return
    }
    if (!content.trim()) {
      setError('쪽지 내용을 입력해주세요')
      return
    }
    setError(null)
    sendNote.mutate(
      { recipientId: recipient.id, content: content.trim(), transportMode: mode },
      {
        onSuccess: onClose,
        onError: (err) => setError(extractErrorMessage(err, '쪽지를 보내지 못했어요')),
      },
    )
  }

  return (
    <Modal
      title="쪽지 보내기"
      onClose={onClose}
      footer={
        <Button className="w-full" isLoading={sendNote.isPending} onClick={handleSend}>
          쪽지 보내기
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">받는 사람</span>
          {recipient ? (
            <div className="flex items-center justify-between rounded-xl bg-primary-50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{recipient.name}</p>
                <p className="text-xs text-gray-500">{recipient.email}</p>
              </div>
              <button onClick={() => setRecipient(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="이메일 또는 이름으로 검색"
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <Button variant="secondary" isLoading={search.isPending} onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-col gap-1">
                {search.data?.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setRecipient(user)}
                    className="flex flex-col rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <TextAreaField
          label="내용"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="전할 말을 적어주세요"
        />

        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">보내는 방법</span>
          <div className="grid grid-cols-2 gap-2">
            {MODE_OPTIONS.map(({ mode: m, label, hint, icon: Icon }) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  mode === m ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${mode === m ? 'text-primary-600' : 'text-gray-500'}`} />
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <span className="text-[11px] text-gray-400">{hint}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </Modal>
  )
}
