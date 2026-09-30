import { Link } from "react-router-dom";
import { Table, Tag, Typography } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { MappedTag } from "@/components/admin/common/MappedTag";
import {
  ACTOR_TAGS,
  getReasonLabel,
  getStatusLabel,
  isFailureStatus,
  STATUS_TAG_COLORS,
  type FailureActor,
  type FailureReasonItem,
} from "@/types/failure-reasons.types";
import { formatRespondedAt } from "@/lib/helpers/failure-reasons.helper";

const { Text, Paragraph } = Typography;

export interface FailureReasonRow extends FailureReasonItem {
  key: string;
}

interface Props {
  rows: FailureReasonRow[];
  loading: boolean;
  pagination: TablePaginationConfig;
}

const monospace = { fontFamily: "monospace", fontSize: 12 } as const;

/** Lien vers une fiche ; "—" si l'id est absent (champ récent, environnement API pas à jour). */
function IdLink({ id, to }: { id: string | undefined; to: (id: string) => string }) {
  if (!id) return <Text type="secondary">—</Text>;
  return (
    <Link to={to(id)} style={monospace}>
      {id}
    </Link>
  );
}

const columns: ColumnsType<FailureReasonRow> = [
  {
    title: "Réponse le",
    dataIndex: "respondedAt",
    width: 140,
    render: (v: string) => formatRespondedAt(v),
  },
  {
    title: "Réservation",
    dataIndex: "reservationId",
    width: 290,
    render: (v: string | undefined) => (
      <IdLink id={v} to={(id) => `/reservations/edit/${encodeURIComponent(id)}`} />
    ),
  },
  {
    title: "Répondant",
    dataIndex: "respondedBy",
    width: 290,
    render: (v: string | undefined) => <IdLink id={v} to={(id) => `/users/edit/${encodeURIComponent(id)}`} />,
  },
  {
    title: "Acteur",
    dataIndex: "actor",
    width: 90,
    render: (v: FailureActor) => <MappedTag value={v} map={ACTOR_TAGS} />,
  },
  {
    title: "Statut",
    dataIndex: "status",
    width: 220,
    render: (v: string) => <Tag color={isFailureStatus(v) ? STATUS_TAG_COLORS[v] : "default"}>{getStatusLabel(v)}</Tag>,
  },
  {
    title: "Motif",
    key: "reason",
    width: 260,
    render: (_, r) => getReasonLabel(r.actor, r.reasonCode),
  },
  {
    title: "Commentaire",
    dataIndex: "comment",
    width: 280,
    render: (v: string | null) =>
      v ? (
        <Paragraph ellipsis={{ rows: 2, tooltip: v }} style={{ margin: 0 }}>
          {v}
        </Paragraph>
      ) : (
        <Text type="secondary">—</Text>
      ),
  },
];

export function FailureReasonsTable({ rows, loading, pagination }: Props) {
  return (
    <Table<FailureReasonRow>
      rowKey="key"
      columns={columns}
      dataSource={rows}
      loading={loading}
      locale={{ emptyText: "Aucune réponse pour ces filtres" }}
      scroll={{ x: 1570 }}
      pagination={pagination}
    />
  );
}
