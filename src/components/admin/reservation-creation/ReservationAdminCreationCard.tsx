import { Alert, Button, Card, Descriptions, Space, Tag, Typography } from "antd";
import { SolutionOutlined } from "@ant-design/icons";
import { AdminName } from "@/components/admin/common/AdminName";
import { useAdminReservationCreationTrace } from "@/hooks/useAdminReservationCreation";
import { getErrorStatus } from "@/lib/helpers/api-response.helper";
import { extractErrorMessage } from "@/lib/helpers/http-exception.helper";
import { formatDateTime, formatFcfa } from "@/lib/helpers/admin-reservation-creation.helper";
import type { AdminReservationCreationTrace } from "@/types/admin-reservation-creation.types";

const { Text, Paragraph } = Typography;

const violationLabel = (violation: AdminReservationCreationTrace["violationsRegles"][number]): string =>
  typeof violation === "string" ? violation : violation.message || violation.code;

/**
 * Encart « Créée depuis le backoffice » de la fiche réservation (Admin).
 * Rien n'est affiché si la réservation vient de l'app (404), pendant le chargement ou sur 403.
 */
export function ReservationAdminCreationCard({ reservationId }: { reservationId: string | undefined }) {
  const { data: trace, isInitialLoading, isError, error, refetch } = useAdminReservationCreationTrace(reservationId);

  if (!reservationId || isInitialLoading) return null;
  if (isError) {
    if (getErrorStatus(error) === 403) return null;
    return (
      <Alert
        type="error"
        showIcon
        message="Impossible de vérifier si la réservation a été créée depuis le backoffice"
        description={extractErrorMessage(error, "Une erreur est survenue.")}
        action={
          <Button size="small" onClick={() => refetch()}>
            Réessayer
          </Button>
        }
      />
    );
  }
  if (!trace) return null;

  const manual = trace.prixManuel !== null && trace.prixManuel !== undefined;

  return (
    <Card
      style={{ border: "1px solid #E8E9EE", borderRadius: 10 }}
      title={
        <Space>
          <SolutionOutlined />
          <span>Créée depuis le backoffice</span>
        </Space>
      }
    >
      <Descriptions size="small" column={1}>
        <Descriptions.Item label="Par">
          <AdminName id={trace.adminId} />
        </Descriptions.Item>
        <Descriptions.Item label="Le">{formatDateTime(trace.createdAt)}</Descriptions.Item>
        <Descriptions.Item label="Prix">
          {manual ? (
            <Space size={8} wrap>
              <Text strong>{formatFcfa(trace.prixManuel as number)}</Text>
              <Tag color="orange">Prix manuel</Tag>
              {trace.prixCalcule != null && (
                <Text type="secondary">
                  au lieu de <Text delete type="secondary">{formatFcfa(trace.prixCalcule)}</Text> (tarif calculé)
                </Text>
              )}
            </Space>
          ) : trace.prixCalcule != null ? (
            <Text>{formatFcfa(trace.prixCalcule)} (tarif de la résidence)</Text>
          ) : (
            "—"
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Contournements">
          {!trace.reglesForcees && !trace.limiteIgnoree && !manual ? (
            <Text type="secondary">Aucun</Text>
          ) : (
            <Space direction="vertical" size={4}>
              {trace.reglesForcees && (
                <span>
                  <Tag color="orange">Règles de séjour forcées</Tag>
                  {trace.violationsRegles.length > 0 && (
                    <Text type="secondary">{trace.violationsRegles.map(violationLabel).join(" · ")}</Text>
                  )}
                </span>
              )}
              {trace.limiteIgnoree && (
                <span>
                  <Tag color="orange">Limite de réservations ignorée</Tag>
                  <Text type="secondary">{trace.reservationsActives} réservation(s) active(s) à la création</Text>
                </span>
              )}
              {manual && <Tag color="orange">Prix manuel</Tag>}
            </Space>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Note interne">
          {trace.noteAdmin ? (
            <Paragraph style={{ marginBottom: 0 }} ellipsis={{ rows: 3, expandable: true, symbol: "voir plus" }}>
              {trace.noteAdmin}
            </Paragraph>
          ) : (
            <Text type="secondary">—</Text>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
