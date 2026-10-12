import { ApiErrorAlert } from "@/components/admin/common/ApiErrorAlert";

/** Erreurs des endpoints Localisation : 403 (rôle non Admin), 400 (dates), autres. */
export function LocationErrorAlert({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <ApiErrorAlert
      error={error}
      onRetry={onRetry}
      forbiddenMessage="Accès réservé aux administrateurs"
      loadErrorMessage="Impossible de charger les positions"
    />
  );
}
