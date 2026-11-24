// 백엔드는 타임존 없는 LocalDateTime 문자열(yyyy-MM-ddTHH:mm:ss)을 사용한다.

export function isoToDate(iso: string): Date {
  return new Date(iso)
}

export function isoToInputValue(iso: string): string {
  // "2026-11-24T19:00:00" -> "2026-11-24T19:00" (datetime-local input 형식)
  return iso.slice(0, 16)
}

export function inputValueToIso(value: string): string {
  // "2026-11-24T19:00" -> "2026-11-24T19:00:00"
  return value.length === 16 ? `${value}:00` : value
}

export function dateToInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
