import { useState, type JSX } from "react";
import type { ChampionCardProps } from "../../types/champions";
import { Link } from "react-router";

export default function ChampionCard({
  id,
  name,
  title,
  tags,
  skins,
}: ChampionCardProps): JSX.Element {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  return (
    <Link to={`/wiki/${id}`}>
      <article
        className={`bg-lol-bg hover:bg-lol-card relative
      flex-center flex-col border-2 rounded-lg transition-all duration-500 ease-in-out hover:-translate-y-1 cursor-pointer
      ${
        imageLoaded
          ? "border-lol-gold hover:border-lol-gold-light"
          : "border-transparent"
      }`}
      >
        {/* image container */}
        <div className="relative rounded-lg size-full">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-lol-card animate-pulse rounded-lg size-full"></div>
          )}
          <img
            src={skins[0].imageUrl}
            alt={`${name} default skin`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            className={`object-cover size-full rounded-lg transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>

        {/* fade bottom card */}
        <div
          className={`absolute rounded-b-lg inset-0 bg-linear-to-t from-black via-black/50 via-40% to-transparent transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        ></div>

        {/* text container + banner */}
        <div
          className={`absolute bottom-1 right-auto flex flex-col w-full transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        >
          <h2 className="text-lol-gold text-center font-bold">{name}</h2>
          {/* title */}
          <p className="italic text-lol-text-muted text-center">{title}</p>
        </div>

        {/* tag */}
        <div
          className={`absolute left-1 top-1.5 flex flex-col gap-1 px-0.5 transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        >
          {tags.map((tag) => (
            <span
              key={tag}
              className={`${tag.toLowerCase()} role-banner text-xs text-center`}
            >
              {tag}
            </span>
          ))}
        </div>
      </article>
    </Link>
  );
}
