import { describe, expect, it, vi } from "vitest";
import {
  createIdempotencyKeyStore,
  createIdempotentSubmitter,
  fingerprint,
  getIdempotencyErrorKind,
} from "./idempotency.helper";

const sequentialKeys = () => {
  let n = 0;
  return () => `key-${++n}`;
};

const apiError = (statusCode: number, code: string) => ({ statusCode, code, message: code });

describe("fingerprint", () => {
  it("ne dépend ni de l'ordre des clés ni des champs undefined", () => {
    expect(fingerprint({ a: 1, b: { c: 2, d: 3 }, e: undefined })).toBe(fingerprint({ b: { d: 3, c: 2 }, a: 1 }));
    expect(fingerprint({ a: 1 })).not.toBe(fingerprint({ a: 2 }));
  });
});

describe("getIdempotencyErrorKind", () => {
  it("lit le code d'une HttpError refine ou d'une erreur axios brute", () => {
    expect(getIdempotencyErrorKind(apiError(400, "IDEMPOTENCY_KEY_REQUIRED"))).toBe("key-required");
    expect(getIdempotencyErrorKind({ code: "ERR_BAD_REQUEST", response: { data: { code: "IDEMPOTENCY_KEY_REUSED" } } })).toBe("key-reused");
    expect(getIdempotencyErrorKind(apiError(409, "OPERATION_IN_PROGRESS"))).toBe("in-progress");
    expect(getIdempotencyErrorKind(apiError(409, "RESERVATION_FUNDS_NOT_RELEASABLE"))).toBe("funds-not-releasable");
    expect(getIdempotencyErrorKind(new Error("Network Error"))).toBe("other");
  });
});

describe("createIdempotencyKeyStore", () => {
  it("garde la même clé pour le même contenu et en génère une nouvelle si le contenu change ou après reset", () => {
    const store = createIdempotencyKeyStore(sequentialKeys());
    expect(store.keyFor({ amount: 100 })).toBe("key-1");
    expect(store.keyFor({ amount: 100 })).toBe("key-1");
    expect(store.keyFor({ amount: 200 })).toBe("key-2");
    store.reset();
    expect(store.keyFor({ amount: 200 })).toBe("key-3");
  });

  it("utilise crypto.randomUUID par défaut", () => {
    const spy = vi.spyOn(crypto, "randomUUID");
    const key = createIdempotencyKeyStore().keyFor({});
    expect(spy).toHaveBeenCalledOnce();
    expect(key).toMatch(/^[0-9a-f-]{36}$/);
    spy.mockRestore();
  });
});

describe("createIdempotentSubmitter", () => {
  it("ignore un second envoi pendant que le premier est en cours (double-clic)", async () => {
    let resolve!: (v: string) => void;
    const send = vi.fn(() => new Promise<string>((r) => (resolve = r)));
    const submitter = createIdempotentSubmitter({ send, generateKey: sequentialKeys() });

    const first = submitter.submit({ amount: 1 });
    expect(submitter.isSubmitting()).toBe(true);
    await expect(submitter.submit({ amount: 1 })).resolves.toEqual({ status: "ignored" });
    resolve("ok");
    await expect(first).resolves.toEqual({ status: "success", data: "ok" });
    expect(send).toHaveBeenCalledOnce();
    expect(submitter.isSubmitting()).toBe(false);
  });

  it("réutilise la clé après une erreur réseau, un 5xx ou un 409 OPERATION_IN_PROGRESS", async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(new Error("timeout of 30000ms exceeded"))
      .mockRejectedValueOnce(apiError(503, "SERVICE_UNAVAILABLE"))
      .mockRejectedValueOnce(apiError(409, "OPERATION_IN_PROGRESS"))
      .mockResolvedValueOnce("ok");
    const submitter = createIdempotentSubmitter({ send, generateKey: sequentialKeys() });

    for (let i = 0; i < 4; i++) await submitter.submit({ amount: 1 });
    expect(send.mock.calls.map((c) => c[1])).toEqual(["key-1", "key-1", "key-1", "key-1"]);
  });

  it("génère une nouvelle clé après un succès", async () => {
    const send = vi.fn().mockResolvedValue("ok");
    const submitter = createIdempotentSubmitter({ send, generateKey: sequentialKeys() });
    await submitter.submit({ amount: 1 });
    await submitter.submit({ amount: 1 });
    expect(send.mock.calls.map((c) => c[1])).toEqual(["key-1", "key-2"]);
  });

  it("génère une nouvelle clé si le contenu change après une erreur", async () => {
    const send = vi.fn().mockRejectedValueOnce(apiError(500, "X")).mockResolvedValueOnce("ok");
    const submitter = createIdempotentSubmitter({ send, generateKey: sequentialKeys() });
    await submitter.submit({ amount: 1 });
    await submitter.submit({ amount: 2 });
    expect(send.mock.calls.map((c) => c[1])).toEqual(["key-1", "key-2"]);
  });

  it("409 IDEMPOTENCY_KEY_REUSED : nouvelle clé au prochain envoi, même contenu", async () => {
    const send = vi.fn().mockRejectedValueOnce(apiError(409, "IDEMPOTENCY_KEY_REUSED")).mockResolvedValueOnce("ok");
    const submitter = createIdempotentSubmitter({ send, generateKey: sequentialKeys() });
    const result = await submitter.submit({ amount: 1 });
    expect(result).toMatchObject({ status: "error", kind: "key-reused" });
    await submitter.submit({ amount: 1 });
    expect(send.mock.calls.map((c) => c[1])).toEqual(["key-1", "key-2"]);
  });

  it("400 IDEMPOTENCY_KEY_REQUIRED : signalé comme bug client", async () => {
    const onKeyRequired = vi.fn();
    const error = apiError(400, "IDEMPOTENCY_KEY_REQUIRED");
    const submitter = createIdempotentSubmitter({ send: vi.fn().mockRejectedValue(error), onKeyRequired });
    await expect(submitter.submit({})).resolves.toMatchObject({ status: "error", kind: "key-required" });
    expect(onKeyRequired).toHaveBeenCalledWith(error);
  });
});
