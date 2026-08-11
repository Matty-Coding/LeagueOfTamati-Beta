export interface Spell {
  id: "passive" | "q" | "w" | "e" | "r";
  name: string;
  description: string;
  imageUrl: string;
}

export interface Skin {
  name: string;
  imageUrl: string;
}

export type Tag =
  | "Tank"
  | "Fighter"
  | "Mage"
  | "Marksman"
  | "Support"
  | "Assassin";

export interface Champion {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  lore: string;
  tags: Tag[];
  spells: Spell[];
  skins: Skin[];
}

export type ChampionCardProps = Pick<
  Champion,
  "id" | "name" | "title" | "tags" | "skins"
>;

export type ChampionsFilters = ("All" | Tag)[];

export interface EditProfileChampionItem {
  imageUrl: string;
  skins: Skin[];
}
