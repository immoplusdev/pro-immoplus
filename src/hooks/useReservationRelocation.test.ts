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
  getRelocationSuggestions,
  getResidenceChangeHistory,
  previewRelocation,
  relocateReservation,
} from "./useReservationRelocation";
import { RelocationMotif } from "@/types/reservation-relocation.types";

const body = { residenceId: "res-b", motif: RelocationMotif.Autre, note: "n", forcerRegles: false };

describe("API changement de résidence", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it("suggestions : mode, rayon seulement en mode proches, limit plafonné à 20", async () => {
    get.mockResolvedValue({ data: { data: [{ id: "res-b" }] } });
    await expect(getRelocationSuggestions("r1", { mode: "proches", rayonKm: 15, limit: 50 })).resolves.toEqual([{ id: "res-b" }]);
    expect(get).toHaveBeenLastCalledWith("https://api.test/reservations/r1/suggestions", {
      params: { mode: "proches", rayonKm: 15, limit: 20 },
      signal: undefined,
    });
    await getRelocationSuggestions("r1", { mode: "similaires", rayonKm: 15 });
    expect(get.mock.calls[1][1].params).toEqual({ mode: "similaires", limit: 6 });
  });

  it("aperçu : POST sans Idempotency-Key", async () => {
    post.mockResolvedValue({ data: { data: { reservationId: "r1" } } });
    await expect(previewRelocation("r1", body)).resolves.toEqual({ reservationId: "r1" });
    expect(post).toHaveBeenCalledWith("https://api.test/admin/reservations/r1/changement-residence/apercu", body, {
      signal: undefined,
    });
  });

  it("exécution : POST avec l'option idempotencyKey (en-tête Idempotency-Key)", async () => {
    post.mockResolvedValue({ data: { data: { changeId: "c1", replayed: false } } });
    await expect(relocateReservation("r1", body, "key-1")).resolves.toEqual({ changeId: "c1", replayed: false });
    expect(post).toHaveBeenCalledWith("https://api.test/admin/reservations/r1/changement-residence", body, {
      idempotencyKey: "key-1",
    });
  });

  it("historique : déballe `{ data: [...] }`", async () => {
    get.mockResolvedValue({ data: { data: [{ id: "h1" }] } });
    await expect(getResidenceChangeHistory("r1")).resolves.toEqual([{ id: "h1" }]);
    expect(get.mock.calls[0][0]).toBe("https://api.test/admin/reservations/r1/changements-residence");
  });
});
