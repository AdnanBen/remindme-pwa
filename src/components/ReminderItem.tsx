import { memo } from "react"
import { Pencil, Trash2 } from "lucide-react"

import type { Reminder } from "../types"

type ReminderItemProps = {
  reminder: Reminder
  currentTime: number
  onToggle: (id: string) => void
  onEdit: (reminder: Reminder) => void
  onDelete: (id: string) => void
}

const formatDate = (dateStr: string, now: Date) => {
  const date = new Date(dateStr)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const isToday = date.toDateString() === now.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()
  const isPast = date < now

  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  if (isToday) return `Today, ${timeStr}`
  if (isTomorrow) return `Tomorrow, ${timeStr}`
  if (isPast) return `Overdue`
  return date.toLocaleDateString([], { month: "short", day: "numeric" }) + `, ${timeStr}`
}

const ReminderItemComponent = ({ reminder, currentTime, onToggle, onEdit, onDelete }: ReminderItemProps) => {
  const nowDate = new Date(currentTime)
  const isPast = new Date(reminder.dueDate) < nowDate && !reminder.completed

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl bg-base-200 ${reminder.completed ? "opacity-50" : ""}`}
      onContextMenu={(event) => {
        event.preventDefault()
        onEdit(reminder)
      }}
    >
      <input
        type="checkbox"
        className="checkbox checkbox-primary mt-0.5"
        checked={reminder.completed}
        onChange={() => onToggle(reminder.id)}
      />
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${reminder.completed ? "line-through text-base-content/50" : ""}`}>
          {reminder.title}
        </p>
        {reminder.note && <p className="text-sm text-base-content/60 mt-0.5 line-clamp-2">{reminder.note}</p>}
        <p className={`text-xs mt-1 ${isPast ? "text-error" : "text-base-content/40"}`}>
          {formatDate(reminder.dueDate, nowDate)}
        </p>
      </div>
      <button
        className="btn btn-ghost btn-sm btn-square text-base-content/60"
        onClick={() => onEdit(reminder)}
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-error"
        onClick={() => onDelete(reminder.id)}
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

export const ReminderItem = memo(ReminderItemComponent)
