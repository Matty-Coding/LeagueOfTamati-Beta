import type { JSX } from "react";

interface FeatureCardProps {
  icon: JSX.Element;
  title: string;
  content: string;
}

export function FeatureCard({
  icon,
  title,
  content,
}: FeatureCardProps): JSX.Element {
  return (
    <article className="flex-center flex-col gap-2 p-5 bg-lol-blue rounded-md border border-lol-gold hover:border-lol-gold hover:bg-lol-blue-light/60">
      <div className="w-10 h-10 rounded-md text-emerald-600">{icon}</div>
      <div className="flex-center flex-col gap-2">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-center">{content}</p>
      </div>
    </article>
  );
}
