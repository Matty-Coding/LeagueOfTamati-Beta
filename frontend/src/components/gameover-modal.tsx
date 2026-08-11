import { type JSX, useEffect } from "react";
import { Link } from "react-router";
import { HiArrowRight } from "react-icons/hi2";
import capitalize from "../utils/capitalize";

interface GameOverModalProps {
  isOpen: boolean;
  correctChampionName: string;
  correctAbilityId: string;
  correctChampionSpellIcon: string;
  correctChampionId: string;
  correctChampionImage: string;
  finalScore: number;
  reason: "wrong" | "timeout";
  onClose: () => void;
}

export function GameOverModal({
  isOpen,
  correctChampionName,
  correctAbilityId,
  correctChampionSpellIcon,
  correctChampionId,
  correctChampionImage,
  finalScore,
  reason,
  onClose,
}: GameOverModalProps): JSX.Element | null {
  // lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isTimeout = reason === "timeout";

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="gameover-title"
    >
      {/* blurred dark overlay */}
      <div
        className="absolute inset-0 bg-lol-bg/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal card */}
      <div className="relative z-10 w-full max-w-lg md:max-w-2xl rounded-2xl overflow-hidden border border-lol-gold/40 shadow-2xl shadow-black/60 animate-fade">
        {/* champion splash as background */}
        <div className="absolute inset-0">
          <img
            src={correctChampionImage}
            alt={`${correctChampionName} splash art`}
            className="w-full h-full object-contain md:object-cover object-[top_center]"
          />
          {/* dark gradient overlay for readability */}
          <div className="absolute inset-0 bg-linear-to-t from-lol-bg via-lol-bg/80 to-lol-bg/30" />
          <div className="absolute inset-0 bg-linear-to-b from-lol-bg/60 to-transparent to-40%" />
        </div>

        {/* content */}
        <div className="relative z-10 flex flex-col items-center gap-6 p-8 md:p-10 text-center">
          {/* header */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-lol-text-muted text-sm uppercase tracking-widest font-semibold">
              {isTimeout ? "Time's up!" : "Wrong answer"}
            </p>
            <h2
              id="gameover-title"
              className="text-4xl md:text-5xl font-bold text-lol-gold"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              Game Over
            </h2>
          </div>

          {/* score */}
          <div className="flex flex-col items-center">
            <p className="text-lol-text-muted text-sm uppercase tracking-widest">
              Final score
            </p>
            <p className="text-5xl md:text-6xl font-bold font-mono text-lol-text">
              {finalScore}
            </p>
          </div>

          {/* divider */}
          <div className="w-full h-px bg-lol-gold/30" />

          {/* correct answer section */}
          <div className="flex flex-col items-center gap-2 w-full">
            <p className="text-lol-text-muted text-sm uppercase tracking-widest">
              Correct answer
            </p>

            <div className="flex items-center justify-center gap-4 w-full">
              {/* champion icon */}
              <img
                src={correctChampionSpellIcon}
                alt={`${correctChampionName} ${correctAbilityId} icon`}
                className="w-16 h-16 rounded-xl border-2 border-lol-gold/50 shadow-lg shadow-black/40 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />

              <div className="flex flex-col items-start gap-0.5">
                <p className="text-2xl md:text-3xl font-bold text-lol-text leading-tight">
                  {correctChampionName}
                </p>
                <p className="text-lol-gold font-semibold text-lg">
                  Ability:{" "}
                  <span className="text-lol-gold-light">
                    {capitalize(correctAbilityId)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* divider */}
          <div className="w-full h-px bg-lol-gold/30" />

          {/* action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* wiki link */}
            <Link
              to={`/wiki/${correctChampionId}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-md border border-lol-gold/50 text-lol-gold hover:bg-lol-gold/10 transition-colors duration-200 font-semibold"
            >
              View {correctChampionName} on Wiki
              <HiArrowRight size={18} />
            </Link>

            {/* play again / close */}
            <button
              type="button"
              id="gameover-close-btn"
              onClick={onClose}
              className="flex-1 btn py-3 px-5 rounded-md font-semibold"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
