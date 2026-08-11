import type { JSX } from "react";

export default function Spinner(): JSX.Element {
  return (
    <div className="flex-center">
      <div
        className={`w-5 h-5 border-2 border-lol-text-muted border-t-lol-text rounded-full animate-spin`}
      />
    </div>
  );
}
