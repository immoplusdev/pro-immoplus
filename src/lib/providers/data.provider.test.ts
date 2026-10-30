import { describe, expect, it, vi } from "vitest";
import { AxiosError, AxiosHeaders, type AxiosInstance } from "axios";
import { getDataProvider } from "./data.provider";
import { toHttpError } from "./utils";

const API = "https://api.test";

const fakeClient = (response: unknown) => {
  const call = vi.fn().mockResolvedValue({ data: response });
  return { client: { get: call, delete: call } as unknown as AxiosInstance, call };
};

describe("dataProvider : admin/reservation-failure-reasons", () => {
  it("getList : filtres en query string simple et lecture de { data: { items, total } }", async () => {
    const items = [{ id: "1" }, { id: "2" }];
    const { client, call } = fakeClient({ data: { items, total: 2 } });

    const result = await getDataProvider(API, client).getList({
      resource: "admin/reservation-failure-reasons",
      pagination: { mode: "off" },
      filters: [
        { field: "actor", operator: "eq", value: "CLIENT" },
        { field: "includeInactive", operator: "eq", value: true },
      ],
    });

    expect(call).toHaveBeenCalledWith(`${API}/admin/reservation-failure-reasons?actor=CLIENT&includeInactive=true`, {
      headers: undefined,
    });
    expect(result).toEqual({ data: items, total: 2 });
  });

  it("deleteOne : un 204 sans corps ne fait pas planter le provider", async () => {
    const { client } = fakeClient("");
    await expect(
      getDataProvider(API, client).deleteOne({ resource: "admin/reservation-failure-reasons", id: "1" })
    ).resolves.toEqual({ data: undefined });
  });
});

describe("toHttpError", () => {
  const axiosError = (status: number, data: unknown) =>
    new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
      status,
      statusText: "",
      data,
      headers: {},
      config: { headers: new AxiosHeaders() },
    });

  it("conserve le code métier et data", () => {
    const error = toHttpError(
      axiosError(409, { statusCode: 409, message: "Utilisé", code: "FAILURE_REASON_IN_USE", data: { usageCount: 4 } }),
      500
    );
    expect(error).toMatchObject({ statusCode: 409, message: "Utilisé", code: "FAILURE_REASON_IN_USE", data: { usageCount: 4 } });
  });

  it("joint un message de validation en tableau", () => {
    const error = toHttpError(axiosError(400, { statusCode: 400, message: ["label trop long", "code invalide"] }), 500);
    expect(error.message).toBe("label trop long, code invalide");
    expect(error.statusCode).toBe(400);
  });
});
