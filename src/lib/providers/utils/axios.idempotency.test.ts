import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { axiosInstance, IDEMPOTENCY_KEY_HEADER } from "./axios";

const originalAdapter = axiosInstance.defaults.adapter;
let sent: InternalAxiosRequestConfig[];

beforeEach(() => {
  sent = [];
  const adapter: AxiosAdapter = async (config) => {
    sent.push(config);
    return { data: { ok: true }, status: 200, statusText: "OK", headers: {}, config };
  };
  axiosInstance.defaults.adapter = adapter;
});

afterEach(() => {
  axiosInstance.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

const headerOf = (config: InternalAxiosRequestConfig) =>
  AxiosHeaders.from(config.headers).get(IDEMPOTENCY_KEY_HEADER);

describe("axiosInstance : option idempotencyKey", () => {
  it("pose l'en-tête Idempotency-Key avec la clé fournie", async () => {
    await axiosInstance.post("https://api.test/wallet/admin/credit", { amount: 1 }, { idempotencyKey: "key-1" });
    expect(headerOf(sent[0])).toBe("key-1");
  });

  it("ne pose aucun en-tête sans option (pas de clé aléatoire automatique)", async () => {
    const randomUUID = vi.spyOn(crypto, "randomUUID");
    await axiosInstance.post("https://api.test/autre", {});
    await axiosInstance.get("https://api.test/autre");
    expect(headerOf(sent[0])).toBeUndefined();
    expect(headerOf(sent[1])).toBeUndefined();
    expect(randomUUID).not.toHaveBeenCalled();
  });

  it("conserve les autres en-têtes fournis par l'appelant", async () => {
    await axiosInstance.post("https://api.test/x", {}, { idempotencyKey: "key-2", headers: { Authorization: "Bearer t" } });
    const headers = AxiosHeaders.from(sent[0].headers);
    expect(headers.get("Authorization")).toBe("Bearer t");
    expect(headers.get(IDEMPOTENCY_KEY_HEADER)).toBe("key-2");
  });
});
