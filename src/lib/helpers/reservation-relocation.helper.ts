/**
 * Logique pure du « Changer de résidence » (sans React, testée en env node) :
 * éligibilité du bouton, candidates, lecture des erreurs métier, clé d'idempotence de l'étape 3.
 */
import { getErrorBody, getErrorStatus } from "./api-response.helper";
import { createIdempotencyKeyStore, getApiErrorCode } from "./idempotency.helper";
import { extractErrorMessage } from "./http-exception.helper";
import {
  RELOCATABLE_STATUSES,
  type RelocationCandidate,
  type RelocationRequestBody,
  type RelocationResult,
  type ResidenceSuggestionItem,
} from "@/types/reservation-relocation.types";

export { formatFcfa } from "@/types/clients-statistiques.types";

// ─── Éligibilité ─────────────────────────────────────────────────────────────

export interface RelocationEligibilityInput {
  statusReservation?: string | null;
  dateDebut?: string | Date | null;
}

export const isRelocatableStatus = (status: string | null | undefined): boolean =>
  !!status && (RELOCATABLE_STATUSES as readonly string[]).includes(status);

/**
 * Bouton « Changer de résidence » : Admin, statut relogeable, séjour pas encore commencé.
 * Le back reste l'autorité (check-in fait, fonds versés…) : ses refus sont affichés tels quels.
 */
export function canShowRelocationButton(
  reservation: RelocationEligibilityInput | null | undefined,
  { isAdmin, now = new Date() }: { isAdmin: boolean; now?: Date },
): boolean {
  if (!isAdmin || !reservation || !isRelocatableStatus(reservation.statusReservation)) return false;
  if (!reservation.dateDebut) return false;
  const start = new Date(reservation.dateDebut).getTime();
  return Number.isFinite(start) && start > now.getTime();
}

// ─── Candidates ──────────────────────────────────────────────────────────────

export const suggestionToCandidate = (item: ResidenceSuggestionItem): RelocationCandidate => ({
  id: item.id,
  nom: item.nom,
  miniature: item.miniature || null,
  ville: item.ville,
  commune: item.commune,
  prixReservation: item.prixReservation,
  nombreMaxOccupants: item.nombreMaxOccupants,
  distanceKm: item.distanceKm,
  disponibiliteConfirmeeVia: item.disponibiliteConfirmeeVia,
  source: "suggestion",
});

/** La résidence actuelle n'est jamais proposée (le back l'exclut déjà des suggestions, pas de la recherche). */
export const excludeCurrentResidence = <T extends { id: string }>(
  items: readonly T[],
  currentResidenceId: string | null | undefined,
): T[] => (currentResidenceId ? items.filter((item) => item.id !== currentResidenceId) : [...items]);

// ─── Dates et montants ───────────────────────────────────────────────────────

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Date et heure en heure locale du navigateur : « 21/11/2026 14:00 ». */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
}

/** Vrai si les deux instants diffèrent (l'heure d'arrivée vient de la nouvelle résidence). */
export function isDifferentInstant(a: string | Date | null | undefined, b: string | Date | null | undefined): boolean {
  if (!a || !b) return !!a !== !!b;
  return new Date(a).getTime() !== new Date(b).getTime();
}

/** « 2026-11-21T00:00:00.000Z » ou « 2026-11-21 » → « 2026-11-21 » (pas de passage par le fuseau). */
export const toIsoDay = (value: string): string => (/^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : value);

// ─── Erreurs métier ──────────────────────────────────────────────────────────

/** Réaction de l'interface à un refus du back. */
export type RelocationErrorAction =
  | "stay" // rester à l'étape courante, afficher le message
  | "suggest-force" // étape 2 : lister les règles violées, proposer « Ignorer les règles »
  | "back-to-step-1" // choisir une autre résidence
  | "close" // fermer la modale
  | "close-reload" // fermer la modale et recharger la réservation
  | "renew-key" // nouvelle clé d'idempotence, redemander confirmation
  | "hide"; // 403 : rôle non Admin, masquer la fonctionnalité

export interface RelocationErrorFeedback {
  code?: string;
  status?: number;
  /** Message du back (déjà traduit) en priorité, sinon un message générique. */
  message: string;
  /** Complément propre à l'interface (ex. « Contactez la finance »). */
  hint?: string;
  /** Lignes à lister : règles violées ou nuits en conflit. */
  details: string[];
  action: RelocationErrorAction;
}

const FALLBACK_MESSAGE = "Une erreur inattendue est survenue.";

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** `data` de l'erreur : HttpError refine (`error.data`) ou corps axios (`response.data.data`). */
function getErrorData(error: unknown): Record<string, unknown> {
  const body = getErrorBody(error);
  const fromBody = body && typeof body.data === "object" && body.data !== null ? body.data : undefined;
  const direct = (error as { data?: unknown } | null)?.data;
  const data = fromBody ?? (typeof direct === "object" && direct !== null ? direct : undefined);
  return (data ?? {}) as Record<string, unknown>;
}

/**
 * `message` du back en priorité. Une HttpError refine porte déjà ce message dans `error.message` ;
 * sans réponse HTTP ni code métier, c'est une erreur réseau ou un timeout (statut 500 par défaut).
 */
function readErrorMessage(error: unknown, code: string | undefined): string {
  const e = error as { response?: { data?: unknown }; message?: unknown; statusCode?: unknown } | null;
  if (e?.response?.data) return extractErrorMessage(error, FALLBACK_MESSAGE);
  const isHttp = !!code || (typeof e?.statusCode === "number" && e.statusCode !== 500);
  if (isHttp && typeof e?.message === "string" && e.message) return e.message;
  return isHttp ? FALLBACK_MESSAGE : "Erreur réseau ou délai dépassé. Vous pouvez réessayer.";
}

export function getRelocationErrorFeedback(error: unknown): RelocationErrorFeedback {
  const status = getErrorStatus(error);
  const code = getApiErrorCode(error);
  const data = getErrorData(error);
  const base = { code, status, message: readErrorMessage(error, code), details: [] as string[] };

  switch (code) {
    case "STAY_DATES_NOT_BOOKABLE":
      return {
        ...base,
        details: asArray(data.violations)
          .map((v) => (v as { message?: unknown })?.message)
          .filter((m): m is string => typeof m === "string" && m.length > 0),
        hint: "Cochez « Ignorer les règles de la résidence » pour passer outre.",
        action: "suggest-force",
      };
    case "RESIDENCE_UNAVAILABLE":
      return {
        ...base,
        hint: "Résidence prise ces nuits-là :",
        details: asArray(data.datesEnConflit)
          .filter((d): d is string => typeof d === "string")
          .map(toIsoDay),
        action: "back-to-step-1",
      };
    case "RESIDENCE_NOT_BOOKABLE":
      return { ...base, hint: "Résidence non validée ou indisponible : choisissez-en une autre.", action: "back-to-step-1" };
    case "RELOCATION_SAME_RESIDENCE":
      return { ...base, hint: "Choisissez une autre résidence que la résidence actuelle.", action: "back-to-step-1" };
    case "RELOCATION_TOO_LATE":
      return { ...base, hint: "Séjour commencé, check-in fait ou fonds déjà versés.", action: "close" };
    case "RELOCATION_NOT_ALLOWED_STATUS":
      return { ...base, hint: "Le statut de la réservation a changé : elle va être rechargée.", action: "close-reload" };
    case "PROTECTION_ALREADY_RESOLVED":
      return { ...base, hint: "Le client a déjà été remboursé : créez plutôt une nouvelle réservation.", action: "stay" };
    case "PAYMENT_IN_PROGRESS":
      return { ...base, hint: "Paiement en cours, réessayez dans quelques minutes.", action: "stay" };
    case "RELOCATION_FUNDS_UNAVAILABLE":
      return { ...base, hint: "Contactez la finance.", action: "stay" };
    case "RELOCATION_PARTIAL_PAYMENT_UNSUPPORTED":
    case "RELOCATION_AVAILABILITY_V2_UNSUPPORTED":
      return { ...base, action: "stay" };
    case "IDEMPOTENCY_KEY_REUSED":
      return { ...base, hint: "Une nouvelle demande a été préparée : confirmez à nouveau.", action: "renew-key" };
    case "IDEMPOTENCY_KEY_REQUIRED":
      return { ...base, action: "stay" };
  }
  if (status === 403) {
    return { ...base, message: "Action réservée aux administrateurs.", action: "hide" };
  }
  return { ...base, action: "stay" };
}

// ─── Étape 3 : clé d'idempotence ─────────────────────────────────────────────

export type RelocationConfirmOutcome =
  | { status: "success"; data: RelocationResult }
  | { status: "ignored" } // envoi déjà en cours (double clic) ou étape 3 non ouverte
  | { status: "error"; error: unknown; feedback: RelocationErrorFeedback };

export interface RelocationConfirmation {
  /** Ouverture de l'étape 3 : fige le contenu et prépare la clé (la même si le contenu n'a pas changé). */
  open(payload: RelocationRequestBody): string;
  /** Envoi (ou renvoi après échec) avec la clé préparée à l'ouverture. */
  confirm(): Promise<RelocationConfirmOutcome>;
  currentKey(): string | null;
  isSubmitting(): boolean;
  /** Intention abandonnée (modale fermée) : la prochaine ouverture aura une nouvelle clé. */
  reset(): void;
}

export interface RelocationConfirmationOptions {
  send: (payload: RelocationRequestBody, idempotencyKey: string) => Promise<RelocationResult>;
  generateKey?: () => string;
  onKeyRequired?: (error: unknown) => void;
}

/**
 * Une clé = une intention. Générée à l'ouverture de l'étape 3, réutilisée pour tout renvoi
 * (double clic, erreur réseau, timeout, 5xx). Nouvelle clé si le contenu change (autre résidence…),
 * après un succès, après `IDEMPOTENCY_KEY_REUSED` ou à l'abandon.
 */
export function createRelocationConfirmation({
  send,
  generateKey,
  onKeyRequired = (error) =>
    console.error("[relocation] Idempotency-Key absente de la requête (bug client)", error),
}: RelocationConfirmationOptions): RelocationConfirmation {
  const store = createIdempotencyKeyStore(generateKey);
  let payload: RelocationRequestBody | null = null;
  let key: string | null = null;
  let inFlight = false;

  return {
    open(next) {
      payload = { ...next };
      key = store.keyFor(payload);
      return key;
    },
    async confirm() {
      if (inFlight || !payload || !key) return { status: "ignored" };
      inFlight = true;
      const sent = payload;
      try {
        const data = await send(sent, key);
        // Succès, y compris `replayed: true` (même clé déjà traitée).
        store.reset();
        key = null;
        payload = null;
        return { status: "success", data };
      } catch (error) {
        const feedback = getRelocationErrorFeedback(error);
        if (feedback.action === "renew-key") {
          store.reset();
          key = store.keyFor(sent);
        }
        if (feedback.code === "IDEMPOTENCY_KEY_REQUIRED") onKeyRequired(error);
        return { status: "error", error, feedback };
      } finally {
        inFlight = false;
      }
    },
    currentKey: () => key,
    isSubmitting: () => inFlight,
    reset() {
      store.reset();
      key = null;
      payload = null;
    },
  };
}
