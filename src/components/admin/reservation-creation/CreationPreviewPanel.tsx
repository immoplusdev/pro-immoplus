import { Alert, Descriptions, Space, Tag, Typography } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import {
  describeInitialStatus,
  formatDateTime,
  formatFcfa,
} from "@/lib/helpers/admin-reservation-creation.helper";
import {
  MAX_ACTIVE_RESERVATIONS_PER_CLIENT,
  type AdminReservationPreview,
} from "@/types/admin-reservation-creation.types";

const { Text } = Typography;

/** Résultat de l'aperçu : dates, prix, montant payé par le client, statut de départ, règles enfreintes. */
export function CreationPreviewPanel({ preview }: { preview: AdminReservationPreview }) {
  const status = describeInitialStatus(preview);
  const manual = preview.prixManuel !== null && preview.prixManuel !== undefined;
  const limitReached = preview.reservationsActives >= MAX_ACTIVE_RESERVATIONS_PER_CLIENT;

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {preview.violationsRegles.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={preview.reglesForcees ? "Règles de séjour forcées" : "Règles de séjour enfreintes"}
          description={
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {preview.violationsRegles.map((violation) => (
                <li key={violation.code}>{violation.message}</li>
              ))}
            </ul>
          }
        />
      )}
      <Descriptions size="small" column={1} bordered>
        <Descriptions.Item label="Résidence">{preview.residence.nom ?? "—"}</Descriptions.Item>
        <Descriptions.Item label="Séjour">
          {formatDateTime(preview.dateDebut)} → {formatDateTime(preview.dateFin)} · {preview.nuits} nuit
          {preview.nuits > 1 ? "s" : ""}
        </Descriptions.Item>
        <Descriptions.Item label="Prix calculé (tarif résidence)">
          <Text delete={manual}>{formatFcfa(preview.prixCalcule)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Hébergement retenu">
          <Space size={8}>
            <Text strong>{formatFcfa(preview.montantTotalReservation)}</Text>
            {manual && <Tag color="orange">Prix manuel</Tag>}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Commission ImmoPlus">{formatFcfa(preview.montantCommission)}</Descriptions.Item>
        <Descriptions.Item label="Frais de paiement">{formatFcfa(preview.fraisPaiement)}</Descriptions.Item>
        <Descriptions.Item label="Le client paiera">
          <Text strong style={{ fontSize: 16 }}>
            {formatFcfa(preview.montantPaye)}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Statut de départ">
          <Tag color={status.color} style={{ whiteSpace: "normal" }}>
            {status.label}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Réservations actives du client">
          <Space size={8}>
            <Text type={limitReached ? "danger" : undefined}>
              {preview.reservationsActives} / {MAX_ACTIVE_RESERVATIONS_PER_CLIENT}
            </Text>
            {preview.limiteIgnoree && (
              <Tag color="orange" icon={<WarningOutlined />}>
                Limite ignorée
              </Tag>
            )}
          </Space>
        </Descriptions.Item>
      </Descriptions>
    </Space>
  );
}
