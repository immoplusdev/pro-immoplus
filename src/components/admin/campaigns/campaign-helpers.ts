import {
  CampaignCanal,
  CampaignStatut,
  TemplateApprovalStatus,
  TemplateProvider,
} from "@/types/campaigns.types";
import type { CampaignStatus, CampaignTemplate } from "@/types/campaigns.types";

export const SANS_APPAREIL_TOOLTIP =
  "Utilisateurs sans appli à jour ou sans notifications activées au moment de l'envoi.";

export const PUSH_AUDIENCE_HINT =
  "Seuls les utilisateurs joignables par notification (appli à jour) sont comptés.";

/** Intervalle de rafraîchissement du suivi d'une campagne. */
export const CAMPAIGN_POLL_INTERVAL_MS = 4000;

export interface CampaignProgress {
  envoyes: number;
  echecs: number;
  sansAppareil: number;
  enAttente: number;
  /** envoyes + echecs + sansAppareil */
  traites: number;
  /** traites + enAttente (= audience une fois l'envoi lancé) */
  total: number;
  /** 0 à 100 */
  percent: number;
  /** envoyes / (envoyes + echecs), en %, sans les « sans appareil » ; null s'il n'y a rien à mesurer */
  tauxReussite: number | null;
  /** faux en WhatsApp ; canal inconnu : affiché seulement s'il y a des « sans appareil » */
  showSansAppareil: boolean;
}

const count = (n: number | null | undefined) => (typeof n === "number" && Number.isFinite(n) ? n : 0);

export function computeCampaignProgress(
  status: Pick<CampaignStatus, "envoyes" | "echecs" | "enAttente" | "sansAppareil">,
  canal?: CampaignCanal
): CampaignProgress {
  const envoyes = count(status.envoyes);
  const echecs = count(status.echecs);
  const enAttente = count(status.enAttente);
  const sansAppareil = canal === CampaignCanal.Whatsapp ? 0 : count(status.sansAppareil);

  const traites = envoyes + echecs + sansAppareil;
  const total = traites + enAttente;
  const percent = total > 0 ? Math.floor((traites / total) * 100) : 0;
  const tentes = envoyes + echecs;
  const tauxReussite = tentes > 0 ? Math.round((envoyes / tentes) * 1000) / 10 : null;

  const showSansAppareil =
    canal === CampaignCanal.Push || (canal === undefined && sansAppareil > 0);

  return { envoyes, echecs, sansAppareil, enAttente, traites, total, percent, tauxReussite, showSansAppareil };
}

/**
 * Continue de rafraîchir tant que l'envoi n'est pas fini. Les nouvelles tentatives FCM
 * (jusqu'à 3, attente de 5 s doublée à chaque essai) peuvent ralentir la fin d'envoi :
 * on ne s'arrête donc pas sur une durée, seulement quand plus rien n'est en attente.
 */
export function shouldPollCampaign(status: Pick<CampaignStatus, "statut" | "enAttente"> | undefined): boolean {
  if (!status) return false;
  return status.statut === CampaignStatut.EnCours || count(status.enAttente) > 0;
}

/** Un modèle push non approuvé (ex. ancien modèle sans titre) est refusé à l'envoi. */
export function isPushTemplateBlocked(
  template: Pick<CampaignTemplate, "statutApprobation">,
  canal: CampaignCanal | undefined
): boolean {
  return (
    canal === CampaignCanal.Push &&
    !!template.statutApprobation &&
    template.statutApprobation !== TemplateApprovalStatus.Approved
  );
}

/** Les modèles push ImmoPlus sont modifiables dans l'admin ; Twilio (WhatsApp) non. */
export function isTemplateEditable(template: Pick<CampaignTemplate, "provider">): boolean {
  return template.provider === TemplateProvider.ImmoPlus;
}

export function getHttpStatus(err: unknown): number | undefined {
  const e = err as { statusCode?: number; response?: { status?: number } } | null | undefined;
  return e?.response?.status ?? e?.statusCode;
}

/**
 * Vrai si le refus d'envoi vient du modèle (« Le modèle push "X" doit être réécrit… »,
 * « …doit avoir un titre et un texte… », « La variable … du modèle … »).
 */
export function isTemplateRelatedMessage(message: string | undefined): boolean {
  return !!message && /\bmod[eè]le\b/i.test(message);
}

/** Lien vers l'édition d'un modèle push depuis n'importe quel écran. */
export function templateEditPath(templateId?: string): string {
  return templateId ? `/admin/campaign-templates?edit=${encodeURIComponent(templateId)}` : "/admin/campaign-templates";
}
