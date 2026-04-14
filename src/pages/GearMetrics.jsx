import { useMemo, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import { useBoards } from '../hooks/useBoards'
import { useFins } from '../hooks/useFins'
import { useLocations } from '../hooks/useLocations'
import { computeDashboardStats, computeWaterTempByMonth, parseLocalDate, formatDate, formatTimeSince } from '../lib/utils'
import { SurfChart } from '../components/dashboard/SurfChart'
import { StatCard } from '../components/dashboard/StatCard'
import { Spinner } from '../components/ui/Spinner'
import { Bookmark } from 'pixelarticons/react/Bookmark.js'
import { Calendar2 } from 'pixelarticons/react/Calendar2.js'
import { Anchor } from 'pixelarticons/react/Anchor.js'
import { MapPin } from 'pixelarticons/react/MapPin.js'
import { SpeedFast } from 'pixelarticons/react/SpeedFast.js'

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
  const [year, setYear] = useState('')
  const years = [2026, 2025]

  const { sessions, loading: sessionsLoading } = useSessions()
  const { boards, loading: boardsLoading } = useBoards()
  const { fins, loading: finsLoading } = useFins()
  const { locations, loading: locationsLoading } = useLocations()

  const loading = sessionsLoading || boardsLoading || finsLoading || locationsLoading

  const allFiltered = useMemo(() => {
    if (type === 'board') return sessions.filter(s => s.board?.id === id)
    if (type === 'fin') return sessions.filter(s => s.fins?.id === id)
    if (type === 'location') return sessions.filter(s => s.location?.id === id)
    return []
  }, [sessions, type, id])

  const filtered = useMemo(() => {
    if (!year) return allFiltered
    return allFiltered.filter(s => parseLocalDate(s.date).getFullYear() === Number(year))
  }, [allFiltered, year])

  const stats = useMemo(() => computeDashboardStats(filtered), [filtered])
  const byWaveSize = useMemo(() => computeWaveSizes(filtered), [filtered])
  const waterTempByMonth = useMemo(() => computeWaterTempByMonth(filtered), [filtered])
  const visibleWaterTemp = useMemo(() => {
    if (Number(year) === new Date().getFullYear()) {
      return waterTempByMonth.slice(0, new Date().getMonth() + 1)
    }
    return waterTempByMonth
  }, [waterTempByMonth, year])
  const lastSurf = filtered[0]?.date

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

  if (!allFiltered.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-white font-semibold text-sm mb-1">{name}</p>
        <p className="text-retro-muted text-sm">No sessions logged with this gear yet.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Year segmented control */}
      <div className="bg-retro-surface border-b border-retro-border px-4 py-3">
        <div className="flex rounded-lg border border-retro-border overflow-hidden" role="group" aria-label="Filter by year">
          {[{ label: 'All', value: '' }, ...years.map(y => ({ label: String(y), value: String(y) }))].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setYear(opt.value)}
              className={`flex-1 px-3 py-2 text-xs font-display uppercase transition-colors ${
                year === opt.value
                  ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan'
                  : 'text-retro-muted hover:text-retro-text'
              } ${opt.value !== '' ? 'border-l border-retro-border' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Surfs" value={filtered.length} color="neon-pink" icon={Bookmark} />
          {type !== 'location' && (
            <StatCard
              label="Locations"
              value={stats.byLocation.length}
              color="neon-purple"
              icon={MapPin}
            />
          )}
          {type !== 'board' && (
            <StatCard
              label="Boards Used"
              value={stats.byBoard.length}
              color="neon-cyan"
              icon={SpeedFast}
            />
          )}
          {type !== 'fin' && (
            <StatCard
              label="Fin Setups"
              value={stats.byFinType.length}
              color="neon-yellow"
              icon={Anchor}
            />
          )}
          <StatCard
            label="Last Surf"
            value={lastSurf ? formatDate(lastSurf) : '—'}
            subtitle={lastSurf ? (formatTimeSince(lastSurf) === 'Today' ? 'Today' : `${formatTimeSince(lastSurf)} ago`) : ''}
            color="neon-purple"
            icon={Calendar2}
          />
        </div>

        {type === 'location' && (<>
          <SurfChart title="Water Temp (Avg)" data={visibleWaterTemp} color="#00CFFF" unit="°F" />
          {stats.byBoard.length > 0 && <SurfChart title="Boards" data={stats.byBoard} color="#BF00FF" multiColor logScale />}
          <SurfChart title="Wave Height (Observed)" data={byWaveSize} color="#FF2D78" />
          {stats.bySwellSize.length > 0 && <SurfChart title="Wave Height (API)" data={stats.bySwellSize} color="#BF00FF" />}
          {stats.byFinType.length > 0 && <SurfChart title="Fins" data={stats.byFinType} color="#FF2D78" multiColor logScale />}
          <SurfChart title="Monthly Breakdown" data={stats.byMonth} color="#FFE600" />
          <SurfChart title="Days of Week" data={stats.byDayOfWeek} color="#00CFFF" />
        </>)}

        {type === 'board' && (<>
          <SurfChart title="Wave Height (Observed)" data={byWaveSize} color="#FF2D78" />
          {stats.bySwellSize.length > 0 && <SurfChart title="Wave Height (API)" data={stats.bySwellSize} color="#BF00FF" />}
          {stats.byFinType.length > 0 && <SurfChart title="Fins" data={stats.byFinType} color="#FF2D78" multiColor logScale />}
          <SurfChart title="Monthly Breakdown" data={stats.byMonth} color="#FFE600" />
          <SurfChart title="Days of Week" data={stats.byDayOfWeek} color="#00CFFF" />
        </>)}

        {type === 'fin' && (<>
          <SurfChart title="Wave Height (Observed)" data={byWaveSize} color="#FF2D78" />
          {stats.bySwellSize.length > 0 && <SurfChart title="Wave Height (API)" data={stats.bySwellSize} color="#BF00FF" />}
          {stats.byBoard.length > 0 && <SurfChart title="Boards" data={stats.byBoard} color="#BF00FF" multiColor logScale />}
          {stats.byLocation.length > 0 && <SurfChart title="Locations" data={stats.byLocation} color="#00CFFF" multiColor logScale />}
          <SurfChart title="Monthly Breakdown" data={stats.byMonth} color="#FFE600" />
          <SurfChart title="Days of Week" data={stats.byDayOfWeek} color="#00CFFF" />
        </>)}
      </div>
    </div>
  )
}
