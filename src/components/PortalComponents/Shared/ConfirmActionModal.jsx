import PropTypes from "prop-types";

export default function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
  isProcessing = false,
}) {
  if (!isOpen) {
    return null;
  }

  const confirmButtonStyles =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-500"
      : "bg-blue-600 hover:bg-blue-500";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`rounded-md px-4 py-2 text-sm text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmButtonStyles}`}
          >
            {isProcessing ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  tone: PropTypes.oneOf(["default", "danger"]),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool,
};
