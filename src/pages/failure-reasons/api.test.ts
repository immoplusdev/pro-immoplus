import { describe, expect, it } from "vitest";
import {
  buildReorderPayload,
  errorNotification,
  getFailureReasonErrorCode,
  getFormFieldErrors,
  getUsageCountFromError,
  moveFailureReason,
  normalizeCodeInput,
  toCreatePayload,
  toUpdatePayload,
} from "./api";
import type { FailureReason } from "./types";

const reason = (id: string, overrides: Partial<FailureReason> = {}): FailureReason => ({
  id,
  actor: "CLIENT",
  code: id.toUpperCase(),
  label: `Motif ${id}`,
  displayOrder: 1,
  isActive: true,
  isSystem: false,
  usageCount: 0,
  createdAt: "2026-10-01T10:00:00.000Z",
  updatedAt: "2026-10-01T10:00:00.000Z",
  ...overrides,
});

describe("réordonnancement", () => {
  const items = [
    reason("a", { displayOrder: 1 }),
    reason("b", { displayOrder: 2, isActive: false }),
    reason("c", { displayOrder: 3 }),
    reason("autre", { displayOrder: 4, isSystem: true }),
  ];

  it("envoie tous les ids de l'acteur, inactifs compris, dans le nouvel ordre", () => {
    const next = moveFailureReason(items, "c", "a");
    expect(buildReorderPayload("CLIENT", next)).toEqual({ actor: "CLIENT", ids: ["c", "a", "b", "autre"] });
  });

  it("renumérote displayOrder de 1 à n", () => {
    expect(moveFailureReason(items, "a", "autre").map((r) => [r.id, r.displayOrder])).toEqual([
      ["b", 1],
      ["c", 2],
      ["autre", 3],
      ["a", 4],
    ]);
  });

  it("ne duplique jamais un id", () => {
    expect(buildReorderPayload("PRO", [items[0], items[0], items[1]]).ids).toEqual(["a", "b"]);
  });
});

describe("toUpdatePayload (PATCH /:id)", () => {
  it("n'envoie jamais code, actor ni les champs en lecture seule", () => {
    const record = reason("a", { usageCount: 3 });
    const payload = toUpdatePayload({ ...record, label: "  Nouveau libellé  " } as never, record);

    expect(payload).toEqual({ label: "Nouveau libellé", displayOrder: 1, isActive: true });
    for (const key of ["code", "actor", "id", "createdAt", "updatedAt", "usageCount", "isSystem"]) {
      expect(payload).not.toHaveProperty(key);
    }
  });

  it("n'envoie pas isActive pour le motif système", () => {
    expect(toUpdatePayload({ label: "Autre", isActive: false }, { isSystem: true })).toEqual({ label: "Autre" });
  });

  it("omet un ordre vide", () => {
    expect(toUpdatePayload({ label: "x", displayOrder: null })).toEqual({ label: "x" });
  });
});

describe("toCreatePayload (POST)", () => {
  it("normalise le code, trim le libellé, actif par défaut, ordre absent si vide", () => {
    expect(toCreatePayload({ code: "budget trop-bas", label: "  Budget  " }, "PRO")).toEqual({
      actor: "PRO",
      code: "BUDGET_TROP_BAS",
      label: "Budget",
      isActive: true,
    });
  });

  it("transmet l'ordre et le statut saisis", () => {
    expect(toCreatePayload({ actor: "CLIENT", code: "X", label: "x", displayOrder: 2, isActive: false }, "PRO")).toEqual({
      actor: "CLIENT",
      code: "X",
      label: "x",
      displayOrder: 2,
      isActive: false,
    });
  });

  it("normalizeCodeInput : majuscules, espaces et tirets -> _", () => {
    expect(normalizeCodeInput("hors-zone ok 2")).toBe("HORS_ZONE_OK_2");
    expect(normalizeCodeInput(undefined)).toBe("");
  });
});

describe("erreurs métier", () => {
  const conflict = {
    statusCode: 409,
    message: "Ce code existe déjà pour cet acteur",
    code: "FAILURE_REASON_CODE_ALREADY_EXISTS",
  };

  it("un 409 CODE_ALREADY_EXISTS est affiché sous le champ code, sans notification", () => {
    expect(getFormFieldErrors(conflict)).toEqual([{ name: "code", errors: ["Ce code existe déjà pour cet acteur"] }]);
    const notify = errorNotification("Impossible d'ajouter le motif", (e) => !!getFormFieldErrors(e));
    expect(notify(conflict)).toBe(false);
  });

  it("les autres erreurs gardent une notification en français", () => {
    const notify = errorNotification("Impossible d'ajouter le motif", (e) => !!getFormFieldErrors(e));
    const error = { statusCode: 400, message: "label must be shorter", code: undefined };
    expect(getFormFieldErrors(error)).toBeUndefined();
    expect(notify(error)).toEqual({ type: "error", message: "Impossible d'ajouter le motif", description: "label must be shorter" });
  });

  it("lit usageCount d'un 409 IN_USE", () => {
    const error = { statusCode: 409, message: "…", code: "FAILURE_REASON_IN_USE", data: { usageCount: 7 } };
    expect(getFailureReasonErrorCode(error)).toBe("FAILURE_REASON_IN_USE");
    expect(getUsageCountFromError(error)).toBe(7);
  });

  it("retombe sur le corps axios si le code n'est pas au premier niveau", () => {
    expect(getFailureReasonErrorCode({ response: { data: { code: "FAILURE_REASON_INVALID_ORDER" } } })).toBe(
      "FAILURE_REASON_INVALID_ORDER"
    );
  });
});
