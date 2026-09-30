import { Alert, Button } from "antd";
import { extractErrorMessage, getErrorStatus } from "@/lib/helpers";

interface Props {
  error: unknown;
  onRetry: () => void;
  /** Message du 403. */
  forbiddenMessage: string;
  /** Titre des erreurs génériques (réseau, 5xx…). */
  loadErrorMessage: string;
}

/** Alerte d'erreur des écrans admin filtrés par dates : 403, 400 (format de date), autres (avec "Réessayer"). */
export function ApiErrorAlert({ error, onRetry, forbiddenMessage, loadErrorMessage }: Props) {
  const status = getErrorStatus(error);

  if (status === 403) {
    return <Alert type="warning" showIcon message={forbiddenMessage} />;
  }
  if (status === 400) {
    return (
      <Alert
        type="error"
        showIcon
        message="Format de date invalide"
        description="Les dates doivent être au format AAAA-MM-JJ. Modifiez la période puis relancez la recherche."
      />
    );
  }
  return (
    <Alert
      type="error"
      showIcon
      message={loadErrorMessage}
      description={extractErrorMessage(error, "Une erreur est survenue.")}
      action={
        <Button size="small" onClick={onRetry}>
          Réessayer
        </Button>
      }
    />
  );
}
