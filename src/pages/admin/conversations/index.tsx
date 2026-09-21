import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, DatePicker, Input, Select, Space, Switch, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FlagOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { useConversations } from "@/hooks/useMessaging";
import { MappedTag } from "@/components/admin/common/MappedTag";
import { QueryError } from "@/components/admin/common/QueryError";
import { useUrlFilters } from "@/components/admin/common/useUrlFilters";
import {
  conversationStatusMap,
  conversationTypeMap,
  type Conversation,
  type ConversationStatus,
  type ConversationType,
} from "@/types/messaging";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const PER_PAGE = 20;

const FILTER_KEYS = ["type", "status", "userId", "reported", "from", "to"] as const;

const toOptions = <K extends string>(map: Record<K, { label: string }>) =>
  (Object.keys(map) as K[]).map((k) => ({ value: k, label: map[k].label }));

export function ConversationsList() {
  const navigate = useNavigate();
  const { values, update, reset, page } = useUrlFilters(FILTER_KEYS);

  const { data, isLoading, isFetching, isError, error, refetch } = useConversations({
    type: values.type as ConversationType | undefined,
    status: values.status as ConversationStatus | undefined,
    userId: values.userId,
    reported: values.reported === "true" ? true : undefined,
    from: values.from,
    to: values.to,
    page,
    perPage: PER_PAGE,
  });

  const columns: ColumnsType<Conversation> = [
    {
      title: "Type",
      dataIndex: "type",
      width: 120,
      render: (v: ConversationType) => <MappedTag value={v} map={conversationTypeMap} />,
    },
    {
      title: "Statut",
      dataIndex: "status",
      width: 110,
      render: (v: ConversationStatus) => <MappedTag value={v} map={conversationStatusMap} />,
    },
    { title: "Client", dataIndex: "clientId", width: 150, ellipsis: true },
    {
      title: "Pro",
      dataIndex: "proId",
      width: 150,
      ellipsis: true,
      render: (v: string | null) => v ?? <Text type="secondary">Support</Text>,
    },
    {
      title: "Dernier message",
      key: "last",
      width: 280,
      render: (_, r) =>
        r.lastMessageAt ? (
          <div>
            <Text ellipsis style={{ maxWidth: 260, display: "block" }}>
              {r.lastMessagePreview ?? "—"}
            </Text>
            <Tooltip title={dayjs(r.lastMessageAt).format("DD/MM/YYYY HH:mm")}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(r.lastMessageAt).locale("fr").fromNow()}
              </Text>
            </Tooltip>
          </div>
        ) : (
          <Text type="secondary">Aucun message</Text>
        ),
    },
    {
      title: "Contenus bloqués",
      dataIndex: "blockedContentCount",
      width: 140,
      align: "center",
      render: (n: number) => (n > 0 ? <Badge count={n} overflowCount={99} /> : <Text type="secondary">0</Text>),
    },
    {
      title: "Créée le",
      dataIndex: "createdAt",
      width: 150,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
  ];

  const range: [dayjs.Dayjs, dayjs.Dayjs] | null =
    values.from && values.to ? [dayjs(values.from), dayjs(values.to)] : null;

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <Title level={4} style={{ margin: 0 }}>
          Conversations
        </Title>
        <Button icon={<FlagOutlined />} onClick={() => navigate("/admin/conversations/reports")}>
          Signalements
        </Button>
      </Space>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap role="search" aria-label="Filtres des conversations">
          <Select
            allowClear
            placeholder="Type"
            aria-label="Filtrer par type"
            style={{ width: 150 }}
            value={values.type}
            options={toOptions(conversationTypeMap)}
            onChange={(v) => update({ type: v })}
          />
          <Select
            allowClear
            placeholder="Statut"
            aria-label="Filtrer par statut"
            style={{ width: 150 }}
            value={values.status}
            options={toOptions(conversationStatusMap)}
            onChange={(v) => update({ status: v })}
          />
          <Input.Search
            allowClear
            placeholder="ID utilisateur (client ou pro)"
            aria-label="Filtrer par utilisateur"
            style={{ width: 260 }}
            defaultValue={values.userId}
            key={values.userId ?? "no-user"}
            onSearch={(v) => update({ userId: v.trim() || undefined })}
          />
          <Space>
            <Switch
              aria-label="Signalées uniquement"
              checked={values.reported === "true"}
              onChange={(c) => update({ reported: c ? "true" : undefined })}
            />
            <Text>Signalées uniquement</Text>
          </Space>
          <RangePicker
            aria-label="Période"
            value={range}
            format="DD/MM/YYYY"
            onChange={(d) =>
              update({
                from: d?.[0] ? d[0].startOf("day").toISOString() : undefined,
                to: d?.[1] ? d[1].endOf("day").toISOString() : undefined,
              })
            }
          />
          <Button onClick={reset}>Réinitialiser</Button>
        </Space>
      </Card>

      {isError ? (
        <QueryError error={error} onRetry={() => refetch()} />
      ) : (
        <Table<Conversation>
          rowKey="id"
          columns={columns}
          dataSource={data?.data}
          loading={isLoading || isFetching}
          locale={{ emptyText: "Aucune conversation ne correspond aux filtres" }}
          scroll={{ x: 1100 }}
          onRow={(r) => ({
            onClick: () => navigate(`/admin/conversations/${r.id}`),
            onKeyDown: (e) => e.key === "Enter" && navigate(`/admin/conversations/${r.id}`),
            tabIndex: 0,
            style: { cursor: "pointer" },
          })}
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
