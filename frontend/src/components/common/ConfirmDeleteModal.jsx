import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X } from "lucide-react";

const ConfirmDeleteModal = ({
  show,
  onClose,
  onConfirm,
  onAction,
  variant = "confirm",
  title,
  description,
  hint,
  itemName = "this item",
  entityLabel = "item",
  cancelLabel,
  confirmLabel,
  actionLabel,
  actionIcon: ActionIcon,
}) => {
  const isBlocked = variant === "blocked";
  const resolvedTitle =
    title ||
    (isBlocked
      ? `Cannot Delete ${entityLabel}`
      : `Delete ${entityLabel}?`);
  const resolvedCancelLabel = cancelLabel || (isBlocked ? "Close" : "Cancel");
  const resolvedConfirmLabel = confirmLabel || `Delete ${entityLabel}`;
  const resolvedDescription =
    description ||
    (isBlocked
      ? `${itemName} cannot be deleted.`
      : `Are you sure you want to delete ${itemName}?`);
  const resolvedHint =
    hint || (isBlocked ? null : "This cannot be undone.");

  useEffect(() => {
    if (!show) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-xl"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white cursor-pointer"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-start gap-4 pr-8">
          <div
            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              isBlocked
                ? "bg-yellow-500/15 text-yellow-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {isBlocked ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0">
            <h3
              id="confirm-delete-title"
              className="text-lg font-semibold text-gray-100"
            >
              {resolvedTitle}
            </h3>
            <p className="mt-2 text-sm text-gray-300">{resolvedDescription}</p>
            {resolvedHint && (
              <p className="mt-2 text-sm text-gray-400">{resolvedHint}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-600 px-4 py-2.5 text-sm font-medium text-gray-200 hover:bg-gray-700 cursor-pointer"
          >
            {resolvedCancelLabel}
          </button>

          {isBlocked ? (
            onAction && actionLabel ? (
              <button
                type="button"
                onClick={onAction}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 cursor-pointer"
              >
                {ActionIcon && <ActionIcon className="h-4 w-4" />}
                {actionLabel}
              </button>
            ) : null
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              {resolvedConfirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDeleteModal;
