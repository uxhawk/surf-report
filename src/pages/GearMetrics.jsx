import { useMemo, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import { useBoards } from '../hooks/useBoards'
import { useFins } from '../hooks/useFins'
import { useLocations } from '../hooks/useLocations'
import { computeDashboardStats, parseLocalDate, formatDate, formatTimeSince } from '../lib/utils'
import { DAYS_OF_WEEK, MONTHS } from '../lib/constants'
import { SurfChart } from '../components/dashboard/SurfChart'
import { StatCard } from '../components/dashboard/StatCard'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { ChevronDown } from 'pixelarticons/react/ChevronDown.js'
import { ChevronUp } from 'pixelarticons/react/ChevronUp.js'
import { Settings2 } from 'pixelarticons/react/Settings2.js'
import { ZapOff } from 'pixelarticons/react/ZapOff.js'

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
  const [filterOpen, setFilterOpen] = useState(false)
  const [year, setYear] = useState('')

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

  const years = useMemo(() => {
    const set = new Set(allFiltered.map(s => parseLocalDate(s.date).getFullYear()))
    return [...set].sort((a, b) => b - a)
  }, [allFiltered])

  const filtered = useMemo(() => {
    if (!year) return allFiltered
    return allFiltered.filter(s => parseLocalDate(s.date).getFullYear() === Number(year))
  }, [allFiltered, year])

  const stats = useMemo(() => computeDashboardStats(filtered), [filtered])
  const byWaveSize = useMemo(() => computeWaveSizes(filtered), [filtered])
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
      {/* Filter bar */}
      <div className="bg-retro-surface border-b border-retro-border">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="flex items-center gap-1.5 text-retro-muted text-xs font-display uppercase"><Settings2 className="w-4 h-4" /> Filter</p>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" disabled={!year} onClick={() => setYear('')}>
              <ZapOff className="w-4 h-4" /> Clear Filters
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setFilterOpen(prev => !prev)}>
              {filterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${filterOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="px-4 pb-4 flex gap-2">
              <select value={year} onChange={e => setYear(e.target.value)} aria-label="Filter by year" className="flex-1">
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button
                type="button"
                disabled={!year}
                onClick={() => setYear('')}
                className="inline-flex items-center justify-center gap-1.5 text-retro-muted text-xs border border-retro-border rounded-lg px-3 py-2 hover:border-neon-pink hover:text-neon-pink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ZapOff className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Surfs" value={filtered.length} color="neon-pink" icon="🌊" />
          {type !== 'location' && (
            <StatCard
              label="Locations"
              value={stats.byLocation.length}
              color="neon-purple"
              icon="📍"
            />
          )}
          {type !== 'board' && (
            <StatCard
              label="Boards Used"
              value={stats.byBoard.length}
              color="neon-cyan"
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
          <StatCard
            label="Last Surf"
            value={lastSurf ? formatDate(lastSurf) : '—'}
            subtitle={lastSurf ? (formatTimeSince(lastSurf) === 'Today' ? 'Today' : `${formatTimeSince(lastSurf)} ago`) : ''}
            color="neon-purple"
            icon="🗓️"
          />
        </div>

        {/* Location metrics: board, wave size, fin setup, month, day of week */}
        {type === 'location' && (<>
          {stats.byBoard.length > 0 && <SurfChart title="By Board" data={stats.byBoard} color="#BF00FF" multiColor logScale />}
          <SurfChart title="By Wave Size" data={byWaveSize} color="#FF2D78" logScale />
          {stats.byFinType.length > 0 && <SurfChart title="By Fin Setup" data={stats.byFinType} color="#FF2D78" multiColor logScale />}
          <SurfChart title="By Month" data={stats.byMonth} color="#FFE600" />
          <SurfChart title="By Day of Week" data={stats.byDayOfWeek} color="#00CFFF" />
        </>)}

        {/* Board metrics: location, wave size, fin setup, month, day of week */}
        {type === 'board' && (<>
          {stats.byLocation.length > 0 && <SurfChart title="By Location" data={stats.byLocation} color="#00CFFF" multiColor logScale />}
          <SurfChart title="By Wave Size" data={byWaveSize} color="#FF2D78" logScale />
          {stats.byFinType.length > 0 && <SurfChart title="By Fin Setup" data={stats.byFinType} color="#FF2D78" multiColor logScale />}
          <SurfChart title="By Month" data={stats.byMonth} color="#FFE600" />
          <SurfChart title="By Day of Week" data={stats.byDayOfWeek} color="#00CFFF" />
        </>)}

        {/* Fin metrics: wave size, board, location, month, day of week */}
        {type === 'fin' && (<>
          <SurfChart title="By Wave Size" data={byWaveSize} color="#FF2D78" logScale />
          {stats.byBoard.length > 0 && <SurfChart title="By Board" data={stats.byBoard} color="#BF00FF" multiColor logScale />}
          {stats.byLocation.length > 0 && <SurfChart title="By Location" data={stats.byLocation} color="#00CFFF" multiColor logScale />}
          <SurfChart title="By Month" data={stats.byMonth} color="#FFE600" />
          <SurfChart title="By Day of Week" data={stats.byDayOfWeek} color="#00CFFF" />
        </>)}
      </div>
    </div>
  )
}
