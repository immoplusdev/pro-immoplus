export enum CertificationStatus {
  EN_PROGRESSION = "en_progression",
  ELIGIBLE = "eligible",
  CERTIFIE = "certifie",
  SUSPENDU = "suspendu",
  RETIRE = "retire",
}

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
  detail?: InformationsDetail;
}

export interface ReservationsPilier {
  score: number;
  max: number;
  nbReservationsEffectuees?: number;
  plafond?: number;
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

export interface ProCertification {
  userId: string;
  scoreTotal: number;
  status: CertificationStatus;
  piliers?: Piliers;
  conditionsAttribution?: ConditionsAttribution;
  lastCalculatedAt?: string;
  motif?: string;
}

export interface ProRole {
  id: string | number;
  name: string;
  description?: string;
  [key: string]: unknown;
}

export interface ProUserWithCertification {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string | ProRole;
  avatar?: string;
  certification?: ProCertification;
}

export function getRoleName(role: string | ProRole | undefined): string {
  if (!role) return "";
  if (typeof role === "string") return role;
  return role.name ?? "";
}

export interface ProUsersListResponse {
  data: ProUserWithCertification[];
  total: number;
}

export interface RecalculateResponse {
  userId: string;
  scoreTotal: number;
  status: CertificationStatus;
  lastCalculatedAt: string;
}

export interface SuspendResponse {
  userId: string;
  status: CertificationStatus;
  motif: string;
}

export interface RetirerResponse {
  userId: string;
  status: CertificationStatus;
  motif: string;
}

export interface ReactiverResponse {
  userId: string;
  scoreTotal: number;
  status: CertificationStatus;
  lastCalculatedAt: string;
}
