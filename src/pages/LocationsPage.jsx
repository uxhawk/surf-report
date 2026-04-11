import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocations } from '../hooks/useLocations'
import { FormField } from '../components/ui/FormField'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { SegmentedControl } from '../components/ui/SegmentedControl'
import { PhotoUpload } from '../components/ui/PhotoUpload'
import { KebabMenu } from '../components/ui/KebabMenu'
import { PlusBox } from 'pixelarticons/react/PlusBox.js'
import { Database } from 'pixelarticons/react/Database.js'
import { Send } from 'pixelarticons/react/Send.js'
import { Angry } from 'pixelarticons/react/Angry.js'
import { Archive } from 'pixelarticons/react/Archive.js'
import { ImageNew } from 'pixelarticons/react/ImageNew.js'
import { AArrowUp } from 'pixelarticons/react/AArrowUp.js'
import { AArrowDown } from 'pixelarticons/react/AArrowDown.js'
import { LOCATION_TYPES, LOCATION_TYPE_COLORS } from '../lib/constants'

const EMPTY_FORM = { name: '', description: '', types: [], picture_url: '', archived: false }

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required'
  return errors
}

export default function LocationsPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const { locations, loading, createLocation, updateLocation, deleteLocation } = useLocations()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [view, setView] = useState('active')
  const [sortAsc, setSortAsc] = useState(true)

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setSaveError(null)
    setShowForm(true)
  }

  function openEdit(location) {
    setEditingId(location.id)
    setForm({ name: location.name, description: location.description ?? '', types: location.types ?? [], picture_url: location.picture_url ?? '', archived: location.archived ?? false })
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

  function toggleType(type) {
    setForm(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    setSaveError(null)

    const payload = { name: form.name.trim(), description: form.description.trim() || null, types: form.types, picture_url: form.picture_url || null, archived: form.archived }
    const { error } = editingId
      ? await updateLocation(editingId, payload)
      : await createLocation(payload)

    setSaving(false)
    if (error) { setSaveError(error.message); return }
    showToast(editingId ? 'Location updated!' : 'Location added!')
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
  const visible = locations
    .filter(l => view === 'archived' ? l.archived : !l.archived)
    .sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <SegmentedControl
          options={[{ label: <><ImageNew className="w-3 h-3" /> Active</>, value: 'active' }, { label: <><Archive className="w-3 h-3" /> Archived</>, value: 'archived' }]}
          value={view}
          onChange={setView}
        />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setSortAsc(prev => !prev)}>
            {sortAsc ? <AArrowUp className="w-4 h-4" /> : <AArrowDown className="w-4 h-4" />}
          </Button>
          <Button size="sm" onClick={openAdd}><PlusBox className="w-4 h-4" /> Add Location</Button>
        </div>
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

          <FormField label="Type">
            <div className="flex flex-wrap gap-3 pt-1">
              {LOCATION_TYPES.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.types.includes(type)}
                    onChange={() => toggleType(type)}
                  />
                  <span className="text-white text-sm">{type}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Photo">
            <PhotoUpload value={form.picture_url} onChange={url => set('picture_url', url)} label="location photo" />
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

          {saveError && (
            <p className="text-neon-pink text-xs">{saveError}</p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={closeForm}><Angry className="w-4 h-4" /> Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : <><Send className="w-4 h-4" /> {editingId ? 'Save' : 'Add Location'}</>}
            </Button>
          </div>
        </form>
      )}

      {/* List */}
      {visible.length === 0 && !showForm ? (
        <EmptyState
          icon="📍"
          title={view === 'archived' ? 'No archived locations' : 'No locations yet'}
          message={view === 'archived' ? 'Archived locations will appear here.' : 'Add your go-to surf spots so you can select them when logging sessions.'}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map(location => (
            <div key={location.id} className="gradient-border rounded-xl bg-retro-surface overflow-hidden">
              {location.picture_url && (
                <img
                  src={location.picture_url}
                  alt={location.name}
                  className="w-full h-40 object-cover"
                />
              )}
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-white font-display text-[10px]">{location.name}</p>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/profile/locations/${location.id}/metrics`, { state: { name: location.name } })}><Database className="w-4 h-4" /> View Metrics</Button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {location.types?.map(type => (
                    <span
                      key={type}
                      className={`text-[9px] font-display border rounded px-1.5 py-0.5 ${LOCATION_TYPE_COLORS[type] ?? 'text-retro-muted border-retro-border'}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <KebabMenu onEdit={() => openEdit(location)} onDelete={() => { setDeletingId(location.id); setDeleteError(null) }} />
              </div>
              {location.description && (
                <p className="text-retro-muted text-xs">{location.description}</p>
              )}
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
