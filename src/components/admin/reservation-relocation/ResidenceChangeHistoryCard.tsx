import { useOne } from "@refinedev/core";
import { Alert, Button, Card, Space, Tag, Timeline, Tooltip, Typography } from "antd";
import { HistoryOutlined, ReloadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { extractErrorMessage } from "@/lib/helpers/http-exception.helper";
import { getErrorStatus } from "@/lib/helpers/api-response.helper";
import { formatDateTime, formatFcfa } from "@/lib/helpers/reservation-relocation.helper";
import { useResidenceChangeHistory } from "@/hooks/useReservationRelocation";
import { AdminName } from "@/components/admin/common/AdminName";
import { getRelocationMotifLabel, type ResidenceChangeHistoryItem } from "@/types/reservation-relocation.types";

const { Text, Paragraph } = Typography;

/** Nom d'une résidence par son id (GET /residences/:id, mis en cache par refine / react-query). */
function ResidenceName({ id }: { id: string }) {
  const { data, isLoading, isError } = useOne<{ nom?: string | null }>({
    resource: "residences",
    id,
    queryOptions: { staleTime: 10 * 60 * 1000, retry: false },
  });
  const label = isLoading ? "…" : isError ? `Résidence ${id.slice(0, 8)}` : data?.data?.nom || `Résidence ${id.slice(0, 8)}`;
  return <Link to={`/residences/edit/${id}`}>{label}</Link>;
}

function HistoryEntry({ item }: { item: ResidenceChangeHistoryItem }) {
  return (
    <Space direction="vertical" size={4} style={{ width: "100%" }}>
      <Space wrap size={[8, 4]}>
        <Text strong>{formatDateTime(item.createdAt)}</Text>
        <Tag>{getRelocationMotifLabel(item.motif)}</Tag>
        {item.reglesForcees && (
          <Tooltip title={item.violationsRegles.length ? item.violationsRegles.join(", ") : undefined}>
            <Tag color="orange">Règles forcées</Tag>
          </Tooltip>
        )}
        {!item.paid && <Tag>Non payée</Tag>}
      </Space>
      <Text>
        <ResidenceName id={item.fromResidenceId} /> → <ResidenceName id={item.toResidenceId} />
      </Text>
      <Text type="secondary">
        Prix : {formatFcfa(item.oldMontantTotal)} → {formatFcfa(item.newMontantTotal)}
        {item.remboursementClient > 0 && <> · Remboursé au client : {formatFcfa(item.remboursementClient)}</>}
        {item.absorbeImmoplus > 0 && (
          <>
            {" · "}
            <Text type="danger">Pris en charge par ImmoPlus : {formatFcfa(item.absorbeImmoplus)}</Text>
          </>
        )}
      </Text>
      {item.note && (
        <Paragraph style={{ marginBottom: 0 }} ellipsis={{ rows: 3, expandable: true, symbol: "voir plus" }}>
          <Text type="secondary">Note : </Text>
          {item.note}
        </Paragraph>
      )}
      <Text type="secondary" style={{ fontSize: 12 }}>
        Par <AdminName id={item.adminId} />
      </Text>
    </Space>
  );
}

/**
 * Historique des changements de résidence d'une réservation (Admin).
 * Masqué si la liste est vide ou si l'API refuse l'accès (403).
 */
export function ResidenceChangeHistoryCard({ reservationId }: { reservationId: string | undefined }) {
  const { data, isInitialLoading, isFetching, isError, error, refetch } = useResidenceChangeHistory(reservationId);

  if (!reservationId) return null;
  if (isError && getErrorStatus(error) === 403) return null;
  // Rien pendant le premier chargement : la plupart des réservations n'ont aucun changement,
  // une carte squelette apparaîtrait puis disparaîtrait à chaque ouverture de fiche.
  if (isInitialLoading || (!isError && (data?.length ?? 0) === 0)) return null;

  const body = (() => {
    if (isError) {
      return (
        <Alert
          type="error"
          showIcon
          message="Impossible de charger l'historique des changements de résidence"
          description={extractErrorMessage(error, "Une erreur est survenue.")}
          action={
            <Button size="small" onClick={() => refetch()}>
              Réessayer
            </Button>
          }
        />
      );
    }
    return (
      <Timeline
        style={{ marginTop: 8 }}
        items={(data ?? []).map((item) => ({
          key: item.id,
          color: item.absorbeImmoplus > 0 || item.reglesForcees ? "orange" : "blue",
          children: <HistoryEntry item={item} />,
        }))}
      />
    );
  })();

  return (
    <Card
      style={{ border: "1px solid #E8E9EE", borderRadius: 10 }}
      title={
        <Space>
          <HistoryOutlined />
          <span>Historique des changements de résidence</span>
        </Space>
      }
      extra={
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined spin={isFetching && !isInitialLoading} />}
          aria-label="Rafraîchir l'historique des changements de résidence"
          onClick={() => refetch()}
        />
      }
    >
      {body}
    </Card>
  );
}
