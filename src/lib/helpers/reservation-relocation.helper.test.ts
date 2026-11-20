import { describe, expect, it, vi } from "vitest";
import {
  canShowRelocationButton,
  createRelocationConfirmation,
  excludeCurrentResidence,
  formatFcfa,
  getRelocationErrorFeedback,
  isDifferentInstant,
  toIsoDay,
} from "./reservation-relocation.helper";
import { RelocationMotif, type RelocationRequestBody, type RelocationResult } from "@/types/reservation-relocation.types";

const NOW = new Date("2026-11-20T10:00:00Z");
const FUTURE = "2026-11-25T14:00:00.000Z";
const PAST = "2026-11-19T14:00:00.000Z";

/** HttpError telle que produite par `toHttpError` (statut, code et data du back, corps axios conservé). */
const apiError = (statusCode: number, code: string, message: string, data?: unknown) => ({
  statusCode,
  code,
  message,
  data,
  response: { status: statusCode, data: { statusCode, code, message, data } },
});

const networkError = () => ({ statusCode: 500, message: "Network Error", code: "ERR_NETWORK" as string | undefined });

const sequentialKeys = () => {
  let n = 0;
  return () => `key-${++n}`;
};

const payload = (overrides: Partial<RelocationRequestBody> = {}): RelocationRequestBody => ({
  residenceId: "res-b",
  motif: RelocationMotif.ProprietaireAnnule,
  note: "Coupure d'eau",
  forcerRegles: false,
  ...overrides,
});

const result = { changeId: "chg-1", replayed: false, nouvelleResidence: { nom: "Villa B" } } as unknown as RelocationResult;

describe("canShowRelocationButton", () => {
  it("affiche le bouton pour un Admin, un statut relogeable et un séjour à venir", () => {
    for (const statusReservation of ["valide", "en_attente_paiement_client", "confirmee_paiement_arrivee"]) {
      expect(canShowRelocationButton({ statusReservation, dateDebut: FUTURE }, { isAdmin: true, now: NOW })).toBe(true);
    }
  });

  it("masque le bouton hors des statuts éligibles", () => {
    for (const statusReservation of [
      "en_cours",
      "terminee",
      "rejete",
      "en_attente_reponse_proprietaire",
      "client_annule_reservation",
      "proprietaire_annule_reservation",
      null,
      undefined,
    ]) {
      expect(canShowRelocationButton({ statusReservation, dateDebut: FUTURE }, { isAdmin: true, now: NOW })).toBe(false);
    }
  });

  it("masque le bouton si le séjour a commencé, sans date de début, ou pour un non-Admin", () => {
    expect(canShowRelocationButton({ statusReservation: "valide", dateDebut: PAST }, { isAdmin: true, now: NOW })).toBe(false);
    expect(canShowRelocationButton({ statusReservation: "valide", dateDebut: NOW.toISOString() }, { isAdmin: true, now: NOW })).toBe(false);
    expect(canShowRelocationButton({ statusReservation: "valide", dateDebut: null }, { isAdmin: true, now: NOW })).toBe(false);
    expect(canShowRelocationButton({ statusReservation: "valide", dateDebut: FUTURE }, { isAdmin: false, now: NOW })).toBe(false);
    expect(canShowRelocationButton(undefined, { isAdmin: true, now: NOW })).toBe(false);
  });
});

describe("excludeCurrentResidence", () => {
  it("ne propose jamais la résidence actuelle", () => {
    const items = [{ id: "res-a" }, { id: "res-b" }];
    expect(excludeCurrentResidence(items, "res-a")).toEqual([{ id: "res-b" }]);
    expect(excludeCurrentResidence(items, null)).toEqual(items);
  });
});

describe("formatage", () => {
  it("formate les montants en FCFA avec séparateur de milliers", () => {
    expect(formatFcfa(102000).replace(/\s/g, " ")).toBe("102 000 FCFA");
  });

  it("compare des instants et normalise les jours", () => {
    expect(isDifferentInstant("2026-11-25T14:00:00.000Z", "2026-11-25T14:00:00Z")).toBe(false);
    expect(isDifferentInstant("2026-11-25T14:00:00.000Z", "2026-11-25T12:00:00.000Z")).toBe(true);
    expect(toIsoDay("2026-11-25T00:00:00.000Z")).toBe("2026-11-25");
    expect(toIsoDay("2026-11-26")).toBe("2026-11-26");
  });
});

describe("getRelocationErrorFeedback", () => {
  it("STAY_DATES_NOT_BOOKABLE : liste les règles violées et propose de les ignorer", () => {
    const feedback = getRelocationErrorFeedback(
      apiError(400, "STAY_DATES_NOT_BOOKABLE", "Séjour trop court", {
        violations: [
          { code: "MIN_NIGHTS", message: "Séjour trop court" },
          { code: "ADVANCE_NOTICE", message: "Préavis non respecté" },
        ],
      }),
    );
    expect(feedback.action).toBe("suggest-force");
    expect(feedback.message).toBe("Séjour trop court");
    expect(feedback.details).toEqual(["Séjour trop court", "Préavis non respecté"]);
    expect(feedback.hint).toMatch(/Ignorer les règles/);
  });

  it("STAY_DATES_NOT_BOOKABLE : lit aussi une HttpError sans corps axios", () => {
    const httpError: Partial<ReturnType<typeof apiError>> = apiError(400, "STAY_DATES_NOT_BOOKABLE", "Séjour trop court", {
      violations: [{ code: "MIN_NIGHTS", message: "Séjour trop court" }],
    });
    delete httpError.response;
    const feedback = getRelocationErrorFeedback(httpError);
    expect(feedback.message).toBe("Séjour trop court");
    expect(feedback.details).toEqual(["Séjour trop court"]);
  });

  it("RESIDENCE_UNAVAILABLE : nuits en conflit au format AAAA-MM-JJ et retour à l'étape 1", () => {
    const feedback = getRelocationErrorFeedback(
      apiError(409, "RESIDENCE_UNAVAILABLE", "Résidence indisponible à ces dates", {
        datesEnConflit: ["2026-11-25", "2026-11-26T00:00:00.000Z"],
      }),
    );
    expect(feedback.action).toBe("back-to-step-1");
    expect(feedback.message).toBe("Résidence indisponible à ces dates");
    expect(feedback.hint).toBe("Résidence prise ces nuits-là :");
    expect(feedback.details).toEqual(["2026-11-25", "2026-11-26"]);
  });

  it("associe chaque code métier à la bonne réaction", () => {
    const actionOf = (status: number, code: string) => getRelocationErrorFeedback(apiError(status, code, "msg")).action;
    expect(actionOf(409, "RESIDENCE_NOT_BOOKABLE")).toBe("back-to-step-1");
    expect(actionOf(409, "RELOCATION_SAME_RESIDENCE")).toBe("back-to-step-1");
    expect(actionOf(409, "RELOCATION_TOO_LATE")).toBe("close");
    expect(actionOf(409, "RELOCATION_NOT_ALLOWED_STATUS")).toBe("close-reload");
    expect(actionOf(409, "PROTECTION_ALREADY_RESOLVED")).toBe("stay");
    expect(actionOf(409, "PAYMENT_IN_PROGRESS")).toBe("stay");
    expect(actionOf(409, "RELOCATION_FUNDS_UNAVAILABLE")).toBe("stay");
    expect(actionOf(409, "IDEMPOTENCY_KEY_REUSED")).toBe("renew-key");
    expect(actionOf(403, "ADMIN_ROLE_REQUIRED")).toBe("hide");
  });

  it("erreur réseau : message générique, on reste sur l'étape", () => {
    const feedback = getRelocationErrorFeedback({ ...networkError(), code: undefined });
    expect(feedback.action).toBe("stay");
    expect(feedback.message).toMatch(/réseau/);
  });
});

describe("createRelocationConfirmation", () => {
  it("réutilise la même Idempotency-Key lors d'une nouvelle tentative (erreur réseau, timeout)", async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce({ ...networkError(), code: undefined })
      .mockRejectedValueOnce(apiError(504, "", "Gateway Timeout"))
      .mockResolvedValueOnce(result);
    const confirmation = createRelocationConfirmation({ send, generateKey: sequentialKeys() });

    expect(confirmation.open(payload())).toBe("key-1");
    expect((await confirmation.confirm()).status).toBe("error");
    expect((await confirmation.confirm()).status).toBe("error");
    expect((await confirmation.confirm()).status).toBe("success");

    expect(send).toHaveBeenCalledTimes(3);
    expect(send.mock.calls.map(([, key]) => key)).toEqual(["key-1", "key-1", "key-1"]);
    expect(send.mock.calls[0][0]).toEqual(payload());
  });

  it("ignore un double clic pendant l'appel", async () => {
    let resolve!: (value: RelocationResult) => void;
    const send = vi.fn(() => new Promise<RelocationResult>((r) => (resolve = r)));
    const confirmation = createRelocationConfirmation({ send, generateKey: sequentialKeys() });
    confirmation.open(payload());

    const first = confirmation.confirm();
    expect(confirmation.isSubmitting()).toBe(true);
    expect(await confirmation.confirm()).toEqual({ status: "ignored" });
    resolve(result);
    expect((await first).status).toBe("success");
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("garde la clé si l'étape 3 est rouverte sans changement, en génère une nouvelle si la résidence change", () => {
    const confirmation = createRelocationConfirmation({ send: vi.fn(), generateKey: sequentialKeys() });
    expect(confirmation.open(payload())).toBe("key-1");
    expect(confirmation.open(payload())).toBe("key-1");
    expect(confirmation.open(payload({ residenceId: "res-c" }))).toBe("key-2");
  });

  it("traite `replayed: true` comme un succès et renouvelle la clé ensuite", async () => {
    const send = vi.fn().mockResolvedValue({ ...result, replayed: true });
    const confirmation = createRelocationConfirmation({ send, generateKey: sequentialKeys() });
    confirmation.open(payload());
    const outcome = await confirmation.confirm();
    expect(outcome).toMatchObject({ status: "success", data: { replayed: true } });
    expect(confirmation.currentKey()).toBeNull();
    expect(confirmation.open(payload())).toBe("key-2");
  });

  it("IDEMPOTENCY_KEY_REUSED : nouvelle clé, la confirmation suivante l'utilise", async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(apiError(409, "IDEMPOTENCY_KEY_REUSED", "Clé déjà utilisée"))
      .mockResolvedValueOnce(result);
    const confirmation = createRelocationConfirmation({ send, generateKey: sequentialKeys() });
    confirmation.open(payload());

    const first = await confirmation.confirm();
    expect(first).toMatchObject({ status: "error", feedback: { action: "renew-key" } });
    expect(confirmation.currentKey()).toBe("key-2");
    await confirmation.confirm();
    expect(send.mock.calls.map(([, key]) => key)).toEqual(["key-1", "key-2"]);
  });

  it("garde la clé après un refus métier (ex. PAYMENT_IN_PROGRESS) et ne fait rien avant l'ouverture", async () => {
    const send = vi.fn().mockRejectedValue(apiError(409, "PAYMENT_IN_PROGRESS", "Paiement en cours"));
    const confirmation = createRelocationConfirmation({ send, generateKey: sequentialKeys() });
    expect(await confirmation.confirm()).toEqual({ status: "ignored" });
    confirmation.open(payload());
    await confirmation.confirm();
    expect(confirmation.currentKey()).toBe("key-1");
  });

  it("signale IDEMPOTENCY_KEY_REQUIRED comme un bug client", async () => {
    const onKeyRequired = vi.fn();
    const send = vi.fn().mockRejectedValue(apiError(400, "IDEMPOTENCY_KEY_REQUIRED", "Clé requise"));
    const confirmation = createRelocationConfirmation({ send, generateKey: sequentialKeys(), onKeyRequired });
    confirmation.open(payload());
    await confirmation.confirm();
    expect(onKeyRequired).toHaveBeenCalledTimes(1);
  });
});
