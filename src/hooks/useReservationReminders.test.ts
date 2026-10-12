import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("@/lib/providers/utils/axios", () => ({ axiosInstance: { get: (...args: unknown[]) => get(...args) } }));

import { getAdminReminders, getPaidRemindersCount } from "./useReservationReminders";

const page = (total: number) => ({ data: { data: [], meta: { page: 1, perPage: 1, total } } });

describe("getAdminReminders", () => {
  beforeEach(() => get.mockReset());

  it("lit `{ data, meta }` non enveloppé", async () => {
    get.mockResolvedValueOnce(page(134));
    await expect(getAdminReminders({})).resolves.toEqual({ data: [], meta: { page: 1, perPage: 1, total: 134 } });
  });

  it("rejette une réponse inattendue", async () => {
    get.mockResolvedValueOnce({ data: { items: [] } });
    await expect(getAdminReminders({})).rejects.toThrow();
  });
});

describe("getPaidRemindersCount", () => {
  beforeEach(() => get.mockReset());

  it("additionne un appel perPage=1 par statut payé, avec les autres filtres", async () => {
    const totals: Record<string, number> = { valide: 3, en_cours: 1, terminee: 10 };
    get.mockImplementation((_url: string, config?: { params?: Record<string, unknown> }) =>
      Promise.resolve(page(totals[String(config?.params?.status)] ?? 0))
    );
    await expect(getPaidRemindersCount({ kind: "PAY_1", dateFrom: "2026-09-01" })).resolves.toBe(14);
    expect(get).toHaveBeenCalledTimes(3);
    const params = get.mock.calls.map(([, config]) => config.params);
    expect(params.map((p) => p.status).sort()).toEqual(["en_cours", "terminee", "valide"]);
    params.forEach((p) => expect(p).toMatchObject({ kind: "PAY_1", dateFrom: "2026-09-01", page: 1, perPage: 1 }));
  });

  it("n'interroge que le statut filtré s'il est payé", async () => {
    get.mockResolvedValue(page(5));
    await expect(getPaidRemindersCount({ status: "terminee" as never })).resolves.toBe(5);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("vaut 0 sans appel pour un statut non payé", async () => {
    await expect(getPaidRemindersCount({ status: "client_sans_reponse" as never })).resolves.toBe(0);
    expect(get).not.toHaveBeenCalled();
  });
});
