import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Delete } from 'pixelarticons/react/Delete.js'
import { MagicEdit } from 'pixelarticons/react/MagicEdit.js'
import { MoreHorizontal } from 'pixelarticons/react/MoreHorizontal.js'

export function KebabMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    if (!buttonRef.current || !menuRef.current) return
    const btn = buttonRef.current.getBoundingClientRect()
    const menu = menuRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - btn.bottom
    const top = spaceBelow < menu.height + 8
      ? btn.top + window.scrollY - menu.height - 4
      : btn.bottom + window.scrollY + 4
    const left = Math.max(8, btn.right + window.scrollX - menu.width)
    setPos({ top, left })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    function handleClickOutside(e) {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', () => setOpen(false), { once: true })
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, updatePosition])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center justify-center w-7 h-7 rounded-lg text-retro-muted border border-retro-border hover:border-retro-muted transition-colors duration-150"
        aria-label="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'absolute', top: pos.top, left: pos.left }}
          className="z-[9999] bg-retro-surface border border-retro-border rounded-lg shadow-lg min-w-[100px]"
        >
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
        </div>,
        document.body
      )}
    </div>
  )
}
