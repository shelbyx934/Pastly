import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import { getPasteRequest } from "../lib/pasteApi";

function ViewPastePage() {
  const { slug = "" } = useParams();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({
    open: false, title: "", message: "", variant: "success",
  });

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage("");

    getPasteRequest(slug)
      .then((data) => { if (isMounted) setContent(data); })
      .catch(() => {
        if (isMounted) setErrorMessage("Paste does not exist or has expired.");
      })
      .finally(() => { if (isMounted) setIsLoading(false); });

    return () => { isMounted = false; };
  }, [slug]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const el = document.createElement("textarea");
        el.value = content;
        el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setToast({ open: true, title: "Copied", message: "Paste content copied to clipboard.", variant: "info" });
    } catch {
      setToast({ open: true, title: "Copy failed", message: "Clipboard access unavailable.", variant: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Top bar */}
        <div className="mb-5 flex items-center justify-between gap-4 animate-fade-in">
          <div>
            <span className="inline-flex rounded-full border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-soft)]">
              /p/{slug}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isLoading && !errorMessage && (
              <button
                type="button"
                id="copy-paste-content-btn"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-strong)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </button>
            )}
            <Link
              to="/paste"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-4 py-2 text-sm font-medium text-[color:var(--color-text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
            >
              New Paste
            </Link>
          </div>
        </div>

        {/* Content card */}
        <section
          className="w-full rounded-[32px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] shadow-[0_28px_70px_-44px_var(--color-shadow)] animate-fade-in-up"
          aria-label="Paste content"
        >
          <div className="min-h-[70vh] rounded-[32px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-5 py-5 shadow-inner sm:px-6 sm:py-6">
            {isLoading ? (
              /* Loading skeleton */
              <div className="space-y-3 animate-pulse-soft" aria-busy="true" aria-label="Loading paste">
                {[100, 80, 92, 60, 75].map((w, i) => (
                  <div
                    key={i}
                    className="h-4 rounded-lg bg-[color:var(--color-surface-muted)]"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            ) : errorMessage ? (
              /* Error state */
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-200/60 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/30">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-rose-500" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-[color:var(--color-text-strong)]">
                  Paste not found
                </p>
                <p className="mt-2 max-w-sm text-sm text-[color:var(--color-text-soft)]">
                  {errorMessage}
                </p>
                <p className="mt-1 text-xs text-[color:var(--color-text-soft)]">
                  It may have expired, been removed, or the backend may be unavailable.
                </p>
                <Link
                  to="/paste"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_16px_36px_-20px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
                >
                  Create a new paste
                </Link>
              </div>
            ) : (
              <pre className="m-0 whitespace-pre-wrap break-words font-mono text-sm leading-7 text-[color:var(--color-text-strong)] sm:text-[15px]">
                {content}
              </pre>
            )}
          </div>
        </section>
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

export default ViewPastePage;
