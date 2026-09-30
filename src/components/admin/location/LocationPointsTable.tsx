import { Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EnvironmentOutlined } from "@ant-design/icons";
import type { LocationPoint } from "@/types/location.types";
import { formatCapturedAt, formatCoordinate, googleMapsUrl } from "./format";

interface Row extends LocationPoint {
  index: number;
}

interface Props {
  points: readonly LocationPoint[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

/** Liste des positions ; un clic sur une ligne centre la carte sur le point. */
export function LocationPointsTable({ points, selectedIndex, onSelect }: Props) {
  const rows: Row[] = points.map((p, index) => ({ ...p, index }));

  const columns: ColumnsType<Row> = [
    { title: "#", dataIndex: "index", width: 60, render: (i: number) => i + 1 },
    { title: "Date / heure", dataIndex: "capturedAt", width: 170, render: (v: string) => formatCapturedAt(v) },
    { title: "Latitude", dataIndex: "latitude", width: 130, render: (v: number) => formatCoordinate(v) },
    { title: "Longitude", dataIndex: "longitude", width: 130, render: (v: number) => formatCoordinate(v) },
    {
      title: "Carte",
      key: "maps",
      width: 200,
      render: (_, r) => (
        <Typography.Link
          href={googleMapsUrl(r)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <EnvironmentOutlined /> Ouvrir dans Google Maps
        </Typography.Link>
      ),
    },
  ];

  return (
    <Table<Row>
      size="small"
      rowKey="index"
      columns={columns}
      dataSource={rows}
      pagination={{ pageSize: 20, showSizeChanger: false, hideOnSinglePage: true }}
      rowClassName={(r) => (r.index === selectedIndex ? "ant-table-row-selected" : "")}
      onRow={(r) => ({
        onClick: () => onSelect(r.index),
        onKeyDown: (e) => e.key === "Enter" && onSelect(r.index),
        tabIndex: 0,
        style: { cursor: "pointer" },
      })}
    />
  );
}
