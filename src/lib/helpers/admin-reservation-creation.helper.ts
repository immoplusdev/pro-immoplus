/**
 * Logique pure de « Créer une réservation pour un client » (sans React, testée en env node) :
 * sélection des nuits, validation du formulaire, corps de requête, lecture des erreurs métier,
 * cycle de vie de la clé d'idempotence.
 */
import { getErrorStatus, getErrorBody } from "./api-response.helper";
import { fingerprint, getApiErrorCode } from "./idempotency.helper";
import { formatDateTime, getErrorData, readErrorMessage, toIsoDay } from "./reservation-relocation.helper";
import {
  ADMIN_RESERVATION_MANUAL_PRICE_MAX,
  ADMIN_RESERVATION_MANUAL_PRICE_MIN,
  ADMIN_RESERVATION_MAX_NIGHTS,
  ADMIN_RESERVATION_NOTE_ADMIN_MAX_LENGTH,
  ADMIN_RESERVATION_NOTES_MAX_LENGTH,
  ADMIN_RESERVATION_PAYMENT_DELAY_MAX,
  ADMIN_RESERVATION_PAYMENT_DELAY_MIN,
  CLIENT_INELIGIBILITY_LABELS,
  type AdminReservationClient,
  type AdminReservationPreview,
  type AdminReservationRequestBody,
  type AdminReservationResidence,
  type AdminReservationResult,
  type ClientIneligibility,
} from "@/types/admin-reservation-creation.types";

export { formatFcfa, formatDateTime } from "./reservation-relocation.helper";

// ─── Accès et sélection ──────────────────────────────────────────────────────

export const CREATE_RESERVATION_PATH = "/reservations/create";

/** Lien vers l'écran de création, avec le client pré-sélectionné depuis sa fiche. */
export const createReservationUrl = (clientId?: string | null): string =>
  clientId ? `${CREATE_RESERVATION_PATH}?clientId=${encodeURIComponent(clientId)}` : CREATE_RESERVATION_PATH;

export const clientDisplayName = (client: AdminReservationClient | null | undefined): string =>
  [client?.lastName, client?.firstName].filter(Boolean).join(" ").trim() || client?.email || client?.phoneNumber || "Client";

/** La résidence n'est réservable que validée et disponible (RESIDENCE_NOT_BOOKABLE sinon). */
export const isResidenceBookable = (residence: AdminReservationResidence): boolean =>
  (!residence.statusValidation || residence.statusValidation === "valide") && residence.residenceDisponible !== false;

// ─── Nuits ───────────────────────────────────────────────────────────────────
// Une nuit = un jour « YYYY-MM-DD » (la nuit du 24 au 25 décembre est « 2026-12-24 »).
// Tous les calculs se font en UTC pour ne jamais décaler un jour selon le fuseau du navigateur.

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const parseDay = (day: string): number => Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10));

export function addDays(day: string, count: number): string {
  return new Date(parseDay(day) + count * 86_400_000).toISOString().slice(0, 10);
}

/** Jour local du navigateur (« aujourd'hui » pour l'admin), au format YYYY-MM-DD. */
export function localIsoDay(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Nuits d'un séjour : de l'arrivée (incluse) au départ (exclu). Vide si les dates sont incohérentes. */
export function nightsBetween(arrival: string, departure: string): string[] {
  if (!ISO_DAY.test(arrival) || !ISO_DAY.test(departure)) return [];
  const count = Math.round((parseDay(departure) - parseDay(arrival)) / 86_400_000);
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, i) => addDays(arrival, i));
}

/** Dates occupées renvoyées par l'API (`2026-12-24T00:00:00.000Z` ou `2026-12-24`) → ensemble de jours. */
export function toOccupiedSet(dates: readonly { date: string }[] | null | undefined): Set<string> {
  const set = new Set<string>();
  for (const item of dates ?? []) {
    if (item && typeof item.date === "string") set.add(toIsoDay(item.date));
  }
  return set;
}

export interface NightCalendarContext {
  occupied: ReadonlySet<string>;
  /** Premier jour sélectionnable (aujourd'hui). */
  today: string;
}

/** Arrivée impossible : jour passé ou nuit déjà prise. */
export const isArrivalDisabled = (day: string, { occupied, today }: NightCalendarContext): boolean =>
  day < today || occupied.has(day);

/**
 * Départ impossible : pas après l'arrivée, plus de 366 nuits, ou une nuit du séjour déjà prise.
 * Le jour du départ lui-même peut être occupé (le client part le matin).
 */
export function isDepartureDisabled(day: string, arrival: string, context: NightCalendarContext): boolean {
  if (day <= arrival) return true;
  const nights = nightsBetween(arrival, day);
  if (nights.length === 0 || nights.length > ADMIN_RESERVATION_MAX_NIGHTS) return true;
  return nights.some((night) => isArrivalDisabled(night, context));
}

/** Nuits déjà prises ou passées dans une sélection (les dates peuvent changer entre deux chargements). */
export const findBlockedNights = (nights: readonly string[], context: NightCalendarContext): string[] =>
  nights.filter((night) => isArrivalDisabled(night, context));

export const toNightPayload = (nights: readonly string[]): { date: string }[] =>
  [...new Set(nights)].sort().map((night) => ({ date: `${night}T00:00:00.000Z` }));

// ─── Formulaire ──────────────────────────────────────────────────────────────

export interface AdminReservationFormValues {
  clientId?: string | null;
  residenceId?: string | null;
  nights?: string[];
  notes?: string | null;
  prixManuel?: number | null;
  forcerRegles?: boolean;
  ignorerLimiteReservations?: boolean;
  delaiPaiementMinutes?: number | null;
  noteAdmin?: string | null;
}

export type AdminReservationFormField =
  | "clientId"
  | "residenceId"
  | "nights"
  | "notes"
  | "prixManuel"
  | "delaiPaiementMinutes"
  | "noteAdmin";

export interface AdminReservationFormError {
  field: AdminReservationFormField;
  message: string;
}

const hasValue = (value: number | null | undefined): value is number =>
  typeof value === "number" && !Number.isNaN(value);

/** Un contournement est utilisé : forcer les règles, ignorer la limite ou fixer un prix manuel. */
export const usesOverride = (values: AdminReservationFormValues): boolean =>
  !!values.forcerRegles || !!values.ignorerLimiteReservations || hasValue(values.prixManuel);

export const NOTE_ADMIN_REQUIRED_MESSAGE =
  "La note interne est obligatoire pour forcer les règles, ignorer la limite de réservations ou fixer un prix manuel.";

/** Erreur du champ « note interne » (même règle que l'API : obligatoire dès qu'un contournement est utilisé). */
export function noteAdminError(values: AdminReservationFormValues): string | null {
  const note = values.noteAdmin?.trim() ?? "";
  if (note.length > ADMIN_RESERVATION_NOTE_ADMIN_MAX_LENGTH)
    return `${ADMIN_RESERVATION_NOTE_ADMIN_MAX_LENGTH} caractères maximum.`;
  if (usesOverride(values) && !note) return NOTE_ADMIN_REQUIRED_MESSAGE;
  return null;
}

const isInteger = (value: number) => Number.isInteger(value);

/** Validation côté front, alignée sur le DTO de l'API. Liste vide = formulaire envoyable. */
export function validateCreationForm(values: AdminReservationFormValues): AdminReservationFormError[] {
  const errors: AdminReservationFormError[] = [];
  if (!values.clientId) errors.push({ field: "clientId", message: "Choisissez un client." });
  if (!values.residenceId) errors.push({ field: "residenceId", message: "Choisissez une résidence." });
  const nights = values.nights ?? [];
  if (nights.length === 0) errors.push({ field: "nights", message: "Choisissez au moins une nuit." });
  else if (new Set(nights).size > ADMIN_RESERVATION_MAX_NIGHTS)
    errors.push({ field: "nights", message: `${ADMIN_RESERVATION_MAX_NIGHTS} nuits maximum.` });
  if ((values.notes?.trim().length ?? 0) > ADMIN_RESERVATION_NOTES_MAX_LENGTH)
    errors.push({ field: "notes", message: `${ADMIN_RESERVATION_NOTES_MAX_LENGTH} caractères maximum.` });
  if (hasValue(values.prixManuel)) {
    const price = values.prixManuel;
    if (!isInteger(price) || price < ADMIN_RESERVATION_MANUAL_PRICE_MIN || price > ADMIN_RESERVATION_MANUAL_PRICE_MAX)
      errors.push({
        field: "prixManuel",
        message: `Montant entier entre ${ADMIN_RESERVATION_MANUAL_PRICE_MIN} et ${ADMIN_RESERVATION_MANUAL_PRICE_MAX.toLocaleString("fr-FR")} FCFA.`,
      });
  }
  if (hasValue(values.delaiPaiementMinutes)) {
    const delay = values.delaiPaiementMinutes;
    if (!isInteger(delay) || delay < ADMIN_RESERVATION_PAYMENT_DELAY_MIN || delay > ADMIN_RESERVATION_PAYMENT_DELAY_MAX)
      errors.push({
        field: "delaiPaiementMinutes",
        message: `Délai entier entre ${ADMIN_RESERVATION_PAYMENT_DELAY_MIN} et ${ADMIN_RESERVATION_PAYMENT_DELAY_MAX} minutes.`,
      });
  }
  const noteError = noteAdminError(values);
  if (noteError) errors.push({ field: "noteAdmin", message: noteError });
  return errors;
}

/**
 * Corps envoyé à l'aperçu et à la création (exactement les champs du DTO, rien d'autre).
 * `null` tant que le client, la résidence ou les nuits manquent.
 */
export function buildCreationPayload(values: AdminReservationFormValues): AdminReservationRequestBody | null {
  const nights = values.nights ?? [];
  if (!values.clientId || !values.residenceId || nights.length === 0) return null;
  const notes = values.notes?.trim();
  const noteAdmin = values.noteAdmin?.trim();
  return {
    clientId: values.clientId,
    residenceId: values.residenceId,
    datesReservation: toNightPayload(nights),
    ...(notes ? { notes } : {}),
    ignorerLimiteReservations: !!values.ignorerLimiteReservations,
    forcerRegles: !!values.forcerRegles,
    prixManuel: hasValue(values.prixManuel) ? values.prixManuel : null,
    delaiPaiementMinutes: hasValue(values.delaiPaiementMinutes) ? values.delaiPaiementMinutes : null,
    ...(noteAdmin ? { noteAdmin } : {}),
  };
}

/**
 * Paramètres qui relancent l'aperçu : client, résidence, nuits, prix manuel, contournements, délai.
 * Les textes (`notes`, `noteAdmin`) sont lus au moment de l'appel, seule la présence de la note compte.
 */
export function previewTriggerKey(values: AdminReservationFormValues): string {
  return fingerprint({
    clientId: values.clientId ?? null,
    residenceId: values.residenceId ?? null,
    nights: [...new Set(values.nights ?? [])].sort(),
    prixManuel: hasValue(values.prixManuel) ? values.prixManuel : null,
    forcerRegles: !!values.forcerRegles,
    ignorerLimiteReservations: !!values.ignorerLimiteReservations,
    delaiPaiementMinutes: hasValue(values.delaiPaiementMinutes) ? values.delaiPaiementMinutes : null,
    hasNoteAdmin: !!values.noteAdmin?.trim(),
  });
}

// ─── Aperçu ──────────────────────────────────────────────────────────────────

/** Statut de départ en clair, avec le délai. */
export function describeInitialStatus(
  preview: Pick<AdminReservationPreview, "statutInitial" | "delaisProprietaireReponse" | "delaisPaiementClient">,
): { label: string; color: string } {
  switch (preview.statutInitial) {
    case "en_attente_reponse_proprietaire":
      return {
        label: preview.delaisProprietaireReponse
          ? `Le propriétaire doit valider (avant ${formatDateTime(preview.delaisProprietaireReponse)})`
          : "Le propriétaire doit valider",
        color: "orange",
      };
    case "en_attente_paiement_client":
      return {
        label: preview.delaisPaiementClient
          ? `Le client doit payer dans l'app avant ${formatDateTime(preview.delaisPaiementClient)}`
          : "Le client doit payer dans l'app",
        color: "blue",
      };
    case "confirmee_paiement_arrivee":
      return { label: "Confirmée, paiement à l'arrivée", color: "green" };
    default:
      return { label: preview.statutInitial || "—", color: "default" };
  }
}

// ─── Erreurs métier ──────────────────────────────────────────────────────────

/** Réaction de l'interface à un refus du back (aperçu ou création). */
export type CreationErrorAction =
  | "pick-client" // client non éligible : en choisir un autre
  | "pick-residence" // résidence non réservable ou introuvable
  | "suggest-force" // règles de séjour : proposer « Forcer les règles »
  | "change-dates" // nuits passées ou déjà prises : changer les dates
  | "focus-note-admin" // note interne manquante
  | "suggest-ignore-limit" // limite de réservations actives atteinte
  | "retry-same-key" // création en cours, erreur réseau, 5xx : renvoyer avec la même clé
  | "key-bug" // IDEMPOTENCY_KEY_REQUIRED : bug du front
  | "key-reused" // IDEMPOTENCY_KEY_REUSED : clé déjà utilisée pour un autre contenu
  | "hide" // 403 : rôle non Admin
  | "stay";

export interface CreationErrorFeedback {
  code?: string;
  status?: number;
  message: string;
  hint?: string;
  details: string[];
  action: CreationErrorAction;
}

const PAST_DATE = "PAST_DATE";

const asViolations = (value: unknown): { code?: string; message?: string }[] =>
  Array.isArray(value) ? value.filter((v) => typeof v === "object" && v !== null) : [];

const NETWORK_MESSAGE = "Erreur réseau ou délai dépassé. Vous pouvez réessayer.";

export function getCreationErrorFeedback(error: unknown): CreationErrorFeedback {
  const status = getErrorStatus(error);
  const code = getApiErrorCode(error);
  const data = getErrorData(error);
  const base = { code, status, message: readErrorMessage(error, code), details: [] as string[] };

  switch (code) {
    case "CLIENT_NOT_ELIGIBLE": {
      const raison = data.raison as ClientIneligibility | undefined;
      return {
        ...base,
        message: (raison && CLIENT_INELIGIBILITY_LABELS[raison]) || base.message,
        hint: "Choisissez un autre client.",
        action: "pick-client",
      };
    }
    case "RESIDENCE_NOT_BOOKABLE":
      return { ...base, hint: "Résidence non validée ou indisponible : choisissez-en une autre.", action: "pick-residence" };
    case "STAY_DATES_NOT_BOOKABLE": {
      const violations = asViolations(data.violations);
      const past = violations.some((v) => v.code === PAST_DATE);
      return {
        ...base,
        details: violations.map((v) => v.message).filter((m): m is string => typeof m === "string" && m.length > 0),
        hint: past
          ? "Des nuits sont déjà passées : changez les dates."
          : "Cochez « Forcer les règles de séjour » pour passer outre (une note interne sera demandée).",
        action: past ? "change-dates" : "suggest-force",
      };
    }
    case "ADMIN_RESERVATION_NOTE_REQUIRED":
      return { ...base, action: "focus-note-admin" };
    case "IDEMPOTENCY_KEY_REQUIRED":
      return {
        ...base,
        message: "Erreur technique : la clé d'envoi (Idempotency-Key) est absente de la requête.",
        hint: "Rien n'a été créé. Signalez-le à l'équipe technique.",
        action: "key-bug",
      };
    case "IDEMPOTENCY_KEY_REUSED":
      return {
        ...base,
        message: "Erreur technique : cette clé d'envoi a déjà servi pour une autre demande.",
        hint: "Une demande précédente a peut-être abouti : vérifiez les réservations du client avant de recommencer avec une nouvelle clé.",
        action: "key-reused",
      };
    case "ADMIN_RESERVATION_IN_PROGRESS":
      return {
        ...base,
        message: "Création en cours.",
        hint: "Réessayez dans quelques secondes : la même demande sera renvoyée, sans risque de doublon.",
        action: "retry-same-key",
      };
  }

  if (status === 403) return { ...base, message: "Action réservée aux administrateurs.", action: "hide" };
  if (status === 404) return { ...base, hint: "Résidence introuvable : choisissez-en une autre.", action: "pick-residence" };

  if (status === 400) {
    // Nuit déjà prise (DateReservationDejaPriseException, sans code, `data.date`).
    if (typeof data.date === "string" || data.date instanceof Date) {
      return {
        ...base,
        hint: "Une des nuits vient d'être prise : choisissez d'autres dates.",
        details: [toIsoDay(String(data.date))],
        action: "change-dates",
      };
    }
    // Erreur de validation du DTO (message en tableau) : bug du formulaire.
    if (Array.isArray(getErrorBody(error)?.message)) return { ...base, action: "stay" };
    // Seul autre 400 sans code : limite de réservations actives atteinte.
    return {
      ...base,
      hint: "Cochez « Ignorer la limite de 3 réservations actives » pour passer outre (une note interne sera demandée).",
      action: "suggest-ignore-limit",
    };
  }

  // Pas de réponse HTTP (réseau, timeout) ou 5xx : la création a pu aboutir, renvoyer avec la même clé.
  if (status === undefined || status >= 500) {
    return { ...base, message: base.message || NETWORK_MESSAGE, action: "retry-same-key" };
  }
  return { ...base, action: "stay" };
}

/**
 * Le serveur a traité la demande et l'a refusée pour son contenu : si l'admin modifie le formulaire,
 * une nouvelle clé est générée. Sinon (réseau, 5xx, création en cours, clé absente),
 * le résultat est incertain ou rien n'a été traité : la même clé est gardée.
 */
const isDefinitiveRejection = (feedback: CreationErrorFeedback): boolean =>
  feedback.action !== "retry-same-key" && feedback.action !== "key-bug" && feedback.action !== "key-reused";

// ─── Idempotence ─────────────────────────────────────────────────────────────

export type CreationSubmitOutcome =
  | { status: "success"; data: AdminReservationResult }
  | { status: "ignored" } // envoi déjà en cours (double clic)
  | { status: "error"; error: unknown; feedback: CreationErrorFeedback };

export interface AdminReservationSubmission {
  submit(payload: AdminReservationRequestBody): Promise<CreationSubmitOutcome>;
  /** Clé qui sera envoyée au prochain `submit` de ce contenu. */
  currentKey(): string;
  isSubmitting(): boolean;
  /** Nouvelle clé à la demande explicite de l'admin (après `IDEMPOTENCY_KEY_REUSED`). */
  renewKey(): string;
  /** Nouvelle création : nouvelle clé, historique oublié. */
  reset(): void;
}

export interface AdminReservationSubmissionOptions {
  send: (payload: AdminReservationRequestBody, idempotencyKey: string) => Promise<AdminReservationResult>;
  generateKey?: () => string;
  onKeyRequired?: (error: unknown) => void;
}

/**
 * Une clé par formulaire, générée à l'ouverture et gardée pour tous les envois : double clic,
 * renvoi après une erreur réseau ou après `ADMIN_RESERVATION_IN_PROGRESS`.
 * Elle n'est régénérée que si le contenu change après un refus de validation, ou pour une nouvelle création.
 */
export function createAdminReservationSubmission({
  send,
  generateKey = () => crypto.randomUUID(),
  onKeyRequired = (error) =>
    console.error("[admin-reservation] Idempotency-Key absente de la requête (bug client)", error),
}: AdminReservationSubmissionOptions): AdminReservationSubmission {
  let key = generateKey();
  /** Empreinte du dernier contenu refusé par le serveur (la clé a été libérée côté API). */
  let rejectedFingerprint: string | null = null;
  let inFlight = false;

  return {
    async submit(payload) {
      if (inFlight) return { status: "ignored" };
      inFlight = true;
      const fp = fingerprint(payload);
      if (rejectedFingerprint !== null && rejectedFingerprint !== fp) key = generateKey();
      rejectedFingerprint = null;
      try {
        const data = await send(payload, key);
        // Succès, y compris `replayed: true` : la clé reste celle de cette création.
        return { status: "success", data };
      } catch (error) {
        const feedback = getCreationErrorFeedback(error);
        if (isDefinitiveRejection(feedback)) rejectedFingerprint = fp;
        if (feedback.action === "key-bug") onKeyRequired(error);
        return { status: "error", error, feedback };
      } finally {
        inFlight = false;
      }
    },
    currentKey: () => key,
    isSubmitting: () => inFlight,
    renewKey() {
      key = generateKey();
      rejectedFingerprint = null;
      return key;
    },
    reset() {
      key = generateKey();
      rejectedFingerprint = null;
    },
  };
}
