import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Delete } from 'pixelarticons/react/Delete.js'
import { MagicEdit } from 'pixelarticons/react/MagicEdit.js'
import { formatDate, parseLocalDate } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'


const SORT_FIELDS = ['date', 'location', 'waves']

function getValue(s, field) {
  if (field === 'date') return s.date
  if (field === 'location') return s.location?.name ?? ''
  if (field === 'waves') return Number(s.waves) || 0
  return ''
}

function SortHeader({ label, field, sortField, sortDir, onSort, className = '' }) {
  const active = sortField === field
  return (
    <th
      className={`text-left px-4 py-3 font-medium cursor-pointer select-none hover:text-white transition-colors ${active ? 'text-white' : ''} ${className}`}
      onClick={() => onSort(field)}
    >
      {label}
      <span className="ml-1 inline-block w-2 text-center">
        {active ? (sortDir === 'desc' ? '↓' : '↑') : ''}
      </span>
    </th>
  )
}

export function SessionsTable({ sessions, onDelete }) {
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState(null)
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  function toggleExpand(id) {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function handleSort(field) {
    if (sortField === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const displayed = useMemo(() => {
    let rows = sessions
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(s =>
        s.location?.name?.toLowerCase().includes(q) ||
        (s.board ? `${s.board.brand} ${s.board.model}`.toLowerCase().includes(q) : false) ||
        (s.fins ? `${s.fins.brand} ${s.fins.model}`.toLowerCase().includes(q) : false) ||
        s.notes?.toLowerCase().includes(q) ||
        formatDate(s.date).toLowerCase().includes(q)
      )
    }
    return [...rows].sort((a, b) => {
      const av = getValue(a, sortField)
      const bv = getValue(b, sortField)
      const cmp = typeof av === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv))
      return sortDir === 'desc' ? -cmp : cmp
    })
  }, [sessions, search, sortField, sortDir])

  const deletingSession = sessions.find(s => s.id === deletingId)

  return (
    <>
      {/* Search + mobile sort */}
      <div className="px-4 pt-4 pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-2 flex-1">
          <input
            type="search"
            placeholder="Search sessions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
          />
          {search.trim() && (
            <span className="text-retro-muted text-xs whitespace-nowrap">
              {displayed.length} result{displayed.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <span className="text-retro-muted text-xs">Sort:</span>
          <select
            value={sortField}
            onChange={e => { setSortField(e.target.value); setSortDir('desc') }}
            className="flex-1 text-xs"
          >
            <option value="date">Date</option>
            <option value="location">Location</option>
            <option value="waves">Waves</option>
          </select>
          <button
            type="button"
            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            className="text-retro-muted text-xs border border-retro-border rounded px-2 py-1 hover:text-white transition-colors"
          >
            {sortDir === 'desc' ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <p className="text-retro-muted text-sm text-center py-8 px-4">
          No sessions match your filters.
        </p>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="flex flex-col divide-y divide-retro-border sm:hidden max-h-[460px] overflow-y-auto">
            {displayed.map(s => (
              <div key={s.id} className="px-4 py-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-neon-yellow font-semibold text-sm">{formatDate(s.date)}</span>
                    <span className="ml-2 text-retro-muted text-xs">{s.waves} ft</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/sessions/${s.id}/edit`)}><MagicEdit className="w-4 h-4" /> Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeletingId(s.id)}><Delete className="w-4 h-4" /> Delete</Button>
                  </div>
                </div>
                <div className="text-white text-sm">{s.location?.name ?? '—'}</div>
                <div className="text-retro-muted text-xs">
                  {s.board ? `${s.board.brand} ${s.board.model}` : '—'} ·{' '}
                  {s.fins ? `${s.fins.brand} ${s.fins.model}` : '—'}
                </div>
                {s.notes && (
                  <div>
                    <p className={`text-retro-muted text-xs ${expandedIds.has(s.id) ? '' : 'line-clamp-2'}`}>{s.notes}</p>
                    <button
                      onClick={() => toggleExpand(s.id)}
                      className="text-retro-muted/60 text-xs hover:text-retro-muted transition-colors mt-0.5"
                    >
                      {expandedIds.has(s.id) ? 'Show less' : 'Show more'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto max-h-[460px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-retro-surface">
                <tr className="text-retro-muted text-xs uppercase border-b border-retro-border">
                  <SortHeader label="Date" field="date" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Location" field="location" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <th className="text-left px-4 py-3 font-medium">Board</th>
                  <th className="text-left px-4 py-3 font-medium">Fins</th>
                  <SortHeader label="Waves" field="waves" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <th className="text-left px-4 py-3 font-medium">Notes</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-retro-border">
                {displayed.map(s => (
                  <tr
                    key={s.id}
                    className="hover:bg-retro-surface2 transition-colors"
                  >
                    <td className="px-4 py-3 text-neon-yellow whitespace-nowrap">{formatDate(s.date)}</td>
                    <td className="px-4 py-3 text-white">{s.location?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-white whitespace-nowrap">
                      {s.board ? `${s.board.brand} ${s.board.model}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-white whitespace-nowrap">
                      {s.fins ? `${s.fins.brand} ${s.fins.model}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-retro-muted">{s.waves} ft</td>
                    <td className="px-4 py-3 text-retro-muted max-w-xs">
                      {s.notes && (
                        <div>
                          <p className={expandedIds.has(s.id) ? '' : 'truncate'}>{s.notes}</p>
                          <button
                            onClick={() => toggleExpand(s.id)}
                            className="text-retro-muted/60 text-xs hover:text-retro-muted transition-colors mt-0.5"
                          >
                            {expandedIds.has(s.id) ? 'Show less' : 'Show more'}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/sessions/${s.id}/edit`)}>
                          <MagicEdit className="w-4 h-4" /> Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setDeletingId(s.id)}>
                          <Delete className="w-4 h-4" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        open={!!deletingId}
        title="Delete Session?"
        message={deletingSession ? `${formatDate(deletingSession.date)} at ${deletingSession.location?.name ?? 'unknown'}` : ''}
        confirmLabel="Delete"
        onConfirm={async () => { await onDelete(deletingId); setDeletingId(null) }}
        onCancel={() => setDeletingId(null)}
      />

    </>
  )
}
