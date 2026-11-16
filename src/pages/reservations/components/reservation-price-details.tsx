import React from "react";
import { Card, Descriptions, Space, Table, Tag, Typography } from "antd";
import { CalculatorOutlined } from "@ant-design/icons";
import {
  BOOKING_MODE_LABELS,
  formatAdvanceNotice,
  type BookingMode,
} from "@/pages/residences/stay/stay-residence.helpers";

const { Text } = Typography;

type PriceNight = { date: string; price: number; weekend: boolean };

export type StayPriceDetails = {
  currency?: string;
  nights?: PriceNight[];
  nightsCount?: number;
  subtotal?: number;
  weeklyDiscountPercent?: number;
  discountAmount?: number;
  total?: number;
};

type Props = {
  priceDetails?: StayPriceDetails | null;
  acceptedRules?: Record<string, any> | null;
};

const formatMoney = (value: number | null | undefined, currency = "XOF") =>
  value == null
    ? "—"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

/** "2026-11-06" → "ven. 06/11/2026" (date seule : pas de passage par l'UTC). */
function formatNightDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(y, m - 1, d),
  );
}

const dash = (value: unknown) => (value == null || value === "" ? "—" : String(value));

/**
 * Détail du prix d'une réservation sur une résidence séjour : nuit par nuit (week-end signalé),
 * réduction appliquée et règles acceptées. Ces champs valent null sur les réservations historiques :
 * le bloc n'est alors pas affiché.
 */
export function ReservationPriceDetails({ priceDetails, acceptedRules }: Props) {
  if (!priceDetails && !acceptedRules) return null;
  const currency = priceDetails?.currency || "XOF";
  const nights = priceDetails?.nights ?? [];
  const discountPercent = priceDetails?.weeklyDiscountPercent ?? 0;
  const rules = acceptedRules ?? {};

  return (
    <Card
      style={{ border: "1px solid #E8E9EE", borderRadius: 10 }}
      title={
        <Space>
          <CalculatorOutlined />
          <p>Détail du prix</p>
        </Space>
      }
      headStyle={{ padding: "1rem" }}
      bodyStyle={{ padding: "1.5rem" }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {priceDetails && (
          <>
            <Table<PriceNight>
              size="small"
              rowKey="date"
              pagination={false}
              dataSource={nights}
              columns={[
                { title: "Nuit", dataIndex: "date", render: (date: string) => formatNightDate(date) },
                {
                  title: "Tarif",
                  dataIndex: "weekend",
                  render: (weekend: boolean) =>
                    weekend ? <Tag color="purple">Week-end</Tag> : <Tag>Semaine</Tag>,
                },
                {
                  title: "Prix",
                  dataIndex: "price",
                  align: "right",
                  render: (price: number) => formatMoney(price, currency),
                },
              ]}
              summary={() => (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      Sous-total ({priceDetails.nightsCount ?? nights.length} nuit
                      {(priceDetails.nightsCount ?? nights.length) > 1 ? "s" : ""})
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      {formatMoney(priceDetails.subtotal, currency)}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      Réduction séjour long{discountPercent ? ` (${discountPercent} %)` : ""}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      {priceDetails.discountAmount
                        ? `− ${formatMoney(priceDetails.discountAmount, currency)}`
                        : "Aucune"}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <Text strong>Total</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong>{formatMoney(priceDetails.total, currency)}</Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              )}
            />
          </>
        )}

        {acceptedRules && (
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2 }}
            title={<Text type="secondary" style={{ fontSize: 13 }}>Règles acceptées à la réservation</Text>}
          >
            <Descriptions.Item label="Mode">
              {rules.bookingMode ? BOOKING_MODE_LABELS[rules.bookingMode as BookingMode] ?? rules.bookingMode : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Prix de base / nuit">{formatMoney(rules.baseNightlyPrice, currency)}</Descriptions.Item>
            <Descriptions.Item label="Prix week-end / nuit">
              {rules.weekendNightlyPrice != null ? formatMoney(rules.weekendNightlyPrice, currency) : "Pas de tarif week-end"}
            </Descriptions.Item>
            <Descriptions.Item label="Réduction dès 7 nuits">
              {rules.weeklyDiscountPercent ? `${rules.weeklyDiscountPercent} %` : "Aucune"}
            </Descriptions.Item>
            <Descriptions.Item label="Nuits min / max">
              {dash(rules.minNights)} / {dash(rules.maxNights)}
            </Descriptions.Item>
            <Descriptions.Item label="Arrivée / départ">
              {dash(rules.checkInFrom)} → {dash(rules.checkOutBefore)}
            </Descriptions.Item>
            <Descriptions.Item label="Préavis">
              {typeof rules.advanceNoticeDays === "number" ? formatAdvanceNotice(rules.advanceNoticeDays) : "—"}
            </Descriptions.Item>
            {rules.advanceNoticeDays === 0 && (
              <Descriptions.Item label="Heure limite le jour même">{dash(rules.sameDayCutoff)}</Descriptions.Item>
            )}
            <Descriptions.Item label="Réservable jusqu'à">
              {rules.bookingHorizonDays != null ? `${rules.bookingHorizonDays} jours à l'avance` : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Nuits de préparation">{dash(rules.preparationNights)}</Descriptions.Item>
          </Descriptions>
        )}
      </Space>
    </Card>
  );
}
