/**
 * Module "Campagnes Push & WhatsApp" — types partagés avec l'API admin.
 *
 * Réplique les enums / DTO du backend (bases /admin/campaign-templates,
 * /admin/campaigns et /admin/campaign-tags). Toutes les routes exigent un
 * Bearer JWT admin (géré globalement par `axiosInstance`).
 */

/* ------------------------------------------------------------------ */
/* Enums                                                              */
/* ------------------------------------------------------------------ */

export enum CampaignCanal {
  Whatsapp = "whatsapp",
  Push = "push",
}

export enum CampaignCible {
  CustomerApp = "customer_app",
  ProApp = "pro_app",
}

export enum CampaignStatut {
  Brouillon = "brouillon",
  Planifiee = "planifiee",
  EnCours = "en_cours",
  Terminee = "terminee",
}

export enum TemplateApprovalStatus {
  Approved = "approved",
  Pending = "pending",
  Rejected = "rejected",
}

export enum TemplateProvider {
  Twilio = "twilio",
  Onesignal = "onesignal",
}

export enum TagPriorite {
  Indispensable = "indispensable",
  Recommande = "recommande",
  Optionnel = "optionnel",
}

export enum CampaignTagType {
  DbField = "db_field",
  Fixe = "fixe",
}

/** provider imposé par le canal (whatsapp⇔twilio, push⇔onesignal). */
export const PROVIDER_BY_CANAL: Record<CampaignCanal, TemplateProvider> = {
  [CampaignCanal.Whatsapp]: TemplateProvider.Twilio,
  [CampaignCanal.Push]: TemplateProvider.Onesignal,
};

/* ------------------------------------------------------------------ */
/* sourceField autorisés par cible (formulaire de tag "db_field")     */
/* ------------------------------------------------------------------ */

export const SOURCE_FIELDS_BY_CIBLE: Record<CampaignCible, string[]> = {
  [CampaignCible.CustomerApp]: [
    "prenom",
    "nom",
    "segmentFidelite",
    "scoreGlobal",
    "niveauRisque",
    "nombreReservationsTotal",
    "montantTotalDepenseFcfa",
    "joursDepuisDerniereReservation",
  ],
  [CampaignCible.ProApp]: [
    "prenom",
    "nom",
    "scoreCertification",
    "badgeCertification",
    "tauxAcceptation",
    "reservationsEffectuees",
    "caBrutFcfa",
    "delaiMedianMinutes",
  ],
};

/* ------------------------------------------------------------------ */
/* Filtre d'audience — clés fermées par cible                         */
/* ------------------------------------------------------------------ */

export const AUDIENCE_FILTER_KEYS_BY_CIBLE: Record<
  CampaignCible,
  { value: string; label: string }[]
> = {
  [CampaignCible.CustomerApp]: [
    { value: "segment", label: "Segment de fidélité" },
    { value: "niveauRisque", label: "Niveau de risque" },
  ],
  [CampaignCible.ProApp]: [
    { value: "statutCertification", label: "Statut de certification" },
    { value: "badgeCertification", label: "Badge de certification" },
  ],
};

/**
 * Valeurs suggérées pour chaque clé d'audience connue. Quand une clé n'a pas
 * de suggestion ici, l'UI retombe sur une saisie libre.
 */
export const AUDIENCE_FILTER_VALUE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  segment: [
    { value: "nouveau", label: "Nouveau" },
    { value: "occasionnel", label: "Occasionnel" },
    { value: "fidele", label: "Fidèle" },
    { value: "vip", label: "VIP" },
  ],
  niveauRisque: [
    { value: "normal", label: "Normal" },
    { value: "eleve", label: "Élevé" },
    { value: "critique", label: "Critique" },
  ],
  statutCertification: [
    { value: "en_progression", label: "En progression" },
    { value: "eligible", label: "Éligible" },
    { value: "certifie", label: "Certifié" },
    { value: "suspendu", label: "Suspendu" },
    { value: "retire", label: "Retiré" },
  ],
};

/* ------------------------------------------------------------------ */
/* Réponse paginée standard (seul `data` est peuplé ici)              */
/* ------------------------------------------------------------------ */

export interface PaginatedResponse<T> {
  data: T;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/* ------------------------------------------------------------------ */
/* Modèles                                                            */
/* ------------------------------------------------------------------ */

export interface CampaignTemplate {
  templateId: string;
  nom: string;
  /** positions déclarées par le template, ex ["1","2"] */
  variables: string[];
}

/** Vue lecture (peuplement du sélecteur de variables dans la création). */
export interface CampaignTag {
  /** avec accolades, ex "{{prenom}}" */
  tag: string;
  priorite: TagPriorite;
  type: CampaignTagType;
}

/** Vue gestion (CRUD) — différent de `CampaignTag`. */
export interface CampaignTagDetail {
  tagId: string;
  /** SANS accolades ici, ex "prenom" */
  tag: string;
  cible: CampaignCible;
  type: CampaignTagType;
  /** présent seulement si type=db_field */
  sourceField?: string | null;
  priorite: TagPriorite;
}

export interface Campaign {
  campagneId: string;
  canal: CampaignCanal;
  cible: CampaignCible;
  templateId: string;
  statut: CampaignStatut;
  /** count indicatif à la création, réel après /send */
  audience: number;
  planifieLe?: string | null;
}

export interface CampaignStatus {
  campagneId: string;
  statut: CampaignStatut;
  envoyes: number;
  echecs: number;
  enAttente: number;
}

export interface CampaignPreviewItem {
  clientId: string;
  apercuMessage: string;
}

export interface SyncResult {
  syncId: string;
  whatsapp: { nouveaux: number; total: number };
  push: { nouveaux: number; total: number };
}

/* ------------------------------------------------------------------ */
/* Payloads                                                           */
/* ------------------------------------------------------------------ */

export interface CreateCampaignPayload {
  canal: CampaignCanal;
  cible: CampaignCible;
  templateId: string;
  /** { "1": "{{prenom}}", ... } */
  mappingVariables: Record<string, string>;
  audience: { filtre: Record<string, string> };
  /** ISO date, optionnel */
  planifieLe?: string;
}

export interface SendCampaignPayload {
  variablesFixes?: Record<string, string>;
}

export interface PreviewCampaignPayload {
  variablesFixes?: Record<string, string>;
}

export interface CampaignTagPayload {
  /** sans accolades, regex ^\w+$ */
  tag: string;
  cible: CampaignCible;
  type: CampaignTagType;
  /** requis si type=db_field ; absent si type=fixe */
  sourceField?: string;
  priorite: TagPriorite;
}

/* ------------------------------------------------------------------ */
/* Registre local des campagnes créées (aucun endpoint de liste)      */
/* ------------------------------------------------------------------ */

/**
 * L'API n'expose pas de "GET /admin/campaigns" (liste). On mémorise donc
 * localement les campagnes créées depuis ce navigateur pour alimenter l'écran
 * de liste et retrouver le mapping (nécessaire à l'écran d'envoi pour
 * identifier les tags fixes).
 */
export interface CampaignRegistryEntry {
  campagneId: string;
  canal: CampaignCanal;
  cible: CampaignCible;
  templateId: string;
  templateNom: string;
  statut: CampaignStatut;
  audience: number;
  planifieLe?: string | null;
  mappingVariables: Record<string, string>;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Libellés / couleurs                                                */
/* ------------------------------------------------------------------ */

export const canalLabel: Record<CampaignCanal, string> = {
  [CampaignCanal.Whatsapp]: "WhatsApp",
  [CampaignCanal.Push]: "Push",
};

export const canalColor: Record<CampaignCanal, string> = {
  [CampaignCanal.Whatsapp]: "green",
  [CampaignCanal.Push]: "geekblue",
};

export const cibleLabel: Record<CampaignCible, string> = {
  [CampaignCible.CustomerApp]: "Application client",
  [CampaignCible.ProApp]: "Application pro",
};

export const statutLabel: Record<CampaignStatut, string> = {
  [CampaignStatut.Brouillon]: "Brouillon",
  [CampaignStatut.Planifiee]: "Planifiée",
  [CampaignStatut.EnCours]: "En cours",
  [CampaignStatut.Terminee]: "Terminée",
};

export const statutColor: Record<CampaignStatut, string> = {
  [CampaignStatut.Brouillon]: "default",
  [CampaignStatut.Planifiee]: "blue",
  [CampaignStatut.EnCours]: "processing",
  [CampaignStatut.Terminee]: "green",
};

export const prioriteLabel: Record<TagPriorite, string> = {
  [TagPriorite.Indispensable]: "Indispensable",
  [TagPriorite.Recommande]: "Recommandé",
  [TagPriorite.Optionnel]: "Optionnel",
};

export const prioriteColor: Record<TagPriorite, string> = {
  [TagPriorite.Indispensable]: "red",
  [TagPriorite.Recommande]: "orange",
  [TagPriorite.Optionnel]: "default",
};

export const tagTypeLabel: Record<CampaignTagType, string> = {
  [CampaignTagType.DbField]: "Champ base de données",
  [CampaignTagType.Fixe]: "Variable fixe",
};

export const canalOptions = [
  { label: canalLabel[CampaignCanal.Whatsapp], value: CampaignCanal.Whatsapp },
  { label: canalLabel[CampaignCanal.Push], value: CampaignCanal.Push },
];

export const cibleOptions = [
  { label: cibleLabel[CampaignCible.CustomerApp], value: CampaignCible.CustomerApp },
  { label: cibleLabel[CampaignCible.ProApp], value: CampaignCible.ProApp },
];

export const prioriteOptions = [
  { label: prioriteLabel[TagPriorite.Indispensable], value: TagPriorite.Indispensable },
  { label: prioriteLabel[TagPriorite.Recommande], value: TagPriorite.Recommande },
  { label: prioriteLabel[TagPriorite.Optionnel], value: TagPriorite.Optionnel },
];

export const tagTypeOptions = [
  { label: tagTypeLabel[CampaignTagType.DbField], value: CampaignTagType.DbField },
  { label: tagTypeLabel[CampaignTagType.Fixe], value: CampaignTagType.Fixe },
];

/** "prenom" -> "{{prenom}}" */
export function wrapTag(raw: string): string {
  return `{{${raw}}}`;
}

/** "{{prenom}}" -> "prenom" */
export function unwrapTag(tag: string): string {
  return tag.replace(/^\{\{\s*/, "").replace(/\s*\}\}$/, "");
}
