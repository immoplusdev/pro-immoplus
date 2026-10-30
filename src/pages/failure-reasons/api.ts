import { arrayMove } from "@dnd-kit/sortable";
import type {
  CreateFailureReasonPayload,
  FailureReason,
  FailureReasonActor,
  FailureReasonErrorCode,
  FailureReasonFormValues,
  ReorderFailureReasonsPayload,
  UpdateFailureReasonPayload,
} from "./types";

export const FAILURE_REASONS_RESOURCE = "admin/reservation-failure-reasons";

export const FAILURE_REASON_CODE_PATTERN = /^[A-Z0-9_]+$/;
export const FAILURE_REASON_CODE_MAX_LENGTH = 50;
export const FAILURE_REASON_LABEL_MAX_LENGTH = 150;
export const FAILURE_REASON_DISPLAY_ORDER_MAX = 10000;

export const FAILURE_REASON_ACTORS: FailureReasonActor[] = ["CLIENT", "PRO"];

export const parseActor = (value: string | null | undefined): FailureReasonActor | undefined =>
  FAILURE_REASON_ACTORS.find((actor) => actor === value);

export const failureReasonStatusUrl = (apiUrl: string, id: string) =>
  `${apiUrl}/${FAILURE_REASONS_RESOURCE}/${id}/status`;

export const failureReasonOrderUrl = (apiUrl: string) => `${apiUrl}/${FAILURE_REASONS_RESOURCE}/order`;

/** Saisie du code : majuscules, espaces et tirets remplacés par `_`. */
export const normalizeCodeInput = (value: string | undefined): string =>
  (value ?? "").toUpperCase().replace(/[\s-]/g, "_");

const toDisplayOrder = (value: number | null | undefined): number | undefined =>
  typeof value === "number" && Number.isInteger(value) ? value : undefined;

export const toCreatePayload = (
  values: FailureReasonFormValues,
  actor: FailureReasonActor
): CreateFailureReasonPayload => {
  const displayOrder = toDisplayOrder(values.displayOrder);
  return {
    actor: parseActor(values.actor) ?? actor,
    code: normalizeCodeInput(values.code),
    label: (values.label ?? "").trim(),
    ...(displayOrder !== undefined ? { displayOrder } : {}),
    isActive: values.isActive ?? true,
  };
};

/**
 * Payload du PATCH /:id : uniquement `label`, `displayOrder` et `isActive`.
 * Jamais `code` ni `actor`, ni les champs en lecture seule (le back répond 400).
 * `isActive` n'est pas envoyé pour un motif système (non désactivable).
 */
export const toUpdatePayload = (
  values: FailureReasonFormValues,
  record?: Pick<FailureReason, "isSystem">
): UpdateFailureReasonPayload => {
  const payload: UpdateFailureReasonPayload = {};
  if (typeof values.label === "string") payload.label = values.label.trim();
  const displayOrder = toDisplayOrder(values.displayOrder);
  if (displayOrder !== undefined) payload.displayOrder = displayOrder;
  if (typeof values.isActive === "boolean" && !record?.isSystem) payload.isActive = values.isActive;
  return payload;
};

/** `ids` = tous les motifs de l'acteur (inactifs compris), une seule fois chacun, dans l'ordre affiché. */
export const buildReorderPayload = (
  actor: FailureReasonActor,
  items: Pick<FailureReason, "id">[]
): ReorderFailureReasonsPayload => ({
  actor,
  ids: Array.from(new Set(items.map((item) => item.id))),
});

/** Déplace `activeId` à la place de `overId` et renumérote `displayOrder` (comme le back). */
export const moveFailureReason = (items: FailureReason[], activeId: string, overId: string): FailureReason[] => {
  const from = items.findIndex((item) => item.id === activeId);
  const to = items.findIndex((item) => item.id === overId);
  if (from === -1 || to === -1 || from === to) return items;
  return arrayMove(items, from, to).map((item, index) => ({ ...item, displayOrder: index + 1 }));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** `code` métier conservé par `toHttpError` (repli sur le corps axios brut). */
export const getFailureReasonErrorCode = (error: unknown): FailureReasonErrorCode | undefined => {
  if (!isRecord(error)) return undefined;
  if (typeof error.code === "string" && error.code.startsWith("FAILURE_REASON_")) {
    return error.code as FailureReasonErrorCode;
  }
  const response = error.response;
  if (isRecord(response) && isRecord(response.data) && typeof response.data.code === "string") {
    return response.data.code as FailureReasonErrorCode;
  }
  return undefined;
};

/** `data.usageCount` d'un 409 `FAILURE_REASON_IN_USE`. */
export const getUsageCountFromError = (error: unknown): number | undefined => {
  if (!isRecord(error) || !isRecord(error.data)) return undefined;
  const { usageCount } = error.data;
  return typeof usageCount === "number" ? usageCount : undefined;
};

const errorMessage = (error: unknown): string | undefined =>
  isRecord(error) && typeof error.message === "string" && error.message ? error.message : undefined;

export const CODE_ALREADY_EXISTS_MESSAGE = "Ce code existe déjà pour cet acteur";

/** Erreurs affichées sous un champ du formulaire (et donc sans notification générique). */
export const getFormFieldErrors = (error: unknown): { name: "code"; errors: string[] }[] | undefined => {
  if (getFailureReasonErrorCode(error) !== "FAILURE_REASON_CODE_ALREADY_EXISTS") return undefined;
  return [{ name: "code", errors: [errorMessage(error) ?? CODE_ALREADY_EXISTS_MESSAGE] }];
};

/** Notification d'erreur refine en français ; `false` si l'erreur est déjà affichée ailleurs. */
export const errorNotification =
  (title: string, isHandledElsewhere: (error: unknown) => boolean = () => false) =>
  (error?: unknown) =>
    isHandledElsewhere(error)
      ? (false as const)
      : { type: "error" as const, message: title, description: errorMessage(error) ?? "Une erreur est survenue." };
