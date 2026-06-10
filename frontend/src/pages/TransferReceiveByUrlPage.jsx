import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { receiveTransferRequest, getTransferStatusRequest } from "../lib/transferApi";

function getErrorMeta(errorMsg) {
  const msg = (errorMsg ?? "").toLowerCase();
  if (msg.includes("not found") || msg.includes("does not exist") || msg.includes("invalid code")) {
    return {
      emoji: "🔍",
      title: "Transfer Not Found",
      description:
        "This transfer code doesn't exist or may have already been used. Codes are single-use and deleted after the file is downloaded.",
      hint: "Double-check the code and try again, or ask the sender to create a new transfer.",
    };
  }
  if (msg.includes("expir") || msg.includes("expired")) {
    return {
      emoji: "⏰",
      title: "Transfer Expired",
      description:
        "This transfer has expired. Files are automatically deleted after 24 hours for security.",
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

function TransferReceiveByUrlPage() {
  const { code } = useParams();
  // status: "loading" | "ready" | "downloading" | "error"
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  // On first load — only CHECK if the code is valid, do NOT redeem it yet
  useEffect(() => {
    if (!code) {
      setError("No transfer code found in the URL.");
      setStatus("error");
      return;
    }

    getTransferStatusRequest(code)
      .then((data) => {
        if (data.isReceived) {
          setError("File has already been received");
          setStatus("error");
          return;
        }
        setFileName(data.fileName ?? "");
        setStatus("ready");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  }, [code]);

  // Only called when user explicitly clicks "Save File"
  const handleSave = () => {
    setStatus("downloading");
    receiveTransferRequest(code)
      .then((data) => {
        window.location.href = data.url;
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--color-bg)] px-4 text-[color:var(--color-text)]">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full bg-[image:var(--gradient-brand)] opacity-15" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-12 w-12 animate-spin text-[color:var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-[color:var(--color-text-strong)]">Verifying transfer…</p>
            <p className="mt-2 text-sm text-[color:var(--color-text-soft)]">Just a moment while we check the code.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Ready — show confirmation before redeeming ─────────────────────────────
  if (status === "ready") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--color-bg)] px-4 text-[color:var(--color-text)]">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="rounded-[32px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] p-8 shadow-[0_32px_80px_-44px_var(--color-shadow)]">

            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[image:var(--gradient-brand-soft)] text-4xl shadow-inner">
                📦
              </div>
            </div>

            {/* Title */}
            <h1 className="text-center text-2xl font-bold tracking-tight text-[color:var(--color-text-strong)]">
              File Ready to Download
            </h1>

            {/* File name */}
            {fileName && (
              <div className="mt-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-4 py-3 text-center">
                <p className="text-xs text-[color:var(--color-text-soft)] mb-1">File</p>
                <p className="font-semibold text-[color:var(--color-text-strong)] truncate">{fileName}</p>
              </div>
            )}

            {/* Warning */}
            <div className="mt-4 rounded-2xl border border-amber-200/60 bg-amber-50/60 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-950/20">
              <p className="text-center text-xs leading-5 text-amber-700 dark:text-amber-400">
                ⚠️ <strong>One-time download.</strong> This link can only be used once. Once you click Save File the code will be marked as used.
              </p>
            </div>

            {/* Save button */}
            <button
              id="save-file-btn"
              onClick={handleSave}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_16px_36px_-20px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-20px_var(--color-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Save File
            </button>

            <div className="mt-4 flex justify-center">
              <Link to="/transfer" className="text-sm text-[color:var(--color-text-soft)] hover:text-[color:var(--color-text-strong)] transition-colors duration-150">
                ← Back to Transfer
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Downloading ────────────────────────────────────────────────────────────
  if (status === "downloading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--color-bg)] px-4 text-[color:var(--color-text)]">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full bg-[image:var(--gradient-brand)] opacity-15" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-12 w-12 animate-spin text-[color:var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-[color:var(--color-text-strong)]">Starting download…</p>
            <p className="mt-2 text-sm text-[color:var(--color-text-soft)]">Your browser's save dialog should appear shortly.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  const { emoji, title, description, hint } = getErrorMeta(error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--color-bg)] px-4 text-[color:var(--color-text)]">
      <div className="w-full max-w-md animate-fade-in-up">

        <div className="rounded-[32px] border border-rose-200/60 bg-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] p-8 shadow-[0_32px_80px_-44px_rgba(225,60,60,0.18)] dark:border-rose-900/30" role="alert">

          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200/60 bg-rose-50 text-3xl shadow-inner dark:border-rose-900/40 dark:bg-rose-950/40">
              {emoji}
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-300">
            {title}
          </h1>

          <p className="mt-3 text-center text-sm leading-6 text-[color:var(--color-text-soft)]">
            {description}
          </p>

          <div className="mt-5 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-4 py-3">
            <p className="text-center text-xs leading-5 text-[color:var(--color-text-soft)]">
              💡 {hint}
            </p>
          </div>

          {error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-center text-xs text-rose-500/70 hover:text-rose-500 dark:text-rose-400/60 dark:hover:text-rose-400">
                View technical details
              </summary>
              <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 font-mono text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </p>
            </details>
          )}
        </div>

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
            className="text-sm text-[color:var(--color-text-soft)] hover:text-[color:var(--color-text-strong)] focus-visible:outline-none transition-colors duration-150"
          >
            ← Back to Transfer
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TransferReceiveByUrlPage;
