import { useState } from "react";

function TransferCodeDisplay({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-soft)]">
        Transfer Code
      </p>
      <div
        className="rounded-2xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)] px-6 py-4 shadow-inner"
        aria-label={`Transfer code: ${code}`}
      >
        <span className="font-mono text-4xl font-bold tracking-[0.25em] text-[color:var(--color-text-strong)] select-all">
          {code}
        </span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-strong)] hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
      >
        {copied ? (
          <>
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy code
          </>
        )}
      </button>
    </div>
  );
}

export default TransferCodeDisplay;
