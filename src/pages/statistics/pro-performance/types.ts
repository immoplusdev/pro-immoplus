export type ProKpiPeriod = "week" | "month" | "quarter" | "year" | "custom";

export const periodOptions: { label: string; value: ProKpiPeriod }[] = [
    { label: "Semaine", value: "week" },
    { label: "Mois", value: "month" },
    { label: "Trimestre", value: "quarter" },
    { label: "Année", value: "year" },
    { label: "Personnalisé", value: "custom" },
];

export type ProType = "pro_particulier" | "pro_entreprise";

export const proTypeOptions: { label: string; value: ProType }[] = [
    { label: "Particulier", value: "pro_particulier" },
    { label: "Entreprise", value: "pro_entreprise" },
];

export type ProBadge = "en_progression" | "eligible" | "certifie" | "suspendu" | "retire";

export const badgeOptions: { label: string; value: ProBadge }[] = [
    { label: "En progression", value: "en_progression" },
    { label: "Éligible", value: "eligible" },
    { label: "Certifié", value: "certifie" },
    { label: "Suspendu", value: "suspendu" },
    { label: "Retiré", value: "retire" },
];

export type ProRequestStatus = "accepted" | "refused" | "no_response" | "pending";

export const statusOptions: { label: string; value: ProRequestStatus }[] = [
    { label: "Acceptée", value: "accepted" },
    { label: "Refusée", value: "refused" },
    { label: "Sans réponse", value: "no_response" },
    { label: "En attente", value: "pending" },
];

export type ProSortBy = "reservationsEffectuees" | "tauxAcceptation" | "delaiMedian";

export interface ProPerformanceFiltersState {
    period: ProKpiPeriod;
    dateStart?: string;
    dateEnd?: string;
    villeId?: string;
    communeId?: string;
    residenceId?: string;
    proType?: ProType;
    badge?: ProBadge;
    status?: ProRequestStatus;
}

export interface ProsKpisResponse {
    periode: { debut: string; fin: string; label: string };
    demandes: { recues: number };
    decisions: {
        acceptees: { nombre: number; taux: number };
        refusees: { nombre: number; taux: number };
    };
    blocages: {
        sansReponse: { nombre: number; taux: number };
    };
    resultats: {
        effectuees: number;
        caValideFcfa: number;
    };
    confirmees: number;
    delaiMedianMinutes: number | null;
    tauxConversion: number;
}

export interface ProPerformanceRow {
    proId: string;
    nom: string;
    type: ProType;
    zone: { ville: string; commune: string };
    reponse: {
        recues: number;
        acceptees: number;
        refusees: number;
        sansReponse: number;
        tauxAcceptation: number;
        delaiMedianMinutes: number | null;
    };
    conversion: {
        confirmees: number;
        effectuees: number;
        annulationsClient: number;
        annulationsPro: number;
    };
    valeur: {
        caBrutFcfa: number;
        remboursementsFcfa: number;
        caValideFcfa: number;
        bonusAcquisFcfa: number;
        bonusPayeFcfa: number;
        devise: string;
    };
    qualite: {
        badge: ProBadge;
        score: number;
        alertes: string[];
        calendrierAJour: boolean | null;
        derniereActiviteAt: string | null;
    };
    demandesEligibles: number;
    eligiblePourClassement: boolean;
}

export interface ProsTableResponse {
    data: ProPerformanceRow[];
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

export function formatFcfa(value: number): string {
    return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

export const badgeTagColor: Record<ProBadge, string> = {
    en_progression: "processing",
    eligible: "cyan",
    certifie: "success",
    suspendu: "warning",
    retire: "default",
};

export const badgeLabel: Record<ProBadge, string> = {
    en_progression: "En progression",
    eligible: "Éligible",
    certifie: "Certifié",
    suspendu: "Suspendu",
    retire: "Retiré",
};
