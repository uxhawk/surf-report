import { useState } from 'react'
import { ChevronDown } from 'pixelarticons/react/ChevronDown.js'
import { ChevronUp } from 'pixelarticons/react/ChevronUp.js'
import { Settings2 } from 'pixelarticons/react/Settings2.js'
import { MONTHS } from '../../lib/constants'
import { Button } from '../ui/Button'

export function FilterBar({ filters, onChange, locations, boards, fins }) {
  const [open, setOpen] = useState(false)
  const years = [2026, 2025]

  function set(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-retro-surface border-b border-retro-border">
      <div className="px-4 pt-3 pb-2">
        <div className="flex rounded-lg border border-retro-border overflow-hidden" role="group" aria-label="Filter by year">
          {[{ label: 'All', value: '' }, ...years.map(y => ({ label: String(y), value: String(y) }))].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('year', opt.value)}
              className={`flex-1 px-3 py-2 text-xs font-display uppercase transition-colors ${
                filters.year === opt.value
                  ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan'
                  : 'text-retro-muted hover:text-retro-text'
              } ${opt.value !== '' ? 'border-l border-retro-border' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2">
        <p className="flex items-center gap-1.5 text-retro-muted text-xs font-display uppercase"><Settings2 className="w-4 h-4" /> Filter</p>
        <Button size="sm" variant="ghost" onClick={() => setOpen(prev => !prev)}>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
        <div className="px-4 pb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
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
        </div>
        </div>
      </div>
    </div>
  )
}
