import { Link, useSearchParams } from "react-router-dom";

function getErrorMeta(errorMsg) {
  const msg = (errorMsg ?? "").toLowerCase();
  if (msg.includes("not found") || msg.includes("does not exist") || msg.includes("invalid code") || msg.includes("invalid.")) {
    return {
      emoji: "🔍",
      title: "Transfer Not Found",
      description:
        "This transfer code doesn't exist or may have already been used. Codes are single-use and deleted after the file is downloaded.",
      hint: "Double-check the code and try again, or ask the sender to create a new transfer.",
    };
  }
  if (msg.includes("expir")) {
    return {
      emoji: "⏰",
      title: "Transfer Expired",
      description:
        "This transfer has expired. Files are automatically deleted after a short period for security.",
      hint: "Ask the sender to upload the file again and share a fresh code.",
    };
  }
  if (msg.includes("already") || msg.includes("received") || msg.includes("redeemed")) {
    return {
      emoji: "✅",
      title: "Already Downloaded",
      description:
        "This transfer code has already been redeemed. Each code can only be used once.",
      hint: "If you haven't downloaded it yet, ask the sender to send a new file.",
    };
  }
  return {
    emoji: "⚠️",
    title: "Something Went Wrong",
    description: errorMsg || "An unexpected error occurred while fetching your file.",
    hint: "Try again in a moment, or enter the code manually on the receive page.",
  };
}

function TransferErrorPage() {
  const [params] = useSearchParams();
  const message = params.get("message") ?? "";
  const code = params.get("code") ?? "";

  const { emoji, title, description, hint } = getErrorMeta(message);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--color-bg)] px-4 text-[color:var(--color-text)]">
      <div className="w-full max-w-md animate-fade-in-up">

        {/* Error card */}
        <div
          className="rounded-[32px] border border-rose-200/60 bg-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] p-8 shadow-[0_32px_80px_-44px_rgba(225,60,60,0.18)] dark:border-rose-900/30"
          role="alert"
          aria-labelledby="transfer-error-title"
        >
          {/* Icon */}
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200/60 bg-rose-50 text-3xl shadow-inner dark:border-rose-900/40 dark:bg-rose-950/40">
              {emoji}
            </div>
          </div>

          {/* Title */}
          <h1
            id="transfer-error-title"
            className="text-center text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-300"
          >
            {title}
          </h1>

          {/* Description */}
          <p className="mt-3 text-center text-sm leading-6 text-[color:var(--color-text-soft)]">
            {description}
          </p>

          {/* Hint */}
          <div className="mt-5 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-4 py-3">
            <p className="text-center text-xs leading-5 text-[color:var(--color-text-soft)]">
              💡 {hint}
            </p>
          </div>

          {/* Code badge */}
          {code && (
            <p className="mt-4 text-center font-mono text-xs text-[color:var(--color-text-soft)]">
              Code tried:{" "}
              <span className="rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-2 py-0.5 font-bold tracking-widest text-[color:var(--color-text-strong)]">
                {code.toUpperCase()}
              </span>
            </p>
          )}

          {/* Technical detail */}
          {message && (
            <details className="mt-4">
              <summary className="cursor-pointer text-center text-xs text-rose-500/70 hover:text-rose-500 dark:text-rose-400/60 dark:hover:text-rose-400">
                View technical details
              </summary>
              <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 font-mono text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                {message}
              </p>
            </details>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            to="/transfer/receive"
            className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_-20px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Enter code manually
          </Link>
          <Link
            to="/transfer"
            className="text-sm text-[color:var(--color-text-soft)] hover:text-[color:var(--color-text-strong)] transition-colors duration-150 focus-visible:outline-none"
          >
            ← Back to Transfer
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TransferErrorPage;
