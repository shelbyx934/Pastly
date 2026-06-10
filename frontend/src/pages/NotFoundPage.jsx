import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--color-bg)] px-4 text-[color:var(--color-text)]">
      <div className="w-full max-w-md animate-fade-in-up text-center">

        {/* Large 404 */}
        <p className="bg-[image:var(--gradient-brand)] bg-clip-text text-[9rem] font-extrabold leading-none tracking-tighter text-transparent select-none">
          404
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[color:var(--color-text-strong)]">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-soft)]">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_-20px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go Home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-sm text-[color:var(--color-text-soft)] hover:text-[color:var(--color-text-strong)] transition-colors duration-150 focus-visible:outline-none"
          >
            ← Go back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
