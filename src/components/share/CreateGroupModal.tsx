import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { TextField } from '../common/Field'
import { useCreateGroup } from '../../hooks/useGroups'
import { extractErrorMessage } from '../../api/client'
import { useTranslation } from '../../i18n/useTranslation'

interface CreateGroupModalProps {
  onClose: () => void
  onCreated: (groupId: number) => void
}

export function CreateGroupModal({ onClose, onCreated }: CreateGroupModalProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const createGroup = useCreateGroup()

  const handleSubmit = () => {
    if (!title.trim()) {
      setError(t.createGroup.nameRequired)
      return
    }
    createGroup.mutate(title.trim(), {
      onSuccess: (group) => {
        onCreated(group.id)
        onClose()
      },
      onError: (err) => setError(extractErrorMessage(err, t.createGroup.createFailed)),
    })
  }

  return (
    <Modal
      title={t.createGroup.title}
      onClose={onClose}
      footer={
        <Button className="w-full" isLoading={createGroup.isPending} onClick={handleSubmit}>
          {t.createGroup.create}
        </Button>
      }
    >
      <TextField
        label={t.createGroup.nameLabel}
        placeholder={t.createGroup.namePlaceholder}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={error ?? undefined}
        autoFocus
      />
    </Modal>
  )
}
