import { useState, useEffect, useCallback } from "react"
import type { RecurringReminder } from "../types"
import { recurringDB } from "../lib/db"

export const useRecurring = () => {
  const [recurring, setRecurring] = useState<RecurringReminder[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const data = await recurringDB.getAll()

    const fallbackSorted = [...data].sort((a, b) => {
      const createdA = new Date(a.createdAt).getTime()
      const createdB = new Date(b.createdAt).getTime()
      if (createdA !== createdB) return createdA - createdB
      return a.time.localeCompare(b.time)
    })

    const needsOrder = fallbackSorted.some((item) => item.order === undefined)
    const withOrder = needsOrder
      ? fallbackSorted.map((item, idx) => ({ ...item, order: item.order ?? idx }))
      : fallbackSorted

    if (needsOrder) {
      await Promise.all(withOrder.map((item) => recurringDB.update(item)))
    }

    setRecurring([...withOrder].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async initialization
    load()
  }, [load])

  const add = useCallback(
    async (reminder: Omit<RecurringReminder, "id" | "createdAt">) => {
      const now = new Date()
      const maxOrder = recurring.reduce((max, r) => Math.max(max, r.order ?? -1), -1)
      const [hours, minutes] = reminder.time.split(":").map(Number)
      const scheduledToday = new Date(now)
      scheduledToday.setHours(hours, minutes, 0, 0)

      const lastNotified = now > scheduledToday ? scheduledToday.toISOString() : undefined

      const newReminder: RecurringReminder = {
        ...reminder,
        id: crypto.randomUUID(),
        order: maxOrder + 1,
        createdAt: now.toISOString(),
        lastNotified,
      }
      await recurringDB.add(newReminder)
      await load()
    },
    [load, recurring],
  )

  const update = useCallback(
    async (reminder: RecurringReminder) => {
      await recurringDB.update(reminder)
      await load()
    },
    [load],
  )

  const remove = useCallback(
    async (id: string) => {
      await recurringDB.delete(id)
      await load()
    },
    [load],
  )

  const reorderEnabled = useCallback(
    async (orderedEnabled: RecurringReminder[]) => {
      const disabled = recurring.filter((r) => !r.enabled)
      const next = [...orderedEnabled, ...disabled].map((item, idx) => ({ ...item, order: idx }))
      setRecurring(next)
      await Promise.all(next.map((item) => recurringDB.update(item)))
    },
    [recurring],
  )

  const reorderDisabled = useCallback(
    async (orderedDisabled: RecurringReminder[]) => {
      const enabled = recurring.filter((r) => r.enabled)
      const next = [...enabled, ...orderedDisabled].map((item, idx) => ({ ...item, order: idx }))
      setRecurring(next)
      await Promise.all(next.map((item) => recurringDB.update(item)))
    },
    [recurring],
  )

  const toggleEnabled = useCallback(
    async (id: string) => {
      const reminder = recurring.find((r) => r.id === id)
      if (reminder) {
        const wasEnabled = reminder.enabled
        const toggled = { ...reminder, enabled: !reminder.enabled }

        if (wasEnabled) {
          const enabled = recurring.filter((r) => r.enabled && r.id !== id)
          const disabled = recurring.filter((r) => !r.enabled || r.id === id)
          const next = [...enabled, ...disabled].map((item, idx) =>
            item.id === toggled.id ? { ...toggled, order: idx } : { ...item, order: idx },
          )
          setRecurring(next)
          await Promise.all(next.map((item) => recurringDB.update(item)))
        } else {
          const enabled = recurring.filter((r) => r.enabled || r.id === id)
          const disabled = recurring.filter((r) => !r.enabled && r.id !== id)
          const next = [...enabled, ...disabled].map((item, idx) =>
            item.id === toggled.id ? { ...toggled, order: idx } : { ...item, order: idx },
          )
          setRecurring(next)
          await Promise.all(next.map((item) => recurringDB.update(item)))
        }
      }
    },
    [recurring],
  )

  const markNotified = useCallback(
    async (id: string, scheduledTime: string) => {
      const reminder = recurring.find((r) => r.id === id)
      if (reminder) {
        await update({ ...reminder, lastNotified: scheduledTime })
      }
    },
    [recurring, update],
  )

  const clearAll = useCallback(async () => {
    await recurringDB.clear()
    setRecurring([])
  }, [])

  return {
    recurring,
    loading,
    add,
    update,
    remove,
    reorderEnabled,
    reorderDisabled,
    toggleEnabled,
    markNotified,
    clearAll,
    reload: load,
  }
}
