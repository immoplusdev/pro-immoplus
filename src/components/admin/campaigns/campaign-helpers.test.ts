import { describe, expect, it } from "vitest";
import {
  computeCampaignProgress,
  getHttpStatus,
  isPushTemplateBlocked,
  isTemplateRelatedMessage,
  shouldPollCampaign,
  templateEditPath,
} from "./campaign-helpers";
import { CampaignCanal, CampaignStatut, TemplateApprovalStatus } from "@/types/campaigns.types";

describe("computeCampaignProgress", () => {
  it("campagne push terminée : envoyés + échecs + sans appareil = audience", () => {
    const p = computeCampaignProgress({ envoyes: 60, echecs: 10, sansAppareil: 30, enAttente: 0 }, CampaignCanal.Push);
    expect(p.traites).toBe(100);
    expect(p.total).toBe(100);
    expect(p.percent).toBe(100);
    expect(p.showSansAppareil).toBe(true);
  });

  it("le taux de réussite exclut les sans appareil", () => {
    const p = computeCampaignProgress({ envoyes: 60, echecs: 20, sansAppareil: 900, enAttente: 0 }, CampaignCanal.Push);
    expect(p.tauxReussite).toBe(75);
  });

  it("compte les sans appareil dans la progression", () => {
    const p = computeCampaignProgress({ envoyes: 10, echecs: 0, sansAppareil: 40, enAttente: 50 }, CampaignCanal.Push);
    expect(p.percent).toBe(50);
  });

  it("n'affiche pas 100 % tant qu'il reste des messages en attente", () => {
    const p = computeCampaignProgress({ envoyes: 999, echecs: 0, sansAppareil: 0, enAttente: 1 }, CampaignCanal.Push);
    expect(p.percent).toBe(99);
  });

  it("champ sansAppareil absent : traité comme 0", () => {
    const p = computeCampaignProgress({ envoyes: 5, echecs: 5, enAttente: 0 }, CampaignCanal.Push);
    expect(p.sansAppareil).toBe(0);
    expect(p.traites).toBe(10);
  });

  it("WhatsApp : jamais de sans appareil", () => {
    const p = computeCampaignProgress({ envoyes: 8, echecs: 2, sansAppareil: 3, enAttente: 0 }, CampaignCanal.Whatsapp);
    expect(p.showSansAppareil).toBe(false);
    expect(p.sansAppareil).toBe(0);
    expect(p.total).toBe(10);
    expect(p.tauxReussite).toBe(80);
  });

  it("canal inconnu : affiché seulement s'il y en a", () => {
    expect(computeCampaignProgress({ envoyes: 1, echecs: 0, sansAppareil: 0, enAttente: 0 }).showSansAppareil).toBe(false);
    expect(computeCampaignProgress({ envoyes: 1, echecs: 0, sansAppareil: 2, enAttente: 0 }).showSansAppareil).toBe(true);
  });

  it("rien de tenté : pas de taux, 0 %", () => {
    const p = computeCampaignProgress({ envoyes: 0, echecs: 0, sansAppareil: 0, enAttente: 0 }, CampaignCanal.Push);
    expect(p.tauxReussite).toBeNull();
    expect(p.percent).toBe(0);
  });
});

describe("shouldPollCampaign", () => {
  it("continue tant que des messages sont en attente", () => {
    expect(shouldPollCampaign({ statut: CampaignStatut.EnCours, enAttente: 3 })).toBe(true);
    expect(shouldPollCampaign({ statut: CampaignStatut.Terminee, enAttente: 2 })).toBe(true);
  });

  it("s'arrête quand l'envoi est fini", () => {
    expect(shouldPollCampaign({ statut: CampaignStatut.Terminee, enAttente: 0 })).toBe(false);
    expect(shouldPollCampaign({ statut: CampaignStatut.Brouillon, enAttente: 0 })).toBe(false);
    expect(shouldPollCampaign(undefined)).toBe(false);
  });
});

describe("isPushTemplateBlocked", () => {
  it("bloque un modèle push rejected", () => {
    expect(isPushTemplateBlocked({ statutApprobation: TemplateApprovalStatus.Rejected }, CampaignCanal.Push)).toBe(true);
  });

  it("laisse passer un modèle approved, ou un modèle WhatsApp", () => {
    expect(isPushTemplateBlocked({ statutApprobation: TemplateApprovalStatus.Approved }, CampaignCanal.Push)).toBe(false);
    expect(isPushTemplateBlocked({ statutApprobation: TemplateApprovalStatus.Rejected }, CampaignCanal.Whatsapp)).toBe(false);
    expect(isPushTemplateBlocked({}, CampaignCanal.Push)).toBe(false);
  });
});

describe("isTemplateRelatedMessage", () => {
  it("reconnaît les 409 liés au modèle", () => {
    expect(isTemplateRelatedMessage('Le modèle push "Relance" doit avoir un titre et un texte avant envoi')).toBe(true);
    expect(isTemplateRelatedMessage('Le modèle push "Relance" doit être réécrit avant envoi (statut: rejected)')).toBe(true);
  });

  it("ignore les autres refus", () => {
    expect(isTemplateRelatedMessage("Campagne déjà envoyée (statut: terminee)")).toBe(false);
    expect(isTemplateRelatedMessage(undefined)).toBe(false);
  });
});

describe("getHttpStatus / templateEditPath", () => {
  it("lit le statut depuis axios ou refine", () => {
    expect(getHttpStatus({ response: { status: 409 } })).toBe(409);
    expect(getHttpStatus({ statusCode: 409 })).toBe(409);
    expect(getHttpStatus(null)).toBeUndefined();
  });

  it("construit le lien d'édition", () => {
    expect(templateEditPath("abc")).toBe("/admin/campaign-templates?edit=abc");
    expect(templateEditPath()).toBe("/admin/campaign-templates");
  });
});
