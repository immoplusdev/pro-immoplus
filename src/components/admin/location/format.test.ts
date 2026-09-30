import { describe, expect, it } from "vitest";
import { locationEntityPath } from "./format";

describe("locationEntityPath", () => {
  it("pointe vers la fiche réservation pour création et acceptation", () => {
    expect(locationEntityPath("CREATION_RESERVATION", "r1")).toBe("/reservations/edit/r1");
    expect(locationEntityPath("ACCEPTATION_RESERVATION", "r1")).toBe("/reservations/edit/r1");
  });

  it("pointe vers le détail de la demande de retrait pour le retrait coffre", () => {
    expect(locationEntityPath("RETRAIT_COFFRE", "w1")).toBe("/withdrawal-requests/show/w1");
  });

  it("renvoie null pour une action inconnue", () => {
    expect(locationEntityPath("AUTRE", "x")).toBeNull();
  });
});
