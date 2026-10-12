/**
 * Relances des réservations (rappels au client pour payer, au propriétaire pour répondre).
 *
 * API (admin, Bearer) :
 * - GET /reservations/relances : Admin + Reservations/Read, réponse NON enveloppée `{ data, meta }`.
 * - GET /reservations/:id/relances : enveloppée `{ data: ReservationReminders }`.
 * - GET / PATCH /configs : champs `relance*`.
 * - WS `/admin-notifications`, événement `admin:relance_reservation`.
 * Les POST /reservations/action/relancer-* sont réservés aux apps mobiles : ne pas les appeler.
 * L'API ne renvoie que des codes : les libellés sont définis ici.
 */
import type { TagStyle } from "@/types/messaging";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";

export const REMINDER_KINDS = [
  "PAY_1",
  "PAY_2",
  "OWN_1",
  "OWN_2",
  "MANUAL_PAY",
  "MANUAL_OWN",
  "FAIL_OWNER_CALENDAR",
  "FAIL_OWNER_CLIENT_ALTERNATIVES",
  "FAIL_CLIENT_ALTERNATIVES",
] as const;
export type ReminderKind = (typeof REMINDER_KINDS)[number];

export const REMINDER_TRIGGERS = ["AUTO", "MANUAL"] as const;
export type ReminderTrigger = (typeof REMINDER_TRIGGERS)[number];

export const REMINDER_TARGETS = ["CLIENT", "OWNER"] as const;
export type ReminderTarget = (typeof REMINDER_TARGETS)[number];

export const REMINDER_OUTCOMES = ["paid", "accepted", "expired", "cancelled", "pending"] as const;
export type ReminderOutcome = (typeof REMINDER_OUTCOMES)[number];

/** Ordre d'affichage des icônes de canal. */
export const REMINDER_CHANNELS = ["push", "whatsapp", "email", "message"] as const;
export type ReminderChannel = (typeof REMINDER_CHANNELS)[number];

export const REMINDER_CHANNEL_STATUSES = ["sent", "failed", "skipped"] as const;
export type ReminderChannelStatus = (typeof REMINDER_CHANNEL_STATUSES)[number];

/** Rapport d'envoi par canal ; `{}` tant que l'envoi est en cours. */
export type ReminderChannelsReport = Partial<Record<ReminderChannel, ReminderChannelStatus>>;

export const REMINDER_KIND_LABELS: Readonly<Record<ReminderKind, string>> = {
  PAY_1: "Paiement — 1re relance",
  PAY_2: "Paiement — 2e relance",
  OWN_1: "Réponse pro — 1re relance",
  OWN_2: "Réponse pro — 2e relance",
  MANUAL_PAY: "Relance manuelle du pro",
  MANUAL_OWN: "Relance manuelle du client",
  FAIL_OWNER_CALENDAR: "Échec pro : mise à jour du calendrier",
  FAIL_OWNER_CLIENT_ALTERNATIVES: "Échec pro : alternatives proposées",
  FAIL_CLIENT_ALTERNATIVES: "Échec client : alternatives proposées",
};

/** Destinataire de chaque type de relance (identique à REMINDER_TARGET_BY_KIND côté API). */
export const REMINDER_KIND_TARGET: Readonly<Record<ReminderKind, ReminderTarget>> = {
  PAY_1: "CLIENT",
  PAY_2: "CLIENT",
  OWN_1: "OWNER",
  OWN_2: "OWNER",
  MANUAL_PAY: "CLIENT",
  MANUAL_OWN: "OWNER",
  FAIL_OWNER_CALENDAR: "OWNER",
  FAIL_OWNER_CLIENT_ALTERNATIVES: "CLIENT",
  FAIL_CLIENT_ALTERNATIVES: "CLIENT",
};

export const REMINDER_TRIGGER_TAGS: Readonly<Record<ReminderTrigger, TagStyle>> = {
  AUTO: { label: "Automatique", color: "blue" },
  MANUAL: { label: "Manuelle", color: "purple" },
};

export const REMINDER_TARGET_LABELS: Readonly<Record<ReminderTarget, string>> = {
  CLIENT: "Client",
  OWNER: "Propriétaire",
};

export const REMINDER_OUTCOME_TAGS: Readonly<Record<ReminderOutcome, TagStyle>> = {
  paid: { label: "Payée", color: "green" },
  accepted: { label: "Acceptée par le pro", color: "blue" },
  expired: { label: "Expirée", color: "orange" },
  cancelled: { label: "Annulée", color: "red" },
  pending: { label: "En attente", color: "default" },
};

export const REMINDER_CHANNEL_LABELS: Readonly<Record<ReminderChannel, string>> = {
  push: "Push",
  whatsapp: "WhatsApp",
  email: "Email",
  message: "Message support",
};

/** Libellé (tooltip, notification) et statut de `Badge` antd. */
export const REMINDER_CHANNEL_STATUS_BADGES: Readonly<
  Record<ReminderChannelStatus, { label: string; badge: "success" | "error" | "default" }>
> = {
  sent: { label: "envoyé", badge: "success" },
  failed: { label: "échec", badge: "error" },
  skipped: { label: "non envoyé", badge: "default" },
};

/**
 * Statuts de réservation comptés comme « payée » : ceux que l'API traduit en outcome `paid`
 * (getReminderOutcome côté API). `/reservations/relances` n'accepte qu'un statut : un appel par statut.
 */
export const PAID_RESERVATION_STATUSES: readonly StatusReservation[] = [
  StatusReservation.Valide,
  StatusReservation.EnCours,
  StatusReservation.Terminee,
];

/* ================================================================== */
/* Réponses API                                                        */
/* ================================================================== */

export interface AdminReminderItem {
  id: string;
  reservationId: string;
  residenceId: string | null;
  kind: ReminderKind;
  trigger: ReminderTrigger;
  target: ReminderTarget;
  /** ISO. */
  sentAt: string;
  outcome: ReminderOutcome;
}

export interface AdminRemindersMeta {
  page: number;
  perPage: number;
  total: number;
}

/** GET /reservations/relances : `{ data, meta }` directement (pas d'enveloppe). */
export interface AdminRemindersResponse {
  data: AdminReminderItem[];
  meta: AdminRemindersMeta;
}

export interface AdminRemindersFilters {
  status?: StatusReservation;
  kind?: ReminderKind;
  trigger?: ReminderTrigger;
  /** YYYY-MM-DD, incluse. */
  dateFrom?: string;
  /** YYYY-MM-DD, incluse. */
  dateTo?: string;
  page?: number;
  perPage?: number;
}

export interface ReservationReminderItem {
  id: string;
  kind: ReminderKind;
  trigger: ReminderTrigger;
  target: ReminderTarget;
  /** userId de l'auteur ; absent pour une relance AUTO. */
  triggeredBy?: string;
  sentAt: string;
  channels: ReminderChannelsReport;
}

export interface ReservationRemindersQuota {
  sent: number;
  max: number;
  nextAllowedAt: string | null;
}

/** GET /reservations/:id/relances (contenu de `data`). */
export interface ReservationReminders {
  reservationId: string;
  status: string;
  manual: ReservationRemindersQuota;
  items: ReservationReminderItem[];
}

/** Payload WS `admin:relance_reservation`. */
export interface ReminderSentEvent {
  reminderId: string;
  reservationId: string;
  kind: string;
  trigger: string;
  target: string;
  channels: Record<string, string>;
  at: string;
}

/* ================================================================== */
/* Paramètres (GET / PATCH /configs)                                   */
/* ================================================================== */

/** Champs `relance*` tels que renvoyés par GET /configs (colonnes nullables, booléen en 0/1 selon le driver). */
export interface RawReminderSettings {
  relancesEnabled?: boolean | number | string | null;
  relanceStepsPercent?: unknown;
  relanceManualMax?: number | string | null;
  relanceManualMinIntervalMinutes?: number | string | null;
  relanceFailClientDelayMinutes?: number | string | null;
}

/** Corps du PATCH /configs : uniquement les champs de la section Relances. */
export interface ReminderSettings {
  relancesEnabled: boolean;
  relanceStepsPercent: number[];
  relanceManualMax: number;
  relanceManualMinIntervalMinutes: number;
  relanceFailClientDelayMinutes: number;
}

/** Défauts de l'API (REMINDER_DEFAULTS), affichés quand la colonne est `null`. */
export const REMINDER_SETTINGS_DEFAULTS: Readonly<ReminderSettings> = {
  relancesEnabled: true,
  relanceStepsPercent: [40, 75],
  relanceManualMax: 2,
  relanceManualMinIntervalMinutes: 2,
  relanceFailClientDelayMinutes: 15,
};

/** Bornes de l'API (UpdateConfigDto) pour un seuil en % du délai. */
export const REMINDER_STEP_MIN = 1;
export const REMINDER_STEP_MAX = 99;

/* ================================================================== */
/* Gardes et libellés                                                  */
/* ================================================================== */

const includes = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === "string" && (list as readonly string[]).includes(value);

export const isReminderKind = (v: unknown): v is ReminderKind => includes(REMINDER_KINDS, v);
export const isReminderTrigger = (v: unknown): v is ReminderTrigger => includes(REMINDER_TRIGGERS, v);
export const isReminderTarget = (v: unknown): v is ReminderTarget => includes(REMINDER_TARGETS, v);
export const isReminderChannel = (v: unknown): v is ReminderChannel => includes(REMINDER_CHANNELS, v);
export const isReminderChannelStatus = (v: unknown): v is ReminderChannelStatus =>
  includes(REMINDER_CHANNEL_STATUSES, v);
export const isStatusReservation = (v: unknown): v is StatusReservation =>
  includes(Object.values(StatusReservation), v);

/** Libellé d'un type de relance, repli sur le code brut (type ajouté côté API). */
export function getReminderKindLabel(kind: string): string {
  return isReminderKind(kind) ? REMINDER_KIND_LABELS[kind] : kind;
}

export function getReminderTargetLabel(target: string): string {
  return isReminderTarget(target) ? REMINDER_TARGET_LABELS[target] : target;
}
