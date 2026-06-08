import { useEffect, useRef, useState } from "react";
import { getTransferStatusRequest } from "../lib/transferApi";

const POLL_INTERVAL = 5000; // 5 seconds

function StatusPollBadge({ code, expiresAt }) {
  const [received, setReceived] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!code) return;

    const poll = async () => {
      try {
        const data = await getTransferStatusRequest(code);
        if (data.isReceived) {
          setReceived(true);
          clearInterval(intervalRef.current);
        }
      } catch {
        // silent — stop polling on persistent error to avoid spam
        clearInterval(intervalRef.current);
      }
    };

    // Stop polling when expired
    const msUntilExpiry = new Date(expiresAt) - Date.now();
    if (msUntilExpiry <= 0) return;

    poll(); // immediate first check
    intervalRef.current = setInterval(poll, POLL_INTERVAL);

    const expireTimeout = setTimeout(() => {
      clearInterval(intervalRef.current);
    }, msUntilExpiry);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(expireTimeout);
    };
  }, [code, expiresAt]);

  if (received) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 animate-fade-in">
        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
        Receiver opened the file
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-soft)]">
      <span className="h-2 w-2 rounded-full bg-[color:var(--color-accent)] shrink-0 animate-pulse-soft" aria-hidden="true" />
      Waiting for receiver…
    </div>
  );
}

export default StatusPollBadge;
