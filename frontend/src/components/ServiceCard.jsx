import { Link } from "react-router-dom";

function ServiceCard({ title, description, ctaLabel, to, disabled = false, badge, icon }) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-[color:var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface)_90%,transparent)] p-7 shadow-[0_16px_48px_-28px_var(--color-shadow)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[color:var(--color-border-strong)] hover:shadow-[0_28px_64px_-28px_var(--color-shadow)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--gradient-brand-soft)] border border-[color:var(--color-border-strong)] text-[color:var(--color-accent)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_24px_var(--color-accent-soft)]">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[color:var(--color-text-strong)]">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-soft)]">
              {description}
            </p>
          </div>
        </div>
        {badge && (
          <span className="inline-flex shrink-0 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-3 py-1 text-xs font-medium text-[color:var(--color-text-soft)]">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-auto pt-4">
        {disabled ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-5 py-2.5 text-sm font-medium text-[color:var(--color-text-soft)] opacity-70"
          >
            {ctaLabel}
          </button>
        ) : (
          <Link
            to={to}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_-18px_var(--color-shadow)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_var(--color-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)]"
          >
            {ctaLabel}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </article>
  );
}

export default ServiceCard;
