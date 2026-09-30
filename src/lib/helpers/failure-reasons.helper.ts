import dayjs, { type Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  ACTOR_TAGS,
  FAILURE_ACTORS,
  FAILURE_STATUSES,
  getReasonLabel,
  getStatusLabel,
  isAmbiguousReasonCode,
  isFailureActor,
  isFailureStatus,
  isReasonOfActor,
  OTHER_REASON_CODE,
  REASONS_BY_ACTOR,
  STATUS_ACTOR,
  STATUS_LABELS,
  type FailureActor,
  type FailureReasonItem,
  type FailureStatus,
} from "@/types/failure-reasons.types";
import { buildCsv } from "./csv.helper";

// Parsing strict `dayjs(v, format, true)` : le plugin n'est sinon chargé qu'en effet de bord du DatePicker Ant.
dayjs.extend(customParseFormat);

export const API_DATE_FORMAT = "YYYY-MM-DD";

/** Date/heure de réponse dans le fuseau local : DD/MM/YYYY HH:mm (repli : valeur brute). */
export function formatRespondedAt(iso: string): string {
  const d = dayjs(iso);
  return d.isValid() ? d.format("DD/MM/YYYY HH:mm") : iso;
}

/* ================================================================== */
/* Filtres dépendants                                                  */
/* ================================================================== */

export interface FailureFilterValues {
  actor?: FailureActor;
  status?: FailureStatus;
  reasonCode?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

/** Valeur d'option du Select motif : `ACTEUR:CODE` (AUTRE existe des deux côtés). */
export function reasonOptionValue(actor: FailureActor, code: string): string {
  return `${actor}:${code}`;
}

export function parseReasonOptionValue(value: string): { actor: FailureActor; code: string } | null {
  const i = value.indexOf(":");
  const actor = value.slice(0, i);
  const code = value.slice(i + 1);
  return i > 0 && isFailureActor(actor) && code ? { actor, code } : null;
}

/** Acteur propriétaire d'un code non ambigu (ex. PRIX_TROP_ELEVE → CLIENT) ; `undefined` si ambigu/inconnu. */
function uniqueActorOf(code: string): FailureActor | undefined {
  const owners = FAILURE_ACTORS.filter((a) => isReasonOfActor(a, code));
  return owners.length === 1 ? owners[0] : undefined;
}

export function statusOptionsFor(actor?: FailureActor): SelectOption[] {
  return FAILURE_STATUSES.filter((s) => !actor || STATUS_ACTOR[s] === actor).map((s) => ({
    value: s,
    label: STATUS_LABELS[s],
  }));
}

function reasonOptionsOf(actor: FailureActor): SelectOption[] {
  return Object.entries(REASONS_BY_ACTOR[actor]).map(([code, label]) => ({
    value: reasonOptionValue(actor, code),
    label,
  }));
}

/** Motifs de l'acteur choisi ; si "Tous", options groupées Client / Pro. */
export function reasonOptionsFor(actor: FailureActor): SelectOption[];
export function reasonOptionsFor(actor?: undefined): SelectOptionGroup[];
export function reasonOptionsFor(actor?: FailureActor): SelectOption[] | SelectOptionGroup[];
export function reasonOptionsFor(actor?: FailureActor): SelectOption[] | SelectOptionGroup[] {
  if (actor) return reasonOptionsOf(actor);
  return FAILURE_ACTORS.map((a) => ({ label: ACTOR_TAGS[a].label, options: reasonOptionsOf(a) }));
}

/** Valeur courante du Select motif, ou `undefined` si aucun motif. */
export function selectedReasonOption(values: FailureFilterValues): string | undefined {
  if (!values.reasonCode) return undefined;
  const actor = values.actor ?? uniqueActorOf(values.reasonCode);
  return actor ? reasonOptionValue(actor, values.reasonCode) : undefined;
}

/**
 * Changement d'acteur : statut et motif remis à zéro s'ils ne sont plus compatibles.
 * "Tous" efface le statut (il fixerait à nouveau l'acteur) et un motif ambigu (AUTRE exige un acteur).
 */
export function applyActorChange(values: FailureFilterValues, actor?: FailureActor): FailureFilterValues {
  const next: FailureFilterValues = { ...values, actor };
  if (!actor) {
    next.status = undefined;
    if (next.reasonCode && isAmbiguousReasonCode(next.reasonCode)) next.reasonCode = undefined;
    return next;
  }
  if (next.status && STATUS_ACTOR[next.status] !== actor) next.status = undefined;
  if (next.reasonCode && !isReasonOfActor(actor, next.reasonCode)) next.reasonCode = undefined;
  return next;
}

/** Un statut détermine l'acteur : on le fixe (et on retire un motif de l'autre côté). */
export function applyStatusChange(values: FailureFilterValues, status?: FailureStatus): FailureFilterValues {
  if (!status) return { ...values, status: undefined };
  return { ...applyActorChange(values, STATUS_ACTOR[status]), status };
}

/** Choix d'un motif (valeur `ACTEUR:CODE`) : un code présent des deux côtés (AUTRE) fixe l'acteur. */
export function applyReasonChange(values: FailureFilterValues, optionValue?: string): FailureFilterValues {
  const parsed = optionValue ? parseReasonOptionValue(optionValue) : null;
  if (!parsed) return { ...values, reasonCode: undefined };
  const base = isAmbiguousReasonCode(parsed.code) || values.actor ? applyActorChange(values, parsed.actor) : values;
  return { ...base, reasonCode: parsed.code };
}

const isApiDate = (v: string | undefined): v is string => !!v && dayjs(v, API_DATE_FORMAT, true).isValid();

/**
 * Filtres lus dans l'URL, rendus cohérents : valeurs inconnues ignorées, acteur déduit du statut,
 * motif incompatible ou ambigu sans acteur retiré, dates strictes YYYY-MM-DD.
 */
export function sanitizeFailureFilters(raw: Partial<Record<keyof FailureFilterValues, string>>): FailureFilterValues {
  const status = isFailureStatus(raw.status) ? raw.status : undefined;
  const actor = status ? STATUS_ACTOR[status] : isFailureActor(raw.actor) ? raw.actor : undefined;
  let reasonCode = raw.reasonCode?.trim() || undefined;
  if (reasonCode) {
    const valid = actor ? isReasonOfActor(actor, reasonCode) : uniqueActorOf(reasonCode) !== undefined;
    if (!valid) reasonCode = undefined;
  }
  return {
    actor,
    status,
    reasonCode,
    dateDebut: isApiDate(raw.dateDebut) ? raw.dateDebut : undefined,
    dateFin: isApiDate(raw.dateFin) ? raw.dateFin : undefined,
  };
}

/* ================================================================== */
/* Statistiques (agrégation front)                                     */
/* ================================================================== */

export interface CountEntry {
  key: string;
  label: string;
  count: number;
  /** Part en % (0-100) du total de référence. */
  percent: number;
}

export interface TimelineBucket {
  key: string;
  label: string;
  count: number;
}

export interface FailureStats {
  total: number;
  byActor: Record<FailureActor, number>;
  otherCount: number;
  byReason: Record<FailureActor, CountEntry[]>;
  byStatus: CountEntry[];
  granularity: "day" | "week";
  timeline: TimelineBucket[];
}

const pct = (count: number, total: number) => (total > 0 ? Math.round((count / total) * 1000) / 10 : 0);

function sortedEntries(counts: Map<string, number>, total: number, labelOf: (key: string) => string): CountEntry[] {
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: labelOf(key), count, percent: pct(count, total) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "fr"));
}

const startOfIsoWeek = (d: Dayjs) => d.subtract((d.day() + 6) % 7, "day").startOf("day");

/**
 * Agrège les réponses. Granularité : jour si la période fait moins de 31 jours, semaine (lundi) sinon.
 * Période = filtres dateDebut/dateFin s'ils sont fournis, sinon min/max des réponses. Heure locale.
 */
export function aggregateFailureStats(
  items: readonly FailureReasonItem[],
  range?: { dateDebut?: string; dateFin?: string }
): FailureStats {
  const byActor: Record<FailureActor, number> = { CLIENT: 0, PRO: 0 };
  const reasonCounts: Record<FailureActor, Map<string, number>> = { CLIENT: new Map(), PRO: new Map() };
  const statusCounts = new Map<string, number>();
  let otherCount = 0;

  const dates = items.map((i) => dayjs(i.respondedAt)).filter((d) => d.isValid());

  items.forEach((item) => {
    if (isFailureActor(item.actor)) {
      byActor[item.actor] += 1;
      const map = reasonCounts[item.actor];
      map.set(item.reasonCode, (map.get(item.reasonCode) ?? 0) + 1);
    }
    if (item.reasonCode === OTHER_REASON_CODE) otherCount += 1;
    statusCounts.set(item.status, (statusCounts.get(item.status) ?? 0) + 1);
  });

  const minDate = range?.dateDebut
    ? dayjs(range.dateDebut, API_DATE_FORMAT)
    : dates.reduce<Dayjs | undefined>((m, d) => (!m || d.isBefore(m) ? d : m), undefined);
  const maxDate = range?.dateFin
    ? dayjs(range.dateFin, API_DATE_FORMAT)
    : dates.reduce<Dayjs | undefined>((m, d) => (!m || d.isAfter(m) ? d : m), undefined);

  const spanDays = minDate && maxDate ? maxDate.startOf("day").diff(minDate.startOf("day"), "day") + 1 : 0;
  const granularity: FailureStats["granularity"] = spanDays < 31 ? "day" : "week";
  const bucketStart = (d: Dayjs) => (granularity === "day" ? d.startOf("day") : startOfIsoWeek(d));

  const timelineCounts = new Map<string, number>();
  dates.forEach((d) => {
    const key = bucketStart(d).format(API_DATE_FORMAT);
    timelineCounts.set(key, (timelineCounts.get(key) ?? 0) + 1);
  });

  // Buckets continus (y compris à 0) entre le début et la fin de période.
  const timeline: TimelineBucket[] = [];
  if (minDate && maxDate) {
    const step = granularity === "day" ? "day" : "week";
    for (let d = bucketStart(minDate); !d.isAfter(maxDate, "day"); d = d.add(1, step)) {
      const key = d.format(API_DATE_FORMAT);
      timeline.push({
        key,
        label: granularity === "day" ? d.format("DD/MM") : `Sem. ${d.format("DD/MM")}`,
        count: timelineCounts.get(key) ?? 0,
      });
    }
  }

  return {
    total: items.length,
    byActor,
    otherCount,
    byReason: {
      CLIENT: sortedEntries(reasonCounts.CLIENT, byActor.CLIENT, (code) => getReasonLabel("CLIENT", code)),
      PRO: sortedEntries(reasonCounts.PRO, byActor.PRO, (code) => getReasonLabel("PRO", code)),
    },
    byStatus: sortedEntries(statusCounts, items.length, getStatusLabel),
    granularity,
    timeline,
  };
}

/* ================================================================== */
/* CSV                                                                 */
/* ================================================================== */

export const FAILURE_REASONS_CSV_COLUMNS = [
  "respondedAt",
  "reservationId",
  "respondedBy",
  "actor",
  "status",
  "statusLabel",
  "reasonCode",
  "reasonLabel",
  "comment",
] as const;

export function buildFailureReasonsCsv(items: readonly FailureReasonItem[]): string {
  return buildCsv(
    FAILURE_REASONS_CSV_COLUMNS,
    items.map((i) => [
      i.respondedAt,
      i.reservationId,
      i.respondedBy,
      i.actor,
      i.status,
      getStatusLabel(i.status),
      i.reasonCode,
      getReasonLabel(i.actor, i.reasonCode),
      i.comment,
    ])
  );
}
