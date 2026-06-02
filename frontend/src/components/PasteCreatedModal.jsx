import { Link } from "react-router-dom";

function PasteCreatedModal({
  open,
  pasteUrl,
  onClose,
  onCopy,
  isCopied,
}) {
  if (!open || !pasteUrl) {
    return null;
  }

  const pastePath = new URL(pasteUrl).pathname;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[color:var(--color-overlay)] backdrop-blur-md"
        aria-label="Close paste actions dialog"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paste-created-title"
        className="relative z-10 w-full max-w-md rounded-[32px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-6 shadow-[0_32px_90px_-38px_var(--color-shadow)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-2 text-[color:var(--color-text-soft)] transition-all duration-200 hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
          aria-label="Close dialog"
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

        <div className="rounded-3xl bg-[image:var(--gradient-brand-soft)] p-[1px]">
          <div className="rounded-[calc(1.5rem-1px)] bg-[color:var(--color-surface)] px-5 py-5">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--color-text-soft)]">
              Paste created
            </p>
            <h2
              id="paste-created-title"
              className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--color-text-strong)]"
            >
              Your paste is ready to share
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-soft)]">
              Open the paste now or copy the URL and send it anywhere.
            </p>

            <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-4 py-3">
              <p className="truncate text-sm text-[color:var(--color-text-strong)]">
                {pasteUrl}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            to={pastePath}
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-[image:var(--gradient-brand)] px-5 py-3 text-sm font-medium text-white shadow-[0_22px_45px_-24px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_52px_-24px_var(--color-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
          >
            Open paste
          </Link>

          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-3 text-sm font-medium text-[color:var(--color-text-strong)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
          >
            {isCopied ? "Copied" : "Copy URL"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PasteCreatedModal;
