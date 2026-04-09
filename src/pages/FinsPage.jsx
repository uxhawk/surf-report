import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFins } from '../hooks/useFins'
import { FIN_SETUPS } from '../lib/constants'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { PhotoUpload } from '../components/ui/PhotoUpload'
import { useToast } from '../components/ui/Toast'
import { SegmentedControl } from '../components/ui/SegmentedControl'

const EMPTY_FORM = { brand: '', model: '', setup: '', description: '', picture_url: '', archived: false }

function validate(form) {
  const errors = {}
  if (!form.brand.trim()) errors.brand = 'Brand is required'
  if (!form.model.trim()) errors.model = 'Model is required'
  if (!form.setup) errors.setup = 'Setup is required'
  return errors
}

const SETUP_COLORS = {
  Single: 'text-neon-yellow border-neon-yellow/40',
  Twin: 'text-neon-cyan border-neon-cyan/40',
  Thruster: 'text-neon-pink border-neon-pink/40',
  Quad: 'text-neon-purple border-neon-purple/40',
}

export default function FinsPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const { fins, loading, createFin, updateFin, deleteFin } = useFins()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [view, setView] = useState('active')

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setSaveError(null)
    setShowForm(true)
  }

  function openEdit(fin) {
    setEditingId(fin.id)
    setForm({
      brand: fin.brand,
      model: fin.model,
      setup: fin.setup,
      description: fin.description ?? '',
      picture_url: fin.picture_url ?? '',
      archived: fin.archived ?? false,
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

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setSaveError(null)

    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      setup: form.setup,
      description: form.description.trim() || null,
      picture_url: form.picture_url || null,
      archived: form.archived,
    }

    const { error } = editingId
      ? await updateFin(editingId, payload)
      : await createFin(payload)

    setSaving(false)
    if (error) { setSaveError(error.message); return }
    showToast(editingId ? 'Fins updated!' : 'Fins added!')
    closeForm()
  }

  async function handleDelete() {
    const { error } = await deleteFin(deletingId)
    if (error) {
      setDeleteError('Cannot delete — these fins are used by existing sessions.')
    }
    setDeletingId(null)
  }

  if (loading) return <Spinner />

  const deletingFin = fins.find(f => f.id === deletingId)
  const visible = fins.filter(f => view === 'archived' ? f.archived : !f.archived)

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <SegmentedControl
          options={[{ label: 'Active', value: 'active' }, { label: 'Archived', value: 'archived' }]}
          value={view}
          onChange={setView}
        />
        <Button size="sm" onClick={openAdd}>+ Add Fins</Button>
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
            {editingId ? 'Edit Fins' : 'New Fins'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Brand" required error={errors.brand}>
              <input type="text" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. FCS" />
            </FormField>
            <FormField label="Model" required error={errors.model}>
              <input type="text" value={form.model} onChange={e => set('model', e.target.value)} placeholder="e.g. Performer" />
            </FormField>
          </div>

          <FormField label="Setup" required error={errors.setup}>
            <select value={form.setup} onChange={e => set('setup', e.target.value)}>
              <option value="">Select setup…</option>
              {FIN_SETUPS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Any notes about these fins…"
              rows={2}
            />
          </FormField>

          <FormField label="Photo">
            <PhotoUpload value={form.picture_url} onChange={url => set('picture_url', url)} label="fins photo" />
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
              {saving ? 'Saving…' : editingId ? 'Save' : 'Add Fins'}
            </Button>
          </div>
        </form>
      )}

      {visible.length === 0 && !showForm ? (
        <EmptyState
          icon="🔱"
          title={view === 'archived' ? 'No archived fins' : 'No fins yet'}
          message={view === 'archived' ? 'Archived fins will appear here.' : 'Add your fin sets so you can track which setup you rode each session.'}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map(fin => (
            <div key={fin.id} className="gradient-border rounded-xl bg-retro-surface overflow-hidden">
              {fin.picture_url && (
                <img
                  src={fin.picture_url}
                  alt={`${fin.brand} ${fin.model}`}
                  className="w-full h-36 object-cover"
                />
              )}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {fin.brand} {fin.model}
                    </p>
                    <span className={`text-[9px] font-display border rounded px-1.5 py-0.5 shrink-0 ${SETUP_COLORS[fin.setup] ?? 'text-retro-muted border-retro-border'}`}>
                      {fin.setup}
                    </span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/gear/fins/${fin.id}/metrics`, { state: { name: `${fin.brand} ${fin.model}` } })}>Metrics</Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(fin)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => { setDeletingId(fin.id); setDeleteError(null) }}>Delete</Button>
                  </div>
                </div>
                {fin.description && (
                  <p className="text-retro-muted text-xs">{fin.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!deletingId}
        title="Delete Fins?"
        message={deletingFin ? `Delete "${deletingFin.brand} ${deletingFin.model}"?` : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
