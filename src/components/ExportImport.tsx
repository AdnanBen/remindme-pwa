import { useRef } from "react"
import type { AppData } from "../types"

type ExportImportProps = {
  onExport: () => AppData
  onImport: (data: AppData) => void
}

export const ExportImport = ({ onExport, onImport }: ExportImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = onExport()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reminders-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as AppData
        if (data.reminders && data.recurringReminders) {
          onImport(data)
        } else {
          alert("Invalid backup file format")
        }
      } catch {
        alert("Failed to parse backup file")
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <footer className="flex gap-4 p-4 justify-center border-t border-base-300">
      <button className="text-sm text-base-content/50 hover:text-base-content transition-colors" onClick={handleExport}>
        Export backup
      </button>
      <span className="text-base-content/20">|</span>
      <button
        className="text-sm text-base-content/50 hover:text-base-content transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        Import backup
      </button>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </footer>
  )
}
