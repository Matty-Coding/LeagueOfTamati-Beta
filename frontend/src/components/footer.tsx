import type { JSX } from "react";
import { FaDiscord, FaEnvelope, FaGithub } from "react-icons/fa";

export function Footer(): JSX.Element {
  return (
    <footer className="p-5 md:p-10 bg-lol-bg mt-auto text-xs md:text-sm">
      {/* title */}
      <h2 className="font-cinzel text-lol-gold font-bold text-xl md:text-2xl pb-3">
        League of Tamati
      </h2>

      {/* wrapper */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between w-full gap-3 md:gap-10">
        {/* left section copyrights */}
        <div className="flex flex-col">
          <p>
            &copy; {new Date().getFullYear()} League of Tamati - Personal
            Project, not for commercial use.
          </p>
          <p>
            <a
              href="https://www.leagueoflegends.com/en-us/"
              target="_blank"
              rel="noreferrer noopener"
              className="text-lol-gold hover:text-lol-gold-light transition-colors duration-200 hover:underline"
            >
              League of Legends
            </a>{" "}
            and all related content are the property of{" "}
            <a
              href="https://www.riotgames.com/en"
              target="_blank"
              rel="noreferrer noopener"
              className="text-lol-gold hover:text-lol-gold-light transition-colors duration-200 hover:underline"
            >
              Riot Games, Inc.
            </a>
          </p>
          <p>League of Tamati is not affiliated with Riot Games, Inc.</p>
        </div>

        {/* right section contacts */}
        <div className="flex md:flex-col lg:flex-row items-center justify-end gap-3 md:gap-1 lg:gap-10">
          <a
            href="https://discord.com/users/tamat14"
            target="_blank"
            rel="noreferrer noopener"
            className="text-lol-text-muted hover:text-lol-gold transition-colors duration-200 flex-center items-center gap-1"
            aria-label="Discord"
          >
            <FaDiscord size={15} /> Discord
          </a>

          <a
            href="https://github.com/Matty-Coding"
            target="_blank"
            rel="noreferrer noopener"
            className="text-lol-text-muted hover:text-lol-gold transition-colors duration-200 flex-center items-center gap-1"
            aria-label="GitHub"
          >
            <FaGithub size={15} /> GitHub
          </a>

          <a
            href="mailto:mattyloffry.01@gmail.com"
            target="_blank"
            rel="noreferrer noopener"
            className="text-lol-text-muted hover:text-lol-gold transition-colors duration-200 flex-center items-center gap-1"
            aria-label="Email"
          >
            <FaEnvelope size={15} /> Email
          </a>
        </div>
      </div>
    </footer>
  );
}
