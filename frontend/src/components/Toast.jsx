import { useEffect } from "react";

function Toast({
  open,
  title,
  message,
  variant = "success",
  onClose,
  duration = 3200,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => window.clearTimeout(timeoutId);
  }, [duration, onClose, open]);

  if (!open) {
    return null;
  }

  const variantClasses = {
    success: "border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-100",
    error: "border-rose-200/80 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-100",
    info: "border-sky-200/80 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-100",
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm"
      role="status"
      aria-live="polite"
    >
      <div
        className={`rounded-2xl border px-4 py-4 shadow-lg transition-all duration-300 ${variantClasses[variant]}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 text-sm opacity-90">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current dark:hover:bg-white/10"
            aria-label="Close notification"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toast;
