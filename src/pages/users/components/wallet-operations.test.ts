import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { axiosInstance, IDEMPOTENCY_KEY_HEADER } from "@/lib/providers/utils/axios";
import { createIdempotentSubmitter } from "@/lib/helpers/idempotency.helper";
import {
  buildCreditPayload,
  buildReleaseFundsPayload,
  buildTransferPayload,
  getWalletErrorFeedback,
  postWalletAdminOperation,
  WalletReleaseFundsPayload,
} from "./wallet-operations";

/**
 * Reversement (WalletReleaseFundsForm) : même chaîne que l'écran — valeurs du formulaire ->
 * payload -> submitter idempotent (useIdempotentSubmit) -> axiosInstance -> API simulée.
 */
const API = "https://api.test";
const OWNER = "11111111-1111-4111-8111-111111111111";
const RESERVATION = "22222222-2222-4222-8222-222222222222";

type Reply = { status: number; data: unknown };
const originalAdapter = axiosInstance.defaults.adapter;
let sent: InternalAxiosRequestConfig[];
let replies: Reply[];

beforeEach(() => {
  sent = [];
  replies = [];
  const adapter: AxiosAdapter = async (config) => {
    sent.push(config);
    const reply = replies.shift() ?? { status: 200, data: { data: { availableBalance: 0 } } };
    const response = { ...reply, statusText: "", headers: {}, config };
    if (reply.status >= 400) {
      throw new AxiosError("Request failed", AxiosError.ERR_BAD_RESPONSE, config, null, response);
    }
    return response;
  };
  axiosInstance.defaults.adapter = adapter;
});

afterEach(() => {
  axiosInstance.defaults.adapter = originalAdapter;
});

const keysSent = () => sent.map((c) => AxiosHeaders.from(c.headers).get(IDEMPOTENCY_KEY_HEADER));

const releaseFundsScreen = () =>
  createIdempotentSubmitter<WalletReleaseFundsPayload, unknown>({
    send: (payload, key) => postWalletAdminOperation(API, "release-funds", payload, key, "token"),
  });

const formValues = (overrides = {}) => ({
  amount: 45000,
  currency: "XOF",
  source: "RESERVATION",
  sourceId: ` ${RESERVATION} `,
  note: "  Séjour terminé, reversement au pro  ",
  ...overrides,
});

describe("Reversement de fonds : corps et en-têtes", () => {
  it("envoie un corps conforme et l'en-tête Idempotency-Key", async () => {
    await releaseFundsScreen().submit(buildReleaseFundsPayload(OWNER, formValues()));

    expect(sent).toHaveLength(1);
    expect(sent[0].url).toBe(`${API}/wallet/admin/release-funds`);
    expect(JSON.parse(sent[0].data)).toEqual({
      ownerId: OWNER,
      amount: 45000,
      currency: "XOF",
      source: "RESERVATION",
      sourceId: RESERVATION,
      note: "Séjour terminé, reversement au pro",
    });
    const headers = AxiosHeaders.from(sent[0].headers);
    expect(headers.get(IDEMPOTENCY_KEY_HEADER)).toMatch(/^[0-9a-f-]{36}$/);
    expect(headers.get("Authorization")).toBe("Bearer token");
  });
});

describe("Reversement de fonds : cycle de vie de la clé", () => {
  it("deux clics rapides : une seule requête", async () => {
    const screen = releaseFundsScreen();
    const payload = buildReleaseFundsPayload(OWNER, formValues());
    const [a, b] = await Promise.all([screen.submit(payload), screen.submit(payload)]);
    expect([a.status, b.status].sort()).toEqual(["ignored", "success"]);
    expect(sent).toHaveLength(1);
  });

  it("nouveau clic après une erreur 5xx : même clé", async () => {
    replies = [{ status: 502, data: { message: "Bad Gateway" } }];
    const screen = releaseFundsScreen();
    const payload = buildReleaseFundsPayload(OWNER, formValues());
    expect((await screen.submit(payload)).status).toBe("error");
    expect((await screen.submit(payload)).status).toBe("success");
    const [first, retry] = keysSent();
    expect(retry).toBe(first);
  });

  it("nouvelle opération après un succès : nouvelle clé", async () => {
    const screen = releaseFundsScreen();
    await screen.submit(buildReleaseFundsPayload(OWNER, formValues()));
    await screen.submit(buildReleaseFundsPayload(OWNER, formValues()));
    const [first, second] = keysSent();
    expect(second).not.toBe(first);
  });

  it("montant modifié après une erreur : nouvelle clé", async () => {
    replies = [{ status: 409, data: { code: "RESERVATION_FUNDS_NOT_RELEASABLE", message: "..." } }];
    const screen = releaseFundsScreen();
    const result = await screen.submit(buildReleaseFundsPayload(OWNER, formValues()));
    expect(result).toMatchObject({ status: "error", kind: "funds-not-releasable" });
    await screen.submit(buildReleaseFundsPayload(OWNER, formValues({ amount: 40000 })));
    const [first, second] = keysSent();
    expect(second).not.toBe(first);
  });

  it("409 IDEMPOTENCY_KEY_REUSED : nouvelle clé à la reconfirmation", async () => {
    replies = [{ status: 409, data: { code: "IDEMPOTENCY_KEY_REUSED", message: "..." } }];
    const screen = releaseFundsScreen();
    const payload = buildReleaseFundsPayload(OWNER, formValues());
    expect(await screen.submit(payload)).toMatchObject({ kind: "key-reused" });
    await screen.submit(payload);
    const [first, second] = keysSent();
    expect(second).not.toBe(first);
  });

  it("409 OPERATION_IN_PROGRESS : on rafraîchit au lieu de renvoyer", async () => {
    replies = [{ status: 409, data: { code: "OPERATION_IN_PROGRESS", message: "..." } }];
    const result = await releaseFundsScreen().submit(buildReleaseFundsPayload(OWNER, formValues()));
    expect(result).toMatchObject({ status: "error", kind: "in-progress" });
    expect(getWalletErrorFeedback("in-progress")).toMatchObject({ refresh: true, level: "info" });
  });

  it("rejeu 2xx d'une clé déjà exécutée : traité comme un succès", async () => {
    replies = [{ status: 200, data: { data: { availableBalance: 45000 } } }];
    const result = await releaseFundsScreen().submit(buildReleaseFundsPayload(OWNER, formValues()));
    expect(result).toEqual({ status: "success", data: { data: { availableBalance: 45000 } } });
  });
});

describe("Autres corps wallet", () => {
  it("credit : sourceId, motif et date sérialisés", () => {
    expect(
      buildCreditPayload(OWNER, { ...formValues(), operator: "wave", refundDate: new Date("2026-01-02T03:04:05Z") }),
    ).toMatchObject({ ownerId: OWNER, sourceId: RESERVATION, note: "Séjour terminé, reversement au pro", operator: "wave", refundDate: "2026-01-02T03:04:05.000Z" });
  });

  it("transfer : fromOwnerId, toOwnerId, amount et motif obligatoire", () => {
    expect(buildTransferPayload(OWNER, { amount: 500, toOwnerId: ` ${RESERVATION}`, note: " motif ", currency: "XOF" })).toEqual({
      fromOwnerId: OWNER,
      toOwnerId: RESERVATION,
      amount: 500,
      currency: "XOF",
      note: "motif",
    });
  });
});
