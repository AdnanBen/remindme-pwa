import { memo, useCallback, useId } from "react"
import type React from "react"
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd"

type RenderItemResult = {
  content: React.ReactNode
  draggable?: boolean
}

type SortableSectionProps<T> = {
  items: T[]
  getId: (item: T) => string
  renderItem: (item: T) => RenderItemResult
  onReorder?: (items: T[]) => void | Promise<void>
  droppableId?: string
}

const SortableSectionInner = <T,>({
  items,
  getId,
  renderItem,
  onReorder,
  droppableId: providedDroppableId,
}: SortableSectionProps<T>) => {
  const fallbackDroppableId = useId()

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!onReorder) return
      const { destination, source } = result
      if (!destination) return
      if (destination.index === source.index) return

      const next = [...items]
      const [moved] = next.splice(source.index, 1)
      next.splice(destination.index, 0, moved)
      onReorder(next)
    },
    [items, onReorder],
  )

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={providedDroppableId ?? fallbackDroppableId}>
        {(droppableProvided) => (
          <div
            className="flex flex-col gap-2"
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
          >
            {items.map((item, index) => {
              const id = getId(item)
              const { content, draggable = true } = renderItem(item)
              return (
                <Draggable key={id} draggableId={id} index={index} isDragDisabled={!onReorder || !draggable}>
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                      className={snapshot.isDragging ? "opacity-70" : undefined}
                    >
                      {content}
                    </div>
                  )}
                </Draggable>
              )
            })}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export const SortableSection = memo(SortableSectionInner) as typeof SortableSectionInner
