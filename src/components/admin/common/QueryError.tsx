import { Button, Result } from "antd";
import { extractErrorMessage, getErrorStatus } from "@/lib/helpers";

interface QueryErrorProps {
  error: unknown;
  onRetry?: () => void;
  onBack?: () => void;
  notFoundTitle?: string;
}

/** Écran d'erreur : 403 « Accès refusé », 404 « introuvable », réseau / autres. */
export function QueryError({ error, onRetry, onBack, notFoundTitle = "Ressource introuvable" }: QueryErrorProps) {
  const status = getErrorStatus(error);

  const extra = (
    <>
      {onBack && <Button onClick={onBack}>Retour</Button>}
      {onRetry && status !== 404 && (
        <Button type="primary" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </>
  );

  if (status === 403) {
    return <Result status="403" title="Accès refusé" subTitle="Vous n'avez pas les droits nécessaires." extra={extra} />;
  }
  if (status === 404) {
    return (
      <Result
        status="404"
        title={notFoundTitle}
        subTitle={extractErrorMessage(error, "Cet élément n'existe pas ou a été supprimé.")}
        extra={extra}
      />
    );
  }
  const network = status === undefined;
  return (
    <Result
      status="error"
      title={network ? "Erreur réseau" : "Une erreur est survenue"}
      subTitle={
        network
          ? "Impossible de joindre le serveur. Vérifiez votre connexion."
          : extractErrorMessage(error, "Impossible de charger les données.")
      }
      extra={extra}
    />
  );
}
