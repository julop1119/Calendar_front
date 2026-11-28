import { useEffect, useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import type { View } from 'react-big-calendar'
import { useGroupContext } from '../context/GroupContext'
import { useEvents } from '../hooks/useEvents'
import { CalendarView } from '../components/calendar/CalendarView'
import { EventFormModal } from '../components/calendar/EventFormModal'
import { EventDetailModal } from '../components/calendar/EventDetailModal'
import { AddActionSheet } from '../components/calendar/AddActionSheet'
import { AiPlannerModal } from '../components/ai/AiPlannerModal'
import { FullScreenSpinner } from '../components/common/Spinner'
import { EmptyState } from '../components/common/EmptyState'
import { useTranslation } from '../i18n/useTranslation'
import { useSettings } from '../context/SettingsContext'
import { syncCalendarWidget } from '../plugins/widgetBridge'
import type { CalendarEvent } from '../types'

type Sheet =
  | { kind: 'none' }
  | { kind: 'actions'; slot?: { start: Date; end: Date } }
  | { kind: 'manual'; slot?: { start: Date; end: Date } }
  | { kind: 'ai' }
  | { kind: 'detail'; event: CalendarEvent }

export function CalendarPage() {
  const { selectedGroupId, isLoading: groupsLoading } = useGroupContext()
  const { data: events = [], isLoading: eventsLoading } = useEvents(selectedGroupId)
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())
  const [sheet, setSheet] = useState<Sheet>({ kind: 'none' })
  const { t } = useTranslation()
  const { region } = useSettings()

  useEffect(() => {
    syncCalendarWidget(events, region)
  }, [events, region])

  if (groupsLoading) {
    return <FullScreenSpinner />
  }

  if (!selectedGroupId) {
    return (
      <EmptyState
        icon={CalendarDays}
        title={t.calendarPage.emptyTitle}
        description={t.calendarPage.emptyDescription}
      />
    )
  }

  return (
    <div className="relative flex flex-1 flex-col">
      {eventsLoading ? (
        <FullScreenSpinner />
      ) : (
        <CalendarView
          events={events}
          view={view}
          date={date}
          onViewChange={setView}
          onNavigate={setDate}
          onSelectEvent={(event) => setSheet({ kind: 'detail', event })}
          onSelectSlot={(slot) => setSheet({ kind: 'actions', slot })}
        />
      )}

      <button
        onClick={() => setSheet({ kind: 'actions' })}
        className="fixed bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700"
        aria-label={t.calendarPage.addEvent}
      >
        <Plus className="h-6 w-6" />
      </button>

      {sheet.kind === 'actions' && (
        <AddActionSheet
          onClose={() => setSheet({ kind: 'none' })}
          onManual={() => setSheet({ kind: 'manual', slot: sheet.slot })}
          onAi={() => setSheet({ kind: 'ai' })}
        />
      )}

      {sheet.kind === 'manual' && (
        <EventFormModal
          groupId={selectedGroupId}
          defaultStart={sheet.slot?.start}
          defaultEnd={sheet.slot?.end}
          onClose={() => setSheet({ kind: 'none' })}
        />
      )}

      {sheet.kind === 'ai' && (
        <AiPlannerModal groupId={selectedGroupId} onClose={() => setSheet({ kind: 'none' })} />
      )}

      {sheet.kind === 'detail' && (
        <EventDetailModal
          groupId={selectedGroupId}
          event={sheet.event}
          onClose={() => setSheet({ kind: 'none' })}
        />
      )}
    </div>
  )
}
