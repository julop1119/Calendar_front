import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { TextField } from '../common/Field'
import { useCreateGroup } from '../../hooks/useGroups'
import { extractErrorMessage } from '../../api/client'

interface CreateGroupModalProps {
  onClose: () => void
  onCreated: (groupId: number) => void
}

export function CreateGroupModal({ onClose, onCreated }: CreateGroupModalProps) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const createGroup = useCreateGroup()

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('캘린더 이름을 입력해주세요')
      return
    }
    createGroup.mutate(title.trim(), {
      onSuccess: (group) => {
        onCreated(group.id)
        onClose()
      },
      onError: (err) => setError(extractErrorMessage(err, '캘린더를 만들지 못했습니다')),
    })
  }

  return (
    <Modal
      title="새 캘린더 만들기"
      onClose={onClose}
      footer={
        <Button className="w-full" isLoading={createGroup.isPending} onClick={handleSubmit}>
          만들기
        </Button>
      }
    >
      <TextField
        label="캘린더 이름"
        placeholder="예: 우리 가족 캘린더"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={error ?? undefined}
        autoFocus
      />
    </Modal>
  )
}
