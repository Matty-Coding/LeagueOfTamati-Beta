import { useEffect, useRef, useState } from "react";

interface CircularTimerProps {
  duration: number;
  isRunning: boolean;
  onComplete?: () => void;
}

const SIZE = 60; // in px
const STROKE_WIDTH = 3; // in px
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CircularTimer({
  duration,
  isRunning,
  onComplete,
}: CircularTimerProps) {
  const [remaining, setRemaining] = useState(duration);

  // Refs
  const rafIdRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  //
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // cleanup to reset timer correctly
  useEffect(() => {
    const reset = () => {
      setRemaining(duration);
      endTimeRef.current = null;
    };

    reset();
  }, [duration]);

  useEffect(() => {
    // stop the timer if not running or the duration is 0
    if (!isRunning || duration <= 0) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (duration <= 0 && isRunning) onCompleteRef.current?.();
      return;
    }

    // calculate the end time precisely
    endTimeRef.current = performance.now() + duration * 1000;

    const tick = (now: number) => {
      // remaining time to the end of the timer
      const timeLeft = (endTimeRef.current! - now) / 1000;
      const newRemaining = Math.max(0, timeLeft);

      setRemaining(newRemaining);

      if (newRemaining <= 0) {
        onCompleteRef.current?.();
        return;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isRunning, duration]);

  const progress = remaining / (duration || 1); // avoid division by zero
  const dashoffset = CIRCUMFERENCE * (1 - progress);

  const RED_THRESHOLD_SECONDS = duration / 8;
  const ORANGE_THRESHOLD_SECONDS = duration / 4;
  const YELLOW_THRESHOLD_SECONDS = duration / 2;

  const isRed = remaining <= RED_THRESHOLD_SECONDS;
  const isOrange = remaining <= ORANGE_THRESHOLD_SECONDS && remaining > 0;
  const isYellow = remaining <= YELLOW_THRESHOLD_SECONDS && remaining > 0;

  return (
    <div className="relative flex flex-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90 w-15 h-15 md:w-20 md:h-20 lg:w-24 lg:h-24"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          className="stroke-lol-text"
          fill="none"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset: dashoffset }}
          className={`transition-color duration-200 ${
            isRed
              ? "stroke-red-500"
              : isOrange
                ? "stroke-orange-500"
                : isYellow
                  ? "stroke-yellow-500"
                  : "stroke-green-500"
          }`}
        />
      </svg>
      <span className="absolute text-3xl md:text-4xl lg:text-5xl text-lol font-bold font-mono">
        {Math.ceil(remaining)}
      </span>
    </div>
  );
}
