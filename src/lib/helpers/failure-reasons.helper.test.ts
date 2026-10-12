import { describe, expect, it } from "vitest";
import {
  aggregateFailureStats,
  applyActorChange,
  applyReasonChange,
  applyStatusChange,
  buildFailureReasonsCsv,
  reasonOptionsFor,
  sanitizeFailureFilters,
  selectedReasonOption,
  statusOptionsFor,
} from "./failure-reasons.helper";
import { getReasonLabel, getStatusLabel, type FailureReasonItem } from "@/types/failure-reasons.types";

const item = (o: Partial<FailureReasonItem> = {}): FailureReasonItem => ({
  reservationId: "res-1",
  respondedBy: "user-1",
  actor: "CLIENT",
  status: "client_annule_reservation",
  reasonCode: "PRIX_TROP_ELEVE",
  comment: null,
  respondedAt: "2026-09-10T10:00:00.000Z",
  ...o,
});

describe("libellés (acteur, code)", () => {
  it("résout AUTRE selon l'acteur", () => {
    expect(getReasonLabel("CLIENT", "AUTRE")).toBe("Autre raison");
    expect(getReasonLabel("PRO", "AUTRE")).toBe("Autre raison");
  });

  it("ne mélange pas les référentiels", () => {
    expect(getReasonLabel("CLIENT", "PRIX_TROP_ELEVE")).toBe("Le prix était trop élevé");
    expect(getReasonLabel("PRO", "PRIX_TROP_ELEVE")).toBe("PRIX_TROP_ELEVE");
    expect(getReasonLabel("PRO", "DESACCORD_PRIX")).toBe("Désaccord sur le prix proposé");
  });

  it("replie sur le code brut (code, acteur ou statut inconnu, clé d'Object.prototype)", () => {
    expect(getReasonLabel("CLIENT", "NOUVEAU_CODE")).toBe("NOUVEAU_CODE");
    expect(getReasonLabel("ADMIN", "AUTRE")).toBe("AUTRE");
    expect(getReasonLabel("CLIENT", "toString")).toBe("toString");
    expect(getStatusLabel("rejete")).toBe("rejete");
    expect(getStatusLabel("client_sans_reponse")).toBe("Client sans réponse (non payée)");
  });
});

describe("filtres dépendants", () => {
  it("restreint statuts et motifs à l'acteur", () => {
    expect(statusOptionsFor("PRO").map((o) => o.value)).toEqual([
      "proprietaire_annule_reservation",
      "proprietaire_sans_reponse",
    ]);
    expect(statusOptionsFor()).toHaveLength(4);
    const clientReasons = reasonOptionsFor("CLIENT");
    expect(clientReasons.every((o) => o.value.startsWith("CLIENT:"))).toBe(true);
  });

  it("groupe les motifs Client / Pro quand l'acteur est Tous", () => {
    const groups = reasonOptionsFor();
    expect(groups.map((g) => g.label)).toEqual(["Client", "Pro"]);
  });

  it("choisir AUTRE fixe l'acteur", () => {
    expect(applyReasonChange({}, "PRO:AUTRE")).toEqual({ actor: "PRO", reasonCode: "AUTRE" });
  });

  it("un motif propre à un acteur ne fixe pas l'acteur quand Tous est choisi", () => {
    expect(applyReasonChange({}, "CLIENT:PRIX_TROP_ELEVE")).toEqual({ reasonCode: "PRIX_TROP_ELEVE" });
  });

  it("changer d'acteur retire statut et motif incompatibles, garde les compatibles", () => {
    const values = { actor: "CLIENT" as const, status: "client_sans_reponse" as const, reasonCode: "AUTRE" };
    expect(applyActorChange(values, "PRO")).toEqual({ actor: "PRO", status: undefined, reasonCode: "AUTRE" });
    expect(applyActorChange({ reasonCode: "PRIX_TROP_ELEVE" }, "PRO").reasonCode).toBeUndefined();
    expect(applyActorChange({ reasonCode: "PRIX_TROP_ELEVE" }, "CLIENT").reasonCode).toBe("PRIX_TROP_ELEVE");
  });

  it("repasser à Tous retire le statut et un motif ambigu", () => {
    expect(applyActorChange({ actor: "PRO", status: "proprietaire_sans_reponse", reasonCode: "AUTRE" }, undefined)).toEqual({
      actor: undefined,
      status: undefined,
      reasonCode: undefined,
    });
  });

  it("choisir un statut fixe l'acteur et retire un motif de l'autre côté", () => {
    expect(applyStatusChange({ reasonCode: "DESACCORD_PRIX" }, "client_annule_reservation")).toEqual({
      actor: "CLIENT",
      status: "client_annule_reservation",
      reasonCode: undefined,
    });
  });

  it("déduit l'option sélectionnée même sans acteur pour un code non ambigu", () => {
    expect(selectedReasonOption({ reasonCode: "TRAVAUX_MAINTENANCE" })).toBe("PRO:TRAVAUX_MAINTENANCE");
    expect(selectedReasonOption({ actor: "CLIENT", reasonCode: "AUTRE" })).toBe("CLIENT:AUTRE");
  });

  it("assainit les filtres d'URL", () => {
    expect(
      sanitizeFailureFilters({ actor: "PRO", status: "client_sans_reponse", reasonCode: "AUTRE", dateDebut: "2026-02-30" })
    ).toEqual({ actor: "CLIENT", status: "client_sans_reponse", reasonCode: "AUTRE", dateDebut: undefined, dateFin: undefined });
    expect(sanitizeFailureFilters({ reasonCode: "AUTRE" }).reasonCode).toBeUndefined();
    expect(sanitizeFailureFilters({ actor: "ADMIN", reasonCode: "INCONNU", dateFin: "2026-09-30" })).toEqual({
      actor: undefined,
      status: undefined,
      reasonCode: undefined,
      dateDebut: undefined,
      dateFin: "2026-09-30",
    });
  });
});

describe("aggregateFailureStats", () => {
  const items = [
    item(),
    item({ reasonCode: "AUTRE" }),
    item({ reasonCode: "PRIX_TROP_ELEVE", respondedAt: "2026-09-12T10:00:00.000Z" }),
    item({ actor: "PRO", status: "proprietaire_sans_reponse", reasonCode: "AUTRE", respondedAt: "2026-09-12T11:00:00.000Z" }),
  ];

  it("calcule KPI, répartitions triées et pourcentages", () => {
    const s = aggregateFailureStats(items);
    expect(s.total).toBe(4);
    expect(s.byActor).toEqual({ CLIENT: 3, PRO: 1 });
    expect(s.otherCount).toBe(2);
    expect(s.byReason.CLIENT[0]).toEqual({ key: "PRIX_TROP_ELEVE", label: "Le prix était trop élevé", count: 2, percent: 66.7 });
    expect(s.byReason.PRO).toEqual([{ key: "AUTRE", label: "Autre raison", count: 1, percent: 100 }]);
    expect(s.byStatus[0]).toMatchObject({ key: "client_annule_reservation", count: 3, percent: 75 });
  });

  it("utilise des buckets journaliers continus sous 31 jours", () => {
    const s = aggregateFailureStats(items, { dateDebut: "2026-09-10", dateFin: "2026-09-13" });
    expect(s.granularity).toBe("day");
    expect(s.timeline.map((b) => [b.key, b.count])).toEqual([
      ["2026-09-10", 2],
      ["2026-09-11", 0],
      ["2026-09-12", 2],
      ["2026-09-13", 0],
    ]);
  });

  it("passe à la semaine (lundi) à partir de 31 jours", () => {
    const s = aggregateFailureStats(items, { dateDebut: "2026-08-01", dateFin: "2026-09-30" });
    expect(s.granularity).toBe("week");
    expect(s.timeline[0].key).toBe("2026-07-27");
    expect(s.timeline.reduce((n, b) => n + b.count, 0)).toBe(4);
    expect(s.timeline.find((b) => b.key === "2026-09-07")?.count).toBe(4);
  });

  it("gère une liste vide", () => {
    const s = aggregateFailureStats([]);
    expect(s.total).toBe(0);
    expect(s.timeline).toEqual([]);
    expect(s.byStatus).toEqual([]);
  });
});

describe("buildFailureReasonsCsv", () => {
  it("écrit l'en-tête, les libellés et vide les champs absents", () => {
    const csv = buildFailureReasonsCsv([item({ reservationId: undefined, respondedBy: undefined, actor: "PRO", reasonCode: "AUTRE", status: "proprietaire_sans_reponse" })]);
    const lines = csv.slice(1).split("\r\n");
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(lines[0]).toBe("respondedAt,reservationId,respondedBy,actor,status,statusLabel,reasonCode,reasonLabel,comment");
    expect(lines[1]).toBe("2026-09-10T10:00:00.000Z,,,PRO,proprietaire_sans_reponse,Pro sans réponse,AUTRE,Autre raison,");
  });

  it("échappe guillemets, retours à la ligne, virgules et points-virgules du commentaire", () => {
    const lines = buildFailureReasonsCsv([item({ comment: 'Trop cher; vu "ailleurs",\nà revoir' })]).slice(1).split("\r\n");
    expect(lines.slice(1).join("\r\n")).toContain(',"Trop cher; vu ""ailleurs"",\nà revoir"');
  });

  it("neutralise une formule dans le commentaire", () => {
    const lines = buildFailureReasonsCsv([item({ comment: "=1+1" })]).slice(1).split("\r\n");
    expect(lines[1].endsWith(",'=1+1")).toBe(true);
  });
});
