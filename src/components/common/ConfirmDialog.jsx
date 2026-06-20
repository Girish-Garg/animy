import Modal from './Modal';

/**
 * Confirmation dialog for destructive actions (delete album/video/chat).
 * Built on the shared Modal so it inherits focus trap + Escape + aria.
 */
export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = true,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      label={title}
      className="w-[90%] max-w-md rounded-2xl bg-[#0B1020] p-6 text-white shadow-xl"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {message && <p className="mt-2 text-sm text-gray-400">{message}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
            destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0075FF] hover:bg-blue-600'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
