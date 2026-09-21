import { useNavigate } from "react-router-dom";
import { Button, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useConversationReports } from "@/hooks/useMessaging";
import { MappedTag } from "@/components/admin/common/MappedTag";
import { QueryError } from "@/components/admin/common/QueryError";
import { useUrlFilters } from "@/components/admin/common/useUrlFilters";
import { reportReasonMap, type ConversationReport, type ConversationReportReason } from "@/types/messaging";

const { Title, Text } = Typography;
const PER_PAGE = 20;

export function ConversationReportsList() {
  const navigate = useNavigate();
  const { values, update, page } = useUrlFilters(["reason"] as const);

  const { data, isLoading, isFetching, isError, error, refetch } = useConversationReports({
    reason: values.reason as ConversationReportReason | undefined,
    page,
    perPage: PER_PAGE,
  });

  const columns: ColumnsType<ConversationReport> = [
    {
      title: "Motif",
      dataIndex: "reason",
      width: 220,
      render: (v: ConversationReportReason) => <MappedTag value={v} map={reportReasonMap} />,
    },
    { title: "Signaleur", dataIndex: "reporterId", width: 150, ellipsis: true },
    { title: "Utilisateur signalé", dataIndex: "reportedUserId", width: 150, ellipsis: true },
    {
      title: "Détails",
      dataIndex: "details",
      width: 260,
      ellipsis: true,
      render: (v: string | null) => v ?? <Text type="secondary">—</Text>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      width: 150,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, r) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/admin/conversations/${r.conversationId}`)}>
          Voir la conversation
        </Button>
      ),
    },
  ];

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/conversations")} aria-label="Retour aux conversations" />
        <Title level={4} style={{ margin: 0 }}>
          Signalements
        </Title>
      </Space>
      <div style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Filtrer par motif"
          aria-label="Filtrer par motif"
          style={{ width: 260 }}
          value={values.reason}
          options={(Object.keys(reportReasonMap) as ConversationReportReason[]).map((k) => ({
            value: k,
            label: reportReasonMap[k].label,
          }))}
          onChange={(v) => update({ reason: v })}
        />
      </div>
      {isError ? (
        <QueryError error={error} onRetry={() => refetch()} />
      ) : (
        <Table<ConversationReport>
          rowKey="id"
          columns={columns}
          dataSource={data?.data}
          loading={isLoading || isFetching}
          locale={{ emptyText: "Aucun signalement" }}
          scroll={{ x: 1100 }}
          pagination={{
            current: data?.currentPage ?? page,
            pageSize: data?.pageSize ?? PER_PAGE,
            total: data?.totalCount ?? 0,
            showSizeChanger: false,
            onChange: (p) => update({ page: String(p) }),
          }}
        />
      )}
    </div>
  );
}
