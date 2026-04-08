import { MONTHS } from '../../lib/constants'

export function FilterBar({ filters, onChange, locations, boards, fins }) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  function set(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-retro-surface border-b border-retro-border">
      <p className="text-retro-muted text-xs font-display uppercase">Filter</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
          onClick={() => onChange({ year: '', month: '', locationId: '', boardId: '', finsId: '' })}
          className="text-retro-muted text-xs border border-retro-border rounded-lg px-3 py-2 hover:border-neon-pink hover:text-neon-pink transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
