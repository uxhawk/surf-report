import { useState } from 'react'
import { ChevronDown } from 'pixelarticons/react/ChevronDown.js'
import { ChevronUp } from 'pixelarticons/react/ChevronUp.js'
import { Settings2 } from 'pixelarticons/react/Settings2.js'
import { ZapOff } from 'pixelarticons/react/ZapOff.js'
import { Calendar2 } from 'pixelarticons/react/Calendar2.js'
import { MONTHS } from '../../lib/constants'
import { Button } from '../ui/Button'

export function FilterBar({ filters, onChange, locations, boards, fins }) {
  const [open, setOpen] = useState(false)
  const years = [2026, 2025]
  const hasFilters = Object.values(filters).some(v => v !== '')

  function set(key, value) {
    onChange({ ...filters, [key]: value })
  }

  function clearAll() {
    onChange({ year: '', month: '', locationId: '', boardId: '', finsId: '' })
  }

  return (
    <div className="bg-retro-surface border-b border-retro-border">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="flex items-center gap-1.5 text-retro-muted text-xs font-display uppercase"><Settings2 className="w-4 h-4" /> Filter</p>
        <div className="flex items-center gap-1.5">
          {!hasFilters && (
            <Button size="sm" variant="ghost" onClick={() => onChange({ year: String(new Date().getFullYear()), month: '', locationId: '', boardId: '', finsId: '' })}>
              <Calendar2 className="w-4 h-4" /> {new Date().getFullYear()}
            </Button>
          )}
          <Button size="sm" variant="ghost" disabled={!hasFilters} onClick={clearAll}>
            <ZapOff className="w-4 h-4" /> Clear
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(prev => !prev)}>
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
        <div className="px-4 pb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <select
            value={filters.year}
            onChange={e => set('year', e.target.value)}
            aria-label="Filter by year"
          >
            <option value="">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={filters.month}
            onChange={e => set('month', e.target.value)}
            aria-label="Filter by month"
          >
            <option value="">All Months</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>

          <select
            value={filters.locationId}
            onChange={e => set('locationId', e.target.value)}
            aria-label="Filter by location"
          >
            <option value="">All Locations</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <select
            value={filters.boardId}
            onChange={e => set('boardId', e.target.value)}
            aria-label="Filter by board"
          >
            <option value="">All Boards</option>
            {boards.map(b => (
              <option key={b.id} value={b.id}>{b.brand} {b.model}</option>
            ))}
          </select>

          <select
            value={filters.finsId}
            onChange={e => set('finsId', e.target.value)}
            aria-label="Filter by fins"
          >
            <option value="">All Fins</option>
            {fins.map(f => (
              <option key={f.id} value={f.id}>{f.brand} {f.model}</option>
            ))}
          </select>

          <button
            type="button"
            disabled={!hasFilters}
            onClick={clearAll}
            className="inline-flex items-center justify-center gap-1.5 text-retro-muted text-xs border border-retro-border rounded-lg px-3 py-2 hover:border-neon-pink hover:text-neon-pink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ZapOff className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
