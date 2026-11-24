import { CalendarPlus, Sparkles } from 'lucide-react'

interface AddActionSheetProps {
  onClose: () => void
  onManual: () => void
  onAi: () => void
}

export function AddActionSheet({ onClose, onManual, onAi }: AddActionSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-t-2xl bg-white p-4 pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
        <button
          onClick={onAi}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left hover:bg-gray-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            <p className="text-sm font-medium text-gray-900">AI로 약속 잡기</p>
            <p className="text-xs text-gray-500">"벤쿠버 다운타운에서 한식집 7시"처럼 말해보세요</p>
          </span>
        </button>
        <button
          onClick={onManual}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left hover:bg-gray-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <CalendarPlus className="h-5 w-5" />
          </span>
          <span>
            <p className="text-sm font-medium text-gray-900">직접 일정 추가</p>
            <p className="text-xs text-gray-500">제목, 장소, 시간을 직접 입력</p>
          </span>
        </button>
      </div>
    </div>
  )
}
