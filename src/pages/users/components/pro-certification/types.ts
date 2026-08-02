export type CertificationStatus = "en_progression" | "eligible" | "certifie" | "suspendu" | "retire";

export const certificationStatusColor: Record<CertificationStatus, string> = {
    en_progression: "#B86B0A",
    eligible: "#185FA5",
    certifie: "#1F8A5B",
    suspendu: "#C13838",
    retire: "#5F5E5A",
};

export const certificationStatusLabel: Record<CertificationStatus, string> = {
    en_progression: "En progression",
    eligible: "Éligible",
    certifie: "Certifié",
    suspendu: "Suspendu",
    retire: "Retiré",
};

export interface InformationsDetail {
    photoLogo: number;
    numerosVerifies: number;
    identiteRccm: number;
    email: number;
    adresse: number;
    moyenPaiement: number;
    annonceComplete: number;
}

export interface InformationsPilier {
    score: number;
    max: number;
    detail: InformationsDetail;
}

export interface ReservationsPilier {
    score: number;
    max: number;
    nbReservationsEffectuees: number;
    plafond: number;
}

export interface AvisPilier {
    score: number | null;
    max: number;
    noteMoyenne: number | null;
    nbAvisRecus: number;
}

export interface FiabilitePilier {
    score: number;
    max: number;
    tauxReponse: number | null;
    delaiMedianMinutes: number | null;
    calendrierMajJours: number | null;
    tauxAnnulationPro: number | null;
    tauxCheckinReussi: number | null;
}

export interface Piliers {
    informations: InformationsPilier;
    reservations: ReservationsPilier;
    avis: AvisPilier;
    fiabilite: FiabilitePilier;
}

export interface ConditionsAttribution {
    identiteVerifiee: boolean;
    moyenPaiementVerifie: boolean;
    avisMinimum: boolean;
    reservationsMin10: boolean;
    fiabiliteMin14: boolean;
    aucuneSanctionActive: boolean;
}

export interface ProCertificationDetail {
    userId: string;
    scoreTotal: number;
    status: CertificationStatus;
    piliers: Piliers;
    conditionsAttribution: ConditionsAttribution;
    lastCalculatedAt: string;
}

export const conditionsAttributionLabels: Record<keyof ConditionsAttribution, string> = {
    identiteVerifiee: "Identité vérifiée",
    moyenPaiementVerifie: "Moyen de paiement vérifié",
    avisMinimum: "Avis minimum atteint",
    reservationsMin10: "Au moins 10 réservations effectuées",
    fiabiliteMin14: "Score fiabilité ≥ 14/20",
    aucuneSanctionActive: "Aucune sanction active",
};
