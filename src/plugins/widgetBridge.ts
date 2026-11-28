import { registerPlugin, Capacitor } from '@capacitor/core'
import type { CalendarEvent } from '../types'

interface WidgetBridgePlugin {
  setCalendarData(options: { json: string }): Promise<void>
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge')

interface CalendarWidgetPayload {
  year: number
  month: number // 1-12
  eventDays: number[]
}

function buildPayload(events: CalendarEvent[]): CalendarWidgetPayload {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const eventDays = Array.from(
    new Set(
      events
        .map((event) => new Date(event.startTime))
        .filter((date) => date.getFullYear() === year && date.getMonth() + 1 === month)
        .map((date) => date.getDate()),
    ),
  ).sort((a, b) => a - b)

  return { year, month, eventDays }
}

/** 이번 달 일정이 있는 날짜 목록을 네이티브 저장소에 저장해 홈 화면 위젯이 읽을 수 있게 한다. */
export function syncCalendarWidget(events: CalendarEvent[]): void {
  if (!Capacitor.isNativePlatform()) {
    return
  }
  const payload = buildPayload(events)
  WidgetBridge.setCalendarData({ json: JSON.stringify(payload) }).catch(() => {
    /* 위젯 플러그인이 아직 없는 구버전 앱 등 — 조용히 무시 */
  })
}
