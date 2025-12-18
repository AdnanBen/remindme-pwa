export type Reminder = {
  id: string
  title: string
  note?: string
  dueDate: string
  order?: number
  completed: boolean
  notified: boolean
  createdAt: string
}

export type RecurringReminder = {
  id: string
  title: string
  note?: string
  frequency: "daily" | "weekly" | "monthly"
  daysOfWeek?: number[]
  dayOfMonth?: number
  time: string
  order?: number
  enabled: boolean
  lastNotified?: string
  createdAt: string
}

export type AppData = {
  reminders: Reminder[]
  recurringReminders: RecurringReminder[]
}
