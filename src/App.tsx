import { useState, useEffect, useCallback } from "react"
import type { AppData } from "./types"
import { useReminders } from "./hooks/useReminders"
import { useRecurring } from "./hooks/useRecurring"
import { useNotifications } from "./hooks/useNotifications"
import { reminderDB, recurringDB } from "./lib/db"
import { Header } from "./components/Header"
import { Tabs } from "./components/Tabs"
import { ReminderList } from "./components/ReminderList"
import { RecurringList } from "./components/RecurringList"
import { ExportImport } from "./components/ExportImport"

const App = () => {
  const [activeTab, setActiveTab] = useState<"reminders" | "recurring">("reminders")
  const [now, setNow] = useState(() => Date.now())
  const [reminderFormTrigger, setReminderFormTrigger] = useState(0)
  const [recurringFormTrigger, setRecurringFormTrigger] = useState(0)

  const {
    reminders,
    loading: remindersLoading,
    add: addReminder,
    update: updateReminder,
    remove: removeReminder,
    reorderPending: reorderRemindersPending,
    reorderCompleted: reorderRemindersCompleted,
    toggleComplete,
    markNotified: markReminderNotified,
    reload: reloadReminders,
  } = useReminders()
  const {
    recurring,
    loading: recurringLoading,
    add: addRecurring,
    update: updateRecurring,
    remove: removeRecurring,
    reorderEnabled: reorderRecurringEnabled,
    reorderDisabled: reorderRecurringDisabled,
    toggleEnabled,
    markNotified: markRecurringNotified,
    reload: reloadRecurring,
  } = useRecurring()
  const { permission, requestPermission, checkReminders } = useNotifications()

  useEffect(() => {
    if (permission === "default") {
      requestPermission()
    }
  }, [permission, requestPermission])

  const handleCheck = useCallback(() => {
    checkReminders(reminders, recurring, markReminderNotified, (id: string, scheduledTime: string) =>
      markRecurringNotified(id, scheduledTime),
    )
  }, [checkReminders, reminders, recurring, markReminderNotified, markRecurringNotified])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const runCheck = () => {
      setNow(Date.now())
      handleCheck()
    }

    function scheduleNextCheck() {
      const now = Date.now()
      const nextMinute = Math.ceil(now / 60000) * 60000
      const delay = nextMinute - now

      timeoutId = setTimeout(() => {
        runCheck()
        scheduleNextCheck()
      }, delay)
    }

    runCheck()
    scheduleNextCheck()

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        runCheck()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [handleCheck])
  const handleExport = (): AppData => ({
    reminders,
    recurringReminders: recurring,
  })

  const normalizeOrder = <T extends { order?: number }>(items: T[]) =>
    items.map((item, idx) => ({ ...item, order: item.order ?? idx }))

  const handleImport = async (data: AppData) => {
    await reminderDB.clear()
    await recurringDB.clear()
    const remindersWithOrder = normalizeOrder(data.reminders)
    const recurringWithOrder = normalizeOrder(data.recurringReminders)

    for (const r of remindersWithOrder) {
      await reminderDB.add(r)
    }
    for (const r of recurringWithOrder) {
      await recurringDB.add(r)
    }
    await reloadReminders()
    await reloadRecurring()
  }

  const handleAdd = useCallback(() => {
    if (activeTab === "reminders") {
      setReminderFormTrigger((n) => n + 1)
    } else {
      setRecurringFormTrigger((n) => n + 1)
    }
  }, [activeTab])

  return (
    <div className="h-dvh flex flex-col bg-base-100">
      <Header onAdd={handleAdd} />
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {activeTab === "reminders" ? (
          <ReminderList
            reminders={reminders}
            loading={remindersLoading}
            currentTime={now}
            addTrigger={reminderFormTrigger}
            onAdd={addReminder}
            onUpdate={updateReminder}
            onReorderPending={reorderRemindersPending}
            onReorderCompleted={reorderRemindersCompleted}
            onToggle={toggleComplete}
            onDelete={removeReminder}
          />
        ) : (
          <RecurringList
            recurring={recurring}
            loading={recurringLoading}
            addTrigger={recurringFormTrigger}
            onAdd={addRecurring}
            onUpdate={updateRecurring}
            onReorderEnabled={reorderRecurringEnabled}
            onReorderDisabled={reorderRecurringDisabled}
            onToggle={toggleEnabled}
            onDelete={removeRecurring}
          />
        )}
      </main>
      <ExportImport onExport={handleExport} onImport={handleImport} />
    </div>
  )
}

export default App
