import { DAYS_OF_WEEK, MONTHS } from './constants'

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

export function formatShortDate(dateStr) {
  if (!dateStr) return ''
  return parseLocalDate(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

export function computeDashboardStats(sessions) {
  if (!sessions?.length) {
    return {
      total: 0,
      byDayOfWeek: DAYS_OF_WEEK.map(name => ({ name, count: 0 })),
      byMonth: MONTHS.map(name => ({ name, count: 0 })),
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

  // By location
  const locationCounts = {}
  sessions.forEach(s => {
    const name = s.location?.name ?? 'Unknown'
    locationCounts[name] = (locationCounts[name] ?? 0) + 1
  })
  const byLocation = Object.entries(locationCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // By board
  const boardCounts = {}
  sessions.forEach(s => {
    if (s.board) {
      const name = `${s.board.brand} ${s.board.model}`
      boardCounts[name] = (boardCounts[name] ?? 0) + 1
    }
  })
  const byBoard = Object.entries(boardCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // By fin setup (brand + model + setup as key, e.g. "Rob Machado Quad")
  const finTypeCounts = {}
  sessions.forEach(s => {
    if (s.fins?.setup) {
      const name = `${s.fins.brand} ${s.fins.model} ${s.fins.setup}`
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
    byLocation,
    byBoard,
    byFinType,
  }
}
