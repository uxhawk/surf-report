import { DAYS_OF_WEEK, MONTHS } from './constants'
import { degreesToCompass } from './openmeteo'

const YEAR_COLORS = ['#00CFFF', '#FF2D78', '#FFE600', '#BF00FF']

// Parse a YYYY-MM-DD date string as local time (avoids UTC offset shifting the day)
export function parseLocalDate(dateStr) {
  return new Date(dateStr + 'T12:00:00')
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatMonthDay(dateStr) {
  if (!dateStr) return ''
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function todayStr() {
  const d = new Date()
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
}

function offsetDayStr(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
}

export function formatTimeSince(dateStr) {
  if (!dateStr) return ''
  const past = parseLocalDate(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0)

  let years = today.getFullYear() - past.getFullYear()
  let months = today.getMonth() - past.getMonth()
  let days = today.getDate() - past.getDate()

  if (days < 0) {
    months--
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }

  if (years === 0 && months === 0) {
    if (days === 0) return 'Today'
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }

  const parts = []
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`)
  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`)

  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`
  return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
}

/**
 * Subtitle for “last surf” cards: time, swell, period, compass, °F, then optional tail.
 * @param {{ omitLocation?: boolean, appendBoard?: boolean }} [options] — `omitLocation`: drop spot name (e.g. location metrics). `appendBoard`: add board model (after location when shown; alone on location metrics).
 */
export function formatLastSurfSessionSubtitle(session, dateStr, options = {}) {
  if (!session || !dateStr) return ''
  const { omitLocation = false, appendBoard = false, compact = false } = options
  const relative = formatTimeSince(dateStr)
  const core = [
    relative === 'Today' ? 'Today' : `${relative} ago`,
    session.swell_height != null ? `${session.swell_height}ft` : null,
    !compact && session.swell_period != null ? `${session.swell_period}s` : null,
    !compact && session.swell_direction != null ? degreesToCompass(session.swell_direction) : null,
    !compact && session.water_temp_c != null
      ? `${Math.round((session.water_temp_c * 9) / 5 + 32)}°F`
      : null,
  ].filter(Boolean)

  const tail = []
  if (!omitLocation && session.location?.name) tail.push(session.location.name)
  if (appendBoard && session.board?.model) {
    tail.push(session.board.model)
  }

  return [...core, ...tail].filter(Boolean).join(' · ')
}

export function formatShortDate(dateStr) {
  if (!dateStr) return ''
  return parseLocalDate(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// MM/DD/YYYY
export function formatNumericDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${m}/${d}/${y}`
}

function streakRange(dates, count) {
  const end = dates[0]
  const start = dates[count - 1]
  return start === end ? formatShortDate(start) : `${formatShortDate(start)} – ${formatShortDate(end)}`
}

// Calculate the current active streak (consecutive days with at least one surf)
// Returns { count, range }
export function calculateStreak(sessions) {
  if (!sessions?.length) return { count: 0, range: null }

  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse()
  if (!dates.length) return { count: 0, range: null }

  const today = todayStr()
  const yesterday = offsetDayStr(-1)

  if (dates[0] !== today && dates[0] !== yesterday) return { count: 0, range: null }

  let streak = 1
  for (let i = 0; i < dates.length - 1; i++) {
    const curr = parseLocalDate(dates[i])
    const prev = parseLocalDate(dates[i + 1])
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) streak++
    else break
  }
  return { count: streak, range: streakRange(dates, streak) }
}

// Calculate the longest streak ever
// Returns { count, range }
export function calculateLongestStreak(sessions) {
  if (!sessions?.length) return { count: 0, range: null }

  const dates = [...new Set(sessions.map(s => s.date))].sort() // ascending
  if (!dates.length) return { count: 0, range: null }

  let best = { count: 1, start: dates[0], end: dates[0] }
  let curStart = dates[0]
  let curCount = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = parseLocalDate(dates[i - 1])
    const curr = parseLocalDate(dates[i])
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      curCount++
      if (curCount > best.count) best = { count: curCount, start: curStart, end: dates[i] }
    } else {
      curStart = dates[i]
      curCount = 1
    }
  }

  const range = best.start === best.end
    ? formatShortDate(best.start)
    : `${formatShortDate(best.start)} – ${formatShortDate(best.end)}`
  return { count: best.count, range }
}

// Compare this year's surf count against the same date last year, and the
// weekly pace needed for the rest of this year to eclipse last year's total.
// Anchored to today, so it ignores dashboard filters (like the active streak).
// Returns null when neither year has any sessions.
export function computeYearPace(sessions) {
  const now = new Date()
  const year = now.getFullYear()
  const prevYear = year - 1
  const today = todayStr()
  const prevCutoff = `${prevYear}${today.slice(4)}` // same month/day, last year

  let toDate = 0
  let prevToDate = 0
  let prevTotal = 0
  sessions.forEach(s => {
    if (!s.date) return
    const y = Number(s.date.slice(0, 4))
    if (y === year && s.date <= today) toDate++
    else if (y === prevYear) {
      prevTotal++
      if (s.date <= prevCutoff) prevToDate++
    }
  })

  if (!toDate && !prevTotal) return null

  const endOfYear = new Date(year, 11, 31, 12)
  const todayNoon = new Date(year, now.getMonth(), now.getDate(), 12)
  const daysLeft = Math.round((endOfYear - todayNoon) / 86_400_000) + 1 // includes today
  const remaining = Math.max(prevTotal + 1 - toDate, 0)
  const perWeek = remaining === 0 ? 0 : (remaining / daysLeft) * 7

  return { year, prevYear, toDate, prevToDate, prevCutoff, prevTotal, remaining, perWeek, daysLeft }
}

export function computeMonthlyByYear(sessions, { years, maxMonth }) {
  const counts = {}
  years.forEach(y => { counts[y] = new Array(12).fill(0) })
  sessions.forEach(s => {
    const d = parseLocalDate(s.date)
    const y = d.getFullYear()
    if (counts[y]) counts[y][d.getMonth()]++
  })

  const monthSlice = maxMonth != null ? MONTHS.slice(0, maxMonth + 1) : MONTHS
  const data = monthSlice.map((name, i) => {
    const row = { name }
    years.forEach(y => { row[y] = counts[y][i] })
    return row
  })
  const bars = years.map((y, i) => ({ key: String(y), color: YEAR_COLORS[i % YEAR_COLORS.length], label: String(y) }))
  return { data, bars }
}

export function computeWaterTempByMonth(sessions) {
  const buckets = MONTHS.map(() => [])
  sessions.forEach(s => {
    if (s.water_temp_c == null) return
    const month = parseLocalDate(s.date).getMonth()
    buckets[month].push(s.water_temp_c)
  })
  const toF = c => Math.round(c * 9 / 5 + 32)
  return MONTHS.map((name, i) => {
    const temps = buckets[i]
    if (!temps.length) return { name, avg: null, min: null, max: null }
    const avgC = temps.reduce((sum, t) => sum + t, 0) / temps.length
    const minC = Math.min(...temps)
    const maxC = Math.max(...temps)
    return { name, avg: toF(avgC), min: toF(minC), max: toF(maxC) }
  })
}

export function computeDashboardStats(sessions) {
  if (!sessions?.length) {
    return {
      total: 0,
      byDayOfWeek: DAYS_OF_WEEK.map(name => ({ name, count: 0 })),
      byMonth: MONTHS.map(name => ({ name, count: 0 })),
      byWaveSize: [],
      bySwellSize: [],
      byPeriod: [],
      byLocation: [],
      byBoard: [],
      byFinType: [],
    }
  }

  // By day of week
  const byDayOfWeek = DAYS_OF_WEEK.map(name => ({ name, count: 0 }))
  sessions.forEach(s => {
    const day = parseLocalDate(s.date).getDay()
    byDayOfWeek[day].count++
  })

  // By month
  const byMonth = MONTHS.map(name => ({ name, count: 0 }))
  sessions.forEach(s => {
    const month = parseLocalDate(s.date).getMonth()
    byMonth[month].count++
  })

  // By wave size (self-reported + API swell bucketed into the same ranges)
  const waveCounts = {}
  sessions.forEach(s => {
    if (s.waves) waveCounts[s.waves] = (waveCounts[s.waves] ?? 0) + 1
  })
  const byWaveSize = Object.entries(waveCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

  const waveRanges = byWaveSize.map(({ name }) => {
    const m = name.match(/^(\d+)-(\d+)(\+)?$/)
    if (!m) return { label: name, min: 0, max: Infinity, span: Infinity }
    return { label: name, min: Number(m[1]), max: m[3] ? Infinity : Number(m[2]), span: m[3] ? Infinity : Number(m[2]) - Number(m[1]) }
  })
  const swellCounts = Object.fromEntries(byWaveSize.map(d => [d.name, 0]))
  sessions.forEach(s => {
    if (s.swell_height == null) return
    const h = s.swell_height
    const matches = waveRanges.filter(r => h >= r.min && h <= r.max)
    if (!matches.length) return
    matches.sort((a, b) => a.span - b.span)
    swellCounts[matches[0].label]++
  })
  const bySwellSize = Object.entries(swellCounts)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

  // By swell period
  const periodBuckets = { 'Short (<10s)': 0, 'Medium (10-13s)': 0, 'Long / Groundswell (≥14s)': 0 }
  sessions.forEach(s => {
    if (s.swell_period == null) return
    if (s.swell_period < 10) periodBuckets['Short (<10s)']++
    else if (s.swell_period <= 13) periodBuckets['Medium (10-13s)']++
    else periodBuckets['Long / Groundswell (≥14s)']++
  })
  const byPeriod = Object.entries(periodBuckets)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({ name, count }))

  // By location
  const locationCounts = {}
  sessions.forEach(s => {
    const name = s.location?.name ?? 'Unknown'
    locationCounts[name] = (locationCounts[name] ?? 0) + 1
  })
  const byLocation = Object.entries(locationCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // By board (model only — chart labels stay short)
  const boardCounts = {}
  sessions.forEach(s => {
    if (s.board?.model) {
      const name = s.board.model
      boardCounts[name] = (boardCounts[name] ?? 0) + 1
    }
  })
  const byBoard = Object.entries(boardCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // By fin (model only — chart labels stay short)
  const finTypeCounts = {}
  sessions.forEach(s => {
    if (s.fins?.model) {
      const name = s.fins.model
      finTypeCounts[name] = (finTypeCounts[name] ?? 0) + 1
    }
  })
  const byFinType = Object.entries(finTypeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return {
    total: sessions.length,
    byDayOfWeek,
    byMonth,
    byWaveSize,
    bySwellSize,
    byPeriod,
    byLocation,
    byBoard,
    byFinType,
  }
}
