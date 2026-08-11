import { useEffect, type JSX } from "react";
import { useChampionsById } from "../../hooks/champions";
import Spinner from "../../components/spinner";
import { useParams } from "react-router";
import NavBar from "../../components/navbar";
import { LoreDetails } from "../../components/wiki/lore";
import { AbilitiesDetails } from "../../components/wiki/abilities-list";
import { SkinsCarousel } from "../../components/wiki/skins-carousel";
import { Footer } from "../../components/footer";

export function WikiDetailsPage(): JSX.Element {
  const { championId } = useParams();
  const { details, loading, error } = useChampionsById(championId!);

  // page title
  useEffect(() => {
    document.title = `${details?.name} | League of Tamati`;
  }, [details]);

  if (loading) return <Spinner />;
  if (error) return <div>{error}</div>;
  if (!details)
    return (
      <>
        <NavBar />
        <p className="grow flex-center text-lol-text-muted">No details found</p>
      </>
    );

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar />

      {/* hero section */}
      <div className="relative w-full aspect-video xl:h-[90vh]">
        <img
          src={details.skins[0].imageUrl}
          alt={`${details.id} default skin`}
          className="absolute inset-0 size-full object-cover object-top"
        />

        {/* gradient to background */}
        <div className="absolute inset-0 bg-linear-to-t from-lol-bg via-transparent"></div>

        {/* gradient to read the text (DESKTOP) */}
        <div className="hidden xl:block absolute inset-0 bg-linear-to-tr from-lol-bg from-20% via-transparent to-lol-bg"></div>

        {/* on the image (DESKTOP) */}
        <div className="hidden xl:flex flex-col justify-center p-5 absolute z-10 bottom-0 left-4">
          <div className="flex gap-3 justify-start">
            {details.tags.map((tag) => (
              <span
                key={tag}
                className={`${tag.toLowerCase()} font-bold border rounded-md text-lg px-3 py-1 text-center`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-lol-text font-bold text-7xl mt-6">
              {details.name}
            </h1>
            <h2 className="text-lol-text-muted font-semibold text-3xl italic">
              {details.title}
            </h2>
          </div>
        </div>

        {/* on the image (MOBILE) */}
        <div className="xl:hidden absolute bottom-0 left-3 flex flex-col gap-1.5">
          {details.tags.map((tag) => (
            <span
              key={tag}
              className={`${tag.toLowerCase()} role-banner text-xs text-center`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* mobile */}
      <div className="xl:hidden flex flex-col justify-center items-center">
        <h1 className="font-bold text-3xl text-lol-text">{details.name}</h1>
        <h2 className="font-semibold text-xl text-lol-text-muted italic">
          {details.title}
        </h2>
      </div>

      {/* lore */}
      <LoreDetails loreContent={details.lore} />

      {/* abilities */}
      <AbilitiesDetails champName={details.name} abilities={details.spells} />

      {/* skins */}
      <SkinsCarousel skins={details.skins} />

      <Footer />
    </div>
  );
}
