import type { JSX } from "react";

interface GameHeroSectionProps {
  title: string;
  description: string;
}

export function GameHeroSection({
  title,
  description,
}: GameHeroSectionProps): JSX.Element {
  return (
    <div className="details-wrapper">
      <h1 className="details-title">{title}</h1>
      <h2 className="text-center lg:px-20">{description}</h2>
    </div>
  );
}
