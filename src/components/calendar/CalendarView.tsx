import { useMemo } from 'react'
import { Calendar, dateFnsLocalizer, type DateHeaderProps, type View } from 'react-big-calendar'
import { format } from 'date-fns/format'
import { parse } from 'date-fns/parse'
import { startOfWeek } from 'date-fns/startOfWeek'
import { getDay } from 'date-fns/getDay'
import { ko } from 'date-fns/locale/ko'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-view.css'
import type { CalendarEvent } from '../../types'
import { getHolidayName } from '../../lib/holidays'
import { useSettings } from '../../context/SettingsContext'
import { useTranslation } from '../../i18n/useTranslation'

function HolidayDateHeader({ date, label, drilldownView, onDrillDown }: DateHeaderProps) {
  const { region } = useSettings()
  const holidayName = getHolidayName(date, region)
  const className = holidayName ? 'rbc-holiday-label' : undefined

  if (!drilldownView) {
    return (
      <span className={className} title={holidayName}>
        {label}
      </span>
    )
  }
  return (
    <button type="button" className={['rbc-button-link', className].filter(Boolean).join(' ')} title={holidayName} onClick={onDrillDown}>
      {label}
    </button>
  )
}

const localeByLanguage = { ko, en: enUS }

function useLocalizer(language: 'ko' | 'en') {
  const dateFnsLocale = localeByLanguage[language]
  return useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek: () => startOfWeek(new Date(), { locale: dateFnsLocale }),
        getDay,
        locales: { [language]: dateFnsLocale },
      }),
    [language, dateFnsLocale],
  )
}

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
  const { language } = useSettings()
  const { t } = useTranslation()
  const localizer = useLocalizer(language)

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
          culture={language}
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
          components={{ month: { dateHeader: HolidayDateHeader } }}
          style={{ height: '100%' }}
          messages={{
            next: t.calendarMessages.next,
            previous: t.calendarMessages.previous,
            today: t.calendarMessages.today,
            month: t.calendarMessages.month,
            week: t.calendarMessages.week,
            noEventsInRange: t.calendarMessages.noEventsInRange,
            showMore: (count) => t.calendarMessages.showMore.replace('{count}', String(count)),
          }}
        />
      </div>
    </div>
  )
}
