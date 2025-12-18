import { useState } from "react"
import type { Reminder } from "../types"

type ReminderInlineFormProps = {
  editing?: Reminder | null
  onAdd: (data: { title: string; note?: string; dueDate: string }) => Promise<void> | void
  onUpdate: (reminder: Reminder) => Promise<void> | void
  onClose: () => void
}

const getDefaultDueDate = () => {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  now.setHours(now.getHours() + 1)
  return now.toISOString().slice(0, 16)
}

const getInitialState = (editing?: Reminder | null) => ({
  title: editing?.title ?? "",
  note: editing?.note ?? "",
  dueDate: editing ? new Date(editing.dueDate).toISOString().slice(0, 16) : getDefaultDueDate(),
})

export const ReminderInlineForm = ({ editing, onAdd, onUpdate, onClose }: ReminderInlineFormProps) => {
  const initial = getInitialState(editing)
  const [title, setTitle] = useState(initial.title)
  const [note, setNote] = useState(initial.note)
  const [dueDate, setDueDate] = useState(initial.dueDate)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = title.trim() && dueDate && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate) return
    setSubmitting(true)
    const payload = {
      title: title.trim(),
      note: note.trim() || undefined,
      dueDate: new Date(dueDate).toISOString(),
    }

    if (editing) {
      await onUpdate({ ...editing, ...payload })
    } else {
      await onAdd(payload)
    }

    setSubmitting(false)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 p-4 rounded-2xl bg-base-200/80 border border-base-300 shadow-sm backdrop-blur"
    >
      <div className="flex justify-between items-center">
        <div className="text-xs uppercase tracking-wide text-base-content/60">
          {editing ? "Editing reminder" : "New reminder"}
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
          type="datetime-local"
          className="input input-bordered w-full sm:w-56"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <textarea
        className="textarea textarea-bordered w-full"
        placeholder="Notes"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
      />
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-ghost rounded-full" onClick={handleCancel}>
          Close
        </button>
        <button
          type="submit"
          className={`btn rounded-full px-6 ${canSubmit ? "btn-primary" : "btn-ghost bg-base-100 border border-base-300"}`}
          disabled={!canSubmit}
        >
          {editing ? "Save" : "Add"}
        </button>
      </div>
    </form>
  )
}
