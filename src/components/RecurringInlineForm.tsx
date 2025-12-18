import { useState } from "react"
import type { RecurringReminder } from "../types"

type RecurringInlineFormProps = {
  editing?: RecurringReminder | null
  onAdd: (data: Omit<RecurringReminder, "id" | "createdAt">) => Promise<void> | void
  onUpdate: (reminder: RecurringReminder) => Promise<void> | void
  onClose: () => void
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const getInitialState = (editing?: RecurringReminder | null) => ({
  title: editing?.title ?? "",
  note: editing?.note ?? "",
  frequency: editing?.frequency ?? ("daily" as const),
  time: editing?.time ?? "09:00",
  daysOfWeek: editing?.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6],
  dayOfMonth: editing?.dayOfMonth ?? 1,
  enabled: editing?.enabled ?? true,
  lastNotified: editing?.lastNotified,
})

export const RecurringInlineForm = ({ editing, onAdd, onUpdate, onClose }: RecurringInlineFormProps) => {
  const initial = getInitialState(editing)
  const [title, setTitle] = useState(initial.title)
  const [note, setNote] = useState(initial.note)
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(initial.frequency)
  const [time, setTime] = useState(initial.time)
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initial.daysOfWeek)
  const [dayOfMonth, setDayOfMonth] = useState(initial.dayOfMonth)
  const [enabled, setEnabled] = useState(initial.enabled)
  const [submitting, setSubmitting] = useState(false)

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()))
  }

  const canSubmit = title.trim() && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    const payload: Omit<RecurringReminder, "id" | "createdAt"> = {
      title: title.trim(),
      note: note.trim() || undefined,
      frequency,
      time,
      daysOfWeek: frequency === "weekly" ? daysOfWeek : undefined,
      dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
      enabled,
      lastNotified: editing?.lastNotified,
    }

    if (editing) {
      await onUpdate({ ...editing, ...payload })
    } else {
      await onAdd(payload)
    }

    setSubmitting(false)
    onClose()
  }

  const handleCancel = () => onClose()

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 p-4 rounded-2xl bg-base-200/80 border border-base-300 shadow-sm backdrop-blur"
    >
      <div className="flex justify-between items-center">
        <div className="text-xs uppercase tracking-wide text-base-content/60">
          {editing ? "Editing recurring" : "New recurring reminder"}
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          className="input input-bordered w-full sm:flex-1 text-base"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <input
          type="time"
          className="input input-bordered w-full sm:w-32"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <textarea
        className="textarea textarea-bordered w-full"
        placeholder="Notes"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
      />
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium w-16">Repeat</span>
          <select
            className="select select-bordered select-sm"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as typeof frequency)}
          >
            <option value="daily">Every day</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        {frequency === "weekly" && (
          <div className="flex gap-1 flex-wrap ml-18">
            {DAYS.map((day, i) => (
              <button
                key={i}
                type="button"
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  daysOfWeek.includes(i)
                    ? "bg-primary text-primary-content"
                    : "bg-base-300 text-base-content/60 hover:bg-base-100"
                }`}
                onClick={() => toggleDay(i)}
              >
                {day}
              </button>
            ))}
          </div>
        )}
        {frequency === "monthly" && (
          <div className="flex items-center gap-2 ml-18">
            <span className="text-sm text-base-content/60">on day</span>
            <input
              type="number"
              className="input input-bordered input-sm w-16"
              min={1}
              max={31}
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10) || 1)}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <label className="label cursor-pointer gap-2">
          <span className="label-text">Enabled</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={enabled}
            onChange={() => setEnabled((v) => !v)}
          />
        </label>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-ghost rounded-full" onClick={handleCancel}>
          Close
        </button>
        <button
          type="submit"
          className={`btn rounded-full px-6 ${
            canSubmit ? "btn-primary" : "btn-ghost bg-base-100 border border-base-300"
          }`}
          disabled={!canSubmit}
        >
          {editing ? "Save" : "Add"}
        </button>
      </div>
    </form>
  )
}
