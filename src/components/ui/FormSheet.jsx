import { useEffect } from 'react'
import { Button } from './Button'
import { Angry } from 'pixelarticons/react/Angry.js'
import { Send } from 'pixelarticons/react/Send.js'

/**
 * Full-page modal for add/edit forms. Title bar pinned top, cancel/submit
 * pinned bottom (like the app's BottomNav), fields scroll in between.
 */
export function FormSheet({ open, title, submitLabel, saving = false, error = null, onSubmit, onCancel, children }) {
  // Prevent body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-retro-bg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-sheet-title"
    >
      <form onSubmit={onSubmit} noValidate className="h-full max-w-2xl mx-auto flex flex-col">
        <header className="bg-retro-bg border-b border-retro-border px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
          <h2 id="form-sheet-title" className="font-display text-neon-yellow text-[10px] leading-none truncate">
            {title}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {children}
        </div>

        <div className="bg-retro-surface border-t border-retro-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex flex-col gap-3">
          {error && <p className="text-neon-pink text-xs">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
              <Angry className="w-4 h-4" /> Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : <><Send className="w-4 h-4" /> {submitLabel}</>}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
