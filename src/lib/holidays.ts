import KoreanLunarCalendar from 'korean-lunar-calendar'

export type Region = 'KR' | 'CA'

interface Holiday {
  date: string // YYYY-MM-DD
  name: string
}

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

/** 주어진 달에서 n번째 요일(weekday: 0=일 ~ 6=토)의 날짜를 반환한다. */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): number {
  const first = new Date(year, month - 1, 1)
  const offset = (weekday - first.getDay() + 7) % 7
  return 1 + offset + (n - 1) * 7
}

/** year/month/day 기준으로 그 날 이전(포함) 가장 가까운 요일의 날짜를 반환한다. */
function lastWeekdayOnOrBefore(year: number, month: number, day: number, weekday: number): number {
  const d = new Date(year, month - 1, day)
  while (d.getDay() !== weekday) {
    d.setDate(d.getDate() - 1)
  }
  return d.getDate()
}

/** 그레고리력 부활절(Anonymous Gregorian algorithm / Computus). */
function easterSunday(year: number): { month: number; day: number } {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { month, day }
}

function lunarToSolar(year: number, lunarMonth: number, lunarDay: number): { year: number; month: number; day: number } {
  const calendar = new KoreanLunarCalendar()
  calendar.setLunarDate(year, lunarMonth, lunarDay, false)
  return calendar.getSolarCalendar()
}

const FIXED_KR_HOLIDAYS: Array<{ month: number; day: number; name: string }> = [
  { month: 1, day: 1, name: '신정' },
  { month: 3, day: 1, name: '삼일절' },
  { month: 5, day: 5, name: '어린이날' },
  { month: 6, day: 6, name: '현충일' },
  { month: 8, day: 15, name: '광복절' },
  { month: 10, day: 3, name: '개천절' },
  { month: 10, day: 9, name: '한글날' },
  { month: 12, day: 25, name: '성탄절' },
]

function buildKoreaHolidaysForYear(year: number): Holiday[] {
  const holidays: Holiday[] = FIXED_KR_HOLIDAYS.map(({ month, day, name }) => ({
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

function buildCanadaHolidaysForYear(year: number): Holiday[] {
  const easter = easterSunday(year)
  const goodFriday = addDays(year, easter.month, easter.day, -2)

  return [
    { date: toDateString(year, 1, 1), name: "New Year's Day" },
    { date: goodFriday, name: 'Good Friday' },
    { date: toDateString(year, 5, lastWeekdayOnOrBefore(year, 5, 24, 1)), name: 'Victoria Day' },
    { date: toDateString(year, 7, 1), name: 'Canada Day' },
    { date: toDateString(year, 9, nthWeekdayOfMonth(year, 9, 1, 1)), name: 'Labour Day' },
    { date: toDateString(year, 9, 30), name: 'National Day for Truth and Reconciliation' },
    { date: toDateString(year, 10, nthWeekdayOfMonth(year, 10, 1, 2)), name: 'Thanksgiving' },
    { date: toDateString(year, 11, 11), name: 'Remembrance Day' },
    { date: toDateString(year, 12, 25), name: 'Christmas Day' },
    { date: toDateString(year, 12, 26), name: 'Boxing Day' },
  ]
}

const holidayCache = new Map<string, Map<string, string>>()

function getHolidayMapForYear(region: Region, year: number): Map<string, string> {
  const cacheKey = `${region}-${year}`
  let map = holidayCache.get(cacheKey)
  if (!map) {
    const holidays = region === 'CA' ? buildCanadaHolidaysForYear(year) : buildKoreaHolidaysForYear(year)
    map = new Map(holidays.map((h) => [h.date, h.name]))
    holidayCache.set(cacheKey, map)
  }
  return map
}

/** 음력 연휴가 전해/다음해로 걸치는 경우를 대비해 해당 연도와 전후 1년치를 함께 찾는다. */
export function getHolidayName(date: Date, region: Region): string | undefined {
  const year = date.getFullYear()
  const key = toDateString(year, date.getMonth() + 1, date.getDate())
  for (const y of [year - 1, year, year + 1]) {
    const name = getHolidayMapForYear(region, y).get(key)
    if (name) {
      return name
    }
  }
  return undefined
}
