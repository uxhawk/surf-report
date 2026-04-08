import { useEffect } from 'react'
import { Button } from './Button'

export function Modal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  // Trap focus / prevent body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-sm gradient-border rounded-xl p-6 bg-retro-surface flex flex-col gap-4">
        <h2 id="modal-title" className="text-neon-yellow font-display text-xs leading-relaxed">
          {title}
        </h2>
        {message && <p className="text-white text-sm">{message}</p>}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
