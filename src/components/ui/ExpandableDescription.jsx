import { useState, useEffect } from 'react'
import { Button } from './Button'

const PREVIEW_LEN = 165

export function ExpandableDescription({ text, className = '' }) {
  const [expanded, setExpanded] = useState(false)
  const needsToggle = text.length > PREVIEW_LEN

  useEffect(() => {
    setExpanded(false)
  }, [text])

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <p className="text-retro-muted text-xs whitespace-pre-wrap">
        {!expanded && needsToggle ? `${text.slice(0, PREVIEW_LEN)}…` : text}
      </p>
      {needsToggle && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="self-start -ml-1 h-7 px-2 text-[11px]"
          aria-expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? 'View less' : 'View more'}
        </Button>
      )}
    </div>
  )
}
