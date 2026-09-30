import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import {
  getReminderTargetLabel,
  isReminderChannel,
  isReminderKind,
  isReminderTrigger,
  isStatusReservation,
  REMINDER_CHANNEL_LABELS,
  REMINDER_CHANNELS,
  REMINDER_SETTINGS_DEFAULTS,
  REMINDER_STEP_MAX,
  REMINDER_STEP_MIN,
  type AdminRemindersFilters,
  type RawReminderSettings,
  type ReminderChannel,
  type ReminderSentEvent,
  type ReminderSettings,
  type ReservationReminderItem,
} from "@/types/reservation-reminders.types";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export const API_DATE_FORMAT = "YYYY-MM-DD";

/** Date d'envoi en heure d'Abidjan (= UTC), quel que soit le fuseau du navigateur. Repli : valeur brute. */
export function formatReminderDate(iso: string): string {
  const d = dayjs.utc(iso);
  return d.isValid() ? d.format("DD/MM/YYYY HH:mm") : iso;
}

/* ================================================================== */
/* Filtres de la liste                                                 */
/* ================================================================== */

export type ReminderFilterValues = Omit<AdminRemindersFilters, "page" | "perPage">;

const isApiDate = (v: string | undefined): v is string => !!v && dayjs(v, API_DATE_FORMAT, true).isValid();

/** Filtres lus dans l'URL : valeurs inconnues ignorées, dates strictes YYYY-MM-DD, période remise dans l'ordre. */
export function sanitizeReminderFilters(
  raw: Partial<Record<keyof ReminderFilterValues, string>>
): ReminderFilterValues {
  let dateFrom = isApiDate(raw.dateFrom) ? raw.dateFrom : undefined;
  let dateTo = isApiDate(raw.dateTo) ? raw.dateTo : undefined;
  if (dateFrom && dateTo && dateFrom > dateTo) [dateFrom, dateTo] = [dateTo, dateFrom];
  return {
    status: isStatusReservation(raw.status) ? raw.status : undefined,
    kind: isReminderKind(raw.kind) ? raw.kind : undefined,
    trigger: isReminderTrigger(raw.trigger) ? raw.trigger : undefined,
    dateFrom,
    dateTo,
  };
}

type QueryParams = Record<string, string | number>;

/** Query params de GET /reservations/relances : valeurs vides omises. */
export function buildReminderParams(filters: AdminRemindersFilters): QueryParams {
  const params: QueryParams = {};
  if (filters.status) params.status = filters.status;
  if (filters.kind) params.kind = filters.kind;
  if (filters.trigger) params.trigger = filters.trigger;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.perPage !== undefined) params.perPage = filters.perPage;
  return params;
}

/** Part des relances ayant abouti à un paiement, en % arrondi au dixième ; `null` sans relance. */
export function conversionRate(total: number, paid: number): number | null {
  if (!(total > 0)) return null;
  return Math.round((paid / total) * 1000) / 10;
}

/* ================================================================== */
/* Canaux et timeline                                                  */
/* ================================================================== */

/** Canaux en échec, dans l'ordre d'affichage (clés inconnues ignorées). */
export function failedChannels(channels: Record<string, string> | null | undefined): ReminderChannel[] {
  if (!channels) return [];
  return REMINDER_CHANNELS.filter((c) => channels[c] === "failed");
}

/** `channels` vide : la relance est enregistrée mais l'envoi n'est pas terminé. */
export function isSendingInProgress(channels: Record<string, string> | null | undefined): boolean {
  return !channels || !Object.keys(channels).some(isReminderChannel);
}

/** Point de la Timeline : rouge si un canal a échoué, sinon bleu (AUTO) ou violet (MANUAL). */
export function reminderDotColor(item: Pick<ReservationReminderItem, "trigger" | "channels">): string {
  if (failedChannels(item.channels).length > 0) return "red";
  return item.trigger === "MANUAL" ? "purple" : "blue";
}

/** Tri chronologique (plus ancienne en premier), sans muter l'entrée. */
export function sortChronologically<T extends { sentAt: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => dayjs(a.sentAt).valueOf() - dayjs(b.sentAt).valueOf());
}

/* ================================================================== */
/* Temps réel                                                          */
/* ================================================================== */

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Valide le payload WS ; `null` s'il est inexploitable (pas de reservationId). */
export function parseReminderEvent(raw: unknown): ReminderSentEvent | null {
  if (!isRecord(raw) || typeof raw.reservationId !== "string" || !raw.reservationId) return null;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const channels: Record<string, string> = {};
  if (isRecord(raw.channels)) {
    Object.entries(raw.channels).forEach(([k, v]) => {
      if (typeof v === "string") channels[k] = v;
    });
  }
  return {
    reminderId: str(raw.reminderId),
    reservationId: raw.reservationId,
    kind: str(raw.kind),
    trigger: str(raw.trigger),
    target: str(raw.target),
    channels,
    at: str(raw.at),
  };
}

/** Titre / description de la notification d'échec, ou `null` si aucun canal n'a échoué. */
export function reminderFailureNotice(event: ReminderSentEvent): { title: string; description: string } | null {
  const failed = failedChannels(event.channels);
  if (failed.length === 0) return null;
  return {
    title: `Relance ${event.kind} : échec ${failed.map((c) => REMINDER_CHANNEL_LABELS[c]).join(", ")}`,
    description: `Destinataire : ${getReminderTargetLabel(event.target)}`,
  };
}

/* ================================================================== */
/* Paramètres                                                          */
/* ================================================================== */

/** Booléen MySQL : `0`/`1` (nombre ou chaîne) ou vrai booléen ; `null`/illisible → défaut. */
export function toBooleanSetting(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string" && value.trim() !== "") {
    if (value === "true") return true;
    if (value === "false") return false;
    const n = Number(value);
    return Number.isFinite(n) ? n !== 0 : fallback;
  }
  return fallback;
}

function toIntSetting(value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
}

/** Même lecture que l'API (getSettings) : seuils valides, triés, 2 au plus ; défaut si vide. */
export function normalizeSteps(value: unknown): number[] {
  const steps = Array.isArray(value)
    ? value
        .map(Number)
        .filter((s) => Number.isInteger(s) && s >= REMINDER_STEP_MIN && s <= REMINDER_STEP_MAX)
        .sort((a, b) => a - b)
        .slice(0, 2)
    : [];
  return steps.length ? steps : [...REMINDER_SETTINGS_DEFAULTS.relanceStepsPercent];
}

/** Valeurs du formulaire à partir de GET /configs (null → défaut, 0/1 → booléen). */
export function normalizeReminderSettings(raw: RawReminderSettings | null | undefined): ReminderSettings {
  const d = REMINDER_SETTINGS_DEFAULTS;
  return {
    relancesEnabled: toBooleanSetting(raw?.relancesEnabled, d.relancesEnabled),
    relanceStepsPercent: normalizeSteps(raw?.relanceStepsPercent),
    relanceManualMax: toIntSetting(raw?.relanceManualMax, d.relanceManualMax),
    relanceManualMinIntervalMinutes: toIntSetting(raw?.relanceManualMinIntervalMinutes, d.relanceManualMinIntervalMinutes),
    relanceFailClientDelayMinutes: toIntSetting(raw?.relanceFailClientDelayMinutes, d.relanceFailClientDelayMinutes),
  };
}

/** Valeurs du formulaire (seuils saisis séparément, le 2e facultatif). */
export interface ReminderSettingsFormValues {
  relancesEnabled: boolean;
  step1: number | null;
  step2: number | null;
  relanceManualMax: number | null;
  relanceManualMinIntervalMinutes: number | null;
  relanceFailClientDelayMinutes: number | null;
}

export function toReminderFormValues(settings: ReminderSettings): ReminderSettingsFormValues {
  return {
    relancesEnabled: settings.relancesEnabled,
    step1: settings.relanceStepsPercent[0] ?? null,
    step2: settings.relanceStepsPercent[1] ?? null,
    relanceManualMax: settings.relanceManualMax,
    relanceManualMinIntervalMinutes: settings.relanceManualMinIntervalMinutes,
    relanceFailClientDelayMinutes: settings.relanceFailClientDelayMinutes,
  };
}

/** Corps du PATCH /configs : uniquement les champs `relance*`. Les valeurs ont été validées par le Form. */
export function toReminderSettingsPayload(values: ReminderSettingsFormValues): ReminderSettings {
  const d = REMINDER_SETTINGS_DEFAULTS;
  const steps = [values.step1, values.step2].filter((s): s is number => typeof s === "number");
  return {
    relancesEnabled: values.relancesEnabled,
    relanceStepsPercent: steps.length ? steps : [...d.relanceStepsPercent],
    relanceManualMax: values.relanceManualMax ?? d.relanceManualMax,
    relanceManualMinIntervalMinutes: values.relanceManualMinIntervalMinutes ?? d.relanceManualMinIntervalMinutes,
    relanceFailClientDelayMinutes: values.relanceFailClientDelayMinutes ?? d.relanceFailClientDelayMinutes,
  };
}

/** Durée approximative : « ~4 min », « ~7 min 30 », « ~9 h 36 », « ~30 s ». */
export function formatApproxDuration(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  if (totalSeconds < 60) return `~${totalSeconds} s`;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (totalMinutes >= 60) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m ? `~${h} h ${String(m).padStart(2, "0")}` : `~${h} h`;
  }
  return seconds ? `~${totalMinutes} min ${String(seconds).padStart(2, "0")}` : `~${totalMinutes} min`;
}

/**
 * Moment d'envoi des relances d'un délai : « Paiement (10 min) : relances à ~4 min et ~7 min 30 ».
 * `null` si le délai est inconnu ou si aucun seuil n'est saisi.
 */
export function describeStepTimings(
  label: string,
  delayMinutes: unknown,
  steps: ReadonlyArray<number | null | undefined>
): string | null {
  const delay = Number(delayMinutes);
  const valid = steps.filter((s): s is number => typeof s === "number" && s > 0 && s < 100);
  if (!(delay > 0) || valid.length === 0) return null;
  const moments = [...valid].sort((a, b) => a - b).map((s) => formatApproxDuration((delay * s) / 100));
  const list = moments.length > 1 ? `${moments.slice(0, -1).join(", ")} et ${moments[moments.length - 1]}` : moments[0];
  return `${label} (${delay} min) : ${moments.length > 1 ? "relances" : "relance"} à ${list}`;
}
