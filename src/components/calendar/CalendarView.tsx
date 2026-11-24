import { useMemo } from 'react'
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar'
import { format } from 'date-fns/format'
import { parse } from 'date-fns/parse'
import { startOfWeek } from 'date-fns/startOfWeek'
import { getDay } from 'date-fns/getDay'
import { ko } from 'date-fns/locale/ko'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-view.css'
import type { CalendarEvent } from '../../types'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ko }),
  getDay,
  locales: { ko },
})

interface BigCalendarEvent {
  title: string
  start: Date
  end: Date
  resource: CalendarEvent
}

interface CalendarViewProps {
  events: CalendarEvent[]
  view: View
  date: Date
  onViewChange: (view: View) => void
  onNavigate: (date: Date) => void
  onSelectEvent: (event: CalendarEvent) => void
  onSelectSlot: (range: { start: Date; end: Date }) => void
}

export function CalendarView({
  events,
  view,
  date,
  onViewChange,
  onNavigate,
  onSelectEvent,
  onSelectSlot,
}: CalendarViewProps) {
  const items = useMemo<BigCalendarEvent[]>(
    () =>
      events.map((event) => ({
        title: event.title,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
        resource: event,
      })),
    [events],
  )

  return (
    <div className="flex-1 px-2 pb-24 pt-2">
      <div className="calendar-view h-[calc(100dvh-9rem)] min-h-[32rem] rounded-2xl bg-white p-2 shadow-sm sm:p-3">
        <Calendar
          localizer={localizer}
          culture="ko"
          events={items}
          view={view}
          date={date}
          onView={onViewChange}
          onNavigate={onNavigate}
          views={['month', 'week']}
          selectable
          popup
          onSelectEvent={(e) => onSelectEvent((e as BigCalendarEvent).resource)}
          onSelectSlot={(slot) => onSelectSlot({ start: slot.start, end: slot.end })}
          style={{ height: '100%' }}
          messages={{
            next: '다음',
            previous: '이전',
            today: '오늘',
            month: '월',
            week: '주',
            noEventsInRange: '일정이 없습니다',
            showMore: (count) => `+${count}개 더보기`,
          }}
        />
      </div>
    </div>
  )
}
