export type PollStatus = "ACTIVE" | "CLOSED";

// Jamais "inline" pour un sondage — contrairement aux pubs (voir diffusion/types.ts).
export type PollSectionPosition = "before" | "after";

export interface PollOption {
  id: string;
  label: string;
  voteCount: number;
  percentage: number;
}

export interface Poll {
  id: string;
  question: string;
  description?: string | null;
  options: PollOption[];
  expiresAt: string;
  targetSectionKey: string;
  sectionPosition: PollSectionPosition;
  status: PollStatus;
  totalVotes: number;
}

export const POLL_STATUSES: PollStatus[] = ["ACTIVE", "CLOSED"];

export const POLL_SECTION_POSITIONS: PollSectionPosition[] = ["before", "after"];

export const SECTION_POSITION_LABELS: Record<PollSectionPosition, string> = {
  before: "Avant la section",
  after: "Après la section",
};

// Clés statiques de HomeSectionKey — repli si GET /me/home est indisponible.
export const HOME_SECTION_KEYS_STATIC: string[] = [
  "near_you",
  "available_now",
  "top_rated",
  "new_this_week",
  "biens_a_louer_par_ville",
  "biens_a_louer_par_commune",
  "biens_a_acheter_par_ville",
  "biens_a_acheter_par_commune",
  "terrain_a_louer",
  "terrain_a_acheter",
];
