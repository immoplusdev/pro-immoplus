import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Col, Input, Row, Select, Skeleton, Space, Statistic, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SyncOutlined, UnorderedListOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useRelaisList, useRelaisModuleStatus, useRelaisStats } from "@/hooks/useImmoRelais";
import { MappedTag } from "@/components/admin/common/MappedTag";
import { QueryError } from "@/components/admin/common/QueryError";
import { useUrlFilters } from "@/components/admin/common/useUrlFilters";
import { formatFcfa } from "@/pages/admin/relais/format";
import {
  RELAIS_INTEREST_STATUSES,
  RELAIS_STATUSES,
  relaisInterestStatusMap,
  relaisMatchingStatusMap,
  relaisStatusMap,
  type ImmoRelais,
  type ImmoRelaisSortBy,
  type ImmoRelaisStatus,
} from "@/types/immo-relais";

const { Title, Text } = Typography;
const PAGE_SIZE = 20;

function Dashboard() {
  const stats = useRelaisStats();
  const moduleStatus = useRelaisModuleStatus();

  return (
    <Card
      size="small"
      style={{ marginBottom: 16 }}
      title="Vue d'ensemble"
      extra={
        moduleStatus.data ? (
          <Badge
            status={moduleStatus.data.active ? "success" : "error"}
            text={moduleStatus.data.active ? "Module iMatch actif" : "Module iMatch inactif"}
          />
        ) : null
      }
    >
      {stats.isError ? (
        <QueryError error={stats.error} onRetry={() => stats.refetch()} />
      ) : stats.isLoading ? (
        <Skeleton active />
      ) : (
        <>
          <Text strong>Relais par statut</Text>
          <Row gutter={[16, 16]} style={{ margin: "8px 0 16px" }}>
            {RELAIS_STATUSES.map((s) => (
              <Col xs={12} md={6} key={s}>
                <Card size="small">
                  <Statistic
                    title={<Tag color={relaisStatusMap[s].color}>{relaisStatusMap[s].label}</Tag>}
                    value={stats.data?.relaisByStatus[s] ?? 0}
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <Text strong>Intérêts par statut</Text>
          <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
            {RELAIS_INTEREST_STATUSES.map((s) => (
              <Col xs={12} md={8} key={s}>
                <Card size="small">
                  <Statistic
                    title={<Tag color={relaisInterestStatusMap[s].color}>{relaisInterestStatusMap[s].label}</Tag>}
                    value={stats.data?.interestsByStatus[s] ?? 0}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Card>
  );
}

export function RelaisList() {
  const navigate = useNavigate();
  const { values, update, reset, page } = useUrlFilters(["status", "occupantId", "sortBy"] as const);

  const { data, isLoading, isFetching, isError, error, refetch } = useRelaisList({
    status: values.status as ImmoRelaisStatus | undefined,
    occupantId: values.occupantId,
    sortBy: (values.sortBy as ImmoRelaisSortBy | undefined) ?? "recent",
    page,
    limit: PAGE_SIZE,
  });

  const columns: ColumnsType<ImmoRelais> = [
    {
      title: "Lieu",
      key: "location",
      width: 240,
      render: (_, r) => (
        <div>
          <Text>{r.location}</Text>
          {r.landmark && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {r.landmark}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Bien",
      key: "property",
      width: 200,
      render: (_, r) => `${r.propertyType} · ${r.rooms} p.${r.surface ? ` · ${r.surface} m²` : ""}`,
    },
    {
      title: "Loyer",
      dataIndex: "currentRentPrice",
      width: 130,
      render: (v: number | null) => formatFcfa(v),
    },
    {
      title: "Disponibilité",
      dataIndex: "availabilityDate",
      width: 120,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Statut",
      dataIndex: "status",
      width: 120,
      render: (v: ImmoRelaisStatus) => <MappedTag value={v} map={relaisStatusMap} />,
    },
    {
      title: "Matching",
      dataIndex: "matchingStatus",
      width: 170,
      render: (v: ImmoRelais["matchingStatus"]) => (
        <Space size={4}>
          {v === "matching" && <SyncOutlined spin aria-label="Matching en cours" />}
          <MappedTag value={v} map={relaisMatchingStatusMap} />
        </Space>
      ),
    },
    { title: "Intéressés", dataIndex: "interestedCount", width: 100, align: "center" },
    { title: "Matches potentiels", dataIndex: "potentialMatches", width: 140, align: "center" },
    {
      title: "Créé le",
      dataIndex: "createdAt",
      width: 130,
      render: (v?: string) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
    },
  ];

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <Title level={4} style={{ margin: 0 }}>
          Immo-Relais
        </Title>
        <Button icon={<UnorderedListOutlined />} onClick={() => navigate("/admin/relais/interests")}>
          Tous les intérêts
        </Button>
      </Space>

      <Dashboard />

      <Space wrap style={{ marginBottom: 16 }} role="search" aria-label="Filtres des relais">
        <Select
          allowClear
          placeholder="Statut"
          aria-label="Filtrer par statut"
          style={{ width: 160 }}
          value={values.status}
          options={RELAIS_STATUSES.map((s) => ({ value: s, label: relaisStatusMap[s].label }))}
          onChange={(v) => update({ status: v })}
        />
        <Input.Search
          allowClear
          placeholder="ID occupant"
          aria-label="Filtrer par occupant"
          style={{ width: 240 }}
          defaultValue={values.occupantId}
          key={values.occupantId ?? "no-occupant"}
          onSearch={(v) => update({ occupantId: v.trim() || undefined })}
        />
        <Select
          aria-label="Tri"
          style={{ width: 160 }}
          value={values.sortBy ?? "recent"}
          options={[
            { value: "recent", label: "Plus récents" },
            { value: "oldest", label: "Plus anciens" },
          ]}
          onChange={(v) => update({ sortBy: v === "recent" ? undefined : v })}
        />
        <Button onClick={reset}>Réinitialiser</Button>
      </Space>

      {isError ? (
        <QueryError error={error} onRetry={() => refetch()} />
      ) : (
        <Table<ImmoRelais>
          rowKey="id"
          columns={columns}
          dataSource={data?.data}
          loading={isLoading || isFetching}
          locale={{ emptyText: "Aucun relais" }}
          scroll={{ x: 1300 }}
          onRow={(r) => ({
            onClick: () => navigate(`/admin/relais/${r.id}`),
            onKeyDown: (e) => e.key === "Enter" && navigate(`/admin/relais/${r.id}`),
            tabIndex: 0,
            style: { cursor: "pointer" },
          })}
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

