/**
 * Changement de résidence d'une réservation (relogement du client), réservé au rôle Admin.
 * Contrat : api-immoplus-v2, branche feat/admin-reservation-relocation
 * (`reservation-relocation-admin.controller.ts`, `residence-relocation.service.ts`).
 */
import type { StayPriceDetails } from "@/pages/reservations/components/reservation-price-details";

export enum RelocationMotif {
  ProprietaireAnnule = "PROPRIETAIRE_ANNULE",
  ResidenceIndisponible = "RESIDENCE_INDISPONIBLE",
  LogementNonConforme = "LOGEMENT_NON_CONFORME",
  DemandeClient = "DEMANDE_CLIENT",
  Autre = "AUTRE",
}

export const RELOCATION_MOTIF_LABELS: Record<RelocationMotif, string> = {
  [RelocationMotif.ProprietaireAnnule]: "Le propriétaire a annulé",
  [RelocationMotif.ResidenceIndisponible]: "Résidence indisponible",
  [RelocationMotif.LogementNonConforme]: "Logement non conforme",
  [RelocationMotif.DemandeClient]: "Demande du client",
  [RelocationMotif.Autre]: "Autre",
};

export const getRelocationMotifLabel = (motif: string | null | undefined): string =>
  (motif && RELOCATION_MOTIF_LABELS[motif as RelocationMotif]) || motif || "—";

/** Statuts relogeables (RELOCATABLE_STATUSES côté API). */
export const RELOCATABLE_STATUSES = [
  "valide",
  "en_attente_paiement_client",
  "confirmee_paiement_arrivee",
] as const;

export const RELOCATION_NOTE_MAX_LENGTH = 1000;

// ─── Suggestions : GET /reservations/:id/suggestions ─────────────────────────

export type SuggestionMode = "similaires" | "proches";

export interface ResidenceSuggestionItem {
  id: string;
  nom: string;
  miniature: string | null;
  typeResidence: string;
  prixReservation: number;
  nombreMaxOccupants: number;
  score: number;
  ville: string;
  commune: string;
  distanceKm: number | null;
  disponibiliteConfirmeeVia: "calendrier" | "confirmation_proprietaire";
  reservationDirecte: boolean;
}

export interface SuggestionsParams {
  mode: SuggestionMode;
  rayonKm?: number;
  limit?: number;
}

/** Résidence choisie à l'étape 1, quelle que soit sa source (suggestion ou recherche libre). */
export interface RelocationCandidate {
  id: string;
  nom: string;
  miniature: string | null;
  ville?: string | null;
  commune?: string | null;
  prixReservation?: number | null;
  nombreMaxOccupants?: number | null;
  distanceKm?: number | null;
  disponibiliteConfirmeeVia?: ResidenceSuggestionItem["disponibiliteConfirmeeVia"] | null;
  source: "suggestion" | "recherche";
  /** Recherche libre : statut de validation de la résidence (le back refuse une résidence non validée). */
  statusValidation?: string | null;
}

// ─── Aperçu / exécution ──────────────────────────────────────────────────────

export interface RelocationRequestBody {
  residenceId: string;
  motif: RelocationMotif;
  note: string;
  forcerRegles: boolean;
}

export interface RelocationResidenceSide {
  id: string;
  nom: string | null;
  proprietaireId: string | null;
  /** Hébergement, hors frais. */
  montantTotal: number;
  montantCommission: number;
  /** Frais de paiement compris. */
  montantPaye: number;
  dateDebut: string | null;
  dateFin: string | null;
}

export interface RelocationNewResidenceSide extends RelocationResidenceSide {
  priceDetails: StayPriceDetails | null;
}

export interface RelocationViolation {
  code: string;
  message: string;
}

export interface RelocationPreview {
  reservationId: string;
  statusReservation: string;
  paid: boolean;
  ancienneResidence: RelocationResidenceSide;
  nouvelleResidence: RelocationNewResidenceSide;
  montantEncaisse: number;
  remboursementClient: number;
  absorbeImmoplus: number;
  netNouveauProprietaire: number;
  violationsRegles: RelocationViolation[];
  reglesForcees: boolean;
  avertissements: string[];
}

export interface RelocationResult extends RelocationPreview {
  changeId: string;
  /** Même Idempotency-Key déjà traitée : succès, résultat enregistré rejoué. */
  replayed: boolean;
}

// ─── Historique : GET /admin/reservations/:id/changements-residence ──────────

export interface ResidenceChangeHistoryItem {
  id: string;
  reservationId?: string;
  fromResidenceId: string;
  toResidenceId: string;
  fromOwnerId: string | null;
  toOwnerId: string | null;
  statusReservation: string;
  paid: boolean;
  oldDateDebut: string | null;
  newDateDebut: string | null;
  oldDateFin: string | null;
  newDateFin: string | null;
  oldMontantTotal: number;
  newMontantTotal: number;
  oldCommission: number;
  newCommission: number;
  oldMontantPaye: number;
  newMontantPaye: number;
  montantEncaisse: number;
  remboursementClient: number;
  absorbeImmoplus: number;
  netNouveauProprietaire: number;
  motif: RelocationMotif | string;
  note: string;
  reglesForcees: boolean;
  /** Codes des règles forcées (ex. MIN_NIGHTS). */
  violationsRegles: string[];
  adminId: string | null;
  createdAt: string;
}

// ─── Erreurs ─────────────────────────────────────────────────────────────────

export type RelocationErrorCode =
  | "STAY_DATES_NOT_BOOKABLE"
  | "RESIDENCE_UNAVAILABLE"
  | "RESIDENCE_NOT_BOOKABLE"
  | "RELOCATION_SAME_RESIDENCE"
  | "RELOCATION_TOO_LATE"
  | "RELOCATION_NOT_ALLOWED_STATUS"
  | "PROTECTION_ALREADY_RESOLVED"
  | "PAYMENT_IN_PROGRESS"
  | "RELOCATION_FUNDS_UNAVAILABLE"
  | "RELOCATION_PARTIAL_PAYMENT_UNSUPPORTED"
  | "RELOCATION_AVAILABILITY_V2_UNSUPPORTED"
  | "IDEMPOTENCY_KEY_REUSED"
  | "IDEMPOTENCY_KEY_REQUIRED";
