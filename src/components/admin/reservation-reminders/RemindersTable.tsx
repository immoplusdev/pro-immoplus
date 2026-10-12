import { Link } from "react-router-dom";
import { Empty, Table, Typography } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { MappedTag } from "@/components/admin/common/MappedTag";
import { formatReminderDate } from "@/lib/helpers/reservation-reminders.helper";
import {
  getReminderKindLabel,
  getReminderTargetLabel,
  REMINDER_OUTCOME_TAGS,
  REMINDER_TRIGGER_TAGS,
  type AdminReminderItem,
} from "@/types/reservation-reminders.types";

const { Text } = Typography;

interface Props {
  rows: AdminReminderItem[];
  loading: boolean;
  pagination: TablePaginationConfig;
  onChange: (pagination: TablePaginationConfig) => void;
}

const monospace = { fontFamily: "monospace", fontSize: 12 } as const;

/** Id tronqué (8 premiers caractères), complet au survol. */
function IdLink({ id, to }: { id: string | null | undefined; to: (id: string) => string }) {
  if (!id) return <Text type="secondary">—</Text>;
  return (
    <Link to={to(id)} style={monospace} title={id}>
      {id.slice(0, 8)}…
    </Link>
  );
}

const columns: ColumnsType<AdminReminderItem> = [
  {
    title: "Envoyée le",
    dataIndex: "sentAt",
    width: 150,
    render: (v: string) => formatReminderDate(v),
  },
  {
    title: "Type",
    dataIndex: "kind",
    width: 260,
    render: (v: string) => getReminderKindLabel(v),
  },
  {
    title: "Déclenchement",
    dataIndex: "trigger",
    width: 130,
    render: (v: AdminReminderItem["trigger"]) => <MappedTag value={v} map={REMINDER_TRIGGER_TAGS} />,
  },
  {
    title: "Destinataire",
    dataIndex: "target",
    width: 120,
    render: (v: string) => getReminderTargetLabel(v),
  },
  {
    title: "Réservation",
    dataIndex: "reservationId",
    width: 120,
    render: (v: string) => <IdLink id={v} to={(id) => `/reservations/edit/${encodeURIComponent(id)}`} />,
  },
  {
    title: "Résidence",
    dataIndex: "residenceId",
    width: 120,
    render: (v: string | null) => <IdLink id={v} to={(id) => `/residences/edit/${encodeURIComponent(id)}`} />,
  },
  {
    title: "Résultat",
    dataIndex: "outcome",
    width: 170,
    render: (v: AdminReminderItem["outcome"]) => <MappedTag value={v} map={REMINDER_OUTCOME_TAGS} />,
  },
];

export function RemindersTable({ rows, loading, pagination, onChange }: Props) {
  return (
    <Table<AdminReminderItem>
      rowKey="id"
      columns={columns}
      dataSource={rows}
      loading={loading}
      locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune relance pour ces filtres" /> }}
      scroll={{ x: true }}
      pagination={pagination}
      onChange={onChange}
    />
  );
}
