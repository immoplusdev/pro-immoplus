/**
 * Motifs d'échec des réservations (BI / reporting).
 *
 * API : GET /reservations/motifs-echec — rôle Admin + permission Reservations/Read.
 * Réponse enveloppée (`body.data`), pagination dans data.total/page/limit, tri respondedAt DESC.
 * Les endpoints /reservations/:id/motifs-echec sont réservés aux apps client/pro (403 admin) : ne pas les appeler.
 * L'API ne renvoie que des codes : les libellés sont définis ici.
 */
import type { TagStyle } from "@/types/messaging";

export const FAILURE_ACTORS = ["CLIENT", "PRO"] as const;
export type FailureActor = (typeof FAILURE_ACTORS)[number];

export const FAILURE_STATUSES = [
  "client_annule_reservation",
  "client_sans_reponse",
  "proprietaire_annule_reservation",
  "proprietaire_sans_reponse",
] as const;
export type FailureStatus = (typeof FAILURE_STATUSES)[number];

export interface FailureReasonItem {
  /** Ajouté récemment à l'API : peut manquer sur un environnement pas encore à jour. */
  reservationId?: string;
  /** userId de l'auteur de la réponse. Ajouté récemment : peut manquer. */
  respondedBy?: string;
  actor: FailureActor;
  status: FailureStatus;
  reasonCode: string;
  comment: string | null;
  respondedAt: string;
}

export interface FailureReasonsResponse {
  total: number;
  page: number;
  limit: number;
  items: FailureReasonItem[];
}

export interface FailureReasonsFilters {
  actor?: FailureActor;
  status?: FailureStatus;
  reasonCode?: string;
  /** YYYY-MM-DD, incluse. */
  dateDebut?: string;
  /** YYYY-MM-DD, incluse. */
  dateFin?: string;
  page?: number;
  limit?: number;
}

export const CLIENT_REASONS: Readonly<Record<string, string>> = {
  PRIX_TROP_ELEVE: "Le prix était trop élevé",
  TROUVE_AUTRE_LOGEMENT: "A trouvé un autre logement",
  CHANGEMENT_DATES: "Besoin de changer les dates",
  PROBLEME_PAIEMENT: "Problème lors du paiement",
  ATTENTE_TROP_LONGUE: "Le pro a mis trop de temps à répondre",
  CHANGEMENT_PROJET: "Changement ou annulation du projet de séjour",
  AUTRE: "Autre raison",
};

export const PRO_REASONS: Readonly<Record<string, string>> = {
  LOGEMENT_INDISPONIBLE: "Logement déjà réservé ou indisponible",
  DATES_INCOMPATIBLES: "Dates incompatibles avec la disponibilité réelle",
  PROFIL_CLIENT_NON_CONFORME: "Profil du client jugé non conforme",
  TRAVAUX_MAINTENANCE: "Travaux ou maintenance en cours",
  DESACCORD_PRIX: "Désaccord sur le prix proposé",
  PROBLEME_TECHNIQUE: "Problème technique côté plateforme",
  AUTRE: "Autre raison",
};

export const REASONS_BY_ACTOR: Readonly<Record<FailureActor, Readonly<Record<string, string>>>> = {
  CLIENT: CLIENT_REASONS,
  PRO: PRO_REASONS,
};

export const OTHER_REASON_CODE = "AUTRE";

export const STATUS_LABELS: Readonly<Record<FailureStatus, string>> = {
  client_annule_reservation: "Annulée par le client",
  client_sans_reponse: "Client sans réponse (non payée)",
  proprietaire_annule_reservation: "Annulée par le pro",
  proprietaire_sans_reponse: "Pro sans réponse",
};

/** Acteur interrogé pour chaque statut d'échec. */
export const STATUS_ACTOR: Readonly<Record<FailureStatus, FailureActor>> = {
  client_annule_reservation: "CLIENT",
  client_sans_reponse: "CLIENT",
  proprietaire_annule_reservation: "PRO",
  proprietaire_sans_reponse: "PRO",
};

export const ACTOR_TAGS: Readonly<Record<FailureActor, TagStyle>> = {
  CLIENT: { label: "Client", color: "geekblue" },
  PRO: { label: "Pro", color: "purple" },
};

export const STATUS_TAG_COLORS: Readonly<Record<FailureStatus, string>> = {
  client_annule_reservation: "volcano",
  client_sans_reponse: "orange",
  proprietaire_annule_reservation: "magenta",
  proprietaire_sans_reponse: "gold",
};

export function isFailureActor(value: string | undefined): value is FailureActor {
  return !!value && (FAILURE_ACTORS as readonly string[]).includes(value);
}

export function isFailureStatus(value: string | undefined): value is FailureStatus {
  return !!value && (FAILURE_STATUSES as readonly string[]).includes(value);
}

/** Libellé d'un motif, toujours résolu via (acteur, code) : AUTRE existe des deux côtés. Repli : code brut. */
export function getReasonLabel(actor: string, reasonCode: string): string {
  const labels = isFailureActor(actor) ? REASONS_BY_ACTOR[actor] : undefined;
  return (labels && Object.prototype.hasOwnProperty.call(labels, reasonCode) ? labels[reasonCode] : undefined) ?? reasonCode;
}

/** Libellé d'un statut, repli sur la valeur brute. */
export function getStatusLabel(status: string): string {
  return isFailureStatus(status) ? STATUS_LABELS[status] : status;
}

/** Le code existe-t-il pour cet acteur ? */
export function isReasonOfActor(actor: FailureActor, reasonCode: string): boolean {
  return Object.prototype.hasOwnProperty.call(REASONS_BY_ACTOR[actor], reasonCode);
}

/** Codes présents chez les deux acteurs (ex. AUTRE) : leur choix doit fixer l'acteur. */
export function isAmbiguousReasonCode(reasonCode: string): boolean {
  return FAILURE_ACTORS.every((actor) => isReasonOfActor(actor, reasonCode));
}
