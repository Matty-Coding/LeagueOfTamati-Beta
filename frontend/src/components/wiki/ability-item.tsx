import { useState, type JSX } from "react";
import type { Spell } from "../../types/champions";
import { DropdownButton } from "../dropdown-button";
import capitalize from "../../utils/capitalize";

interface AbilityItemProps {
  champName: string;
  ability: Spell;
}

export function AbilityItemMobile({
  champName,
  ability,
}: AbilityItemProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <>
      <div className="flex items-center">
        <div className="w-18 h-18 shrink-0 rounded-md border border-lol-text-muted p-1">
          <img
            src={ability.imageUrl}
            alt={`${champName} ${ability.id}`}
            loading="eager"
            className="size-full rounded-md"
          />
        </div>
        <h3 className="grow text-center font-bold text-base md:text-lg px-1 text-lol-gold-light">
          {ability.name}
        </h3>
      </div>

      <div className="my-2 bg-lol-text-muted h-px w-95%"></div>

      <div className="flex-center flex-col text-base md:text-lg">
        <h4 className="text-lol-gold-light">{capitalize(ability.id)}</h4>
        <p
          className={`${isExpanded ? "line-clamp-none" : "line-clamp-1"} mb-3`}
        >
          {ability.description}
        </p>
        <DropdownButton
          isExpanded={isExpanded}
          handleClick={() => setIsExpanded(!isExpanded)}
        />
      </div>
    </>
  );
}

export function AbilityItemDesktop({
  champName,
  ability,
}: AbilityItemProps): JSX.Element {
  return (
    <>
      <div className="flex gap-3 justify-center items-center">
        {/* image container */}
        <div className="w-30 h-30 rounded-md shrink-0 border border-lol-text-muted">
          <img
            src={ability.imageUrl}
            alt={`${champName} ${ability.id}`}
            loading="eager"
            className="size-full object-contain rounded-md"
          />
        </div>

        <div className="grow p-5 flex-center flex-col gap-3 text-xl">
          <h3 className="text-lol-gold-light">
            <span>({capitalize(ability.id)})</span> {ability.name}
          </h3>
          <p>{ability.description}</p>
        </div>
      </div>
    </>
  );
}

export function AbilityItem({
  champName,
  ability,
}: AbilityItemProps): JSX.Element {
  return (
    <li
      key={ability.id}
      className="border-2 border-lol-text-muted rounded-md p-2 bg-lol-blue-light/50"
    >
      {/* mobile rendering */}
      <div className="xl:hidden">
        <AbilityItemMobile champName={champName} ability={ability} />
      </div>

      {/* desktop rendering */}
      <div className="hidden xl:block">
        <AbilityItemDesktop champName={champName} ability={ability} />
      </div>
    </li>
  );
}
