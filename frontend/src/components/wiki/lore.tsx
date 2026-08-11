import { useState, type JSX } from "react";
import { PiScrollBold } from "react-icons/pi";
import type { Champion } from "../../types/champions";
import { DropdownButton } from "../dropdown-button";

interface LoreProps {
  loreContent: Champion["lore"];
}

export function LoreDetails({ loreContent }: LoreProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="details-wrapper">
      <h2 className="details-title">
        <>
          <PiScrollBold />
          Lore
        </>
      </h2>

      {/* mobile clamp extendable */}
      <div>
        <p
          className={`${isExpanded ? "line-clamp-none" : "line-clamp-2"} xl:line-clamp-none text-base md:text-lg xl:text-xl mb-3`}
        >
          {loreContent}
        </p>
        <DropdownButton isExpanded={isExpanded} handleClick={handleClick} />
      </div>
    </div>
  );
}
