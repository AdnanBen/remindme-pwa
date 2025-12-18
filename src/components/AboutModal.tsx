type AboutModalProps = {
  open: boolean
  onClose: () => void
}

export const AboutModal = ({ open, onClose }: AboutModalProps) => {
  if (!open) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">About Remind Me!</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm mt-3">
          <li>Create one-time or recurring reminders.</li>
          <li>Enable notifications to receive an alert when a reminder is due.</li>
          <li>Drag items to reorder.</li>
          <li>Right-click a reminder to edit quickly.</li>
          <li>Export or import your data to back it up or move devices.</li>
        </ul>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} aria-hidden="true"></div>
    </div>
  )
}
