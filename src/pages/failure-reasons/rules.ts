import type { FailureReason } from "./types";

export const SYSTEM_LOCK_MESSAGE = "Motif système : ni supprimable ni désactivable";
export const INACTIVE_INFO_MESSAGE =
  "Un motif inactif n'est plus proposé aux clients/pros mais reste dans l'historique et les exports";
export const IMMUTABLE_FIELDS_HELP = "Non modifiable : préserve l'historique et les statistiques";
export const INVALID_ORDER_MESSAGE = "La liste a changé entre-temps, réessayez";

export const inUseMessage = (usageCount: number) =>
  `Ce motif a été utilisé ${usageCount} fois : il ne peut pas être supprimé. Le désactiver à la place ?`;

/** Le motif système (AUTRE) n'est jamais désactivable. */
export const canToggleStatus = (reason: Pick<FailureReason, "isSystem">) => !reason.isSystem;

export const canDelete = (reason: Pick<FailureReason, "isSystem">) => !reason.isSystem;

export type DeleteDecision =
  | { kind: "locked" }
  | { kind: "deactivate-instead"; usageCount: number; alreadyInactive: boolean }
  | { kind: "confirm-delete" };

/** Un motif utilisé n'est pas supprimé : on propose de le désactiver, sans appeler l'API de suppression. */
export const getDeleteDecision = (
  reason: Pick<FailureReason, "isSystem" | "usageCount" | "isActive">
): DeleteDecision => {
  if (!canDelete(reason)) return { kind: "locked" };
  if (reason.usageCount > 0) {
    return { kind: "deactivate-instead", usageCount: reason.usageCount, alreadyInactive: !reason.isActive };
  }
  return { kind: "confirm-delete" };
};
