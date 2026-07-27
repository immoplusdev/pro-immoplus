import { useState } from "react";
import { useList, useDelete } from "@refinedev/core";
import {
  Table,
  Button,
  Space,
  Tag,
  Select,
  Popconfirm,
  message,
  Typography,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  AdCampaign,
  AdStatus,
  AdPlacement,
  STATUS_COLORS,
  AD_STATUSES,
  AD_PLACEMENTS,
} from "./types";

const { Text } = Typography;

export const AdCampaignList = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<AdStatus | null>(null);
  const [filterPlacement, setFilterPlacement] = useState<AdPlacement | null>(null);

  const { data, isLoading } = useList<AdCampaign>({
    resource: "ads/campaigns",
    pagination: { mode: "off" },
  });

  const { mutate: deleteOne } = useDelete();

  const campaigns = (data?.data ?? []).filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterPlacement && c.placement !== filterPlacement) return false;
    return true;
  });

  const handleDelete = (id: number) => {
    deleteOne(
      { resource: "ads/campaigns", id },
      {
        onSuccess: () => message.success("Campagne supprimée"),
        onError: () => message.error("Erreur lors de la suppression"),
      }
    );
  };

  const columns = [
    {
      dataIndex: "id",
      title: "ID",
      width: 60,
      sorter: (a: AdCampaign, b: AdCampaign) => a.id - b.id,
    },
    {
      dataIndex: "placement",
      title: "Placement",
      ellipsis: true,
    },
    {
      dataIndex: "campaign_category",
      title: "Catégorie",
    },
    {
      dataIndex: "type",
      title: "Type",
    },
    {
      dataIndex: "status",
      title: "Statut",
      render: (status: AdStatus) => (
        <Tag color={STATUS_COLORS[status]}>{status}</Tag>
      ),
    },
    {
      dataIndex: "priority",
      title: "Priorité",
      width: 80,
      sorter: (a: AdCampaign, b: AdCampaign) => a.priority - b.priority,
    },
    {
      dataIndex: "start_date",
      title: "Date début",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      dataIndex: "end_date",
      title: "Date fin",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Actions",
      align: "center" as const,
      render: (_: unknown, record: AdCampaign) => (
        <Space>
          <Tooltip title="Voir le détail">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/ads/campaigns/show/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Link to={`/ads/campaigns/edit/${record.id}`}>
              <Button size="small" icon={<EditOutlined />} />
            </Link>
          </Tooltip>
          <Popconfirm
            title="Supprimer cette campagne ?"
            description="Cette action est irréversible."
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 700 }}>
          Campagnes publicitaires
        </Text>
        <Link to="/ads/campaigns/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Créer une campagne
          </Button>
        </Link>
      </div>

      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Filtrer par statut"
          style={{ width: 160 }}
          onChange={(v) => setFilterStatus((v as AdStatus) ?? null)}
          options={AD_STATUSES.map((s) => ({ label: s, value: s }))}
        />
        <Select
          allowClear
          showSearch
          placeholder="Filtrer par placement"
          style={{ width: 240 }}
          onChange={(v) => setFilterPlacement((v as AdPlacement) ?? null)}
          options={AD_PLACEMENTS.map((p) => ({ label: p, value: p }))}
        />
      </Space>

      <Table
        dataSource={campaigns}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        size="small"
        pagination={{ pageSize: 20, showSizeChanger: true }}
      />
    </div>
  );
};
