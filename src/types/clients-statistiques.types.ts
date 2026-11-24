import dayjs from "dayjs";

export enum ClientStatut {
    Actif = "actif",
    Suspendu = "suspendu",
    Banni = "banni",
}

export enum ClientRisqueNiveau {
    Normal = "normal",
    Eleve = "eleve",
    Critique = "critique",
}

export enum ClientSegment {
    Nouveau = "nouveau",
    Occasionnel = "occasionnel",
    Fidele = "fidele",
    Vip = "vip",
}

export enum ClientScoreBadge {
    TopClient = "top_client",
    ClientFiable = "client_fiable",
    ClientStandard = "client_standard",
    ClientASurveiller = "client_a_surveiller",
}

export enum ClientKpiPeriod {
    Week = "week",
    Month = "month",
    Quarter = "quarter",
    Year = "year",
    Custom = "custom",
}

export enum ClientListSortBy {
    ScoreGlobal = "scoreGlobal",
    TauxAnnulation = "tauxAnnulation",
    NoteMoyenne = "noteMoyenne",
    MontantDepense = "montantDepense",
    Anciennete = "anciennete",
}

export enum SortDirection {
    Asc = "asc",
    Desc = "desc",
}

export enum ClientComportementFilter {
    Respectueux = "respectueux",
    Acceptable = "acceptable",
    Problematique = "problematique",
}

/** Comportement d'un client (avis hôte, réputation) — mêmes valeurs que le filtre. */
export type ClientComportement = ClientComportementFilter;

export enum SignalementCategorie {
    Comportement = "comportement",
    Proprete = "proprete",
    Paiement = "paiement",
    Materiel = "materiel",
    Autre = "autre",
}

export enum SignalementGravite {
    Faible = "faible",
    Moyenne = "moyenne",
    Grave = "grave",
}

export enum SignalementStatut {
    EnAttente = "en_attente",
    Traite = "traite",
    Rejete = "rejete",
}

export interface PaginatedResponse<T> {
    data: T[];
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export interface ClientKpisDto {
    periode: { type: string; debut: string; fin: string };
    totalClients: number;
    nouveauxClients: number;
    clientsActifs: number;
    reservations: {
        totalEffectuees: number;
        tauxAnnulationClient: number;
        tauxSansReponse: number;
    };
    paiements: {
        tauxEchec: number;
        montantTotalDepenseFcfa: number;
    };
    reputation: {
        noteMoyenneHoteClient: number | null;
        tauxRecommandation: number;
        repartitionComportement: { respectueux: number; acceptable: number; problematique: number };
    };
    alertes: { clientsARisque: number };
}

export interface ClientKpiFilters {
    period: ClientKpiPeriod;
    dateDebut?: string;
    dateFin?: string;
    statut?: ClientStatut;
}

export interface ClientListItemDto {
    clientId: string;
    nom: string;
    anciennete: { createdAt: string; joursDepuisInscription: number };
    verification: { identite: boolean; email: boolean; telephone: boolean };
    /** tauxAnnulation : ratio 0–1. */
    reservations: {
        total: number;
        terminees: number;
        annuleesClient: number;
        sansReponse: number;
        tauxAnnulation: number;
    };
    /** tauxEchec : ratio 0–1. */
    paiements: { tauxEchec: number; montantTotalDepenseFcfa: number };
    /** tauxRecommandation : ratio 0–1 (AVG de would_recommend côté back). */
    reputation: {
        noteMoyenneHoteClient: number | null;
        comportement: ClientComportement | null;
        tauxRecommandation: number;
    };
    fidelite: {
        nombreReservationsDistinctes: number;
        clientRecurrent: boolean;
        premiereReservation: string | null;
        derniereReservation: string | null;
        frequenceMoyenneJours: number | null;
        segment: ClientSegment;
    };
    risque: { niveau: ClientRisqueNiveau; raisons: string[] };
    score: { global: number; badge: ClientScoreBadge | null };
    statut: ClientStatut;
}

export interface ClientHistoriqueReservationDto {
    reservationId: string;
    /** Valeur brute de `status_reservation` (cf. enum StatusReservation). */
    statut: string;
    /** Date de création, "YYYY-MM-DD". */
    date: string;
    montantFcfa: number;
}

export interface ClientHistoriqueAvisHoteDto {
    reservationId: string;
    note: number | null;
    comportement: ClientComportement | null;
    commentaire: string | null;
}

/** GET /v1/statistics/clients/:clientId — `data` de l'enveloppe. Historiques : 10 entrées max, plus récentes en premier. */
export interface ClientDetailDto extends ClientListItemDto {
    historique: {
        dernieresReservations: ClientHistoriqueReservationDto[];
        derniersAvisHote: ClientHistoriqueAvisHoteDto[];
    };
}

export interface ClientListFilters {
    statut?: ClientStatut;
    niveauRisque?: ClientRisqueNiveau;
    segment?: ClientSegment;
    comportement?: ClientComportementFilter;
    scoreMin?: number;
    scoreMax?: number;
}

export interface ClientRecomputeScoreResultDto {
    clientId: string;
    score: {
        global: number;
        detail: { fiabiliteReservation: number; paiement: number; reputation: number; anciennete: number };
        badge: ClientScoreBadge | null;
    };
    risque: { niveau: ClientRisqueNiveau; raisons: string[]; fenetreJours: 90; reservationsEligibles: number };
    fidelite: { segment: ClientSegment };
    recalculeLe: string;
}

export interface ClientStatutChangeResultDto {
    clientId: string;
    statut: ClientStatut.Suspendu | ClientStatut.Banni;
    raison: string;
    suspenduLe: string;
    suspenduPar: string;
}

export interface ClientReactivateResultDto {
    clientId: string;
    statut: ClientStatut.Actif;
    raison: null;
    suspenduLe: null;
    suspenduPar: null;
}

export interface AdminSignalementItemDto {
    signalementId: string;
    reservationId: string;
    clientId: string;
    hostId: string;
    categorie: SignalementCategorie;
    gravite: SignalementGravite;
    statut: SignalementStatut;
    description: string;
    traiteLe: string | null;
    traitePar: string | null;
    createdAt: string;
}

// ─── Formatage & libellés FR (fichier unique pour tout le module clients) ────

export const EMPTY_VALUE = "—";

const fcfaFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 });

/** 1250000 → « 1 250 000 FCFA » (séparateur de milliers fr). */
export function formatFcfa(value: number): string {
    return `${fcfaFormatter.format(value)} FCFA`;
}

/**
 * Taux renvoyés par l'API en RATIO 0–1 (pct() côté back, AVG(0/1) pour tauxRecommandation) → « 12 % ».
 * null/undefined → « — ».
 */
export function formatPercent(ratio: number | null | undefined): string {
    if (ratio == null || Number.isNaN(ratio)) return EMPTY_VALUE;
    return percentFormatter.format(ratio);
}

/** Date ISO ou "YYYY-MM-DD" → « dd/MM/yyyy » ; null → « — ». */
export function formatDateFr(value: string | null | undefined): string {
    if (!value) return EMPTY_VALUE;
    const d = dayjs(value);
    return d.isValid() ? d.format("DD/MM/YYYY") : EMPTY_VALUE;
}

/** Note /5 → « 4,5/5 » ; null → « — ». */
export function formatNote(value: number | null | undefined): string {
    if (value == null) return EMPTY_VALUE;
    return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(value)}/5`;
}

/** Fréquence moyenne entre deux réservations → « tous les 30 jours » ; null → « — ». */
export function formatFrequence(jours: number | null | undefined): string {
    if (jours == null) return EMPTY_VALUE;
    const n = Math.round(jours);
    return n <= 1 ? "tous les jours" : `tous les ${n} jours`;
}

export const verificationLabel: Record<keyof ClientListItemDto["verification"], string> = {
    identite: "Identité",
    email: "E-mail",
    telephone: "Téléphone",
};

export const periodOptions: { label: string; value: ClientKpiPeriod }[] = [
    { label: "Semaine", value: ClientKpiPeriod.Week },
    { label: "Mois", value: ClientKpiPeriod.Month },
    { label: "Trimestre", value: ClientKpiPeriod.Quarter },
    { label: "Année", value: ClientKpiPeriod.Year },
    { label: "Personnalisé", value: ClientKpiPeriod.Custom },
];

export const clientStatutColor: Record<ClientStatut, string> = {
    [ClientStatut.Actif]: "green",
    [ClientStatut.Suspendu]: "orange",
    [ClientStatut.Banni]: "red",
};

export const clientStatutLabel: Record<ClientStatut, string> = {
    [ClientStatut.Actif]: "Actif",
    [ClientStatut.Suspendu]: "Suspendu",
    [ClientStatut.Banni]: "Banni",
};

export const statutOptions: { label: string; value: ClientStatut }[] = [
    { label: clientStatutLabel[ClientStatut.Actif], value: ClientStatut.Actif },
    { label: clientStatutLabel[ClientStatut.Suspendu], value: ClientStatut.Suspendu },
    { label: clientStatutLabel[ClientStatut.Banni], value: ClientStatut.Banni },
];

export const risqueColor: Record<ClientRisqueNiveau, string> = {
    [ClientRisqueNiveau.Normal]: "green",
    [ClientRisqueNiveau.Eleve]: "orange",
    [ClientRisqueNiveau.Critique]: "red",
};

export const risqueLabel: Record<ClientRisqueNiveau, string> = {
    [ClientRisqueNiveau.Normal]: "Normal",
    [ClientRisqueNiveau.Eleve]: "Élevé",
    [ClientRisqueNiveau.Critique]: "Critique",
};

export const risqueOptions: { label: string; value: ClientRisqueNiveau }[] = [
    { label: risqueLabel[ClientRisqueNiveau.Normal], value: ClientRisqueNiveau.Normal },
    { label: risqueLabel[ClientRisqueNiveau.Eleve], value: ClientRisqueNiveau.Eleve },
    { label: risqueLabel[ClientRisqueNiveau.Critique], value: ClientRisqueNiveau.Critique },
];

export const segmentLabel: Record<ClientSegment, string> = {
    [ClientSegment.Nouveau]: "Nouveau",
    [ClientSegment.Occasionnel]: "Occasionnel",
    [ClientSegment.Fidele]: "Fidèle",
    [ClientSegment.Vip]: "VIP",
};

export const segmentOptions: { label: string; value: ClientSegment }[] = [
    { label: segmentLabel[ClientSegment.Nouveau], value: ClientSegment.Nouveau },
    { label: segmentLabel[ClientSegment.Occasionnel], value: ClientSegment.Occasionnel },
    { label: segmentLabel[ClientSegment.Fidele], value: ClientSegment.Fidele },
    { label: segmentLabel[ClientSegment.Vip], value: ClientSegment.Vip },
];

export const scoreBadgeColor: Record<ClientScoreBadge, string> = {
    [ClientScoreBadge.TopClient]: "gold",
    [ClientScoreBadge.ClientFiable]: "blue",
    [ClientScoreBadge.ClientStandard]: "default",
    [ClientScoreBadge.ClientASurveiller]: "red",
};

export const scoreBadgeLabel: Record<ClientScoreBadge, string> = {
    [ClientScoreBadge.TopClient]: "Top client",
    [ClientScoreBadge.ClientFiable]: "Client fiable",
    [ClientScoreBadge.ClientStandard]: "Client standard",
    [ClientScoreBadge.ClientASurveiller]: "Client à surveiller",
};

export const comportementLabel: Record<ClientComportementFilter, string> = {
    [ClientComportementFilter.Respectueux]: "Respectueux",
    [ClientComportementFilter.Acceptable]: "Acceptable",
    [ClientComportementFilter.Problematique]: "Problématique",
};

export const comportementOptions: { label: string; value: ClientComportementFilter }[] = [
    { label: comportementLabel[ClientComportementFilter.Respectueux], value: ClientComportementFilter.Respectueux },
    { label: comportementLabel[ClientComportementFilter.Acceptable], value: ClientComportementFilter.Acceptable },
    {
        label: comportementLabel[ClientComportementFilter.Problematique],
        value: ClientComportementFilter.Problematique,
    },
];

export const sortByLabel: Record<ClientListSortBy, string> = {
    [ClientListSortBy.ScoreGlobal]: "Score",
    [ClientListSortBy.TauxAnnulation]: "Taux d'annulation",
    [ClientListSortBy.NoteMoyenne]: "Note moyenne",
    [ClientListSortBy.MontantDepense]: "Montant dépensé",
    [ClientListSortBy.Anciennete]: "Ancienneté",
};

export const signalementCategorieLabel: Record<SignalementCategorie, string> = {
    [SignalementCategorie.Comportement]: "Comportement",
    [SignalementCategorie.Proprete]: "Propreté",
    [SignalementCategorie.Paiement]: "Paiement",
    [SignalementCategorie.Materiel]: "Matériel",
    [SignalementCategorie.Autre]: "Autre",
};

export const signalementGraviteColor: Record<SignalementGravite, string> = {
    [SignalementGravite.Faible]: "default",
    [SignalementGravite.Moyenne]: "orange",
    [SignalementGravite.Grave]: "red",
};

export const signalementGraviteLabel: Record<SignalementGravite, string> = {
    [SignalementGravite.Faible]: "Faible",
    [SignalementGravite.Moyenne]: "Moyenne",
    [SignalementGravite.Grave]: "Grave",
};

export const signalementStatutColor: Record<SignalementStatut, string> = {
    [SignalementStatut.EnAttente]: "orange",
    [SignalementStatut.Traite]: "green",
    [SignalementStatut.Rejete]: "default",
};

export const signalementStatutLabel: Record<SignalementStatut, string> = {
    [SignalementStatut.EnAttente]: "En attente",
    [SignalementStatut.Traite]: "Traité",
    [SignalementStatut.Rejete]: "Rejeté",
};

export const signalementStatutOptions: { label: string; value: SignalementStatut }[] = [
    { label: signalementStatutLabel[SignalementStatut.EnAttente], value: SignalementStatut.EnAttente },
    { label: signalementStatutLabel[SignalementStatut.Traite], value: SignalementStatut.Traite },
    { label: signalementStatutLabel[SignalementStatut.Rejete], value: SignalementStatut.Rejete },
];
