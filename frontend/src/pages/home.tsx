import { useEffect, type JSX } from "react";
import NavBar from "../components/navbar";
import videoHero from "/video/zed-motion.mp4";
import { Link } from "react-router";
import { FeatureCard } from "../components/wiki/feature-card";
import { HiBookOpen, HiPuzzle } from "react-icons/hi";
import { HiTrophy } from "react-icons/hi2";
import { Footer } from "../components/footer";
import { useAuth } from "../hooks/auth";
import SpinnerPage from "../utils/spinner-page";

export default function HomePage(): JSX.Element {
  // page title
  useEffect(() => {
    document.title = "Home | League of Tamati";
  }, []);

  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar />

      {/* hero section */}
      <div className="relative w-full aspect-video min-h-[80vh]">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 size-full object-cover object-top"
        >
          <source src={videoHero} type="video/mp4" />
        </video>

        {/* gradient on top of video */}
        <div className="absolute inset-0 bg-linear-to-t from-lol-bg via-transparent to-lol-bg"></div>

        {/* hero section text */}
        <div className="absolute -bottom-10 md:bottom-0 xl:bottom-20 2xl:bottom-60 w-full px-4 flex-center flex-col gap-2">
          <h1 className="font-cinzel font-extrabold text-lol-gold text-5xl md:text-6xl lg:text-7xl text-center text-shadow-md text-shadow-black">
            LEAGUE OF TAMATI
          </h1>

          <h2 className="text-xl md:text-2xl lg:text-3xl font-cinzel text-center font-bold px-14">
            The Wiki. The Game. The Challenge.
          </h2>

          {/* hero section links */}
          <div className="flex-center flex-col md:flex-row gap-5 mt-5 text-base md:text-xl lg:text-2xl">
            <Link
              to={isAuthenticated ? `/profile/${user?.username}` : "/login"}
              className="btn rounded-md py-3 px-8"
            >
              Start now
            </Link>
            <Link
              to="/wiki"
              className="border border-lol-gold px-5 py-3 rounded-md text-lol-gold hover:bg-lol-gold hover:text-lol-bg transition-colors duration-200 ease-in"
            >
              Explore Wiki
            </Link>
          </div>
        </div>
      </div>

      {/* features */}
      <div className="grid grid-cols-1 md:grid-cols-3 py-50 px-10 gap-5 bg-linear-to-b from-lol-bg from-0% via-lol-blue via-50% to-lol-bg to-100%">
        <FeatureCard
          icon={<HiBookOpen size={"full"} />}
          title="The Wiki"
          content="Explore all League of Legends champions, their abilities, lore and skins"
        />
        <FeatureCard
          icon={<HiPuzzle size={"full"} />}
          title="The Quiz"
          content="Test your knowledge — guess the champion from their ability description"
        />
        <FeatureCard
          icon={<HiTrophy size={"full"} />}
          title="The Challenge"
          content="Climb the global rankings and compete with friends"
        />
      </div>
      <Footer />
    </div>
  );
}
