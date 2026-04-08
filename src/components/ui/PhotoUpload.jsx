import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

export function PhotoUpload({ value, onChange, label = 'Photo' }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const inputRef = useRef(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { data, error } = await supabase.storage
      .from('gear-photos')
      .upload(path, file, { upsert: true })

    if (error) {
      setUploadError('Upload failed. Make sure the "gear-photos" bucket exists in Supabase Storage.')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('gear-photos')
      .getPublicUrl(data.path)

    onChange(publicUrl)
    setUploading(false)
  }

  async function handleRemove() {
    onChange('')
  }

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative w-full max-w-xs">
          <img
            src={value}
            alt="Gear photo"
            className="w-full h-48 object-cover rounded-lg border border-retro-border"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black/60 text-neon-pink rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-black/80"
            aria-label="Remove photo"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full max-w-xs h-32 border-2 border-dashed border-retro-border rounded-lg flex flex-col items-center justify-center gap-2 text-retro-muted hover:border-neon-cyan hover:text-neon-cyan transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-sm">Uploading...</span>
          ) : (
            <>
              <span className="text-2xl">📷</span>
              <span className="text-xs">Add {label}</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label={`Upload ${label}`}
      />
      {uploadError && <p className="text-neon-pink text-xs">{uploadError}</p>}
    </div>
  )
}
