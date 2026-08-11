import { type JSX } from "react";
import type { Champion } from "../../types/champions";
import { RiCrosshair2Line } from "react-icons/ri";
import { AbilityItem } from "./ability-item";

interface AbilitiesProps {
  champName: string;
  abilities: Champion["spells"];
}

export function AbilitiesDetails({
  champName,
  abilities,
}: AbilitiesProps): JSX.Element {
  return (
    <div className="details-wrapper">
      <h2 className="details-title">
        <>
          <RiCrosshair2Line /> Abilities
        </>
      </h2>

      <ul className="w-full flex flex-col gap-2 py-3">
        {abilities.map((ability) => (
          <AbilityItem
            key={ability.id}
            champName={champName}
            ability={ability}
          />
        ))}
      </ul>
    </div>
  );
}
