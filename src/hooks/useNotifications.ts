import { useState, useCallback } from "react"
import type { Reminder, RecurringReminder } from "../types"

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    "Notification" in window ? Notification.permission : "denied",
  )

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      return "denied" as NotificationPermission
    }
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }

  const notify = useCallback(
    (title: string, body?: string) => {
      if (permission !== "granted") return

      new Notification(title, {
        body,
        icon: "/pwa-192x192.png",
        badge: "/pwa-64x64.png",
      })
    },
    [permission],
  )

  const checkReminders = useCallback(
    (
      reminders: Reminder[],
      recurring: RecurringReminder[],
      onReminderNotified: (id: string) => void,
      onRecurringNotified: (id: string, scheduledTime: string) => void,
    ) => {
      if (permission !== "granted") return

      const now = new Date()

      reminders.forEach((reminder) => {
        if (reminder.completed || reminder.notified) return
        const dueDate = new Date(reminder.dueDate)
        if (dueDate <= now) {
          notify(reminder.title, reminder.note)
          onReminderNotified(reminder.id)
        }
      })

      recurring.forEach((rec) => {
        if (!rec.enabled) return

        const [hours, minutes] = rec.time.split(":").map(Number)

        // Check if we're in the scheduled minute window
        if (now.getHours() !== hours || now.getMinutes() !== minutes) return

        // Build the scheduled datetime for today
        const scheduledToday = new Date(now)
        scheduledToday.setHours(hours, minutes, 0, 0)

        // Skip if already notified for THIS scheduled slot
        const lastNotifiedTime = rec.lastNotified ? new Date(rec.lastNotified) : null
        if (lastNotifiedTime && lastNotifiedTime.getTime() === scheduledToday.getTime()) return

        // Check frequency rules
        let shouldNotify = false
        const dayOfWeek = now.getDay()
        const dayOfMonth = now.getDate()

        switch (rec.frequency) {
          case "daily":
            shouldNotify = true
            break
          case "weekly":
            shouldNotify = rec.daysOfWeek?.includes(dayOfWeek) ?? false
            break
          case "monthly":
            shouldNotify = rec.dayOfMonth === dayOfMonth
            break
        }

        if (shouldNotify) {
          notify(rec.title, rec.note)
          onRecurringNotified(rec.id, scheduledToday.toISOString())
        }
      })
    },
    [permission, notify],
  )

  return {
    permission,
    requestPermission,
    notify,
    checkReminders,
  }
}
