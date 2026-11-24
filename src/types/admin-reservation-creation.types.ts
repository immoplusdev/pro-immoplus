/**
 * Création d'une réservation par un admin au nom d'un client existant (demande par téléphone / WhatsApp).
 * Contrat : api-immoplus-v2, branche feat/admin-create-reservation
 * (`reservation-admin-creation.controller.ts`, `admin-reservation-creation.service.ts`).
 */

export const ADMIN_RESERVATION_NOTES_MAX_LENGTH = 2000;
export const ADMIN_RESERVATION_NOTE_ADMIN_MAX_LENGTH = 1000;
export const ADMIN_RESERVATION_MAX_NIGHTS = 366;
export const ADMIN_RESERVATION_MANUAL_PRICE_MIN = 1;
export const ADMIN_RESERVATION_MANUAL_PRICE_MAX = 100_000_000;
export const ADMIN_RESERVATION_PAYMENT_DELAY_MIN = 5;
export const ADMIN_RESERVATION_PAYMENT_DELAY_MAX = 2880;
/** MAX_ACTIVE_RESERVATIONS_PER_CLIENT côté API. */
export const MAX_ACTIVE_RESERVATIONS_PER_CLIENT = 3;

/**
 * Corps de l'aperçu et de la création. L'API rejette toute propriété inconnue
 * (`forbidNonWhitelisted`) : ne jamais y ajouter de champ d'interface.
 */
export interface AdminReservationRequestBody {
  clientId: string;
  residenceId: string;
  /** Une entrée par nuit, à minuit UTC (`2026-12-24T00:00:00.000Z`). */
  datesReservation: { date: string }[];
  notes?: string;
  ignorerLimiteReservations: boolean;
  forcerRegles: boolean;
  prixManuel: number | null;
  delaiPaiementMinutes: number | null;
  noteAdmin?: string;
}

export type AdminReservationInitialStatus =
  | "en_attente_reponse_proprietaire"
  | "en_attente_paiement_client"
  | "confirmee_paiement_arrivee";

export interface AdminReservationViolation {
  code: string;
  message: string;
}

/** POST /admin/reservations/creation/apercu — `data`. */
export interface AdminReservationPreview {
  clientId: string;
  residence: { id: string; nom: string | null; proprietaireId: string };
  dateDebut: string;
  dateFin: string;
  nuits: number;
  /** Tarif de la résidence pour ces nuits. */
  prixCalcule: number;
  prixManuel: number | null;
  /** Hébergement retenu (prix manuel ou calculé). */
  montantTotalReservation: number;
  montantCommission: number;
  fraisPaiement: number;
  /** Ce que le client paiera dans l'app. */
  montantPaye: number;
  statutInitial: AdminReservationInitialStatus | string;
  validationProprietaire: boolean;
  delaisProprietaireReponse: string | null;
  delaisPaiementClient: string | null;
  violationsRegles: AdminReservationViolation[];
  reglesForcees: boolean;
  reservationsActives: number;
  limiteIgnoree: boolean;
}

/** POST /admin/reservations/creation — `data`. */
export interface AdminReservationResult {
  creationId: string;
  /** Même Idempotency-Key déjà traitée : la réservation existante est renvoyée. */
  replayed: boolean;
  /** Même format que GET /reservations/:id. */
  reservation: { id: string; [key: string]: unknown };
}

/** GET /admin/reservations/:id/creation-admin — `data` (404 si la réservation ne vient pas du backoffice). */
export interface AdminReservationCreationTrace {
  id: string;
  reservationId: string;
  adminId: string | null;
  clientId: string;
  residenceId: string;
  prixCalcule: number | null;
  prixManuel: number | null;
  reglesForcees: boolean;
  violationsRegles: (AdminReservationViolation | string)[];
  limiteIgnoree: boolean;
  reservationsActives: number;
  noteAdmin: string | null;
  createdAt: string;
}

/** GET /reservations/data/residence/occupied-dates/:residence — `data`. */
export interface ResidenceOccupiedDates {
  dates: { date: string }[];
  bookingWindow?: { firstBookableNight: string | null; lastBookableNight: string | null } | null;
}

export type ClientIneligibility = "NOT_FOUND" | "DELETED" | "BLOCKED" | "NOT_CUSTOMER";

export const CLIENT_INELIGIBILITY_LABELS: Record<ClientIneligibility, string> = {
  NOT_FOUND: "Ce client est introuvable.",
  DELETED: "Le compte de ce client a été supprimé.",
  BLOCKED: "Le compte de ce client est bloqué.",
  NOT_CUSTOMER: "Ce compte n'est pas un compte client.",
};

/** Client choisi à l'étape 1 (liste des utilisateurs, rôle customer). */
export interface AdminReservationClient {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  status?: string | null;
}

/** Résidence choisie à l'étape 2 (liste des résidences). */
export interface AdminReservationResidence {
  id: string;
  nom: string;
  miniature: string | null;
  ville?: string | null;
  commune?: string | null;
  prixReservation?: number | null;
  statusValidation?: string | null;
  residenceDisponible?: boolean | null;
}
