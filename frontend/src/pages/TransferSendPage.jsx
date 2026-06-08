import { useRef, useState } from "react";
import CountdownTimer from "../components/CountdownTimer";
import FileDropZone from "../components/FileDropZone";
import Navbar from "../components/Navbar";
import QRCode from "../components/QRCode";
import StatusPollBadge from "../components/StatusPollBadge";
import Toast from "../components/Toast";
import TransferCodeDisplay from "../components/TransferCodeDisplay";
import { createTransferRequest } from "../lib/transferApi";

const STEP = { SELECT: "select", UPLOADING: "uploading", DONE: "done" };

function TransferSendPage() {
  const [step, setStep] = useState(STEP.SELECT);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null); // { code, url, expiresAt }
  const [urlCopied, setUrlCopied] = useState(false);
  const [toast, setToast] = useState({ open: false, title: "", message: "", variant: "success" });

  const abortRef = useRef(null);

  const showToast = (title, message, variant = "error") =>
    setToast({ open: true, title, message, variant });

  const handleUpload = async () => {
    if (!file) return;
    setStep(STEP.UPLOADING);
    setUploadProgress(0);

    try {
      const data = await createTransferRequest(file, (e) => {
        if (e.total) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      setResult(data);
      setStep(STEP.DONE);
    } catch (err) {
      setStep(STEP.SELECT);
      showToast("Upload failed", err.message);
    }
  };

  const handleCopyUrl = async () => {
    if (!result?.url) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 1800);
      showToast("Copied!", "Transfer URL copied to clipboard.", "info");
    } catch {
      showToast("Copy failed", "Clipboard access unavailable.");
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <Navbar showHomeLink />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <div className="mb-10 animate-fade-in-up">
          <div className="mb-6 rounded-[32px] bg-[image:var(--gradient-brand-soft)] p-[1px] shadow-[0_28px_70px_-40px_var(--color-shadow)]">
            <div className="rounded-[calc(2rem-1px)] bg-[color:color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-6 py-6 sm:px-8">
              <span className="inline-flex items-center rounded-full border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-soft)]">
                Send File
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-[color:var(--color-text-strong)] sm:text-4xl">
                Upload &amp; Share
              </h1>
              <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-soft)]">
                Pick a file — you'll get a code, URL and QR to share with the receiver.
              </p>
            </div>
          </div>
        </div>

        {/* ── STEP 1 & 2: Select + Upload ── */}
        {step !== STEP.DONE && (
          <section className="animate-fade-in-up space-y-6">
            <div className="rounded-[28px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-6 shadow-[0_20px_50px_-32px_var(--color-shadow)]">
              <h2 className="mb-4 text-sm font-semibold text-[color:var(--color-text-strong)]">
                Choose a file
              </h2>
              <FileDropZone
                file={file}
                onFile={setFile}
                onClear={() => setFile(null)}
                disabled={step === STEP.UPLOADING}
              />
            </div>

            {/* Upload progress */}
            {step === STEP.UPLOADING && (
              <div className="animate-fade-in rounded-[28px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-6 shadow-[0_16px_40px_-28px_var(--color-shadow)]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[color:var(--color-text-strong)]">
                    {uploadProgress < 100 ? "Uploading…" : "Processing on server…"}
                  </p>
                  <p className="text-sm font-mono text-[color:var(--color-text-soft)]">
                    {uploadProgress}%
                  </p>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                  <div
                    className="h-full rounded-full bg-[image:var(--gradient-brand)] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                    role="progressbar"
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Upload progress"
                  />
                </div>
                {uploadProgress >= 100 && (
                  <p className="mt-3 text-xs text-[color:var(--color-text-soft)] animate-pulse-soft">
                    Saving to cloud storage, almost done…
                  </p>
                )}
              </div>
            )}

            {/* Send button */}
            <div className="flex justify-end">
              <button
                type="button"
                id="send-file-btn"
                disabled={!file || step === STEP.UPLOADING}
                onClick={handleUpload}
                className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-7 py-3 text-sm font-semibold text-white shadow-[0_20px_44px_-28px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_50px_-24px_var(--color-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
              >
                {step === STEP.UPLOADING ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Uploading…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Send File
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* ── STEP 3: Result ── */}
        {step === STEP.DONE && result && (
          <div className="animate-fade-in-up space-y-6">

            {/* Status + Timer row */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-5 py-4 shadow-[0_14px_36px_-24px_var(--color-shadow)]">
              <StatusPollBadge code={result.code} expiresAt={result.expiresAt} />
              <CountdownTimer expiresAt={result.expiresAt} />
            </div>

            {/* Three sharing panels */}
            <div className="grid gap-5 sm:grid-cols-3">

              {/* Code */}
              <div className="flex flex-col items-center rounded-[28px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-6 shadow-[0_18px_44px_-28px_var(--color-shadow)]">
                <TransferCodeDisplay code={result.code} />
              </div>

              {/* URL */}
              <div className="flex flex-col rounded-[28px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-6 shadow-[0_18px_44px_-28px_var(--color-shadow)]">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-soft)]">
                  Direct URL
                </p>
                <div className="flex-1 rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-3">
                  <p className="break-all text-xs leading-6 text-[color:var(--color-text-strong)]">
                    {result.url}
                  </p>
                </div>
                <button
                  type="button"
                  id="copy-transfer-url-btn"
                  onClick={handleCopyUrl}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-strong)] hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
                >
                  {urlCopied ? (
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
                      Copy URL
                    </>
                  )}
                </button>
              </div>

              {/* QR */}
              <div className="flex flex-col items-center rounded-[28px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-6 shadow-[0_18px_44px_-28px_var(--color-shadow)]">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-soft)]">
                  Scan QR
                </p>
                <div className="rounded-2xl bg-[#fffaf5] p-2 dark:bg-[#f7f2eb]">
                  <QRCode value={result.url} size={148} />
                </div>
                <p className="mt-3 text-center text-xs text-[color:var(--color-text-soft)]">
                  Scan to download directly
                </p>
              </div>
            </div>

            {/* File info */}
            <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_70%,transparent)] px-5 py-4">
              <p className="text-sm text-[color:var(--color-text-soft)]">
                <span className="font-semibold text-[color:var(--color-text-strong)]">{file?.name}</span>
                {" · "}
                Code redeemable once · Receiver's download is direct from cloud storage
              </p>
            </div>

            {/* Send another */}
            <div className="flex justify-center">
              <button
                type="button"
                id="send-another-btn"
                onClick={() => { setStep(STEP.SELECT); setFile(null); setResult(null); setUploadProgress(0); }}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-6 py-3 text-sm font-medium text-[color:var(--color-text-strong)] hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
              >
                Send another file
              </button>
            </div>
          </div>
        )}
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

export default TransferSendPage;
