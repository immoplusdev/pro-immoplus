export type FailureReasonActor = "CLIENT" | "PRO";

export interface FailureReason {
  id: string;
  actor: FailureReasonActor;
  /** Stable, jamais modifiable. */
  code: string;
  /** 1 à 150 caractères. */
  label: string;
  /** Entier >= 1. */
  displayOrder: number;
  isActive: boolean;
  /** true pour AUTRE : ni supprimable ni désactivable, mais renommable. */
  isSystem: boolean;
  /** Nombre de réponses client/pro ayant choisi ce motif. */
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export type FailureReasonErrorCode =
  | "FAILURE_REASON_NOT_FOUND"
  | "FAILURE_REASON_CODE_ALREADY_EXISTS"
  | "FAILURE_REASON_SYSTEM_LOCKED"
  | "FAILURE_REASON_IN_USE"
  | "FAILURE_REASON_INVALID_ORDER"
  | "FAILURE_REASON_ADMIN_ROLE_REQUIRED";

export interface FailureReasonList {
  items: FailureReason[];
  total: number;
}

/** Valeurs du formulaire (création et édition). */
export interface FailureReasonFormValues {
  actor?: FailureReasonActor;
  code?: string;
  label?: string;
  displayOrder?: number | null;
  isActive?: boolean;
}

export interface CreateFailureReasonPayload {
  actor: FailureReasonActor;
  code: string;
  label: string;
  displayOrder?: number;
  isActive: boolean;
}

/** Seuls champs acceptés par PATCH /:id (le back refuse tout champ inconnu). */
export interface UpdateFailureReasonPayload {
  label?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ReorderFailureReasonsPayload {
  actor: FailureReasonActor;
  ids: string[];
}
