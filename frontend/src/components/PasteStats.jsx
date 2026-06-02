function PasteStats({ characters, lines, bytes, formattedSize, limitBytes }) {
  const usagePercentage = Math.min((bytes / limitBytes) * 100, 100);

  return (
    <section
      aria-label="Paste statistics"
      className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.24)]"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-[color:var(--color-surface-muted)] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-soft)]">
            Characters
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--color-text-strong)]">
            {characters.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl bg-[color:var(--color-surface-muted)] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-soft)]">
            Lines
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--color-text-strong)]">
            {lines.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl bg-[color:var(--color-surface-muted)] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-soft)]">
            Size
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--color-text-strong)]">
            {formattedSize}
          </p>
          <p className="mt-2 text-xs text-[color:var(--color-text-soft)]">
            {bytes.toLocaleString()} bytes
          </p>
        </div>

        <div className="rounded-2xl bg-[color:var(--color-surface-muted)] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-soft)]">
            Limit Used
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--color-text-strong)]">
            {usagePercentage.toFixed(1)}%
          </p>
          <p className="mt-2 text-xs text-[color:var(--color-text-soft)]">
            10 MB maximum
          </p>
        </div>
      </div>
    </section>
  );
}

export default PasteStats;
