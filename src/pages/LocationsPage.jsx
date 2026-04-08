import { useState } from 'react'
import { useLocations } from '../hooks/useLocations'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'

const EMPTY_FORM = { name: '', description: '' }

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required'
  return errors
}

export default function LocationsPage() {
  const { locations, loading, createLocation, updateLocation, deleteLocation } = useLocations()

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

  function openEdit(location) {
    setEditingId(location.id)
    setForm({ name: location.name, description: location.description ?? '' })
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

    const payload = { name: form.name.trim(), description: form.description.trim() || null }
    const { error } = editingId
      ? await updateLocation(editingId, payload)
      : await createLocation(payload)

    setSaving(false)
    if (error) { setSaveError(error.message); return }
    closeForm()
  }

  async function handleDelete() {
    const { error } = await deleteLocation(deletingId)
    if (error) {
      setDeleteError('Cannot delete — this location is used by existing sessions.')
    }
    setDeletingId(null)
  }

  if (loading) return <Spinner />

  const deletingLocation = locations.find(l => l.id === deletingId)

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-retro-muted text-xs">{locations.length} location{locations.length !== 1 ? 's' : ''}</span>
        <Button size="sm" onClick={openAdd}>+ Add Location</Button>
      </div>

      {deleteError && (
        <p className="text-neon-pink text-xs bg-neon-pink/10 border border-neon-pink/30 rounded-lg p-3">
          {deleteError}
        </p>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="gradient-border rounded-xl p-4 bg-retro-surface flex flex-col gap-4"
        >
          <h2 className="text-neon-yellow font-display text-[9px]">
            {editingId ? 'Edit Location' : 'New Location'}
          </h2>

          <FormField label="Name" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Trestles, Rincon…"
              autoFocus
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Any notes about this spot…"
              rows={3}
            />
          </FormField>

          {saveError && (
            <p className="text-neon-pink text-xs">{saveError}</p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={closeForm}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save' : 'Add Location'}
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {locations.length === 0 && !showForm ? (
        <EmptyState
          icon="📍"
          title="No locations yet"
          message="Add your go-to surf spots so you can select them when logging sessions."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {locations.map(location => (
            <div key={location.id} className="gradient-border rounded-xl p-4 bg-retro-surface flex items-start justify-between gap-3">
              <div>
                <p className="text-white font-semibold text-sm">{location.name}</p>
                {location.description && (
                  <p className="text-retro-muted text-xs mt-1">{location.description}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(location)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => { setDeletingId(location.id); setDeleteError(null) }}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!deletingId}
        title="Delete Location?"
        message={`Delete "${deletingLocation?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
