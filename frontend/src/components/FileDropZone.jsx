import { useCallback, useRef, useState } from "react";

const MAX_SIZE = 1024 * 1024 * 1024; // 1 GB

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getFileIcon(type) {
  if (!type) return "📄";
  if (type.startsWith("image/")) return "🖼️";
  if (type.startsWith("video/")) return "🎬";
  if (type.startsWith("audio/")) return "🎵";
  if (type.includes("pdf")) return "📕";
  if (type.includes("zip") || type.includes("tar") || type.includes("gz") || type.includes("rar")) return "🗜️";
  if (type.includes("word") || type.includes("document")) return "📝";
  if (type.includes("sheet") || type.includes("excel")) return "📊";
  if (type.includes("presentation") || type.includes("powerpoint")) return "📽️";
  if (type.startsWith("text/")) return "📃";
  return "📦";
}

function FileDropZone({ file, onFile, onClear, disabled = false }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState("");

  const processFile = useCallback((f) => {
    if (!f) return;
    if (f.size > MAX_SIZE) {
      setSizeError(`File is ${formatSize(f.size)} — exceeds the 1 GB limit.`);
      onFile(null);
      return;
    }
    setSizeError("");
    onFile(f);
  }, [onFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files[0];
    processFile(dropped);
  }, [disabled, processFile]);

  const handleDragOver = (e) => { e.preventDefault(); if (!disabled) setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleInput = (e) => {
    const picked = e.target.files?.[0];
    processFile(picked);
    e.target.value = "";
  };

  const handleClear = () => {
    setSizeError("");
    onClear();
  };

  if (file) {
    return (
      <div className="animate-fade-in-up rounded-[28px] border border-[color:var(--color-border-strong)] bg-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] p-6">
        <div className="flex items-start gap-4">
          <span className="text-4xl leading-none select-none" aria-hidden="true">
            {getFileIcon(file.type)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-[color:var(--color-text-strong)]">
              {file.name}
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-text-soft)]">
              {formatSize(file.size)}
              {file.type ? ` · ${file.type}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            aria-label="Remove file"
            className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-2 text-[color:var(--color-text-soft)] hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-strong)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-label="Drop a file here or click to browse"
        className={[
          "w-full rounded-[28px] border-2 border-dashed p-10 text-center transition-all duration-200",
          isDragging
            ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] scale-[1.01]"
            : "border-[color:var(--color-border-strong)] bg-[color:color-mix(in_srgb,var(--color-surface)_80%,transparent)] hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)]",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        ].join(" ")}
      >
        <div className="pointer-events-none flex flex-col items-center gap-3">
          <svg viewBox="0 0 24 24" className="h-12 w-12 text-[color:var(--color-accent)]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="text-base font-semibold text-[color:var(--color-text-strong)]">
            {isDragging ? "Drop it!" : "Drag & drop a file here"}
          </p>
          <p className="text-sm text-[color:var(--color-text-soft)]">
            or click to browse · up to 1 GB
          </p>
        </div>
      </button>

      {sizeError && (
        <p className="mt-3 text-sm font-medium text-rose-500 animate-fade-in">
          ⚠️ {sizeError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleInput}
      />
    </div>
  );
}

export default FileDropZone;
