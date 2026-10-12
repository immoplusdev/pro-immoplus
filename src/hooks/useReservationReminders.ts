import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { getErrorStatus, unwrapEnvelopeData } from "@/lib/helpers/api-response.helper";
import { buildReminderParams, type ReminderFilterValues } from "@/lib/helpers/reservation-reminders.helper";
import {
  PAID_RESERVATION_STATUSES,
  type AdminRemindersFilters,
  type AdminRemindersResponse,
  type RawReminderSettings,
  type ReminderSentEvent,
  type ReminderSettings,
  type ReservationReminders,
} from "@/types/reservation-reminders.types";
import type { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";

const KEY = "admin-reservation-reminders";
const BASE = `${API_URL}/reservations`;

export const REMINDERS_MAX_PAGE_SIZE = 100;

/** Clés react-query, exposées pour l'invalidation temps réel. */
export const reminderQueryKeys = {
  all: [KEY] as const,
  list: () => [KEY, "list"] as const,
  paidCount: () => [KEY, "paid-count"] as const,
  reservation: (reservationId: string) => [KEY, "reservation", reservationId] as const,
  settings: () => [KEY, "settings"] as const,
};

/** Pas de retry sur 4xx (400 date invalide, 403 droits, 404) : rejouer ne changerait rien. */
const retryOnlyTransient = (failureCount: number, error: unknown) => {
  const status = getErrorStatus(error);
  return (status === undefined || status >= 500) && failureCount < 2;
};

function isAdminRemindersResponse(body: unknown): body is AdminRemindersResponse {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return Array.isArray(b.data) && typeof b.meta === "object" && b.meta !== null;
}

/** GET /reservations/relances (Admin) : `{ data, meta }` non enveloppé ; une enveloppe éventuelle est tolérée. */
export async function getAdminReminders(
  filters: AdminRemindersFilters,
  signal?: AbortSignal
): Promise<AdminRemindersResponse> {
  const res = await axiosInstance.get<unknown>(`${BASE}/relances`, { params: buildReminderParams(filters), signal });
  const body = res.data;
  if (isAdminRemindersResponse(body)) return body;
  const inner = (body as { data?: unknown } | null)?.data;
  if (isAdminRemindersResponse(inner)) return inner;
  throw new Error("Réponse API inattendue : `data` / `meta` absents");
}

/**
 * Relances dont la réservation a abouti à un paiement, pour les mêmes filtres :
 * un appel `perPage=1` par statut « payé » (l'API n'accepte qu'un statut), totaux additionnés.
 * Un filtre de statut non payé donne 0 sans appel.
 */
export async function getPaidRemindersCount(filters: ReminderFilterValues, signal?: AbortSignal): Promise<number> {
  const statuses: readonly StatusReservation[] = filters.status
    ? PAID_RESERVATION_STATUSES.filter((s) => s === filters.status)
    : PAID_RESERVATION_STATUSES;
  const totals = await Promise.all(
    statuses.map((status) =>
      getAdminReminders({ ...filters, status, page: 1, perPage: 1 }, signal).then((r) => Number(r.meta.total) || 0)
    )
  );
  return totals.reduce((sum, n) => sum + n, 0);
}

/** GET /reservations/:id/relances (enveloppé). */
export async function getReservationReminders(reservationId: string, signal?: AbortSignal): Promise<ReservationReminders> {
  const res = await axiosInstance.get<unknown>(`${BASE}/${encodeURIComponent(reservationId)}/relances`, { signal });
  return unwrapEnvelopeData<ReservationReminders>(res.data);
}

/** GET /configs (enveloppé) : seuls les champs de la section Relances et les délais sont lus. */
export async function getReminderSettingsSource(
  signal?: AbortSignal
): Promise<RawReminderSettings & { customerPaymentMinutes?: unknown; proValidationMinutes?: unknown }> {
  const res = await axiosInstance.get<unknown>(`${API_URL}/configs`, { signal });
  return unwrapEnvelopeData(res.data);
}

/** PATCH /configs avec uniquement les champs `relance*`. */
export async function patchReminderSettings(settings: ReminderSettings): Promise<void> {
  await axiosInstance.patch(`${API_URL}/configs`, settings);
}

export function useAdminReminders(filters: AdminRemindersFilters) {
  return useQuery({
    queryKey: [...reminderQueryKeys.list(), filters],
    queryFn: ({ signal }) => getAdminReminders(filters, signal),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: retryOnlyTransient,
  });
}

export function usePaidRemindersCount(filters: ReminderFilterValues, enabled = true) {
  return useQuery({
    queryKey: [...reminderQueryKeys.paidCount(), filters],
    queryFn: ({ signal }) => getPaidRemindersCount(filters, signal),
    enabled,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    retry: retryOnlyTransient,
  });
}

export function useReservationReminders(reservationId: string | undefined) {
  return useQuery({
    queryKey: reminderQueryKeys.reservation(reservationId ?? ""),
    queryFn: ({ signal }) => getReservationReminders(reservationId as string, signal),
    enabled: !!reservationId,
    refetchOnWindowFocus: false,
    retry: retryOnlyTransient,
  });
}

export function useReminderSettingsSource() {
  return useQuery({
    queryKey: reminderQueryKeys.settings(),
    queryFn: ({ signal }) => getReminderSettingsSource(signal),
    refetchOnWindowFocus: false,
    retry: retryOnlyTransient,
  });
}

export function useUpdateReminderSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchReminderSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reminderQueryKeys.settings() }),
  });
}

/**
 * Invalidation à la réception d'une relance (WS) : seules les requêtes montées sont refetchées
 * (liste, compteur payé, historique de la réservation concernée) ; les autres sont marquées périmées.
 */
export function useInvalidateOnReminderSent() {
  const queryClient = useQueryClient();
  return useCallback(
    (event: Pick<ReminderSentEvent, "reservationId">) => {
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.paidCount() });
      queryClient.invalidateQueries({ queryKey: reminderQueryKeys.reservation(event.reservationId) });
    },
    [queryClient]
  );
}
