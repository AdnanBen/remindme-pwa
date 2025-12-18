import { memo } from "react"
import { Pencil, Trash2 } from "lucide-react"

import type { RecurringReminder } from "../types"

type RecurringItemProps = {
  reminder: RecurringReminder
  onToggle: (id: string) => void
  onEdit: (reminder: RecurringReminder) => void
  onDelete: (id: string) => void
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const formatSchedule = (reminder: RecurringReminder) => {
  const time = reminder.time
  switch (reminder.frequency) {
    case "daily":
      return `Every day at ${time}`
    case "weekly": {
      const days = reminder.daysOfWeek?.map((d) => DAYS[d]).join(", ") || "No days"
      return `${days} at ${time}`
    }
    case "monthly":
      return `Day ${reminder.dayOfMonth} of each month at ${time}`
    default:
      return time
  }
}

const RecurringItemComponent = ({ reminder, onToggle, onEdit, onDelete }: RecurringItemProps) => {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl bg-base-200 ${!reminder.enabled ? "opacity-50" : ""}`}
      onContextMenu={(event) => {
        event.preventDefault()
        onEdit(reminder)
      }}
    >
      <input
        type="checkbox"
        className="toggle toggle-primary toggle-sm mt-0.5"
        checked={reminder.enabled}
        onChange={() => onToggle(reminder.id)}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium">{reminder.title}</p>
        {reminder.note && <p className="text-sm text-base-content/60 mt-0.5 line-clamp-2">{reminder.note}</p>}
        <p className="text-xs mt-1 text-base-content/40">{formatSchedule(reminder)}</p>
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

export const RecurringItem = memo(RecurringItemComponent)
