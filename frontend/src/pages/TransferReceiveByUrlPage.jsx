import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { receiveTransferRequest } from "../lib/transferApi";

function TransferReceiveByUrlPage() {
  const { code } = useParams();
  const [status, setStatus] = useState("loading"); // loading | error
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) {
      setError("No transfer code found in the URL.");
      setStatus("error");
      return;
    }

    receiveTransferRequest(code)
      .then((data) => {
        // Redirect browser to pCloud download URL — browser handles the download natively
        window.location.href = data.url;
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  }, [code]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--color-bg)] px-4 text-[color:var(--color-text)]">
      {status === "loading" ? (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          {/* Spinner ring */}
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-[image:var(--gradient-brand)] opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="h-10 w-10 animate-spin text-[color:var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-[color:var(--color-text-strong)]">
              Fetching your file…
            </p>
            <p className="mt-2 text-sm text-[color:var(--color-text-soft)]">
              Your download will start in a moment.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm animate-fade-in">
          <div className="rounded-[32px] border border-rose-200/60 bg-rose-50 p-8 text-center shadow-[0_24px_60px_-36px_rgba(225,60,60,0.2)] dark:border-rose-900/40 dark:bg-rose-950/30" role="alert">
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">Oops</p>
            <p className="mt-3 text-sm leading-6 text-rose-600 dark:text-rose-400">
              {error}
            </p>
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              to="/transfer/receive"
              className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_-20px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
            >
              Enter code manually
            </Link>
            <Link
              to="/transfer"
              className="text-sm text-[color:var(--color-text-soft)] hover:text-[color:var(--color-text-strong)] focus-visible:outline-none"
            >
              ← Back to Transfer
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransferReceiveByUrlPage;
