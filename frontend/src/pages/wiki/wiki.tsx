import { useEffect, useState, type JSX } from "react";
import ChampionCard from "../../components/wiki/champion-card";
import { useChampions } from "../../hooks/champions";
import type { Tag } from "../../types/champions";
import { RiCloseCircleLine } from "react-icons/ri";
import NavBar from "../../components/navbar";
import { HiChevronDown, HiSearch } from "react-icons/hi";
import { Footer } from "../../components/footer";
import SpinnerPage from "../../utils/spinner-page";

const filters: ("All" | Tag)[] = [
  "All",
  "Assassin",
  "Tank",
  "Mage",
  "Support",
  "Marksman",
  "Fighter",
];

export default function ChampionsWiki(): JSX.Element {
  // page title
  useEffect(() => {
    document.title = "Wiki | League of Tamati";
  }, []);

  // hooks
  const { data, loading, error } = useChampions();
  const [activeFilter, setActiveFilter] = useState<"All" | Tag>("All");
  const [textFilter, setTextFilter] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // functions
  const filteredChampions =
    data?.filter((champion) => {
      const selectedTag: boolean =
        activeFilter === "All" || champion.tags.includes(activeFilter);
      const cleanText: string = textFilter.trim().toLowerCase();
      const matchesText: boolean = champion.name
        .toLowerCase()
        .includes(cleanText);

      return matchesText && selectedTag;
    }) ?? [];

  // rendering
  if (loading) return <SpinnerPage />;
  if (error) return <div>{error}</div>;

  const renderFilters: JSX.Element[] = filters.map((filter) => (
    <button
      type="button"
      key={filter}
      className={`text-sm px-5 py-2 rounded-lg hover:opacity-100 cursor-pointer border transition-opacity duration-300 ease-in-out ${filter.toLowerCase()} ${
        activeFilter === filter ? "opacity-100 border-2" : "opacity-40"
      }`}
      onClick={() => {
        setActiveFilter(filter);
        setDropdownOpen(false);
      }}
    >
      {filter}
    </button>
  ));

  const toggleDropdown = (): void => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <>
      <header className="flex flex-col gap-2 shadow-sm shadow-lol-gold pb-2 sticky top-0 bg-lol-bg z-10">
        <NavBar />

        {/* search + filters wrapper */}
        <div className="flex gap-2  justify-between px-2 lg:px-10 md:px-5 w-full">
          {/* search */}
          <div className="relative grow">
            <HiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-lol-text-muted"
              size={18}
            />
            <input
              type="search"
              placeholder="Search by name..."
              className="w-full bg-lol-card/80 text-lol-text text-sm rounded-lg pl-10 pr-10 py-2 border border-lol-blue-light/60 focus:border-lol-gold focus:outline-none focus:ring-1 focus:ring-lol-gold transition-all ring ring-lol-text-muted"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
            />
            {textFilter && (
              <RiCloseCircleLine
                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 opacity-80 cursor-pointer hover:opacity-100"
                size={20}
                onClick={() => setTextFilter("")}
              />
            )}
          </div>

          {/* mobile (dropdown) */}
          <div
            className={`min-w-30 relative flex-center gap-2 lg:hidden rounded-md border-2 ${activeFilter.toLowerCase()}`}
          >
            <button
              type="button"
              className="flex items-center justify-between px-5 relative"
              onClick={toggleDropdown}
            >
              <span className="font-bold pr-3">{activeFilter}</span>
              <HiChevronDown
                size={20}
                className={`absolute right-1 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out flex z-100 flex-col absolute top-full left-0 right-0 bg-lol-bg ${
                dropdownOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              {renderFilters}
            </div>
          </div>

          {/* desktop */}
          <div className="hidden lg:flex items-center justify-center gap-2">
            {renderFilters}
          </div>
        </div>
      </header>

      {/* no results */}
      {filteredChampions.length === 0 ? (
        <p className="grow flex-center text-lol-text-muted">
          No champions found
        </p>
      ) : (
        // results
        <div className="py-2 px-2 md:px-5 lg:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {filteredChampions.map((champion) => (
            <ChampionCard
              key={champion.id}
              id={champion.id}
              name={champion.name}
              title={champion.title}
              tags={champion.tags}
              skins={champion.skins}
            />
          ))}
        </div>
      )}
      <Footer />
    </>
  );
}
