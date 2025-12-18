import { useState, useEffect, useCallback } from "react"
import type { Reminder } from "../types"
import { reminderDB } from "../lib/db"

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const data = await reminderDB.getAll()

    const fallbackSorted = [...data].sort((a, b) => {
      const dueA = new Date(a.dueDate).getTime()
      const dueB = new Date(b.dueDate).getTime()
      if (dueA !== dueB) return dueA - dueB
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    const needsOrder = fallbackSorted.some((item) => item.order === undefined)
    const withOrder = needsOrder
      ? fallbackSorted.map((item, idx) => ({ ...item, order: item.order ?? idx }))
      : fallbackSorted

    if (needsOrder) {
      await Promise.all(withOrder.map((item) => reminderDB.update(item)))
    }

    setReminders([...withOrder].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async initialization
    load()
  }, [load])

  const add = useCallback(
    async (reminder: Omit<Reminder, "id" | "completed" | "notified" | "createdAt">) => {
      const nowTs = Date.now()
      const maxOrder = reminders.reduce((max, r) => Math.max(max, r.order ?? -1), -1)
      const newReminder: Reminder = {
        ...reminder,
        id: crypto.randomUUID(),
        order: maxOrder + 1,
        completed: false,
        notified: false,
        createdAt: new Date(nowTs).toISOString(),
      }
      await reminderDB.add(newReminder)
      await load()
    },
    [load, reminders],
  )

  const update = useCallback(
    async (reminder: Reminder) => {
      const existing = reminders.find((r) => r.id === reminder.id)
      const dueDateChanged = existing?.dueDate !== reminder.dueDate

      const next: Reminder = dueDateChanged ? { ...reminder, notified: false, completed: false } : reminder

      await reminderDB.update(next)
      await load()
    },
    [load, reminders],
  )

  const remove = useCallback(
    async (id: string) => {
      await reminderDB.delete(id)
      await load()
    },
    [load],
  )

  const reorderPending = useCallback(
    async (orderedPending: Reminder[]) => {
      const completed = reminders.filter((r) => r.completed)
      const next = [...orderedPending, ...completed].map((item, idx) => ({ ...item, order: idx }))
      setReminders(next)
      await Promise.all(next.map((item) => reminderDB.update(item)))
    },
    [reminders],
  )

  const reorderCompleted = useCallback(
    async (orderedCompleted: Reminder[]) => {
      const pending = reminders.filter((r) => !r.completed)
      const next = [...pending, ...orderedCompleted].map((item, idx) => ({ ...item, order: idx }))
      setReminders(next)
      await Promise.all(next.map((item) => reminderDB.update(item)))
    },
    [reminders],
  )

  const toggleComplete = useCallback(
    async (id: string) => {
      const reminder = reminders.find((r) => r.id === id)
      if (reminder) {
        const wasCompleted = reminder.completed
        const toggled = { ...reminder, completed: !reminder.completed }

        if (wasCompleted) {
          const pending = reminders.filter((r) => !r.completed || r.id === id)
          const completed = reminders.filter((r) => r.completed && r.id !== id)
          const next = [...pending, ...completed].map((item, idx) =>
            item.id === toggled.id ? { ...toggled, order: idx } : { ...item, order: idx },
          )
          setReminders(next)
          await Promise.all(next.map((item) => reminderDB.update(item)))
        } else {
          const pending = reminders.filter((r) => !r.completed && r.id !== id)
          const completed = reminders.filter((r) => r.completed || r.id === id)
          const next = [...pending, ...completed].map((item, idx) =>
            item.id === toggled.id ? { ...toggled, order: idx } : { ...item, order: idx },
          )
          setReminders(next)
          await Promise.all(next.map((item) => reminderDB.update(item)))
        }
      }
    },
    [reminders],
  )

  const markNotified = useCallback(
    async (id: string) => {
      const reminder = reminders.find((r) => r.id === id)
      if (reminder) {
        await update({ ...reminder, notified: true })
      }
    },
    [reminders, update],
  )

  const clearAll = useCallback(async () => {
    await reminderDB.clear()
    setReminders([])
  }, [])

  return {
    reminders,
    loading,
    add,
    update,
    remove,
    reorderPending,
    reorderCompleted,
    toggleComplete,
    markNotified,
    clearAll,
    reload: load,
  }
}
