import { describe, expect, it } from "vitest";
import { canDelete, canToggleStatus, getDeleteDecision, inUseMessage } from "./rules";

describe("motif système (AUTRE)", () => {
  const autre = { isSystem: true, isActive: true, usageCount: 0 };

  it("n'est ni désactivable ni supprimable", () => {
    expect(canToggleStatus(autre)).toBe(false);
    expect(canDelete(autre)).toBe(false);
    expect(getDeleteDecision(autre)).toEqual({ kind: "locked" });
    expect(getDeleteDecision({ ...autre, usageCount: 12 })).toEqual({ kind: "locked" });
  });

  it("un motif standard l'est", () => {
    expect(canToggleStatus({ isSystem: false })).toBe(true);
    expect(canDelete({ isSystem: false })).toBe(true);
  });
});

describe("suppression d'un motif", () => {
  it("utilisé : propose la désactivation au lieu de la suppression", () => {
    expect(getDeleteDecision({ isSystem: false, isActive: true, usageCount: 3 })).toEqual({
      kind: "deactivate-instead",
      usageCount: 3,
      alreadyInactive: false,
    });
    expect(inUseMessage(3)).toBe(
      "Ce motif a été utilisé 3 fois : il ne peut pas être supprimé. Le désactiver à la place ?"
    );
  });

  it("utilisé et déjà inactif : rien à désactiver", () => {
    expect(getDeleteDecision({ isSystem: false, isActive: false, usageCount: 1 })).toMatchObject({
      kind: "deactivate-instead",
      alreadyInactive: true,
    });
  });

  it("jamais utilisé : confirmation puis suppression", () => {
    expect(getDeleteDecision({ isSystem: false, isActive: true, usageCount: 0 })).toEqual({ kind: "confirm-delete" });
  });
});
