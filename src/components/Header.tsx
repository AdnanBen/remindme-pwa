import { Info, Plus } from "lucide-react"

type HeaderProps = {
  onAdd?: () => void
  onInfo?: () => void
}

export const Header = ({ onAdd, onInfo }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-base-100 border-b border-base-300">
      <div>
        <h1 className="text-xl font-bold">Reminders</h1>
      </div>
      {onAdd ? (
        <div className="flex items-center gap-2">
          {onInfo && (
            <button className="btn btn-ghost btn-sm btn-circle" aria-label="About" onClick={onInfo}>
              <Info className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button className="btn btn-ghost btn-sm btn-circle" aria-label="Add" onClick={onAdd}>
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div />
      )}
    </header>
  )
}
