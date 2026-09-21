export type ConversationType = "reservation" | "visite" | "relais" | "support";
export type ConversationStatus = "active" | "archived" | "blocked";
export type ConversationMessageType = "text" | "system";
export type MessageModerationStatus = "clean" | "blocked";
export type ConversationReportReason =
  | "contact_info_attempt"
  | "off_platform_transaction_attempt"
  | "harassment"
  | "spam"
  | "scam"
  | "other";
export type ParticipantRole = "pro" | "client";

/** Enveloppe de pagination renvoyée par l'API. */
export interface Paginated<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  residenceId: string | null;
  reservationId: string | null;
  visiteId: string | null;
  relaisId: string | null;
  proId: string | null;
  clientId: string;
  status: ConversationStatus;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageSenderId: string | null;
  unreadCountPro: number;
  unreadCountClient: number;
  blockedContentCount: number;
  blockedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: ParticipantRole;
  type: ConversationMessageType;
  content: string | null;
  moderationStatus: MessageModerationStatus;
  clientTempId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface ConversationReport {
  id: string;
  conversationId: string;
  reporterId: string;
  reportedUserId: string;
  reason: ConversationReportReason;
  details: string | null;
  createdAt: string;
}

export type ConversationDetail = Conversation & { reports: ConversationReport[] };

export interface ConversationsFilters {
  type?: ConversationType;
  status?: ConversationStatus;
  userId?: string;
  reported?: boolean;
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
}

export interface SendAdminMessagePayload {
  content: string;
  clientTempId?: string;
}

export interface TagStyle {
  label: string;
  color: string;
}

export const conversationTypeMap: Record<ConversationType, TagStyle> = {
  reservation: { label: "Réservation", color: "blue" },
  visite: { label: "Visite", color: "purple" },
  relais: { label: "Relais", color: "cyan" },
  support: { label: "Support", color: "orange" },
};

export const conversationStatusMap: Record<ConversationStatus, TagStyle> = {
  active: { label: "Active", color: "green" },
  archived: { label: "Archivée", color: "default" },
  blocked: { label: "Bloquée", color: "red" },
};

export const reportReasonMap: Record<ConversationReportReason, TagStyle> = {
  contact_info_attempt: { label: "Partage de coordonnées", color: "orange" },
  off_platform_transaction_attempt: { label: "Transaction hors plateforme", color: "volcano" },
  harassment: { label: "Harcèlement", color: "red" },
  spam: { label: "Spam", color: "gold" },
  scam: { label: "Arnaque", color: "magenta" },
  other: { label: "Autre", color: "default" },
};

export const participantRoleMap: Record<ParticipantRole, TagStyle> = {
  pro: { label: "Pro", color: "geekblue" },
  client: { label: "Client", color: "green" },
};

export const MESSAGE_MAX_LENGTH = 2000;
