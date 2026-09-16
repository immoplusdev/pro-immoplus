import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
  notification,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SyncOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useSyncTemplates } from "@/hooks/useCampaigns";
import { useCampaignRegistry } from "@/hooks/useCampaignRegistry";
import { CampaignCanalTag } from "@/components/admin/campaigns/CampaignCanalTag";
import { CampaignStatutTag } from "@/components/admin/campaigns/CampaignStatutTag";
import { extractErrorMessage } from "@/lib/helpers";
import { cibleLabel } from "@/types/campaigns.types";
import type { CampaignRegistryEntry } from "@/types/campaigns.types";

const { Title, Text } = Typography;

export function CampaignsList() {
  const navigate = useNavigate();
  const { entries, remove } = useCampaignRegistry();
  const sync = useSyncTemplates();

  const handleSync = () => {
    sync.mutate(undefined, {
      onSuccess: (res) => {
        notification.success({
          message: "Synchronisation terminée",
          description: `WhatsApp : ${res.whatsapp.nouveaux} nouveau(x) / ${res.whatsapp.total} · Push : ${res.push.nouveaux} nouveau(x) / ${res.push.total}`,
        });
      },
      onError: (err) => {
        notification.warning({
          message: "Synchronisation impossible",
          description: extractErrorMessage(
            err,
            "La dernière synchronisation date de moins de 5 minutes."
          ),
        });
      },
    });
  };

  const columns = [
    {
      title: "Canal",
      dataIndex: "canal",
      key: "canal",
      width: 130,
      render: (canal: CampaignRegistryEntry["canal"]) => <CampaignCanalTag canal={canal} />,
    },
    {
      title: "Cible",
      dataIndex: "cible",
      key: "cible",
      width: 150,
      render: (cible: CampaignRegistryEntry["cible"]) => cibleLabel[cible],
    },
    {
      title: "Template",
      dataIndex: "templateNom",
      key: "templateNom",
      render: (nom: string, record: CampaignRegistryEntry) => (
        <div>
          <Text>{nom || "—"}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {Object.keys(record.mappingVariables).length} variable(s) mappée(s)
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      width: 120,
      render: (statut: CampaignRegistryEntry["statut"]) => <CampaignStatutTag statut={statut} />,
    },
    {
      title: "Audience",
      dataIndex: "audience",
      key: "audience",
      width: 110,
      render: (n: number) => n?.toLocaleString("fr-FR") ?? "—",
    },
    {
      title: "Planifiée le",
      dataIndex: "planifieLe",
      key: "planifieLe",
      width: 150,
      render: (v: string | null | undefined) =>
        v ? dayjs(v).format("DD/MM/YYYY HH:mm") : <Text type="secondary">—</Text>,
    },
    {
      title: "Créée le",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      render: (_: unknown, record: CampaignRegistryEntry) => (
        <Space size="small">
          <Tooltip title="Suivi / envoi">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/campaigns/${record.campagneId}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Retirer de la liste ?"
            description="La campagne n'est pas supprimée côté serveur, seulement retirée de cette liste locale."
            okText="Retirer"
            cancelText="Annuler"
            onConfirm={() => {
              remove(record.campagneId);
              message.success("Campagne retirée de la liste");
            }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Campagnes Push &amp; WhatsApp
        </Title>
        <Space wrap>
          <Button
            icon={<SyncOutlined />}
            loading={sync.isLoading}
            onClick={handleSync}
          >
            Synchroniser les templates
          </Button>
          <Button icon={<TagsOutlined />} onClick={() => navigate("/admin/campaign-tags")}>
            Gérer les tags
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/campaigns/create")}
          >
            Nouvelle campagne
          </Button>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Cette liste est locale à ce navigateur (l'API n'expose pas d'endpoint de liste). Chaque campagne créée y est ajoutée automatiquement ; le suivi interroge l'API en temps réel."
      />

      <Table<CampaignRegistryEntry>
        rowKey="campagneId"
        dataSource={entries}
        columns={columns}
        size="small"
        pagination={{ pageSize: 20, showSizeChanger: true }}
        locale={{ emptyText: "Aucune campagne créée depuis ce navigateur" }}
      />
    </div>
  );
}
