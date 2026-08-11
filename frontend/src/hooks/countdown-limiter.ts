import { useState, useEffect, useCallback, useRef } from "react";
import { getTimeInterval } from "../utils/timer";

export function usePersistedCountdown(storageKey: string) {
  // callback hook to trigger only if storageKey changes
  const getRemainingSeconds = useCallback(() => {
    const unlockAt = localStorage.getItem(storageKey);
    if (!unlockAt) return 0;

    const diff = getTimeInterval(new Date().getTime(), unlockAt);
    return diff > 0 ? diff : 0;
  }, [storageKey]);

  const [countdown, setCountdown] = useState(getRemainingSeconds());

  // useRef to avoid render triggering
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    // check to avoid mutple intervals
    if (timerRef.current) clearInterval(timerRef.current);

    const update = () => {
      const remaining = getRemainingSeconds();
      setCountdown(remaining);

      // clear localStorage on expiry
      if (remaining <= 0) {
        localStorage.removeItem(storageKey);
        if (timerRef.current) clearInterval(timerRef.current);
      }

      return remaining;
    };

    // update instantly on mount
    const initial = update();

    // if remaining time exists and is positive, start the timer
    if (initial > 0) {
      timerRef.current = setInterval(update, 1000);
    }
  }, [getRemainingSeconds, storageKey]);

  // initial render
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer, storageKey]);

  // refresh to force the update
  const refresh = () => {
    setCountdown(getRemainingSeconds());
    startTimer();
  };

  return { countdown, isOnCountdown: countdown > 0, refresh };
}
