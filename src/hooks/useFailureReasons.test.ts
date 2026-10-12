import { describe, expect, it } from "vitest";
import { buildFailureReasonParams } from "./useFailureReasons";

describe("buildFailureReasonParams", () => {
  it("n'envoie aucun param vide", () => {
    expect(buildFailureReasonParams({ actor: undefined, reasonCode: "  ", dateDebut: "" })).toEqual({});
  });

  it("transmet les filtres renseignés", () => {
    expect(
      buildFailureReasonParams({
        actor: "PRO",
        status: "proprietaire_sans_reponse",
        reasonCode: "AUTRE",
        dateDebut: "2026-09-01",
        dateFin: "2026-09-30",
        page: 2,
        limit: 500,
      })
    ).toEqual({
      actor: "PRO",
      status: "proprietaire_sans_reponse",
      reasonCode: "AUTRE",
      dateDebut: "2026-09-01",
      dateFin: "2026-09-30",
      page: 2,
      limit: 500,
    });
  });
});
