import KoreanLunarCalendar from 'korean-lunar-calendar'

interface Holiday {
  date: string // YYYY-MM-DD
  name: string
}

const FIXED_HOLIDAYS: Array<{ month: number; day: number; name: string }> = [
  { month: 1, day: 1, name: '신정' },
  { month: 3, day: 1, name: '삼일절' },
  { month: 5, day: 5, name: '어린이날' },
  { month: 6, day: 6, name: '현충일' },
  { month: 8, day: 15, name: '광복절' },
  { month: 10, day: 3, name: '개천절' },
  { month: 10, day: 9, name: '한글날' },
  { month: 12, day: 25, name: '성탄절' },
]

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`
}

function addDays(year: number, month: number, day: number, delta: number): string {
  const d = new Date(year, month - 1, day)
  d.setDate(d.getDate() + delta)
  return toDateString(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

function lunarToSolar(year: number, lunarMonth: number, lunarDay: number): { year: number; month: number; day: number } {
  const calendar = new KoreanLunarCalendar()
  calendar.setLunarDate(year, lunarMonth, lunarDay, false)
  return calendar.getSolarCalendar()
}

function buildHolidaysForYear(year: number): Holiday[] {
  const holidays: Holiday[] = FIXED_HOLIDAYS.map(({ month, day, name }) => ({
    date: toDateString(year, month, day),
    name,
  }))

  const seollal = lunarToSolar(year, 1, 1)
  holidays.push(
    { date: addDays(seollal.year, seollal.month, seollal.day, -1), name: '설날 연휴' },
    { date: toDateString(seollal.year, seollal.month, seollal.day), name: '설날' },
    { date: addDays(seollal.year, seollal.month, seollal.day, 1), name: '설날 연휴' },
  )

  const chuseok = lunarToSolar(year, 8, 15)
  holidays.push(
    { date: addDays(chuseok.year, chuseok.month, chuseok.day, -1), name: '추석 연휴' },
    { date: toDateString(chuseok.year, chuseok.month, chuseok.day), name: '추석' },
    { date: addDays(chuseok.year, chuseok.month, chuseok.day, 1), name: '추석 연휴' },
  )

  const buddha = lunarToSolar(year, 4, 8)
  holidays.push({ date: toDateString(buddha.year, buddha.month, buddha.day), name: '부처님오신날' })

  return holidays
}

const holidayCache = new Map<number, Map<string, string>>()

function getHolidayMapForYear(year: number): Map<string, string> {
  let map = holidayCache.get(year)
  if (!map) {
    map = new Map(buildHolidaysForYear(year).map((h) => [h.date, h.name]))
    holidayCache.set(year, map)
  }
  return map
}

/** 음력 연휴가 전해/다음해로 걸치는 경우를 대비해 해당 연도와 전후 1년치를 함께 찾는다. */
function getHolidayName(date: Date): string | undefined {
  const year = date.getFullYear()
  const key = toDateString(year, date.getMonth() + 1, date.getDate())
  for (const y of [year - 1, year, year + 1]) {
    const name = getHolidayMapForYear(y).get(key)
    if (name) {
      return name
    }
  }
  return undefined
}

export function isKoreanHoliday(date: Date): boolean {
  return getHolidayName(date) !== undefined
}

export { getHolidayName }
