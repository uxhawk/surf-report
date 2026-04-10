import { useState, useRef, useEffect } from 'react'
import { Delete } from 'pixelarticons/react/Delete.js'
import { MagicEdit } from 'pixelarticons/react/MagicEdit.js'
import { MoreHorizontal } from 'pixelarticons/react/MoreHorizontal.js'

export function KebabMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center justify-center w-7 h-7 rounded-lg text-retro-muted border border-retro-border hover:border-retro-muted transition-colors duration-150"
        aria-label="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-retro-surface border border-retro-border rounded-lg shadow-lg overflow-hidden min-w-[100px]">
          <button
            onClick={() => { onEdit(); setOpen(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-retro-muted hover:bg-white/5 transition-colors duration-100"
          >
            <MagicEdit className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => { onDelete(); setOpen(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neon-pink hover:bg-neon-pink/10 transition-colors duration-100"
          >
            <Delete className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
