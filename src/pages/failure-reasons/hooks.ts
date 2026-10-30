import { useCallback } from "react";
import { useApiUrl, useCustomMutation, useInvalidate } from "@refinedev/core";
import {
  FAILURE_REASONS_RESOURCE,
  buildReorderPayload,
  errorNotification,
  failureReasonOrderUrl,
  failureReasonStatusUrl,
  getFailureReasonErrorCode,
} from "./api";
import { INACTIVE_INFO_MESSAGE, INVALID_ORDER_MESSAGE } from "./rules";
import type { FailureReason, FailureReasonActor, FailureReasonList } from "./types";

const useInvalidateFailureReasons = () => {
  const invalidate = useInvalidate();
  return useCallback(
    () => invalidate({ resource: FAILURE_REASONS_RESOURCE, invalidates: ["list"] }),
    [invalidate]
  );
};

/** PATCH /:id/status. La promesse ne rejette jamais : `true` si le statut a été enregistré. */
export const useSetFailureReasonStatus = () => {
  const apiUrl = useApiUrl();
  const invalidateList = useInvalidateFailureReasons();
  const { mutate } = useCustomMutation<FailureReason>();

  return useCallback(
    (reason: Pick<FailureReason, "id">, isActive: boolean) =>
      new Promise<boolean>((resolve) => {
        mutate(
          {
            url: failureReasonStatusUrl(apiUrl, reason.id),
            method: "patch",
            values: { isActive },
            successNotification: isActive
              ? { type: "success", message: "Motif activé" }
              : { type: "success", message: "Motif désactivé", description: INACTIVE_INFO_MESSAGE },
            errorNotification: errorNotification(
              isActive ? "Impossible d'activer le motif" : "Impossible de désactiver le motif"
            ),
          },
          {
            onSuccess: () => {
              invalidateList();
              resolve(true);
            },
            onError: () => resolve(false),
          }
        );
      }),
    [apiUrl, invalidateList, mutate]
  );
};

export type ReorderResult = { ok: true; items: FailureReason[] } | { ok: false };

/**
 * PUT /order avec tous les ids de l'acteur. Sur 400 `FAILURE_REASON_INVALID_ORDER`,
 * la liste est rechargée et l'utilisateur invité à réessayer.
 */
export const useReorderFailureReasons = () => {
  const apiUrl = useApiUrl();
  const invalidateList = useInvalidateFailureReasons();
  const { mutate, isLoading } = useCustomMutation<FailureReasonList>();

  const reorder = useCallback(
    (actor: FailureReasonActor, items: Pick<FailureReason, "id">[]) =>
      new Promise<ReorderResult>((resolve) => {
        mutate(
          {
            url: failureReasonOrderUrl(apiUrl),
            method: "put",
            values: buildReorderPayload(actor, items),
            successNotification: { type: "success", message: "Ordre enregistré" },
            errorNotification: (error) =>
              getFailureReasonErrorCode(error) === "FAILURE_REASON_INVALID_ORDER"
                ? { type: "error", message: INVALID_ORDER_MESSAGE }
                : errorNotification("Impossible d'enregistrer l'ordre")(error),
          },
          {
            onSuccess: ({ data }) => {
              resolve({ ok: true, items: data.items });
              invalidateList();
            },
            onError: () => {
              invalidateList();
              resolve({ ok: false });
            },
          }
        );
      }),
    [apiUrl, invalidateList, mutate]
  );

  return { reorder, isReordering: isLoading };
};
