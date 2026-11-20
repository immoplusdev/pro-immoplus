import type { ReactNode } from "react";
import { Alert, Card, Col, Row, Space, Table, Tag, Typography } from "antd";
import { ArrowRightOutlined, WarningOutlined } from "@ant-design/icons";
import { ReservationPriceDetails } from "@/pages/reservations/components/reservation-price-details";
import { formatDateTime, formatFcfa, isDifferentInstant } from "@/lib/helpers/reservation-relocation.helper";
import type { RelocationPreview, RelocationResidenceSide } from "@/types/reservation-relocation.types";

const { Text } = Typography;

type ComparisonRow = {
  key: string;
  label: string;
  before: ReactNode;
  after: ReactNode;
  changed: boolean;
};

const changedStyle = { background: "#FFF7E6", padding: "0 4px", borderRadius: 4 } as const;

function comparisonRows(oldSide: RelocationResidenceSide, newSide: RelocationResidenceSide): ComparisonRow[] {
  return [
    { key: "nom", label: "Résidence", before: oldSide.nom ?? "—", after: newSide.nom ?? "—", changed: true },
    {
      key: "total",
      label: "Prix total (hébergement)",
      before: formatFcfa(oldSide.montantTotal),
      after: formatFcfa(newSide.montantTotal),
      changed: oldSide.montantTotal !== newSide.montantTotal,
    },
    {
      key: "commission",
      label: "Commission",
      before: formatFcfa(oldSide.montantCommission),
      after: formatFcfa(newSide.montantCommission),
      changed: oldSide.montantCommission !== newSide.montantCommission,
    },
    {
      key: "paye",
      label: "Montant payé (frais compris)",
      before: formatFcfa(oldSide.montantPaye),
      after: formatFcfa(newSide.montantPaye),
      changed: oldSide.montantPaye !== newSide.montantPaye,
    },
    {
      key: "arrivee",
      label: "Arrivée",
      before: formatDateTime(oldSide.dateDebut),
      after: formatDateTime(newSide.dateDebut),
      changed: isDifferentInstant(oldSide.dateDebut, newSide.dateDebut),
    },
    {
      key: "depart",
      label: "Départ",
      before: formatDateTime(oldSide.dateFin),
      after: formatDateTime(newSide.dateFin),
      changed: isDifferentInstant(oldSide.dateFin, newSide.dateFin),
    },
  ];
}

/** Comparaison côte à côte de l'ancienne et de la nouvelle résidence. */
export function RelocationComparison({ preview }: { preview: RelocationPreview }) {
  const rows = comparisonRows(preview.ancienneResidence, preview.nouvelleResidence);
  const arrivalChanged = isDifferentInstant(preview.ancienneResidence.dateDebut, preview.nouvelleResidence.dateDebut);
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Table<ComparisonRow>
        size="small"
        pagination={false}
        rowKey="key"
        dataSource={rows}
        columns={[
          { title: "", dataIndex: "label", width: 200, render: (label: string) => <Text type="secondary">{label}</Text> },
          { title: "Actuelle", dataIndex: "before" },
          { title: "", key: "arrow", width: 32, render: () => <ArrowRightOutlined style={{ color: "#BFBFBF" }} /> },
          {
            title: "Nouvelle",
            dataIndex: "after",
            render: (after: ReactNode, row) =>
              row.changed && row.key !== "nom" ? (
                <Text strong style={changedStyle}>
                  {after}
                </Text>
              ) : (
                <Text strong={row.key === "nom"}>{after}</Text>
              ),
          },
        ]}
      />
      {arrivalChanged && (
        <Alert
          type="warning"
          showIcon
          message={`L'heure d'arrivée change : ${formatDateTime(preview.ancienneResidence.dateDebut)} → ${formatDateTime(
            preview.nouvelleResidence.dateDebut,
          )}`}
        />
      )}
    </Space>
  );
}

/** Bloc « Impact financier ». */
export function RelocationFinancialImpact({ preview }: { preview: RelocationPreview }) {
  return (
    <Card size="small" title="Impact financier" style={{ borderRadius: 10 }}>
      {preview.paid ? (
        <Space direction="vertical" size={4}>
          <Text>Encaissé : {formatFcfa(preview.montantEncaisse)}</Text>
          {preview.remboursementClient > 0 && (
            <Text>Remboursé au coffre du client : {formatFcfa(preview.remboursementClient)}</Text>
          )}
          {preview.absorbeImmoplus > 0 && (
            <Text type="danger" strong>
              <WarningOutlined /> Pris en charge par ImmoPlus : {formatFcfa(preview.absorbeImmoplus)}
            </Text>
          )}
          <Text>
            Versé au nouveau propriétaire au début du séjour : {formatFcfa(preview.netNouveauProprietaire)}
          </Text>
        </Space>
      ) : (
        <Text>Réservation non payée : le client paiera {formatFcfa(preview.nouvelleResidence.montantPaye)}</Text>
      )}
    </Card>
  );
}

/** Aperçu complet : avertissements, règles forcées, comparaison, impact financier, nuit par nuit. */
export function RelocationPreviewPanel({ preview }: { preview: RelocationPreview }) {
  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {preview.avertissements.map((warning) => (
        <Alert key={warning} type="warning" showIcon banner message={warning} />
      ))}
      {preview.reglesForcees && preview.violationsRegles.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message="Règles de la résidence forcées"
          description={
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {preview.violationsRegles.map((violation) => (
                <li key={violation.code}>{violation.message}</li>
              ))}
            </ul>
          }
        />
      )}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <RelocationComparison preview={preview} />
        </Col>
        <Col xs={24} lg={10}>
          <RelocationFinancialImpact preview={preview} />
        </Col>
      </Row>
      {preview.nouvelleResidence.priceDetails ? (
        <ReservationPriceDetails priceDetails={preview.nouvelleResidence.priceDetails} />
      ) : (
        <Tag>Détail nuit par nuit indisponible</Tag>
      )}
    </Space>
  );
}
