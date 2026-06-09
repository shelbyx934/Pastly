import { useEffect, useRef, useState } from "react";
import CountdownTimer from "../components/CountdownTimer";
import FileDropZone from "../components/FileDropZone";
import Navbar from "../components/Navbar";
import QRCode from "../components/QRCode";
import StatusPollBadge from "../components/StatusPollBadge";
import Toast from "../components/Toast";
import TransferCodeDisplay from "../components/TransferCodeDisplay";
import { createTransferRequest, getTransferJobStatus } from "../lib/transferApi";

const STEP = { SELECT: "select", UPLOADING: "uploading", DONE: "done" };
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

  // ── Phase A: browser → server ─────────────────────────────────────────────
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const browserPercent = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;

  // ── Phase B: server → pCloud ──────────────────────────────────────────────
  const [jobId, setJobId] = useState(null);   // set when 202 arrives
  const [pendingCode, setPendingCode] = useState(""); // code from 202, shown during Phase B
  const [cloudProgress, setCloudProgress] = useState({
    uploaded: 0,
    total: 0,
    finished: false,
    currentFile: "",
  });
  const cloudPercent = cloudProgress.total > 0
    ? Math.round((cloudProgress.uploaded / cloudProgress.total) * 100)
    : 0;

  const showToast = (title, message, variant = "error") =>
    setToast({ open: true, title, message, variant });

  // ── Cloud upload polling effect ───────────────────────────────────────────
  useEffect(() => {
    if (!jobId || step !== STEP.UPLOADING) return;

    let cancelled = false;
    let timeoutId;

    const poll = async () => {
      if (cancelled) return;
      try {
        const data = await getTransferJobStatus(jobId);
        if (cancelled) return;

        if (data.phase === "done") {
          setResult({ code: data.code, url: data.url, expiresAt: data.expiresAt });
          setActiveTab("code");
          setStep(STEP.DONE);
          return; // stop polling
        }

        if (data.phase === "error") {
          setStep(STEP.SELECT);
          showToast("Upload failed", data.error ?? "Cloud upload failed");
          return;
        }

        // Still uploading — update cloud progress state
        setCloudProgress({
          uploaded: data.cloudUploaded ?? 0,
          total: data.cloudTotal ?? 0,
          finished: data.cloudFinished ?? false,
          currentFile: data.currentFile ?? "",
        });

        timeoutId = setTimeout(poll, CLOUD_POLL_MS);
      } catch (err) {
        if (!cancelled) {
          setStep(STEP.SELECT);
          showToast("Upload failed", err.message);
        }
      }
    };

    // First poll after a short delay — give the server a moment to start
    timeoutId = setTimeout(poll, 600);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [jobId, step]);

  // ── Upload handler ─────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    setStep(STEP.UPLOADING);
    setUploadedBytes(0);
    setTotalBytes(0);
    setJobId(null);
    setPendingCode("");
    setCloudProgress({ uploaded: 0, total: 0, finished: false, currentFile: "" });

    try {
      const data = await createTransferRequest(file, (progressEvent) => {
        setUploadedBytes(progressEvent.loaded ?? 0);
        setTotalBytes(progressEvent.total ?? 0);
      });
      // data = { success, jobId, code }
      // 202 received → HTTP connection closed → cloud upload running in background
      setPendingCode(data.code ?? "");
      setJobId(data.jobId);
    } catch (err) {
      setStep(STEP.SELECT);
      showToast("Upload failed", err.message);
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

  // ── Derived state ──────────────────────────────────────────────────────────
  // Whether the browser→server leg is still going
  const isBrowserUploading = step === STEP.UPLOADING && jobId === null;
  // Whether we're polling the cloud leg
  const isCloudUploading = step === STEP.UPLOADING && jobId !== null;

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

            <div className="flex justify-end">
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

              {/* ── Phase A: browser → server ── */}
              {isBrowserUploading && (
                <>
                  {/* Header */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-soft)]">
                      Step 1 of 2 — Sending to server
                    </p>
                    <p className="mt-1 font-medium text-[color:var(--color-text-strong)] truncate">
                      {file?.name}
                    </p>
                  </div>

                  {/* Browser upload progress bar */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-[color:var(--color-text-soft)]">
                      <span>{formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}</span>
                      <span className="font-mono font-semibold text-[color:var(--color-text-strong)]">
                        {browserPercent}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]">
                      <div
                        className="h-full rounded-full bg-[image:var(--gradient-brand)] transition-all duration-200 ease-out"
                        style={{ width: `${browserPercent}%` }}
                        role="progressbar"
                        aria-valuenow={browserPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Browser upload progress"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-[color:var(--color-text-soft)]">
                    <svg className="h-4 w-4 shrink-0 animate-spin text-[color:var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Transferring your file to the server…
                  </div>
                </>
              )}

              {/* ── Phase B: server → pCloud ── */}
              {isCloudUploading && (
                <>
                  {/* Header */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-soft)]">
                      Step 2 of 2 — Uploading to cloud
                    </p>
                    <p className="mt-1 font-medium text-[color:var(--color-text-strong)] truncate">
                      {cloudProgress.currentFile || file?.name}
                    </p>
                  </div>

                  {/* Cloud upload progress bar */}
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
                        /* Indeterminate shimmer while waiting for pCloud to start */
                        <div className="h-full w-1/3 animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full bg-[image:var(--gradient-brand)] opacity-70" />
                      )}
                    </div>
                  </div>

                  {/* Info row */}
                  <div className="flex items-center gap-3 text-sm text-[color:var(--color-text-soft)]">
                    <svg className="h-4 w-4 shrink-0 animate-spin text-[color:var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Uploading to cloud storage — you can safely close this tab.
                  </div>

                  {/* "Safe to close" notice */}
                  <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-4 py-3 text-xs text-[color:var(--color-text-soft)] leading-5">
                    💡 <strong className="text-[color:var(--color-text-strong)]">Your code is already ready:</strong>{" "}
                    {pendingCode && (
                      <span className="font-mono font-bold tracking-widest text-[color:var(--color-text-strong)]">{pendingCode}</span>
                    )}
                    {" "}The file will finish uploading even if you close this window.
                    Once done, the receiver can use the code above.
                  </div>
                </>
              )}
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
                onClick={() => { setStep(STEP.SELECT); setFile(null); setResult(null); setJobId(null); setPendingCode(""); setCodeRedeemed(false); }}
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
