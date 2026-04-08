import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../lib/utils'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

export function SessionsTable({ sessions, onDelete }) {
  const navigate = useNavigate()
  const [deletingId, setDeletingId] = useState(null)

  const deletingSession = sessions.find(s => s.id === deletingId)

  async function handleConfirmDelete() {
    await onDelete(deletingId)
    setDeletingId(null)
  }

  if (!sessions.length) {
    return (
      <p className="text-retro-muted text-sm text-center py-8 px-4">
        No sessions match your filters.
      </p>
    )
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="flex flex-col divide-y divide-retro-border sm:hidden">
        {sessions.map(s => (
          <div key={s.id} className="px-4 py-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-neon-yellow font-semibold text-sm">{formatDate(s.date)}</span>
                <span className="ml-2 text-retro-muted text-xs">{s.waves} ft</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/sessions/${s.id}/edit`)}
                  className="text-neon-cyan text-xs underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletingId(s.id)}
                  className="text-neon-pink text-xs underline"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="text-white text-sm">{s.location?.name ?? '—'}</div>
            <div className="text-retro-muted text-xs">
              {s.board ? `${s.board.brand} ${s.board.model}` : '—'} ·{' '}
              {s.fins ? `${s.fins.brand} ${s.fins.model}` : '—'}
            </div>
            {s.notes && (
              <p className="text-retro-muted text-xs line-clamp-2">{s.notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-retro-muted text-xs uppercase border-b border-retro-border">
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Location</th>
              <th className="text-left px-4 py-3 font-medium">Board</th>
              <th className="text-left px-4 py-3 font-medium">Fins</th>
              <th className="text-left px-4 py-3 font-medium">Waves</th>
              <th className="text-left px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-retro-border">
            {sessions.map(s => (
              <tr key={s.id} className="hover:bg-retro-surface2 transition-colors">
                <td className="px-4 py-3 text-neon-yellow whitespace-nowrap">{formatDate(s.date)}</td>
                <td className="px-4 py-3 text-white">{s.location?.name ?? '—'}</td>
                <td className="px-4 py-3 text-white whitespace-nowrap">
                  {s.board ? `${s.board.brand} ${s.board.model}` : '—'}
                </td>
                <td className="px-4 py-3 text-white whitespace-nowrap">
                  {s.fins ? `${s.fins.brand} ${s.fins.model}` : '—'}
                </td>
                <td className="px-4 py-3 text-retro-muted">{s.waves} ft</td>
                <td className="px-4 py-3 text-retro-muted max-w-xs truncate">{s.notes}</td>
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

      <Modal
        open={!!deletingId}
        title="Delete Session?"
        message={deletingSession ? `${formatDate(deletingSession.date)} at ${deletingSession.location?.name ?? 'unknown'}` : ''}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </>
  )
}
