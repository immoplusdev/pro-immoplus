import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { getErrorStatus, unwrapEnvelopeData } from "@/lib/helpers/api-response.helper";
import type {
  AdminReservationCreationTrace,
  AdminReservationPreview,
  AdminReservationRequestBody,
  AdminReservationResult,
  ResidenceOccupiedDates,
} from "@/types/admin-reservation-creation.types";

const KEY = "admin-reservation-creation";
const ADMIN_BASE = `${API_URL}/admin/reservations`;

export const adminReservationCreationKeys = {
  all: [KEY] as const,
  preview: (trigger: string) => [KEY, "preview", trigger] as const,
  occupiedDates: (residenceId: string) => [KEY, "occupied-dates", residenceId] as const,
  trace: (reservationId: string) => [KEY, "trace", reservationId] as const,
};

const id = (value: string) => encodeURIComponent(value);

/** Pas de retry sur 4xx (403 rôle, 404…) : rejouer ne changerait rien. */
const retryOnlyTransient = (failureCount: number, error: unknown) => {
  const status = getErrorStatus(error);
  return (status === undefined || status >= 500) && failureCount < 2;
};

/** POST /admin/reservations/creation/apercu — aucune écriture côté serveur. */
export async function previewAdminReservation(
  body: AdminReservationRequestBody,
  signal?: AbortSignal,
): Promise<AdminReservationPreview> {
  const res = await axiosInstance.post<unknown>(`${ADMIN_BASE}/creation/apercu`, body, { signal });
  return unwrapEnvelopeData<AdminReservationPreview>(res.data);
}

/** POST /admin/reservations/creation — `Idempotency-Key` obligatoire. */
export async function createAdminReservation(
  body: AdminReservationRequestBody,
  idempotencyKey: string,
): Promise<AdminReservationResult> {
  const res = await axiosInstance.post<unknown>(`${ADMIN_BASE}/creation`, body, { idempotencyKey });
  return unwrapEnvelopeData<AdminReservationResult>(res.data);
}

/** GET /admin/reservations/:id/creation-admin — `null` si la réservation n'a pas été créée depuis le backoffice (404). */
export async function getAdminReservationCreationTrace(
  reservationId: string,
  signal?: AbortSignal,
): Promise<AdminReservationCreationTrace | null> {
  try {
    const res = await axiosInstance.get<unknown>(`${ADMIN_BASE}/${id(reservationId)}/creation-admin`, { signal });
    return unwrapEnvelopeData<AdminReservationCreationTrace>(res.data);
  } catch (error) {
    if (getErrorStatus(error) === 404) return null;
    throw error;
  }
}

/** GET /reservations/data/residence/occupied-dates/:residence — nuits déjà prises (toujours bloquantes). */
export async function getResidenceOccupiedDates(
  residenceId: string,
  signal?: AbortSignal,
): Promise<ResidenceOccupiedDates> {
  const res = await axiosInstance.get<unknown>(`${API_URL}/reservations/data/residence/occupied-dates/${id(residenceId)}`, {
    signal,
  });
  const data = unwrapEnvelopeData<Partial<ResidenceOccupiedDates>>(res.data);
  return { dates: Array.isArray(data.dates) ? data.dates : [], bookingWindow: data.bookingWindow ?? null };
}

export function useResidenceOccupiedDates(residenceId: string | null | undefined) {
  return useQuery({
    queryKey: adminReservationCreationKeys.occupiedDates(residenceId ?? ""),
    queryFn: ({ signal }) => getResidenceOccupiedDates(residenceId as string, signal),
    enabled: !!residenceId,
    staleTime: 30_000,
    retry: retryOnlyTransient,
  });
}

export function useAdminReservationCreationTrace(reservationId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: adminReservationCreationKeys.trace(reservationId ?? ""),
    queryFn: ({ signal }) => getAdminReservationCreationTrace(reservationId as string, signal),
    enabled: enabled && !!reservationId,
    refetchOnWindowFocus: false,
    retry: retryOnlyTransient,
  });
}
