export interface ExtremeGameResponse {
  round_id: number;
  ability_description: string;
  current_score: number;
  expires_at: string;
  server_now: string;
}

export type AbilityKey = "passive" | "q" | "w" | "e" | "r";

export interface ExtremeGameUserAnswer {
  round_id: number;
  champion_name: string;
  ability_id: AbilityKey | null;
}

export interface ExtremeGameCheckRound {
  correct: boolean;
  correct_champion_name: string;
  correct_ability_id: string;
  correct_champion_spell_icon: string;
  correct_champion_id: string;
  correct_champion_image: string;
  current_score: number;
  timeout: boolean;
  next_round: ExtremeGameResponse | null;
}

export interface ChampionSearch {
  id: string;
  champ_name: string;
  champ_icon: string;
}
