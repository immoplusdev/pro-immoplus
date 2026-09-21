import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useAllRelaisInterests } from "@/hooks/useImmoRelais";
import { MappedTag } from "@/components/admin/common/MappedTag";
import { QueryError } from "@/components/admin/common/QueryError";
import { useUrlFilters } from "@/components/admin/common/useUrlFilters";
import {
  RELAIS_INTEREST_STATUSES,
  relaisInterestStatusMap,
  type ImmoRelaisInterest,
  type ImmoRelaisInterestStatus,
} from "@/types/immo-relais";

const { Title, Text } = Typography;
const PAGE_SIZE = 20;

export const interestColumns: ColumnsType<ImmoRelaisInterest> = [
  { title: "Client", dataIndex: "clientId", width: 160, ellipsis: true },
  {
    title: "Message",
    dataIndex: "message",
    width: 260,
    ellipsis: true,
    render: (v?: string) => v ?? <Text type="secondary">—</Text>,
  },
  {
    title: "Statut",
    dataIndex: "status",
    width: 120,
    render: (v: ImmoRelaisInterestStatus) => <MappedTag value={v} map={relaisInterestStatusMap} />,
  },
  {
    title: "Rencontre",
    dataIndex: "meetingDate",
    width: 150,
    render: (v: string | null) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : <Text type="secondary">—</Text>),
  },
  {
    title: "Date",
    dataIndex: "createdAt",
    width: 150,
    render: (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
  },
];

export function RelaisInterestsList() {
  const navigate = useNavigate();
  const { values, update, reset, page } = useUrlFilters(["status", "relaisId", "clientId"] as const);

  const { data, isLoading, isFetching, isError, error, refetch } = useAllRelaisInterests({
    status: values.status as ImmoRelaisInterestStatus | undefined,
    relaisId: values.relaisId,
    clientId: values.clientId,
    page,
    limit: PAGE_SIZE,
  });

  const columns: ColumnsType<ImmoRelaisInterest> = [
    {
      title: "Relais",
      dataIndex: "relaisId",
      width: 160,
      ellipsis: true,
      render: (id: string) => <Link to={`/admin/relais/${id}`}>{id}</Link>,
    },
    ...interestColumns,
  ];

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/relais")} aria-label="Retour aux relais" />
        <Title level={4} style={{ margin: 0 }}>
          Intérêts Immo-Relais
        </Title>
      </Space>
      <Space wrap style={{ display: "flex", marginBottom: 16 }} role="search" aria-label="Filtres des intérêts">
        <Select
          allowClear
          placeholder="Statut"
          aria-label="Filtrer par statut"
          style={{ width: 160 }}
          value={values.status}
          options={RELAIS_INTEREST_STATUSES.map((s) => ({ value: s, label: relaisInterestStatusMap[s].label }))}
          onChange={(v) => update({ status: v })}
        />
        <Input.Search
          allowClear
          placeholder="ID relais"
          aria-label="Filtrer par relais"
          style={{ width: 220 }}
          defaultValue={values.relaisId}
          key={`r-${values.relaisId ?? ""}`}
          onSearch={(v) => update({ relaisId: v.trim() || undefined })}
        />
        <Input.Search
          allowClear
          placeholder="ID client"
          aria-label="Filtrer par client"
          style={{ width: 220 }}
          defaultValue={values.clientId}
          key={`c-${values.clientId ?? ""}`}
          onSearch={(v) => update({ clientId: v.trim() || undefined })}
        />
        <Button onClick={reset}>Réinitialiser</Button>
      </Space>
      {isError ? (
        <QueryError error={error} onRetry={() => refetch()} />
      ) : (
        <Table<ImmoRelaisInterest>
          rowKey="id"
          columns={columns}
          dataSource={data?.data}
          loading={isLoading || isFetching}
          locale={{ emptyText: "Aucun intérêt" }}
          scroll={{ x: 1000 }}
          pagination={{
            current: data?.currentPage ?? page,
            pageSize: data?.pageSize ?? PAGE_SIZE,
            total: data?.totalCount ?? 0,
            showSizeChanger: false,
            onChange: (p) => update({ page: String(p) }),
          }}
        />
      )}
    </div>
  );
}
