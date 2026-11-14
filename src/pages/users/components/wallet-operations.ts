import { axiosInstance } from "@/lib/providers/utils/axios";
import { IdempotencyErrorKind } from "@/lib/helpers/idempotency.helper";

/** Opérations manuelles `POST /wallet/admin/*` (Admin/Financier, `walletAdmin:update`). */
export type WalletAdminOperation = "credit" | "debit" | "release-funds" | "transfer";

export const WALLET_NOTE_MAX_LENGTH = 1000;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Champs du formulaire, tels que renvoyés par antd. */
export interface WalletOperationFormValues {
  amount: number;
  currency?: string;
  source?: string;
  sourceId?: string;
  operator?: string;
  note?: string;
  refundDate?: { toISOString(): string } | null;
  toOwnerId?: string;
}

export interface WalletSourcedPayload {
  ownerId: string;
  amount: number;
  sourceId: string;
  note: string;
  source?: string;
  currency?: string;
}

export interface WalletCreditPayload extends WalletSourcedPayload {
  operator?: string;
  refundDate?: string;
}

export type WalletDebitPayload = WalletCreditPayload;
export type WalletReleaseFundsPayload = WalletSourcedPayload;

export interface WalletTransferPayload {
  fromOwnerId: string;
  toOwnerId: string;
  amount: number;
  note: string;
  currency?: string;
}

const trim = (value?: string) => (value ?? "").trim();

const buildSourcedPayload = (
  ownerId: string,
  values: WalletOperationFormValues,
): WalletSourcedPayload => ({
  ownerId,
  amount: values.amount,
  currency: values.currency,
  source: values.source,
  sourceId: trim(values.sourceId),
  note: trim(values.note),
});

export const buildCreditPayload = (
  ownerId: string,
  values: WalletOperationFormValues,
): WalletCreditPayload => ({
  ...buildSourcedPayload(ownerId, values),
  operator: values.operator,
  refundDate: values.refundDate?.toISOString(),
});

export const buildDebitPayload = (
  ownerId: string,
  values: WalletOperationFormValues,
): WalletDebitPayload => ({
  ...buildSourcedPayload(ownerId, values),
  operator: values.operator,
});

export const buildReleaseFundsPayload = (
  ownerId: string,
  values: WalletOperationFormValues,
): WalletReleaseFundsPayload => buildSourcedPayload(ownerId, values);

export const buildTransferPayload = (
  fromOwnerId: string,
  values: WalletOperationFormValues,
): WalletTransferPayload => ({
  fromOwnerId,
  toOwnerId: trim(values.toOwnerId),
  amount: values.amount,
  currency: values.currency,
  note: trim(values.note),
});

export const postWalletAdminOperation = async <P>(
  apiUrl: string,
  operation: WalletAdminOperation,
  payload: P,
  idempotencyKey: string,
  accessToken?: string,
) => {
  const response = await axiosInstance.post(`${apiUrl}/wallet/admin/${operation}`, payload, {
    idempotencyKey,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  return response.data;
};

export interface WalletErrorFeedback {
  level: "error" | "warning" | "info";
  /** Clé i18n, ou `undefined` pour afficher le message renvoyé par l'API. */
  messageKey?: string;
  /** Rafraîchir le solde / l'historique plutôt que renvoyer. */
  refresh: boolean;
}

export const getWalletErrorFeedback = (kind: IdempotencyErrorKind): WalletErrorFeedback => {
  switch (kind) {
    case "key-required":
      return { level: "error", messageKey: "wallet.errors.idempotencyKeyRequired", refresh: false };
    case "key-reused":
      return { level: "warning", messageKey: "wallet.errors.idempotencyKeyReused", refresh: false };
    case "in-progress":
      return { level: "info", messageKey: "wallet.errors.operationInProgress", refresh: true };
    case "funds-not-releasable":
      return {
        level: "error",
        messageKey: "wallet.errors.reservationFundsNotReleasable",
        refresh: false,
      };
    default:
      return { level: "error", refresh: false };
  }
};

/** Message lisible d'une erreur API (HttpError refine ou erreur axios brute). */
export const getApiErrorMessage = (error: unknown): string | undefined => {
  const e = error as { message?: unknown; response?: { data?: { message?: unknown } } };
  const raw = e?.response?.data?.message ?? e?.message;
  if (Array.isArray(raw)) return raw.join(", ");
  return typeof raw === "string" && raw ? raw : undefined;
};
