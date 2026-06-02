function ProgressBar({ value, tone = "safe" }) {
  const toneClasses = {
    safe: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
  };

  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full bg-[color:var(--color-surface-muted)]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(Math.round(value), 100)}
      aria-label="Paste size limit usage"
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ${toneClasses[tone]}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export default ProgressBar;
