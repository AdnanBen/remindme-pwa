import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Reminder, RecurringReminder } from "../types"

interface RemindersDB extends DBSchema {
  reminders: {
    key: string
    value: Reminder
    indexes: { "by-dueDate": string }
  }
  recurringReminders: {
    key: string
    value: RecurringReminder
  }
}

let dbPromise: Promise<IDBPDatabase<RemindersDB>> | null = null

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<RemindersDB>("reminders-db", 1, {
      upgrade(db) {
        const reminderStore = db.createObjectStore("reminders", { keyPath: "id" })
        reminderStore.createIndex("by-dueDate", "dueDate")
        db.createObjectStore("recurringReminders", { keyPath: "id" })
      },
    })
  }
  return dbPromise
}

export const reminderDB = {
  async getAll(): Promise<Reminder[]> {
    const db = await getDB()
    return db.getAll("reminders")
  },

  async add(reminder: Reminder): Promise<void> {
    const db = await getDB()
    await db.add("reminders", reminder)
  },

  async update(reminder: Reminder): Promise<void> {
    const db = await getDB()
    await db.put("reminders", reminder)
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete("reminders", id)
  },

  async clear(): Promise<void> {
    const db = await getDB()
    await db.clear("reminders")
  },
}

export const recurringDB = {
  async getAll(): Promise<RecurringReminder[]> {
    const db = await getDB()
    return db.getAll("recurringReminders")
  },

  async add(reminder: RecurringReminder): Promise<void> {
    const db = await getDB()
    await db.add("recurringReminders", reminder)
  },

  async update(reminder: RecurringReminder): Promise<void> {
    const db = await getDB()
    await db.put("recurringReminders", reminder)
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete("recurringReminders", id)
  },

  async clear(): Promise<void> {
    const db = await getDB()
    await db.clear("recurringReminders")
  },
}
