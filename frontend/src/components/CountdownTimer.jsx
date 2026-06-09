import { useEffect, useState } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

function getRemaining(expiresAt) {
  const diff = Math.max(0, new Date(expiresAt) - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds, totalSeconds };
}

function CountdownTimer({ expiresAt, forceExpired = false }) {
  const [remaining, setRemaining] = useState(() => getRemaining(expiresAt));

  useEffect(() => {
    if (remaining.totalSeconds <= 0 || forceExpired) return;
    const id = setInterval(() => {
      setRemaining(getRemaining(expiresAt));
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, remaining.totalSeconds, forceExpired]);

  const expired = forceExpired || remaining.totalSeconds === 0;
  const isRed = expired || remaining.totalSeconds <= 60;
  const isAmber = !isRed && remaining.totalSeconds <= 180;

  const color = expired
    ? "text-rose-500"
    : isRed
    ? "text-rose-500"
    : isAmber
    ? "text-amber-500"
    : "text-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 shrink-0 ${color}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className={`text-sm font-mono font-semibold tabular-nums ${color}`}>
        {expired
          ? "Expired"
          : `${pad(remaining.minutes)}:${pad(remaining.seconds)} remaining`}
      </span>
    </div>
  );
}

export default CountdownTimer;

