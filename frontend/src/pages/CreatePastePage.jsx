import { useEffect, useMemo, useRef, useState } from "react";
import BrandLogo from "../components/BrandLogo";
import Navbar from "../components/Navbar";
import PasteCreatedModal from "../components/PasteCreatedModal";
import PasteStats from "../components/PasteStats";
import ProgressBar from "../components/ProgressBar";
import Toast from "../components/Toast";
import { createPasteRequest } from "../lib/pasteApi";

const MAX_PASTE_SIZE = 10 * 1024 * 1024;

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getLineCount(value) {
  if (!value) {
    return 0;
  }

  return value.split(/\r\n|\r|\n/).length;
}

function CreatePastePage() {
  const textareaRef = useRef(null);
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [pasteUrl, setPasteUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    title: "",
    message: "",
    variant: "success",
  });

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isCopied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsCopied(false);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [isCopied]);

  const bytes = useMemo(() => new TextEncoder().encode(content).length, [content]);
  const characters = content.length;
  const lines = useMemo(() => getLineCount(content), [content]);
  const formattedSize = useMemo(() => formatSize(bytes), [bytes]);
  const limitUsage = (bytes / MAX_PASTE_SIZE) * 100;
  const isEmpty = content.trim().length === 0;
  const isLimitExceeded = bytes > MAX_PASTE_SIZE;
  const isNearLimit = bytes >= MAX_PASTE_SIZE * 0.8 && !isLimitExceeded;

  const progressTone = isLimitExceeded
    ? "danger"
    : isNearLimit
      ? "warning"
      : "safe";

  const createPaste = async () => {
    if (isEmpty) {
      setToast({
        open: true,
        title: "Paste is empty",
        message: "Add some content before creating a paste.",
        variant: "error",
      });
      return;
    }

    if (isLimitExceeded) {
      setToast({
        open: true,
        title: "Limit exceeded",
        message: "Reduce the paste size to stay within the 10 MB limit.",
        variant: "error",
      });
      return;
    }

    setIsCreating(true);
    setIsCopied(false);
    setPasteUrl("");
    setIsPasteModalOpen(false);

    try {
      const response = await createPasteRequest(content);
      const shareUrl = new URL(response.url, window.location.origin).toString();

      setPasteUrl(shareUrl);
      setIsPasteModalOpen(true);
    } catch (error) {
      setToast({
        open: true,
        title: "Create failed",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create the paste right now.",
        variant: "error",
      });
      setPasteUrl("");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await createPaste();
  };

  const handleShortcut = async (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      await createPaste();
    }
  };

  const handleCopy = async () => {
    if (!pasteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(pasteUrl);
      setIsCopied(true);
      setToast({
        open: true,
        title: "Copied",
        message: "Paste URL copied to clipboard.",
        variant: "info",
      });
    } catch {
      setToast({
        open: true,
        title: "Copy failed",
        message: "Clipboard access is unavailable in this browser context.",
        variant: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <div className={isPasteModalOpen ? "pointer-events-none select-none blur-sm" : ""}>
        <Navbar showHomeLink />

        <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 rounded-[32px] bg-[image:var(--gradient-brand-soft)] p-[1px] shadow-[0_28px_70px_-40px_var(--color-shadow)]">
              <div className="rounded-[calc(2rem-1px)] bg-[color:color-mix(in_srgb,var(--color-surface)_88%,transparent)] px-6 py-6 sm:px-8">
                <BrandLogo
                  className="h-auto w-full max-w-[220px]"
                  alt="Pastly"
                />
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[color:var(--color-text-strong)] sm:text-5xl">
                  Create Paste
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--color-text-soft)]">
                  Drop in text, review its size, and generate a shareable paste
                  link with a focused writing surface.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="rounded-[28px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-4 shadow-[0_24px_56px_-36px_var(--color-shadow)] sm:p-6">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label
                      htmlFor="paste-content"
                      className="text-sm font-medium text-[color:var(--color-text-strong)]"
                    >
                      Paste content
                    </label>
                    <p className="mt-1 text-sm text-[color:var(--color-text-soft)]">
                      Use Ctrl + Enter to create a paste quickly.
                    </p>
                  </div>
                  <div className="text-sm text-[color:var(--color-text-soft)]">
                    Limit: 10 MB
                  </div>
                </div>

                <textarea
                  id="paste-content"
                  ref={textareaRef}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  onKeyDown={handleShortcut}
                  placeholder="Paste your content here..."
                  className="min-h-[360px] w-full resize-y rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-4 py-4 text-sm leading-7 text-[color:var(--color-text-strong)] shadow-inner outline-none transition-colors duration-200 placeholder:text-[color:var(--color-text-soft)] focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent-soft)]"
                  aria-describedby="paste-help paste-limit"
                  spellCheck="false"
                />

                <div
                  id="paste-help"
                  className="mt-3 flex flex-col gap-2 text-sm text-[color:var(--color-text-soft)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <p>Supports plain text, code snippets, logs, and notes.</p>
                  <p>{isEmpty ? "Start typing to enable paste creation." : "Ready to create."}</p>
                </div>
              </section>

              <PasteStats
                characters={characters}
                lines={lines}
                bytes={bytes}
                formattedSize={formattedSize}
                limitBytes={MAX_PASTE_SIZE}
              />

              <section
                className="rounded-3xl border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-5 shadow-[0_18px_42px_-30px_var(--color-shadow)]"
                aria-labelledby="paste-limit-title"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2
                      id="paste-limit-title"
                      className="text-sm font-semibold text-[color:var(--color-text-strong)]"
                    >
                      10 MB limit indicator
                    </h2>
                    <p
                      id="paste-limit"
                      className="mt-1 text-sm text-[color:var(--color-text-soft)]"
                    >
                      {isLimitExceeded
                        ? "This paste is over the allowed size."
                        : isNearLimit
                          ? "You are approaching the size limit."
                          : "You are comfortably within the size limit."}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[color:var(--color-text-strong)]">
                    {formattedSize} / 10.00 MB
                  </p>
                </div>

                <div className="mt-4">
                  <ProgressBar value={limitUsage} tone={progressTone} />
                </div>
              </section>

              <section className="flex flex-col gap-4 rounded-3xl border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-5 shadow-[0_18px_42px_-30px_var(--color-shadow)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[color:var(--color-text-strong)]">
                    Ready to publish
                  </h2>
                  <p className="mt-1 text-sm text-[color:var(--color-text-soft)]">
                    Ctrl + Enter creates the paste when the content is valid.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isEmpty || isLimitExceeded || isCreating}
                  className="inline-flex min-w-[164px] items-center justify-center rounded-full bg-[image:var(--gradient-brand)] px-6 py-3 text-sm font-medium text-white shadow-[0_22px_48px_-28px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_54px_-26px_var(--color-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Paste"}
                </button>
              </section>
            </form>

            {pasteUrl ? (
              <section
                className="mt-6 rounded-3xl border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-5 shadow-[0_18px_42px_-30px_var(--color-shadow)]"
                aria-labelledby="sample-url-title"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2
                      id="sample-url-title"
                      className="text-sm font-semibold text-[color:var(--color-text-strong)]"
                    >
                      Latest paste
                    </h2>
                    <p className="mt-1 text-sm text-[color:var(--color-text-soft)]">
                      Reopen the share actions or copy the latest URL again.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPasteModalOpen(true)}
                      className="inline-flex items-center justify-center rounded-full bg-[image:var(--gradient-brand)] px-4 py-2 text-sm font-medium text-white shadow-[0_20px_40px_-26px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)]"
                    >
                      Show actions
                    </button>

                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!pasteUrl}
                      className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-strong)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)]"
                    >
                      {isCopied ? "Copied" : "Copy URL"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-4 py-4">
                  <p className="truncate text-sm text-[color:var(--color-text-strong)]">
                    {pasteUrl}
                  </p>
                </div>
              </section>
            ) : null}
          </div>
        </main>
      </div>

      <PasteCreatedModal
        open={isPasteModalOpen}
        pasteUrl={pasteUrl}
        onClose={() => setIsPasteModalOpen(false)}
        onCopy={handleCopy}
        isCopied={isCopied}
      />
      <Toast
        open={toast.open}
        title={toast.title}
        message={toast.message}
        variant={toast.variant}
        onClose={() =>
          setToast((current) => ({
            ...current,
            open: false,
          }))
        }
      />
    </div>
  );
}

export default CreatePastePage;
