import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Menu } from 'pixelarticons/react/Menu.js'
import { SpotForecastCard } from './SpotForecastCard'

function SortableSpotCard({ spot, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: spot.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`gradient-border rounded-xl bg-retro-surface flex items-stretch relative ${isDragging ? 'opacity-90 shadow-neon-cyan' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="px-1.5 flex items-center text-retro-muted/50 hover:text-retro-muted border-r border-retro-border touch-none cursor-grab active:cursor-grabbing"
        aria-label={`Reorder ${spot.name}`}
      >
        <Menu className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <SpotForecastCard
          framed={false}
          name={spot.name}
          latitude={spot.latitude}
          longitude={spot.longitude}
          faces={spot.faces_degrees ?? undefined}
          onClick={onOpen}
        />
      </div>
    </div>
  )
}

/**
 * Drag-to-reorder list of spot forecast cards. Dragging starts from the
 * grip handle only, so the cards stay tappable and the page stays
 * scrollable on touch devices. Also keyboard-sortable (Space + arrows).
 */
export function SortableSpotList({ spots, onReorder, onOpen }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIndex = spots.findIndex(s => s.id === active.id)
    const newIndex = spots.findIndex(s => s.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onReorder(arrayMove(spots, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={spots.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {spots.map(spot => (
            <SortableSpotCard key={spot.id} spot={spot} onOpen={() => onOpen(spot)} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
