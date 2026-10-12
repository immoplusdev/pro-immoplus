import { Link } from "react-router-dom";
import { Space, Table, Typography } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { EnvironmentOutlined } from "@ant-design/icons";
import { MappedTag } from "@/components/admin/common/MappedTag";
import { LocationActionTag } from "./LocationActionTag";
import { locationRoleMap, type LocationExportItem, type LocationRole } from "@/types/location.types";
import { formatCapturedAt, formatCoordinate, googleMapsUrl, locationEntityPath, userLocationTabPath } from "./format";

const { Text } = Typography;

export interface LocationExportRow extends LocationExportItem {
  key: string;
}

interface Props {
  rows: LocationExportRow[];
  loading: boolean;
  pagination: TablePaginationConfig;
}

const columns: ColumnsType<LocationExportRow> = [
  { title: "Date / heure", dataIndex: "capturedAt", width: 150, render: (v: string) => formatCapturedAt(v) },
  {
    title: "Utilisateur",
    dataIndex: "userId",
    width: 300,
    render: (v: string) => (
      <Link to={userLocationTabPath(v)} style={{ fontFamily: "monospace", fontSize: 12 }}>
        {v}
      </Link>
    ),
  },
  {
    title: "Rôle",
    dataIndex: "role",
    width: 90,
    render: (v: LocationRole) => <MappedTag value={v} map={locationRoleMap} />,
  },
  {
    title: "Action",
    dataIndex: "action",
    width: 190,
    render: (v: LocationExportItem["action"]) => <LocationActionTag action={v} />,
  },
  {
    title: "Entité",
    dataIndex: "entityId",
    width: 300,
    render: (_: string, r) => {
      if (!r.entityId) return "—";
      const path = locationEntityPath(r.action, r.entityId);
      return path ? (
        <Link to={path} style={{ fontFamily: "monospace", fontSize: 12 }}>
          {r.entityId}
        </Link>
      ) : (
        <Text copyable style={{ fontFamily: "monospace", fontSize: 12 }}>
          {r.entityId}
        </Text>
      );
    },
  },
  { title: "Ville", dataIndex: "city", width: 140, render: (v: string | null) => v || "—" },
  {
    title: "Coordonnées",
    key: "coords",
    width: 260,
    render: (_, r) => (
      <Space size={8} wrap>
        <Text style={{ fontFamily: "monospace", fontSize: 12 }}>
          {formatCoordinate(r.latitude)}, {formatCoordinate(r.longitude)}
        </Text>
        <Typography.Link href={googleMapsUrl(r)} target="_blank" rel="noopener noreferrer">
          <EnvironmentOutlined /> Maps
        </Typography.Link>
      </Space>
    ),
  },
];

export function LocationExportTable({ rows, loading, pagination }: Props) {
  return (
    <Table<LocationExportRow>
      rowKey="key"
      columns={columns}
      dataSource={rows}
      loading={loading}
      locale={{ emptyText: "Aucune position pour ces filtres" }}
      scroll={{ x: 1450 }}
      pagination={pagination}
    />
  );
}
