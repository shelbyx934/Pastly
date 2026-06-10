import { useEffect, useRef, useState } from "react";
import CountdownTimer from "../components/CountdownTimer";
import FileDropZone from "../components/FileDropZone";
import Navbar from "../components/Navbar";
import QRCode from "../components/QRCode";
import StatusPollBadge from "../components/StatusPollBadge";
import Toast from "../components/Toast";
import TransferCodeDisplay from "../components/TransferCodeDisplay";
import { createTransferRequest, getTransferProgressStatus } from "../lib/transferApi";

const STEP = { SELECT: "select", UPLOADING: "uploading", DONE: "done" };
// uploadPhase: "preparing" (before bytes flow) | "uploading" (bytes in flight)
const UPLOAD_PHASE = { PREPARING: "preparing", UPLOADING: "uploading" };
const TABS = ["code", "link", "qr"];
const CLOUD_POLL_MS = 1500;

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function TransferSendPage() {
  const [step, setStep] = useState(STEP.SELECT);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null); // { code, url, expiresAt }
  const [activeTab, setActiveTab] = useState("code");
  const [urlCopied, setUrlCopied] = useState(false);
  const [codeRedeemed, setCodeRedeemed] = useState(false);
  const [toast, setToast] = useState({ open: false, title: "", message: "", variant: "success" });

  // ── Upload Progress State ──────────────────────────────────────────────────
  const [uploadPhase, setUploadPhase] = useState(UPLOAD_PHASE.PREPARING);
  const [progressHash, setProgressHash] = useState(null);
  const [cloudProgress, setCloudProgress] = useState({
    uploaded: 0,
    total: 0,
    finished: false,
    currentFile: "",
  });

  // AbortController ref for cancelling the upload
  const abortControllerRef = useRef(null);

  const cloudPercent = cloudProgress.total > 0
    ? Math.round((cloudProgress.uploaded / cloudProgress.total) * 100)
    : 0;

  const showToast = (title, message, variant = "error") =>
    setToast({ open: true, title, message, variant });

  // ── Cloud upload polling effect ───────────────────────────────────────────
  useEffect(() => {
    if (!progressHash || step !== STEP.UPLOADING) return;

    let cancelled = false;
    let timeoutId;

    const poll = async () => {
      if (cancelled) return;
      try {
        const data = await getTransferProgressStatus(progressHash);
        if (cancelled) return;

        setCloudProgress({
          uploaded: data.uploaded ?? 0,
          total: data.total ?? 0,
          finished: data.finished ?? false,
          currentFile: data.currentfile ?? "",
        });

        if (!data.finished) {
          timeoutId = setTimeout(poll, CLOUD_POLL_MS);
        }
      } catch {
        if (!cancelled) {
          timeoutId = setTimeout(poll, CLOUD_POLL_MS);
        }
      }
    };

    timeoutId = setTimeout(poll, 1200);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [progressHash, step]);

  // ── Cancel handler ─────────────────────────────────────────────────────────
  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setStep(STEP.SELECT);
    setProgressHash(null);
    setUploadPhase(UPLOAD_PHASE.PREPARING);
    setUploadedBytes(0);
    setTotalBytes(0);
    setCloudProgress({ uploaded: 0, total: 0, finished: false, currentFile: "" });
  };

  // ── Keyboard shortcuts (Ctrl+Enter to upload, Escape to cancel) ────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key === "Enter" && step === STEP.SELECT && file) {
        handleUpload();
      }
      if (e.key === "Escape" && step === STEP.UPLOADING) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, file]);

  // ── Upload handler ─────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStep(STEP.UPLOADING);
    setUploadPhase(UPLOAD_PHASE.PREPARING);
    const hash = crypto.randomUUID();
    setProgressHash(hash);
    setCloudProgress({ uploaded: 0, total: 0, finished: false, currentFile: "" });

    try {
      const data = await createTransferRequest(
        file,
        hash,
        (progressEvent) => {
          // Switch to uploading phase as soon as bytes start flowing
          if ((progressEvent.loaded ?? 0) > 0) setUploadPhase(UPLOAD_PHASE.UPLOADING);
        },
        controller.signal,
      );
      setResult({ code: data.code, url: data.url, expiresAt: data.expiresAt });
      setActiveTab("code");
      setStep(STEP.DONE);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError" || err.code === "ERR_CANCELED") {
        return;
      }
      setStep(STEP.SELECT);
      showToast("Upload failed", err.message);
    } finally {
      setProgressHash(null);
      setUploadPhase(UPLOAD_PHASE.PREPARING);
    }
  };

  const handleCopyUrl = async () => {
    if (!result?.url) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(result.url);
      } else {
        const el = document.createElement("textarea");
        el.value = result.url;
        el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 1800);
      showToast("Copied!", "Transfer URL copied to clipboard.", "info");
    } catch {
      showToast("Copy failed", "Clipboard access unavailable.");
    }
  };

  const isPreparing = step === STEP.UPLOADING && uploadPhase === UPLOAD_PHASE.PREPARING;
  const isUploading = step === STEP.UPLOADING && uploadPhase === UPLOAD_PHASE.UPLOADING;

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

        {/* ── STEP 1: Select ── */}
        {step === STEP.SELECT && (
          <section className="animate-fade-in-up space-y-6">
            <div className="rounded-[28px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-6 shadow-[0_20px_50px_-32px_var(--color-shadow)]">
              <h2 className="mb-4 text-sm font-semibold text-[color:var(--color-text-strong)]">
                Choose a file
              </h2>
              <FileDropZone file={file} onFile={setFile} onClear={() => setFile(null)} disabled={false} />
            </div>

            <div className="flex items-center justify-between">
              {file ? (
                <p className="text-xs text-[color:var(--color-text-soft)]">
                  Press <kbd className="rounded border border-[color:var(--color-border)] px-1.5 py-0.5 font-mono text-[11px]">Ctrl</kbd> + <kbd className="rounded border border-[color:var(--color-border)] px-1.5 py-0.5 font-mono text-[11px]">Enter</kbd> to upload
                </p>
              ) : <span />}
              <button
                type="button"
                id="send-file-btn"
                disabled={!file}
                onClick={handleUpload}
                className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-7 py-3 text-sm font-semibold text-white shadow-[0_20px_44px_-28px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_50px_-24px_var(--color-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Send File
              </button>
            </div>
          </section>
        )}

        {/* ── STEP 2: Uploading ── */}
        {step === STEP.UPLOADING && (
          <section className="animate-fade-in-up">
            <div className="flex flex-col gap-6 rounded-[32px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-8 py-10 shadow-[0_24px_60px_-36px_var(--color-shadow)]">

                             {/* ── Phase i: Preparing ── */}
              {isPreparing && (
                <div className="flex flex-col items-center gap-5 py-4">
                  {/* Animated ring */}
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full bg-[image:var(--gradient-brand)] opacity-15" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="h-9 w-9 animate-spin text-[color:var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[color:var(--color-text-strong)]">
                      Preparing to upload…
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--color-text-soft)] truncate max-w-xs">
                      {file?.name}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Phase ii: Uploading (pCloud progress) ── */}
              {isUploading && (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-soft)]">
                      Uploading to cloud storage
                    </p>
                    <p className="mt-1 font-medium text-[color:var(--color-text-strong)] truncate">
                      {file?.name}
                    </p>
                  </div>

                  {/* pCloud progress bar */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-[color:var(--color-text-soft)]">
                      {cloudProgress.total > 0 ? (
                        <span>{formatBytes(cloudProgress.uploaded)} / {formatBytes(cloudProgress.total)}</span>
                      ) : (
                        <span className="animate-pulse">Connecting to cloud…</span>
                      )}
                      <span className="font-mono font-semibold text-[color:var(--color-text-strong)]">
                        {cloudProgress.total > 0 ? `${cloudPercent}%` : "—"}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                      {cloudProgress.total > 0 ? (
                        <div
                          className="h-full rounded-full bg-[image:var(--gradient-brand)] transition-all duration-500 ease-out"
                          style={{ width: `${cloudPercent}%` }}
                          role="progressbar"
                          aria-valuenow={cloudPercent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Cloud upload progress"
                        />
                      ) : (
                        <div className="h-full w-1/3 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full bg-[image:var(--gradient-brand)] opacity-70" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-[color:var(--color-text-soft)]">
                    <svg className="h-4 w-4 shrink-0 animate-spin text-[color:var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Streaming directly to cloud storage…
                  </div>
                </>
              )}

              {/* ── Cancel button — always visible while uploading ── */}
              <div className="flex justify-center">
                <button
                  id="cancel-upload-btn"
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-2 text-xs font-medium text-[color:var(--color-text-soft)] transition-all duration-200 hover:border-rose-400 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Cancel upload
                  <span className="ml-0.5 opacity-50 text-[10px]">(Esc)</span>
                </button>
              </div>

            </div>
          </section>
        )}

        {/* ── STEP 3: Result ── */}
        {step === STEP.DONE && result && (
          <div className="animate-fade-in-up space-y-6">

            {/* Status + Timer row */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] px-5 py-4 shadow-[0_14px_36px_-24px_var(--color-shadow)]">
              <StatusPollBadge
                code={result.code}
                expiresAt={result.expiresAt}
                onReceived={() => setCodeRedeemed(true)}
              />
              <CountdownTimer expiresAt={result.expiresAt} forceExpired={codeRedeemed} />
            </div>

            {/* Tab panel */}
            <div className="rounded-[28px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] shadow-[0_18px_44px_-28px_var(--color-shadow)] overflow-hidden">

              {/* Tab bar */}
              <div className="flex border-b border-[color:var(--color-border)]" role="tablist" aria-label="Sharing options">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={activeTab === tab}
                    aria-controls={`tab-panel-${tab}`}
                    id={`tab-${tab}`}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={[
                      "flex-1 py-3.5 px-4 text-sm font-semibold capitalize tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]",
                      activeTab === tab
                        ? "bg-[image:var(--gradient-brand)] text-white"
                        : "text-[color:var(--color-text-soft)] hover:text-[color:var(--color-text-strong)] hover:bg-[color:var(--color-surface-muted)]",
                    ].join(" ")}
                  >
                    {tab === "code" && (
                      <span className="flex items-center justify-center gap-2">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Code
                      </span>
                    )}
                    {tab === "link" && (
                      <span className="flex items-center justify-center gap-2">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        Link
                      </span>
                    )}
                    {tab === "qr" && (
                      <span className="flex items-center justify-center gap-2">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="3" height="3" />
                        </svg>
                        QR Code
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab panels */}
              <div className="p-7">
                {activeTab === "code" && (
                  <div id="tab-panel-code" role="tabpanel" aria-labelledby="tab-code" className="flex flex-col items-center animate-fade-in">
                    <TransferCodeDisplay code={result.code} />
                    <p className="mt-5 text-center text-xs text-[color:var(--color-text-soft)]">
                      Share this code with the receiver. It can only be used once.
                    </p>
                  </div>
                )}

                {activeTab === "link" && (
                  <div id="tab-panel-link" role="tabpanel" aria-labelledby="tab-link" className="animate-fade-in">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-soft)]">
                      Direct URL
                    </p>
                    <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-4 py-3">
                      <p className="break-all text-sm leading-6 text-[color:var(--color-text-strong)]">
                        {result.url}
                      </p>
                    </div>
                    <button
                      type="button"
                      id="copy-transfer-url-btn"
                      onClick={handleCopyUrl}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text-strong)] hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
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
                )}

                {activeTab === "qr" && (
                  <div id="tab-panel-qr" role="tabpanel" aria-labelledby="tab-qr" className="flex flex-col items-center animate-fade-in">
                    <div className="rounded-2xl bg-[#fffaf5] p-3 dark:bg-[#f7f2eb]">
                      <QRCode value={result.url} size={180} />
                    </div>
                    <p className="mt-4 text-center text-sm text-[color:var(--color-text-soft)]">
                      Scan to download directly on any device
                    </p>
                  </div>
                )}
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
                onClick={() => { setStep(STEP.SELECT); setFile(null); setResult(null); setCodeRedeemed(false); }}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-6 py-3 text-sm font-medium text-[color:var(--color-text-strong)] hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
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
