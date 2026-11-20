import { Card, Rate, Space, Table, Tabs, Typography } from "antd";
import type { TableProps } from "antd";
import { Link } from "react-router-dom";
import { StatusReservationTag } from "@/pages/reservations/components/status-reservation-tag";
import {
  ClientDetailDto,
  ClientHistoriqueAvisHoteDto,
  ClientHistoriqueReservationDto,
  comportementLabel,
  EMPTY_VALUE,
  formatDateFr,
  formatFcfa,
  formatNote,
} from "@/types/clients-statistiques.types";

const { Text } = Typography;

const reservationColumns: TableProps<ClientHistoriqueReservationDto>["columns"] = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (value: string) => formatDateFr(value),
  },
  {
    title: "Statut",
    dataIndex: "statut",
    key: "statut",
    render: (value: string) => <StatusReservationTag status={value} />,
  },
  {
    title: "Montant",
    dataIndex: "montantFcfa",
    key: "montantFcfa",
    align: "right",
    render: (value: number) => formatFcfa(value),
  },
  {
    title: "",
    key: "lien",
    align: "right",
    render: (_, record) => (
      <Link to={`/reservations/edit/${encodeURIComponent(record.reservationId)}`}>Voir</Link>
    ),
  },
];

const avisColumns: TableProps<ClientHistoriqueAvisHoteDto>["columns"] = [
  {
    title: "Note",
    dataIndex: "note",
    key: "note",
    render: (value: number | null) =>
      value != null ? (
        <Space size={6}>
          <Rate disabled allowHalf value={value} style={{ fontSize: 14 }} />
          <Text type="secondary">{formatNote(value)}</Text>
        </Space>
      ) : (
        EMPTY_VALUE
      ),
  },
  {
    title: "Comportement",
    dataIndex: "comportement",
    key: "comportement",
    render: (value: ClientHistoriqueAvisHoteDto["comportement"]) => (value ? comportementLabel[value] : EMPTY_VALUE),
  },
  {
    title: "Commentaire",
    dataIndex: "commentaire",
    key: "commentaire",
    render: (value: string | null) => (value?.trim() ? value : EMPTY_VALUE),
  },
  {
    title: "Réservation",
    dataIndex: "reservationId",
    key: "reservationId",
    align: "right",
    render: (value: string) => <Link to={`/reservations/edit/${encodeURIComponent(value)}`}>Voir</Link>,
  },
];

/** Historique (10 entrées max par liste, plus récentes en premier — plafond SQL côté back). */
export function ClientStatisticsHistory({ historique }: { historique: ClientDetailDto["historique"] }) {
  return (
    <Card title="Historique" size="small">
      <Tabs
        items={[
          {
            key: "reservations",
            label: `Dernières réservations (${historique.dernieresReservations.length})`,
            children: (
              <Table<ClientHistoriqueReservationDto>
                size="small"
                rowKey="reservationId"
                dataSource={historique.dernieresReservations}
                columns={reservationColumns}
                pagination={false}
                scroll={{ x: true }}
                locale={{ emptyText: "Aucune réservation" }}
              />
            ),
          },
          {
            key: "avis",
            label: `Derniers avis des hôtes (${historique.derniersAvisHote.length})`,
            children: (
              <Table<ClientHistoriqueAvisHoteDto>
                size="small"
                rowKey="reservationId"
                dataSource={historique.derniersAvisHote}
                columns={avisColumns}
                pagination={false}
                scroll={{ x: true }}
                locale={{ emptyText: "Aucun avis" }}
              />
            ),
          },
        ]}
      />
    </Card>
  );
}
