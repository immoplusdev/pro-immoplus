import { useApiUrl, useInvalidate } from "@refinedev/core";
import { message } from "antd";
import { useIdempotentSubmit } from "@/hooks/useIdempotentSubmit";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";
import {
  getApiErrorMessage,
  getWalletErrorFeedback,
  postWalletAdminOperation,
  WalletAdminOperation,
} from "./wallet-operations";

interface Options {
  operation: WalletAdminOperation;
  translate: (key: string) => string;
  successKey: string;
  failedKey: string;
  /** Rafraîchit le solde affiché (après succès ou opération déjà en cours). */
  onRefresh?: () => void;
}

/**
 * Envoi d'une opération wallet admin : une clé d'idempotence par intention, bouton désactivé
 * pendant la requête, messages dédiés aux codes 409 de l'API.
 * Renvoie `true` si l'opération a abouti (le formulaire peut alors être vidé).
 */
export const useWalletAdminOperation = <P>({
  operation,
  translate,
  successKey,
  failedKey,
  onRefresh,
}: Options) => {
  const apiUrl = useApiUrl();
  const invalidate = useInvalidate();
  const { submit, isSubmitting } = useIdempotentSubmit((payload: P, key: string) =>
    postWalletAdminOperation(
      apiUrl,
      operation,
      payload,
      key,
      getLocalStorageProvider().getAuthData()?.access_token,
    ),
  );

  const refresh = () => {
    onRefresh?.();
    invalidate({ resource: "wallet-transactions", invalidates: ["list"] });
  };

  const run = async (payload: P): Promise<boolean> => {
    if (!getLocalStorageProvider().getAuthData()?.access_token) {
      message.error(translate("auth.messages.tokenNotFound"));
      return false;
    }
    const result = await submit(payload);
    if (result.status === "success") {
      message.success(translate(successKey));
      refresh();
      return true;
    }
    if (result.status === "error") {
      const feedback = getWalletErrorFeedback(result.kind);
      const text = feedback.messageKey
        ? translate(feedback.messageKey)
        : getApiErrorMessage(result.error) ?? translate(failedKey);
      message[feedback.level](text);
      if (feedback.refresh) refresh();
    }
    return false;
  };

  return { run, isSubmitting };
};
