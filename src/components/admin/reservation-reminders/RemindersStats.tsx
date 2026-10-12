import { Card, Col, Row, Statistic, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { conversionRate } from "@/lib/helpers/reservation-reminders.helper";

const nf = new Intl.NumberFormat("fr-FR");

interface Props {
  /** `meta.total` de la liste ; `undefined` pendant le premier chargement. */
  total: number | undefined;
  /** Somme des totaux par statut payé ; `undefined` pendant le chargement ou en erreur. */
  paid: number | undefined;
  loading: boolean;
  paidLoading: boolean;
  paidError: boolean;
}

/** Indicateurs des filtres courants : relances envoyées, relances ayant abouti à un paiement, taux. */
export function RemindersStats({ total, paid, loading, paidLoading, paidError }: Props) {
  const rate = total !== undefined && paid !== undefined ? conversionRate(total, paid) : null;
  const paidPlaceholder = paidError ? "—" : undefined;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={8}>
        <Card size="small">
          <Statistic
            title="Relances envoyées"
            loading={loading && total === undefined}
            value={total ?? 0}
            formatter={(v) => nf.format(Number(v))}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card size="small">
          <Statistic
            title={
              <span>
                Ayant abouti à un paiement{" "}
                <Tooltip title="Réservation aujourd'hui validée, en cours ou terminée.">
                  <InfoCircleOutlined />
                </Tooltip>
              </span>
            }
            loading={paidLoading && paid === undefined && !paidError}
            value={paidPlaceholder ?? paid ?? 0}
            formatter={(v) => (paidPlaceholder ? paidPlaceholder : nf.format(Number(v)))}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card size="small">
          <Statistic
            title="Taux de paiement"
            loading={(loading && total === undefined) || (paidLoading && paid === undefined && !paidError)}
            value={rate ?? "—"}
            precision={rate === null ? undefined : 1}
            suffix={rate === null ? undefined : "%"}
            decimalSeparator=","
          />
        </Card>
      </Col>
    </Row>
  );
}
