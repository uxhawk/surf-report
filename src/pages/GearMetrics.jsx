import { useMemo } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import { useBoards } from '../hooks/useBoards'
import { useFins } from '../hooks/useFins'
import { useLocations } from '../hooks/useLocations'
import { computeDashboardStats, parseLocalDate } from '../lib/utils'
import { DAYS_OF_WEEK, MONTHS } from '../lib/constants'
import { SurfChart } from '../components/dashboard/SurfChart'
import { StatCard } from '../components/dashboard/StatCard'
import { Spinner } from '../components/ui/Spinner'

function computeWaveSizes(sessions) {
  const counts = {}
  sessions.forEach(s => {
    if (s.waves) counts[s.waves] = (counts[s.waves] ?? 0) + 1
  })
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
}

export default function GearMetrics({ type }) {
  const { id } = useParams()
  const routerLocation = useLocation()
  const itemName = routerLocation.state?.name ?? ''

  const { sessions, loading: sessionsLoading } = useSessions()
  const { boards, loading: boardsLoading } = useBoards()
  const { fins, loading: finsLoading } = useFins()
  const { locations, loading: locationsLoading } = useLocations()

  const loading = sessionsLoading || boardsLoading || finsLoading || locationsLoading

  const filtered = useMemo(() => {
    if (type === 'board') return sessions.filter(s => s.board?.id === id)
    if (type === 'fin') return sessions.filter(s => s.fins?.id === id)
    if (type === 'location') return sessions.filter(s => s.location?.id === id)
    return []
  }, [sessions, type, id])

  const stats = useMemo(() => computeDashboardStats(filtered), [filtered])
  const byWaveSize = useMemo(() => computeWaveSizes(filtered), [filtered])

  const name = useMemo(() => {
    if (itemName) return itemName
    if (type === 'board') {
      const b = boards.find(b => b.id === id)
      return b ? `${b.brand} ${b.model}` : ''
    }
    if (type === 'fin') {
      const f = fins.find(f => f.id === id)
      return f ? `${f.brand} ${f.model}` : ''
    }
    if (type === 'location') {
      const l = locations.find(l => l.id === id)
      return l?.name ?? ''
    }
    return ''
  }, [itemName, type, id, boards, fins, locations])

  if (loading) return <Spinner />

  if (!filtered.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-white font-semibold text-sm mb-1">{name}</p>
        <p className="text-retro-muted text-sm">No sessions logged with this gear yet.</p>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Surfs" value={filtered.length} color="neon-pink" icon="🌊" />
        {type !== 'location' && (
          <StatCard
            label="Locations"
            value={stats.byLocation.length}
            color="neon-cyan"
            icon="📍"
          />
        )}
        {type !== 'board' && (
          <StatCard
            label="Boards Used"
            value={stats.byBoard.length}
            color="neon-purple"
            icon="🏄"
          />
        )}
        {type !== 'fin' && (
          <StatCard
            label="Fin Setups"
            value={stats.byFinType.length}
            color="neon-yellow"
            icon="🔱"
          />
        )}
      </div>

      {/* Location metrics: board, wave size, fin setup, month, day of week */}
      {type === 'location' && (<>
        {stats.byBoard.length > 0 && <SurfChart title="By Board" data={stats.byBoard} color="#BF00FF" multiColor />}
        <SurfChart title="By Wave Size" data={byWaveSize} color="#FF2D78" />
        {stats.byFinType.length > 0 && <SurfChart title="By Fin Setup" data={stats.byFinType} color="#FF2D78" multiColor />}
        <SurfChart title="By Month" data={stats.byMonth} color="#FFE600" />
        <SurfChart title="By Day of Week" data={stats.byDayOfWeek} color="#00CFFF" />
      </>)}

      {/* Board metrics: location, wave size, fin setup, month, day of week */}
      {type === 'board' && (<>
        {stats.byLocation.length > 0 && <SurfChart title="By Location" data={stats.byLocation} color="#00CFFF" multiColor />}
        <SurfChart title="By Wave Size" data={byWaveSize} color="#FF2D78" />
        {stats.byFinType.length > 0 && <SurfChart title="By Fin Setup" data={stats.byFinType} color="#FF2D78" multiColor />}
        <SurfChart title="By Month" data={stats.byMonth} color="#FFE600" />
        <SurfChart title="By Day of Week" data={stats.byDayOfWeek} color="#00CFFF" />
      </>)}

      {/* Fin metrics: wave size, board, location, month, day of week */}
      {type === 'fin' && (<>
        <SurfChart title="By Wave Size" data={byWaveSize} color="#FF2D78" />
        {stats.byBoard.length > 0 && <SurfChart title="By Board" data={stats.byBoard} color="#BF00FF" multiColor />}
        {stats.byLocation.length > 0 && <SurfChart title="By Location" data={stats.byLocation} color="#00CFFF" multiColor />}
        <SurfChart title="By Month" data={stats.byMonth} color="#FFE600" />
        <SurfChart title="By Day of Week" data={stats.byDayOfWeek} color="#00CFFF" />
      </>)}
    </div>
  )
}
