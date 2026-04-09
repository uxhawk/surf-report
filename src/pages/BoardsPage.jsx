import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoards } from '../hooks/useBoards'
import { FIN_CONFIGS } from '../lib/constants'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { PhotoUpload } from '../components/ui/PhotoUpload'
import { useToast } from '../components/ui/Toast'

function formatBoardLength(inches) {
  const feet = Math.floor(inches / 12)
  const remainingInches = inches % 12
  return `${feet}'${remainingInches}"`
}

const EMPTY_FORM = {
  brand: '', model: '', length_inches: '', volume: '',
  description: '', fin_configurations: [], picture_url: '', archived: false,
}

function validate(form) {
  const errors = {}
  if (!form.brand.trim()) errors.brand = 'Brand is required'
  if (!form.model.trim()) errors.model = 'Model is required'
  if (!form.length_inches) errors.length_inches = 'Length is required'
  if (Number(form.length_inches) <= 0) errors.length_inches = 'Length must be positive'
  if (form.fin_configurations.length === 0) errors.fin_configurations = 'Select at least one fin configuration'
  return errors
}

function BoardCard({ board, onEdit, onDelete, onMetrics }) {
  return (
    <div className={`gradient-border rounded-xl bg-retro-surface overflow-hidden${board.archived ? ' opacity-50' : ''}`}>
      {board.picture_url && (
        <img
          src={board.picture_url}
          alt={`${board.brand} ${board.model}`}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {board.brand} {board.model}
            </p>
            {board.archived && (
              <span className="text-[9px] font-display text-retro-muted border border-retro-border rounded px-1.5 py-0.5 shrink-0">
                ARCHIVED
              </span>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="ghost" onClick={() => onMetrics(board)}>Metrics</Button>
            <Button size="sm" variant="ghost" onClick={() => onEdit(board)}>Edit</Button>
            <Button size="sm" variant="danger" onClick={() => onDelete(board.id)}>Delete</Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-retro-muted text-xs">
            {formatBoardLength(board.length_inches)}
            {board.volume ? ` · ${board.volume}L` : ''}
          </span>
          {board.fin_configurations?.map(c => (
            <span
              key={c}
              className="text-[9px] font-display text-neon-cyan border border-neon-cyan/40 rounded px-1.5 py-0.5"
            >
              {c}
            </span>
          ))}
        </div>
        {board.description && (
          <p className="text-retro-muted text-xs">{board.description}</p>
        )}
      </div>
    </div>
  )
}

export default function BoardsPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const { boards, loading, createBoard, updateBoard, deleteBoard } = useBoards()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setSaveError(null)
    setShowForm(true)
  }

  function openEdit(board) {
    setEditingId(board.id)
    setForm({
      brand: board.brand,
      model: board.model,
      length_inches: String(board.length_inches),
      volume: board.volume != null ? String(board.volume) : '',
      description: board.description ?? '',
      fin_configurations: board.fin_configurations ?? [],
      picture_url: board.picture_url ?? '',
      archived: board.archived ?? false,
    })
    setErrors({})
    setSaveError(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setSaveError(null)
  }

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  function toggleFinConfig(config) {
    setForm(prev => {
      const configs = prev.fin_configurations.includes(config)
        ? prev.fin_configurations.filter(c => c !== config)
        : [...prev.fin_configurations, config]
      return { ...prev, fin_configurations: configs }
    })
    if (errors.fin_configurations) setErrors(prev => ({ ...prev, fin_configurations: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setSaveError(null)

    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      length_inches: Number(form.length_inches),
      volume: form.volume ? Number(form.volume) : null,
      description: form.description.trim() || null,
      fin_configurations: form.fin_configurations,
      picture_url: form.picture_url || null,
      archived: form.archived,
    }

    const { error } = editingId
      ? await updateBoard(editingId, payload)
      : await createBoard(payload)

    setSaving(false)
    if (error) { setSaveError(error.message); return }
    showToast(editingId ? 'Board updated!' : 'Board added!')
    closeForm()
  }

  async function handleDelete() {
    const { error } = await deleteBoard(deletingId)
    if (error) {
      setDeleteError('Cannot delete — this board is used by existing sessions.')
    }
    setDeletingId(null)
  }

  if (loading) return <Spinner />

  const deletingBoard = boards.find(b => b.id === deletingId)

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-retro-muted text-xs">
          {boards.filter(b => !b.archived).length} board{boards.filter(b => !b.archived).length !== 1 ? 's' : ''}
          {boards.some(b => b.archived) && <span className="ml-1 opacity-50">· {boards.filter(b => b.archived).length} archived</span>}
        </span>
        <Button size="sm" onClick={openAdd}>+ Add Board</Button>
      </div>

      {deleteError && (
        <p className="text-neon-pink text-xs bg-neon-pink/10 border border-neon-pink/30 rounded-lg p-3">
          {deleteError}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="gradient-border rounded-xl p-4 bg-retro-surface flex flex-col gap-4"
        >
          <h2 className="text-neon-yellow font-display text-[9px]">
            {editingId ? 'Edit Board' : 'New Board'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Brand" required error={errors.brand}>
              <input type="text" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Channel Islands" />
            </FormField>
            <FormField label="Model" required error={errors.model}>
              <input type="text" value={form.model} onChange={e => set('model', e.target.value)} placeholder="e.g. Fever" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label='Length (inches)' required error={errors.length_inches}>
              <input type="number" value={form.length_inches} onChange={e => set('length_inches', e.target.value)} placeholder='72' min="1" step="0.5" />
            </FormField>
            <FormField label="Volume (liters)">
              <input type="number" value={form.volume} onChange={e => set('volume', e.target.value)} placeholder="32.5" min="0" step="0.1" />
            </FormField>
          </div>

          <FormField label="Fin Configuration" required error={errors.fin_configurations}>
            <div className="flex flex-wrap gap-3 pt-1">
              {FIN_CONFIGS.map(config => (
                <label key={config} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.fin_configurations.includes(config)}
                    onChange={() => toggleFinConfig(config)}
                  />
                  <span className="text-white text-sm">{config}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Description">
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Any notes about this board…" rows={2} />
          </FormField>

          <FormField label="Photo">
            <PhotoUpload value={form.picture_url} onChange={url => set('picture_url', url)} label="board photo" />
          </FormField>

          {editingId && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.archived}
                onChange={e => set('archived', e.target.checked)}
              />
              <span className="text-retro-muted text-sm">
                Archive <span className="text-retro-muted/60 text-xs">(hide from session logging)</span>
              </span>
            </label>
          )}

          {saveError && <p className="text-neon-pink text-xs">{saveError}</p>}

          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={closeForm}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save' : 'Add Board'}
            </Button>
          </div>
        </form>
      )}

      {boards.length === 0 && !showForm ? (
        <EmptyState
          icon="🏄"
          title="No boards yet"
          message="Add your boards so you can track which one you ride each session."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {boards.map(board => (
            <BoardCard
              key={board.id}
              board={board}
              onEdit={openEdit}
              onDelete={(id) => { setDeletingId(id); setDeleteError(null) }}
              onMetrics={b => navigate(`/gear/boards/${b.id}/metrics`, { state: { name: `${b.brand} ${b.model}` } })}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!deletingId}
        title="Delete Board?"
        message={deletingBoard ? `Delete "${deletingBoard.brand} ${deletingBoard.model}"?` : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
