import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { RecurringReminder } from "../types"
import { RecurringInlineForm } from "./RecurringInlineForm"
import { RecurringItem } from "./RecurringItem"
import { SortableSection } from "./SortableSection"

type RecurringListProps = {
  recurring: RecurringReminder[]
  loading: boolean
  addTrigger?: number
  onAdd: (data: Omit<RecurringReminder, "id" | "createdAt">) => Promise<void> | void
  onUpdate: (reminder: RecurringReminder) => Promise<void> | void
  onReorderEnabled: (reminders: RecurringReminder[]) => Promise<void> | void
  onReorderDisabled: (reminders: RecurringReminder[]) => Promise<void> | void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

const RecurringListComponent = ({
  recurring,
  loading,
  addTrigger,
  onAdd,
  onUpdate,
  onReorderEnabled,
  onReorderDisabled,
  onToggle,
  onDelete,
}: RecurringListProps) => {
  const [openForm, setOpenForm] = useState<{ mode: "add" | "edit"; id?: string } | null>(null)
  const lastTrigger = useRef(addTrigger)

  useEffect(() => {
    if (addTrigger !== undefined && addTrigger !== lastTrigger.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional trigger detection
      setOpenForm({ mode: "add" })
    }
    lastTrigger.current = addTrigger
  }, [addTrigger])

  const { enabled, disabled } = useMemo(() => {
    const enabledItems = recurring.filter((r) => r.enabled)
    const disabledItems = recurring.filter((r) => !r.enabled)
    return { enabled: enabledItems, disabled: disabledItems }
  }, [recurring])

  const closeForm = useCallback(() => setOpenForm(null), [])
  const startEdit = useCallback((reminder: RecurringReminder) => setOpenForm({ mode: "edit", id: reminder.id }), [])

  const editingReminder =
    openForm?.mode === "edit" && openForm.id ? recurring.find((r) => r.id === openForm.id) || null : null

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {openForm?.mode === "add" && (
        <RecurringInlineForm key="add" editing={null} onAdd={onAdd} onUpdate={onUpdate} onClose={closeForm} />
      )}

      {enabled.length === 0 && disabled.length === 0 && openForm?.mode !== "add" && (
        <div className="text-center p-8 text-base-content/50 rounded-2xl border border-dashed border-base-300">
          <p className="font-medium">No recurring reminders</p>
          <p className="text-sm">Tap "+" in the header to set your first recurring reminder</p>
        </div>
      )}

      <SortableSection
        items={enabled}
        getId={(r) => r.id}
        onReorder={onReorderEnabled}
        renderItem={(reminder) =>
          openForm?.mode === "edit" && openForm.id === reminder.id && editingReminder
            ? {
                content: (
                  <RecurringInlineForm
                    editing={editingReminder}
                    onAdd={onAdd}
                    onUpdate={onUpdate}
                    onClose={closeForm}
                  />
                ),
                draggable: false,
              }
            : {
                content: (
                  <RecurringItem reminder={reminder} onToggle={onToggle} onEdit={startEdit} onDelete={onDelete} />
                ),
              }
        }
      />

      {disabled.length > 0 && (
        <>
          <div className="divider text-sm text-base-content/50">Disabled</div>
          <SortableSection
            items={disabled}
            getId={(r) => r.id}
            onReorder={onReorderDisabled}
            renderItem={(reminder) =>
              openForm?.mode === "edit" && openForm.id === reminder.id && editingReminder
                ? {
                    content: (
                      <RecurringInlineForm
                        editing={editingReminder}
                        onAdd={onAdd}
                        onUpdate={onUpdate}
                        onClose={closeForm}
                      />
                    ),
                    draggable: false,
                  }
                : {
                    content: (
                      <RecurringItem reminder={reminder} onToggle={onToggle} onEdit={startEdit} onDelete={onDelete} />
                    ),
                  }
            }
          />
        </>
      )}
    </div>
  )
}

export const RecurringList = memo(RecurringListComponent)
