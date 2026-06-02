import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Toast from "../components/Toast";
import { getPasteRequest } from "../lib/pasteApi";

function ViewPastePage() {
  const { slug = "" } = useParams();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState({
    open: false,
    title: "",
    message: "",
    variant: "success",
  });

  useEffect(() => {
    let isMounted = true;

    const loadPaste = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getPasteRequest(slug);

        if (isMounted) {
          setContent(response);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            // error instanceof Error ? error.message : "Unable to load paste.",
            "Paste does not exist or has been expired."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPaste();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setToast({
        open: true,
        title: "Copied",
        message: "Paste content copied to clipboard.",
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
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full rounded-[32px] border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-4 shadow-[0_28px_70px_-44px_var(--color-shadow)] sm:p-6">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={handleCopy}
              disabled={isLoading || Boolean(errorMessage)}
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-strong)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-elevated)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
            >
              Copy
            </button>
          </div>

          <div className="min-h-[70vh] rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-5 py-5 shadow-inner sm:px-6 sm:py-6">
            {isLoading ? (
              <p className="text-sm text-[color:var(--color-text-soft)]">
                Loading paste...
              </p>
            ) : errorMessage ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-rose-600 dark:text-rose-300">
                  {errorMessage}
                </p>
                <p className="text-sm text-[color:var(--color-text-soft)]">
                  This paste may have expired, been removed, or the backend may
                  be unavailable.
                </p>
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

export default ViewPastePage;
