import { Delete } from 'pixelarticons/react/Delete.js'
import { MagicEdit } from 'pixelarticons/react/MagicEdit.js'

export function CardActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="flex items-center justify-center w-7 h-7 rounded-lg text-retro-muted border border-retro-border hover:border-retro-muted transition-colors duration-150"
        aria-label="Edit"
      >
        <MagicEdit className="w-4 h-4" />
      </button>
      <button
        onClick={onDelete}
        className="flex items-center justify-center w-7 h-7 rounded-lg text-neon-pink border border-retro-border hover:border-neon-pink/60 transition-colors duration-150"
        aria-label="Delete"
      >
        <Delete className="w-4 h-4" />
      </button>
    </div>
  )
}
