import { useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { formatDate, parseLocalDate } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

function SessionTooltip({ session, rowRect, tableRect }) {
  const top = Math.min(rowRect.bottom + 6, window.innerHeight - 240)

  return createPortal(
    <div
      style={{ top, left: tableRect.left, width: tableRect.width }}
      className="fixed z-50 gradient-border rounded-xl p-4 bg-retro-surface shadow-lg pointer-events-none flex flex-col gap-2.5"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-neon-yellow font-semibold text-sm">{formatDate(session.date)}</span>
        <span className="text-neon-pink text-xs font-medium">{session.waves} ft</span>
      </div>
      <div className="flex flex-col gap-1">
        <Row label="Location" value={session.location?.name} />
        <Row label="Board" value={session.board ? `${session.board.brand} ${session.board.model}` : null} />
        <Row label="Fins" value={session.fins ? `${session.fins.brand} ${session.fins.model} · ${session.fins.setup}` : null} />
      </div>
      {session.notes && (
        <p className="text-retro-muted text-xs leading-relaxed border-t border-retro-border pt-2.5">{session.notes}</p>
      )}
    </div>,
    document.body
  )
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-retro-muted shrink-0 w-14">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}

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
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [tooltip, setTooltip] = useState(null)
  const tableRef = useRef(null)

  function showTooltip(e, session) {
    setTooltip({
      session,
      rowRect: e.currentTarget.getBoundingClientRect(),
      tableRect: tableRef.current?.getBoundingClientRect() ?? e.currentTarget.getBoundingClientRect(),
    })
  }

  function hideTooltip() {
    setTooltip(null)
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
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/sessions/${s.id}/edit`)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeletingId(s.id)}>Delete</Button>
                  </div>
                </div>
                <div className="text-white text-sm">{s.location?.name ?? '—'}</div>
                <div className="text-retro-muted text-xs">
                  {s.board ? `${s.board.brand} ${s.board.model}` : '—'} ·{' '}
                  {s.fins ? `${s.fins.brand} ${s.fins.model}` : '—'}
                </div>
                {s.notes && (
                  <p className="text-retro-muted text-xs">{s.notes}</p>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div ref={tableRef} className="hidden sm:block overflow-x-auto max-h-[460px] overflow-y-auto">
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
                    onMouseEnter={e => showTooltip(e, s)}
                    onMouseLeave={hideTooltip}
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
                    <td className="px-4 py-3 text-retro-muted">{s.notes}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/sessions/${s.id}/edit`)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setDeletingId(s.id)}>
                          Delete
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

      {tooltip && <SessionTooltip session={tooltip.session} rowRect={tooltip.rowRect} tableRect={tooltip.tableRect} />}
    </>
  )
}
