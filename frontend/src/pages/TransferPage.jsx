import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function TransferPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <Navbar showHomeLink />

      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center animate-fade-in-up">
          <span className="inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-4 py-1 text-sm font-medium text-[color:var(--color-text-soft)]">
            File Transfer
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[color:var(--color-text-strong)] sm:text-5xl">
            Share files, instantly
          </h1>
          <p className="mt-4 text-base leading-8 text-[color:var(--color-text-soft)] sm:text-lg">
            Upload a file and get a code, URL, or QR — no account needed. Files expire after 10 minutes.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Send */}
          <div
            className="animate-fade-in-up group flex flex-col rounded-[32px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-8 shadow-[0_24px_60px_-36px_var(--color-shadow)] transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--color-border-strong)] hover:shadow-[0_32px_72px_-36px_var(--color-shadow)]"
            style={{ animationDelay: "60ms" }}
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-brand)] shadow-[0_12px_32px_-16px_var(--color-shadow)]">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[color:var(--color-text-strong)]">
              Send a File
            </h2>
            <p className="mt-3 flex-1 text-sm leading-7 text-[color:var(--color-text-soft)]">
              Upload any file up to 1 GB. You'll get a short code, a direct URL, and a QR code to share with the receiver.
            </p>
            <div className="mt-8">
              <Link
                to="/transfer/send"
                id="transfer-send-btn"
                className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_50px_-22px_var(--color-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
              >
                Send File
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Receive */}
          <div
            className="animate-fade-in-up group flex flex-col rounded-[32px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-8 shadow-[0_24px_60px_-36px_var(--color-shadow)] transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--color-border-strong)] hover:shadow-[0_32px_72px_-36px_var(--color-shadow)]"
            style={{ animationDelay: "120ms" }}
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-muted)] shadow-[0_8px_20px_-12px_var(--color-shadow)]">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-[color:var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[color:var(--color-text-strong)]">
              Receive a File
            </h2>
            <p className="mt-3 flex-1 text-sm leading-7 text-[color:var(--color-text-soft)]">
              Enter the transfer code you received from the sender and your download will start immediately.
            </p>
            <div className="mt-8">
              <Link
                to="/transfer/receive"
                id="transfer-receive-btn"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-muted)] px-6 py-3 text-sm font-semibold text-[color:var(--color-text-strong)] shadow-[0_10px_24px_-16px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
              >
                Receive File
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div className="mt-10 animate-fade-in-up rounded-3xl border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_70%,transparent)] p-5" style={{ animationDelay: "180ms" }}>
          <dl className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Max file size", value: "1 GB" },
              { label: "Expires after", value: "10 minutes" },
              { label: "One-time use", value: "Code works once" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <dt className="text-xs font-medium uppercase tracking-widest text-[color:var(--color-text-soft)]">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-[color:var(--color-text-strong)]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </main>
    </div>
  );
}

export default TransferPage;
