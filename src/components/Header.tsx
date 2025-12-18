type HeaderProps = {
  onAdd?: () => void
}

export const Header = ({ onAdd }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-base-100 border-b border-base-300">
      <div>
        <h1 className="text-xl font-bold">Reminders</h1>
      </div>
      {onAdd ? (
        <button className="btn btn-ghost btn-sm btn-circle" aria-label="Add" onClick={onAdd}>
          <span className="text-lg leading-none">+</span>
        </button>
      ) : (
        <div />
      )}
    </header>
  )
}
