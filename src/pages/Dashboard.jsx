import { useState, useMemo } from 'react'
import { useSessions } from '../hooks/useSessions'
import { useLocations } from '../hooks/useLocations'
import { useBoards } from '../hooks/useBoards'
import { useFins } from '../hooks/useFins'
import { computeDashboardStats, calculateStreak, calculateLongestStreak, formatDate, parseLocalDate } from '../lib/utils'
import { StatCard } from '../components/dashboard/StatCard'
import { SurfChart } from '../components/dashboard/SurfChart'
import { FilterBar } from '../components/dashboard/FilterBar'
import { SessionsTable } from '../components/dashboard/SessionsTable'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'

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

  const stats = useMemo(() => computeDashboardStats(filtered), [filtered])
  const streak = useMemo(() => calculateStreak(sessions), [sessions])
  const longestStreak = useMemo(() => calculateLongestStreak(sessions), [sessions])

  const lastSurf = sessions[0]?.date

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
            icon="🌊"
          />
          <StatCard
            label="Active Streak"
            value={streak.count ? `${streak.count}d` : '—'}
            subtitle={streak.range}
            color="neon-yellow"
            icon="🔥"
          />
          <StatCard
            label="Last Surf"
            value={lastSurf ? formatDate(lastSurf) : '—'}
            color="neon-purple"
            icon="📍"
          />
          <StatCard
            label="Longest Streak"
            value={longestStreak.count ? `${longestStreak.count}d` : '—'}
            subtitle={longestStreak.range}
            color="neon-cyan"
            icon="🏆"
          />
        </div>

        {/* Charts */}
        <SurfChart title="Surfs by Day of Week" data={stats.byDayOfWeek} color="#FF2D78" />
        <SurfChart title="Surfs by Month" data={stats.byMonth} color="#00CFFF" />
        {stats.byLocation.length > 0 && (
          <SurfChart title="Surfs by Location" data={stats.byLocation} color="#FFE600" multiColor logScale />
        )}
        {stats.byBoard.length > 0 && (
          <SurfChart title="Surfs by Board" data={stats.byBoard} color="#BF00FF" multiColor />
        )}
        {stats.byFinType.length > 0 && (
          <SurfChart title="Surfs by Fin Type" data={stats.byFinType} color="#FF2D78" multiColor />
        )}

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
