import type { TagStyle } from "@/types/messaging";

export type ImmoRelaisStatus = "upcoming" | "matching" | "in_progress" | "cancelled";
export type ImmoRelaisMatchingStatus = "idle" | "matching";
export type ImmoRelaisInterestStatus = "pending" | "in_progress" | "declined";
export type ImmoRelaisSortBy = "recent" | "oldest";

export interface ImmoRelais {
  id: string;
  occupantId: string;
  propertyId: string | null;
  propertyType: string;
  location: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  currentRentPrice: number | null;
  rooms: number;
  surface: number | null;
  approximateDepartureDate: string | null;
  availabilityDate: string;
  reason: string | null;
  reporterRelation: "occupant" | "neighbor" | "other" | null;
  reporterRelationDetails: string | null;
  additionalNotes?: string;
  photos: string[];
  extras: string[];
  status: ImmoRelaisStatus;
  matchingStatus: ImmoRelaisMatchingStatus;
  interestedCount: number;
  potentialMatches: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImmoRelaisInterest {
  id: string;
  relaisId: string;
  clientId: string;
  message?: string;
  status: ImmoRelaisInterestStatus;
  meetingDate: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImmoRelaisMatch {
  id: string;
  relaisId: string;
  alertId: string;
  score: number;
  createdAt?: string;
}

export interface ImmoRelaisStats {
  relaisByStatus: Partial<Record<ImmoRelaisStatus, number>>;
  interestsByStatus: Partial<Record<ImmoRelaisInterestStatus, number>>;
}

export interface ImmoRelaisFilters {
  status?: ImmoRelaisStatus;
  occupantId?: string;
  sortBy?: ImmoRelaisSortBy;
  page?: number;
  limit?: number;
}

export interface ImmoRelaisInterestsFilters {
  status?: ImmoRelaisInterestStatus;
  relaisId?: string;
  clientId?: string;
  page?: number;
  limit?: number;
}

export const relaisStatusMap: Record<ImmoRelaisStatus, TagStyle> = {
  upcoming: { label: "À venir", color: "blue" },
  matching: { label: "En matching", color: "gold" },
  in_progress: { label: "En cours", color: "green" },
  cancelled: { label: "Annulé", color: "red" },
};

export const relaisMatchingStatusMap: Record<ImmoRelaisMatchingStatus, TagStyle> = {
  idle: { label: "Inactif", color: "default" },
  matching: { label: "Matching en cours", color: "gold" },
};

export const relaisInterestStatusMap: Record<ImmoRelaisInterestStatus, TagStyle> = {
  pending: { label: "En attente", color: "gold" },
  in_progress: { label: "En cours", color: "green" },
  declined: { label: "Refusé", color: "red" },
};

export const relaisReporterRelationMap: Record<"occupant" | "neighbor" | "other", string> = {
  occupant: "Occupant",
  neighbor: "Voisin",
  other: "Autre",
};

export const RELAIS_STATUSES = Object.keys(relaisStatusMap) as ImmoRelaisStatus[];
export const RELAIS_INTEREST_STATUSES = Object.keys(
  relaisInterestStatusMap
) as ImmoRelaisInterestStatus[];
