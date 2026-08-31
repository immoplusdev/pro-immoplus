import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  useCampaignTags,
  useCreateCampaignTag,
  useDeleteCampaignTag,
  useUpdateCampaignTag,
} from "@/hooks/useCampaigns";
import { CampaignTagFormModal } from "@/components/admin/campaigns/CampaignTagFormModal";
import { TagPrioriteTag } from "@/components/admin/campaigns/TagPrioriteTag";
import { extractErrorMessage } from "@/lib/helpers";
import {
  CampaignCible,
  CampaignTagType,
  cibleLabel,
  cibleOptions,
  tagTypeLabel,
  wrapTag,
} from "@/types/campaigns.types";
import type { CampaignTagDetail, CampaignTagPayload } from "@/types/campaigns.types";

const { Title, Text } = Typography;

export function CampaignTagsManagement() {
  const navigate = useNavigate();
  const [cible, setCible] = useState<CampaignCible | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CampaignTagDetail | null>(null);

  const { data: tags = [], isFetching } = useCampaignTags(cible);
  const createTag = useCreateCampaignTag();
  const updateTag = useUpdateCampaignTag();
  const deleteTag = useDeleteCampaignTag();

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (tag: CampaignTagDetail) => {
    setEditing(tag);
    setModalOpen(true);
  };

  const handleSubmit = (payload: CampaignTagPayload) => {
    const onError = (err: unknown) =>
      message.error(extractErrorMessage(err, "Erreur lors de l'enregistrement du tag"));

    if (editing) {
      updateTag.mutate(
        { tagId: editing.tagId, ...payload },
        {
          onSuccess: () => {
            message.success("Tag mis à jour");
            setModalOpen(false);
          },
          onError,
        }
      );
    } else {
      createTag.mutate(payload, {
        onSuccess: () => {
          message.success("Tag créé");
          setModalOpen(false);
        },
        onError,
      });
    }
  };

  const handleDelete = (tag: CampaignTagDetail) => {
    deleteTag.mutate(tag.tagId, {
      onSuccess: () => message.success("Tag supprimé"),
      onError: (err) => message.error(extractErrorMessage(err, "Erreur lors de la suppression")),
    });
  };

  const columns = [
    {
      title: "Tag",
      dataIndex: "tag",
      key: "tag",
      render: (raw: string) => <Text code>{wrapTag(raw)}</Text>,
    },
    {
      title: "Cible",
      dataIndex: "cible",
      key: "cible",
      width: 160,
      render: (c: CampaignCible) => cibleLabel[c],
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 180,
      render: (t: CampaignTagType) => (
        <Tag color={t === CampaignTagType.Fixe ? "orange" : "blue"}>{tagTypeLabel[t]}</Tag>
      ),
    },
    {
      title: "Champ source",
      dataIndex: "sourceField",
      key: "sourceField",
      width: 200,
      render: (v: string | null | undefined) => v || <Text type="secondary">—</Text>,
    },
    {
      title: "Priorité",
      dataIndex: "priorite",
      key: "priorite",
      width: 140,
      render: (p: CampaignTagDetail["priorite"]) => <TagPrioriteTag priorite={p} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: CampaignTagDetail) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm
            title="Supprimer ce tag ?"
            description="Si ce tag est encore référencé dans une campagne brouillon, l'envoi de cette campagne échouera plus tard (409). La suppression, elle, n'est pas bloquée."
            okText="Supprimer"
            okButtonProps={{ danger: true }}
            cancelText="Annuler"
            onConfirm={() => handleDelete(record)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteTag.isLoading && deleteTag.variables === record.tagId}
            />
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
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/campaigns")}>
            Retour aux campagnes
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            Catalogue de tags
          </Title>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Nouveau tag
        </Button>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Les tags sont utilisables comme variables dans les templates. Les tags « champ base de données » sont résolus automatiquement ; les tags « variable fixe » demandent une valeur au moment de l'envoi."
      />

      <Space style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Filtrer par cible"
          style={{ width: 220 }}
          options={cibleOptions}
          value={cible}
          onChange={setCible}
        />
      </Space>

      <Table<CampaignTagDetail>
        rowKey="tagId"
        loading={isFetching}
        dataSource={tags}
        columns={columns}
        size="small"
        pagination={{ pageSize: 20, showSizeChanger: true }}
      />

      <CampaignTagFormModal
        open={modalOpen}
        tag={editing}
        loading={createTag.isLoading || updateTag.isLoading}
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
