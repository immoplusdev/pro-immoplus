import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
const post = vi.fn();
vi.mock("@/lib/providers/utils/axios", () => ({
  axiosInstance: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
  },
}));
vi.mock("@/configs/app.config", () => ({ API_URL: "https://api.test" }));

import {
  createAdminReservation,
  getAdminReservationCreationTrace,
  getResidenceOccupiedDates,
  previewAdminReservation,
} from "./useAdminReservationCreation";
import type { AdminReservationRequestBody } from "@/types/admin-reservation-creation.types";

const body: AdminReservationRequestBody = {
  clientId: "c1",
  residenceId: "r1",
  datesReservation: [{ date: "2026-12-24T00:00:00.000Z" }],
  ignorerLimiteReservations: false,
  forcerRegles: false,
  prixManuel: null,
  delaiPaiementMinutes: null,
};

describe("API création de réservation admin", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it("aperçu : POST sans Idempotency-Key, déballe `data`", async () => {
    post.mockResolvedValue({ data: { data: { nuits: 1 } } });
    await expect(previewAdminReservation(body)).resolves.toEqual({ nuits: 1 });
    expect(post).toHaveBeenCalledWith("https://api.test/admin/reservations/creation/apercu", body, { signal: undefined });
  });

  it("création : POST avec l'option idempotencyKey (en-tête Idempotency-Key)", async () => {
    post.mockResolvedValue({ data: { data: { creationId: "x", replayed: false, reservation: { id: "resa" } } } });
    await expect(createAdminReservation(body, "key-1")).resolves.toMatchObject({ reservation: { id: "resa" } });
    expect(post).toHaveBeenCalledWith("https://api.test/admin/reservations/creation", body, { idempotencyKey: "key-1" });
  });

  it("trace : `data` en 200, null en 404, erreur sinon", async () => {
    get.mockResolvedValueOnce({ data: { data: { id: "t1", adminId: "a1" } } });
    await expect(getAdminReservationCreationTrace("resa")).resolves.toEqual({ id: "t1", adminId: "a1" });
    expect(get.mock.calls[0][0]).toBe("https://api.test/admin/reservations/resa/creation-admin");

    get.mockRejectedValueOnce({ statusCode: 404, message: "not found" });
    await expect(getAdminReservationCreationTrace("resa")).resolves.toBeNull();

    get.mockRejectedValueOnce({ statusCode: 403, message: "forbidden" });
    await expect(getAdminReservationCreationTrace("resa")).rejects.toMatchObject({ statusCode: 403 });
  });

  it("dates occupées : liste et fenêtre de réservation", async () => {
    get.mockResolvedValue({
      data: { data: { dates: [{ date: "2026-12-24T00:00:00.000Z" }], bookingWindow: { firstBookableNight: "2026-11-21", lastBookableNight: null } } },
    });
    await expect(getResidenceOccupiedDates("r1")).resolves.toEqual({
      dates: [{ date: "2026-12-24T00:00:00.000Z" }],
      bookingWindow: { firstBookableNight: "2026-11-21", lastBookableNight: null },
    });
    expect(get.mock.calls[0][0]).toBe("https://api.test/reservations/data/residence/occupied-dates/r1");
  });
});
