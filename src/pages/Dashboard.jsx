import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import { useLocations } from '../hooks/useLocations'
import { useBoards } from '../hooks/useBoards'
import { useFins } from '../hooks/useFins'
import { computeDashboardStats, computeMonthlyByYear, computeWaterTempByMonth, calculateStreak, calculateLongestStreak, formatDate, formatTimeSince, parseLocalDate, formatMonthDay } from '../lib/utils'
import { degreesToCompass } from '../lib/openmeteo'
import { StatCard } from '../components/dashboard/StatCard'
import { SurfChart } from '../components/dashboard/SurfChart'
import { FilterBar } from '../components/dashboard/FilterBar'
import { SessionsTable } from '../components/dashboard/SessionsTable'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Bookmark } from 'pixelarticons/react/Bookmark.js'
import { Fire } from 'pixelarticons/react/Fire.js'
import { Calendar2 } from 'pixelarticons/react/Calendar2.js'
import { Trophy } from 'pixelarticons/react/Trophy.js'
import { Thermometer } from 'pixelarticons/react/Thermometer.js'
import { Sparkle } from 'pixelarticons/react/Sparkle.js'

const DEFAULT_FILTERS = {
  year: String(new Date().getFullYear()),
  month: '',
  locationId: '',
  boardId: '',
  finsId: '',
}

export default function Dashboard() {
  const { sessions, loading, deleteSession } = useSessions()
  const { locations } = useLocations()
  const { boards } = useBoards()
  const { fins } = useFins()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      const d = parseLocalDate(s.date)
      if (filters.year && d.getFullYear() !== Number(filters.year)) return false
      if (filters.month && d.getMonth() + 1 !== Number(filters.month)) return false
      if (filters.locationId && s.location?.id !== filters.locationId) return false
      if (filters.boardId && s.board?.id !== filters.boardId) return false
      if (filters.finsId && s.fins?.id !== filters.finsId) return false
      return true
    })
  }, [sessions, filters])

  const yearFiltered = useMemo(() => {
    if (!filters.year) return sessions
    return sessions.filter(s => parseLocalDate(s.date).getFullYear() === Number(filters.year))
  }, [sessions, filters.year])

  const stats = useMemo(() => computeDashboardStats(filtered), [filtered])
  const streak = useMemo(() => calculateStreak(sessions), [sessions])
  const longestStreak = useMemo(() => calculateLongestStreak(yearFiltered), [yearFiltered])

  const visibleMonths = useMemo(() => {
    if (Number(filters.year) === new Date().getFullYear()) {
      return stats.byMonth.slice(0, new Date().getMonth() + 1)
    }
    return stats.byMonth
  }, [stats.byMonth, filters.year])

  const monthlyByYear = useMemo(() => {
    const currentYear = new Date().getFullYear()
    if (!filters.year) {
      return computeMonthlyByYear(sessions, { years: [currentYear - 1, currentYear], maxMonth: null })
    }
    if (Number(filters.year) === currentYear) {
      return computeMonthlyByYear(sessions, { years: [currentYear - 1, currentYear], maxMonth: new Date().getMonth() })
    }
    return null
  }, [sessions, filters.year])

  const tempExtremes = useMemo(() => {
    const withTemp = filtered.filter(s => s.water_temp_c != null)
    if (!withTemp.length) return null
    const toF = c => Math.round(c * 9 / 5 + 32)
    let max = withTemp[0], min = withTemp[0]
    withTemp.forEach(s => {
      if (s.water_temp_c > max.water_temp_c) max = s
      if (s.water_temp_c < min.water_temp_c) min = s
    })
    return {
      max: { temp: toF(max.water_temp_c), date: max.date, location: max.location?.name },
      min: { temp: toF(min.water_temp_c), date: min.date, location: min.location?.name },
    }
  }, [filtered])

  const waterTempByMonth = useMemo(() => computeWaterTempByMonth(filtered), [filtered])
  const visibleWaterTemp = useMemo(() => {
    if (Number(filters.year) === new Date().getFullYear()) {
      return waterTempByMonth.slice(0, new Date().getMonth() + 1)
    }
    return waterTempByMonth
  }, [waterTempByMonth, filters.year])

  const lastSession = sessions[0]
  const lastSurf = lastSession?.date

  const navigate = useNavigate()

  const handleBoardClick = useCallback((entry) => {
    const board = boards.find(b => `${b.brand} ${b.model}` === entry.name)
    if (board) navigate(`/profile/boards/${board.id}/metrics`, { state: { name: `${board.brand} ${board.model}` } })
  }, [boards, navigate])

  const handleFinClick = useCallback((entry) => {
    const fin = fins.find(f => `${f.brand} ${f.model} ${f.setup}` === entry.name)
    if (fin) navigate(`/profile/fins/${fin.id}/metrics`, { state: { name: `${fin.brand} ${fin.model} · ${fin.setup}` } })
  }, [fins, navigate])

  const handleLocationClick = useCallback((entry) => {
    const location = locations.find(l => l.name === entry.name)
    if (location) navigate(`/profile/locations/${location.id}/metrics`, { state: { name: location.name } })
  }, [locations, navigate])

  if (loading) return <Spinner />

  if (!sessions.length) {
    return (
      <EmptyState
        icon="🏄"
        title="No surfs yet!"
        message="Head out and log your first session using the button below."
      />
    )
  }

  return (
    <div>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        locations={locations}
        boards={boards}
        fins={fins}
      />

      <div className="p-4 flex flex-col gap-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Surfs"
            value={stats.total}
            color="neon-pink"
            icon={Bookmark}
          />
          <StatCard
            label="Active Streak"
            value={streak.count ? `${streak.count}d` : '—'}
            subtitle={streak.range}
            color="neon-yellow"
            icon={Fire}
          />
          <StatCard
            label="Last Surf"
            value={lastSurf ? formatMonthDay(lastSurf) : '—'}
            subtitle={lastSession ? [
              formatTimeSince(lastSurf) === 'Today' ? 'Today' : `${formatTimeSince(lastSurf)} ago`,
              lastSession.swell_height != null ? `${lastSession.swell_height}ft` : null,
              lastSession.swell_period != null ? `${lastSession.swell_period}s` : null,
              lastSession.swell_direction != null ? degreesToCompass(lastSession.swell_direction) : null,
              lastSession.water_temp_c != null ? `${Math.round(lastSession.water_temp_c * 9 / 5 + 32)}°F` : null,
            ].filter(Boolean).join(' · ') : ''}
            color="neon-purple"
            icon={Calendar2}
          />
          <StatCard
            label="Longest Streak"
            value={longestStreak.count ? `${longestStreak.count}d` : '—'}
            subtitle={longestStreak.range}
            color="neon-cyan"
            icon={Trophy}
          />
        </div>

        {tempExtremes && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Warmest"
              value={`${tempExtremes.max.temp}°F`}
              subtitle={[formatDate(tempExtremes.max.date), tempExtremes.max.location].filter(Boolean).join(' · ')}
              color="neon-pink"
              icon={Thermometer}
            />
            <StatCard
              label="Coldest"
              value={`${tempExtremes.min.temp}°F`}
              subtitle={[formatDate(tempExtremes.min.date), tempExtremes.min.location].filter(Boolean).join(' · ')}
              color="neon-cyan"
              icon={Sparkle}
            />
          </div>
        )}

        {/* Charts */}
        {monthlyByYear
          ? <SurfChart title="Monthly Breakdown" data={monthlyByYear.data} bars={monthlyByYear.bars} />
          : <SurfChart title="Monthly Breakdown" data={visibleMonths} color="#00CFFF" />
        }
        {stats.byBoard.length > 0 && (
          <SurfChart title="Boards" data={stats.byBoard} color="#BF00FF" multiColor logScale onBarClick={handleBoardClick} />
        )}
        {stats.byFinType.length > 0 && (
          <SurfChart title="Fins" data={stats.byFinType} color="#FF2D78" multiColor logScale onBarClick={handleFinClick} />
        )}
        {stats.byLocation.length > 0 && (
          <SurfChart title="Locations" data={stats.byLocation} color="#FFE600" multiColor logScale onBarClick={handleLocationClick} />
        )}
        {stats.byWaveSize.length > 0 && (
          <SurfChart title="Wave Height (Observed)" data={stats.byWaveSize} color="#00CFFF" />
        )}
        {stats.bySwellSize.length > 0 && (
          <SurfChart title="Wave Height (API)" data={stats.bySwellSize} color="#BF00FF" />
        )}
        {stats.byPeriod.length > 0 && (
          <SurfChart title="Swell Period" data={stats.byPeriod} color="#FFE600" />
        )}
        <SurfChart title="Days of Week" data={stats.byDayOfWeek} color="#FF2D78" />
        <SurfChart title="Water Temp (Avg)" data={visibleWaterTemp} color="#00CFFF" unit="°F" />

        {/* Sessions table */}
        <div>
          <h2 className="text-neon-yellow font-display text-[9px] uppercase mb-3">
            Sessions ({filtered.length})
          </h2>
          <div className="gradient-border rounded-xl overflow-hidden bg-retro-surface">
            <SessionsTable sessions={filtered} onDelete={deleteSession} />
          </div>
        </div>
      </div>
    </div>
  )
}
