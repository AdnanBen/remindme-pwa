import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Reminder } from "../types"
import { ReminderInlineForm } from "./ReminderInlineForm"
import { ReminderItem } from "./ReminderItem"
import { SortableSection } from "./SortableSection"

type ReminderListProps = {
  reminders: Reminder[]
  loading: boolean
  currentTime: number
  addTrigger?: number
  onAdd: (data: { title: string; note?: string; dueDate: string }) => Promise<void> | void
  onUpdate: (reminder: Reminder) => Promise<void> | void
  onReorderPending: (reminders: Reminder[]) => Promise<void> | void
  onReorderCompleted: (reminders: Reminder[]) => Promise<void> | void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

const ReminderListComponent = ({
  reminders,
  loading,
  currentTime,
  addTrigger,
  onAdd,
  onUpdate,
  onReorderPending,
  onReorderCompleted,
  onToggle,
  onDelete,
}: ReminderListProps) => {
  const [openForm, setOpenForm] = useState<{ mode: "add" | "edit"; id?: string } | null>(null)
  const lastTrigger = useRef(addTrigger)

  useEffect(() => {
    if (addTrigger !== undefined && addTrigger !== lastTrigger.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional trigger detection
      setOpenForm({ mode: "add" })
    }
    lastTrigger.current = addTrigger
  }, [addTrigger])

  const { pending, completed } = useMemo(() => {
    const pendingReminders = reminders.filter((r) => !r.completed)
    const completedReminders = reminders.filter((r) => r.completed)
    return { pending: pendingReminders, completed: completedReminders }
  }, [reminders])

  const closeForm = useCallback(() => setOpenForm(null), [])
  const startEdit = useCallback((reminder: Reminder) => setOpenForm({ mode: "edit", id: reminder.id }), [])

  const editingReminder =
    openForm?.mode === "edit" && openForm.id ? reminders.find((r) => r.id === openForm.id) || null : null

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
        <ReminderInlineForm key="add" editing={null} onAdd={onAdd} onUpdate={onUpdate} onClose={closeForm} />
      )}

      {pending.length === 0 && completed.length === 0 && openForm?.mode !== "add" && (
        <div className="text-center p-8 text-base-content/50 rounded-2xl border border-dashed border-base-300">
          <p className="font-medium">No reminders yet</p>
          <p className="text-sm">Tap "+" in the header to create your first reminder</p>
        </div>
      )}

      <SortableSection
        items={pending}
        getId={(r) => r.id}
        onReorder={onReorderPending}
        renderItem={(reminder) =>
          openForm?.mode === "edit" && openForm.id === reminder.id && editingReminder
            ? {
                content: (
                  <ReminderInlineForm editing={editingReminder} onAdd={onAdd} onUpdate={onUpdate} onClose={closeForm} />
                ),
                draggable: false,
              }
            : {
                content: (
                  <ReminderItem
                    reminder={reminder}
                    currentTime={currentTime}
                    onToggle={onToggle}
                    onEdit={startEdit}
                    onDelete={onDelete}
                  />
                ),
              }
        }
      />

      {completed.length > 0 && (
        <>
          <div className="divider text-sm text-base-content/50">Completed</div>
          <SortableSection
            items={completed}
            getId={(r) => r.id}
            onReorder={onReorderCompleted}
            renderItem={(reminder) =>
              openForm?.mode === "edit" && openForm.id === reminder.id && editingReminder
                ? {
                    content: (
                      <ReminderInlineForm
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
                      <ReminderItem
                        reminder={reminder}
                        currentTime={currentTime}
                        onToggle={onToggle}
                        onEdit={startEdit}
                        onDelete={onDelete}
                      />
                    ),
                  }
            }
          />
        </>
      )}
    </div>
  )
}

export const ReminderList = memo(ReminderListComponent)
