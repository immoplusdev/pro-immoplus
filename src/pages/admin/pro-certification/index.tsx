import { useState, useMemo } from "react";
import {
  Table,
  Input,
  Select,
  Slider,
  Button,
  Avatar,
  Space,
  Typography,
  Tooltip,
  message,
  Row,
  Col,
} from "antd";
import { SyncOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useProUsersList, useRecalculate } from "@/hooks/useProCertification";
import { CertificationStatusTag } from "@/components/admin/pro-certification/CertificationStatusTag";
import { ScoreProgress } from "@/components/admin/pro-certification/ScoreProgress";
import { CertificationStatus, getRoleName } from "@/types/pro-certification.types";
import type { ProUserWithCertification } from "@/types/pro-certification.types";

const { Text, Title } = Typography;

const STATUS_OPTIONS = [
  { label: "En progression", value: CertificationStatus.EN_PROGRESSION },
  { label: "Éligible", value: CertificationStatus.ELIGIBLE },
  { label: "Certifié", value: CertificationStatus.CERTIFIE },
  { label: "Suspendu", value: CertificationStatus.SUSPENDU },
  { label: "Retiré", value: CertificationStatus.RETIRE },
];

const ROLE_LABELS: Record<string, string> = {
  pro_particulier: "Pro Particulier",
  pro_entreprise: "Pro Entreprise",
};

export function ProCertificationList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);

  const { data, isLoading } = useProUsersList({ page, pageSize, search });
  const recalculate = useRecalculate();

  const handleRecalculate = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    recalculate.mutate(userId, {
      onSuccess: () => message.success("Score recalculé avec succès"),
      onError: () => message.error("Erreur lors du recalcul"),
    });
  };

  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((u) => {
      const cert = u.certification;
      if (selectedStatuses.length > 0) {
        if (!cert || !selectedStatuses.includes(cert.status)) return false;
      }
      const score = cert?.scoreTotal ?? 0;
      if (score < scoreRange[0] || score > scoreRange[1]) return false;
      return true;
    });
  }, [data?.data, selectedStatuses, scoreRange]);

  const columns = [
    {
      title: "Pro",
      key: "user",
      render: (_: unknown, record: ProUserWithCertification) => (
        <Space>
          <Avatar src={record.avatar} size={36}>
            {record.firstName?.[0]}
            {record.lastName?.[0]}
          </Avatar>
          <div>
            <Text strong style={{ display: "block" }}>
              {record.firstName} {record.lastName}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Rôle",
      key: "role",
      width: 140,
      render: (_: unknown, record: ProUserWithCertification) => {
        const name = getRoleName(record.role);
        return <Text style={{ fontSize: 12 }}>{ROLE_LABELS[name] ?? name}</Text>;
      },
    },
    {
      title: "Score /100",
      key: "score",
      width: 180,
      render: (_: unknown, record: ProUserWithCertification) => {
        const score = record.certification?.scoreTotal;
        if (score === undefined) return <Text type="secondary">—</Text>;
        return (
          <div style={{ minWidth: 140 }}>
            <ScoreProgress score={score} size="small" />
          </div>
        );
      },
    },
    {
      title: "Statut",
      key: "status",
      width: 130,
      render: (_: unknown, record: ProUserWithCertification) => {
        const status = record.certification?.status;
        if (!status) return <Text type="secondary">—</Text>;
        return <CertificationStatusTag status={status} />;
      },
    },
    {
      title: "Dernière maj",
      key: "lastCalc",
      width: 130,
      render: (_: unknown, record: ProUserWithCertification) => {
        const date = record.certification?.lastCalculatedAt;
        if (!date) return <Text type="secondary">—</Text>;
        return (
          <Text style={{ fontSize: 12 }}>{dayjs(date).format("DD/MM/YYYY HH:mm")}</Text>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_: unknown, record: ProUserWithCertification) => (
        <Space size="small">
          <Tooltip title="Recalculer">
            <Button
              size="small"
              icon={<SyncOutlined />}
              loading={recalculate.isLoading && recalculate.variables === record.id}
              onClick={(e) => handleRecalculate(record.id, e)}
            />
          </Tooltip>
          <Tooltip title="Voir le détail">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/pro-certification/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>
          Certification Pro
        </Title>
      </div>

      <Row gutter={[16, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Input
            placeholder="Recherche par nom, téléphone…"
            prefix={<SearchOutlined />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={() => {
              setSearch(searchInput);
              setPage(1);
            }}
            onBlur={() => {
              setSearch(searchInput);
              setPage(1);
            }}
            allowClear
            onClear={() => {
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
          />
        </Col>
        <Col xs={24} sm={8}>
          <Select
            mode="multiple"
            placeholder="Filtrer par statut"
            style={{ width: "100%" }}
            options={STATUS_OPTIONS}
            onChange={(vals) => {
              setSelectedStatuses(vals);
              setPage(1);
            }}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Score : {scoreRange[0]} – {scoreRange[1]}
            </Text>
            <Slider
              range
              min={0}
              max={100}
              value={scoreRange}
              onChange={(v) => {
                setScoreRange(v as [number, number]);
                setPage(1);
              }}
            />
          </div>
        </Col>
      </Row>

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        size="small"
        onRow={(record) => ({
          style: { cursor: "pointer" },
          onClick: () => navigate(`/admin/pro-certification/${record.id}`),
        })}
        pagination={{
          current: page,
          pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
          showTotal: (total) => `${total} Pro`,
        }}
      />
    </div>
  );
}
