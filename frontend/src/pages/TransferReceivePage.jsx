import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import { receiveTransferRequest } from "../lib/transferApi";

function TransferReceivePage() {
  const [code, setCode] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ open: false, title: "", message: "", variant: "info" });

  const normalizedCode = code.trim().toUpperCase();
  const isReady = normalizedCode.length === 6 && !isFetching;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isReady) return;

    setError("");
    setIsFetching(true);

    try {
      const data = await receiveTransferRequest(normalizedCode);
      // Immediately redirect browser to the pCloud download URL
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setIsFetching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <Navbar showHomeLink />

      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-lg flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full animate-fade-in-up">

          {/* Card */}
          <div className="rounded-[32px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] p-8 shadow-[0_32px_80px_-44px_var(--color-shadow)]">

            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[image:var(--gradient-brand-soft)] border border-[color:var(--color-border-strong)]">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-[color:var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
            </div>

            <h1 className="text-center text-2xl font-bold tracking-tight text-[color:var(--color-text-strong)]">
              Receive a File
            </h1>
            <p className="mt-2 text-center text-sm text-[color:var(--color-text-soft)]">
              Enter the transfer code from the sender. Your download will start immediately.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="transfer-code-input"
                  className="block text-sm font-medium text-[color:var(--color-text-strong)]"
                >
                  Transfer Code
                </label>
                <input
                  id="transfer-code-input"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6);
                    setCode(val);
                    setError("");
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}
                  placeholder="6-character code"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={6}
                  disabled={isFetching}
                  className="mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-4 py-3 text-center font-mono text-xl font-bold tracking-widest text-[color:var(--color-text-strong)] shadow-inner outline-none placeholder:text-[color:var(--color-text-soft)] placeholder:font-normal placeholder:tracking-normal focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p className="mt-1 text-right text-xs text-[color:var(--color-text-soft)]">
                  {normalizedCode.length}/6 characters
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="animate-fade-in rounded-2xl border border-rose-200/60 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/40" role="alert">
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                    ⚠️ {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                id="get-file-btn"
                disabled={!isReady}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_44px_-28px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_50px_-24px_var(--color-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
              >
                {isFetching ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Fetching…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Get File
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Back link */}
          <p className="mt-6 text-center text-sm text-[color:var(--color-text-soft)]">
            Don't have a code?{" "}
            <Link
              to="/transfer"
              className="font-medium text-[color:var(--color-accent)] hover:underline focus-visible:outline-none"
            >
              Go back to Transfer
            </Link>
          </p>
        </div>
      </main>

      <Toast
        open={toast.open}
        title={toast.title}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((c) => ({ ...c, open: false }))}
      />
    </div>
  );
}

export default TransferReceivePage;
