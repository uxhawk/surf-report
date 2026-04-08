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

export function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// Calculate the current active streak (consecutive days with at least one surf)
export function calculateStreak(sessions) {
  if (!sessions?.length) return 0

  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse()
  if (!dates.length) return 0

  const today = todayStr()
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (dates[0] !== today && dates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 0; i < dates.length - 1; i++) {
    const curr = parseLocalDate(dates[i])
    const prev = parseLocalDate(dates[i + 1])
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
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

  // By fin type (derived from fins.setup)
  const finTypeCounts = {}
  sessions.forEach(s => {
    if (s.fins?.setup) {
      finTypeCounts[s.fins.setup] = (finTypeCounts[s.fins.setup] ?? 0) + 1
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
