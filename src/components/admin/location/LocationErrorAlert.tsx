import { Alert, Button } from "antd";
import { extractErrorMessage, getErrorStatus } from "@/lib/helpers";

/** Erreurs des endpoints Localisation : 403 (rôle non Admin), 400 (dates), autres. */
export function LocationErrorAlert({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const status = getErrorStatus(error);

  if (status === 403) {
    return <Alert type="warning" showIcon message="Accès réservé aux administrateurs" />;
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
      message="Impossible de charger les positions"
      description={extractErrorMessage(error, "Une erreur est survenue.")}
      action={
        <Button size="small" onClick={onRetry}>
          Réessayer
        </Button>
      }
    />
  );
}
