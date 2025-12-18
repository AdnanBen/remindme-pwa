import { memo } from "react"
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
    <div className={`flex items-start gap-3 p-4 rounded-xl bg-base-200 ${!reminder.enabled ? "opacity-50" : ""}`}>
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 012.828 2.828l-8.5 8.5a2 2 0 01-.878.512l-3.086.822a.5.5 0 01-.61-.61l.822-3.086a2 2 0 01.512-.878l8.5-8.5z" />
        </svg>
      </button>
      <button
        className="btn btn-ghost btn-sm btn-square text-base-content/40 hover:text-error"
        onClick={() => onDelete(reminder.id)}
        aria-label="Delete"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}

export const RecurringItem = memo(RecurringItemComponent)
