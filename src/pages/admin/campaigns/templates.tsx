import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Button, Popconfirm, Segmented, Select, Space, Table, Tooltip, Typography, message } from "antd";
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  useCampaignTemplate,
  useCampaignTemplates,
  useCreatePushTemplate,
  useDeletePushTemplate,
  useUpdatePushTemplate,
} from "@/hooks/useCampaigns";
import { PushTemplateFormModal } from "@/components/admin/campaigns/PushTemplateFormModal";
import { TemplateStatusBadge } from "@/components/admin/campaigns/TemplateStatusBadge";
import { isTemplateEditable } from "@/components/admin/campaigns/campaign-helpers";
import { extractErrorMessage } from "@/lib/helpers";
import {
  CampaignCanal,
  TemplateApprovalStatus,
  canalOptions,
  cibleOptions,
} from "@/types/campaigns.types";
import type { CampaignCible, CampaignTemplate, PushTemplatePayload } from "@/types/campaigns.types";

const { Title, Text } = Typography;

export function CampaignTemplatesManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const editParam = searchParams.get("edit") ?? undefined;

  const [canal, setCanal] = useState<CampaignCanal>(CampaignCanal.Push);
  const [cible, setCible] = useState<CampaignCible | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(editParam);

  useEffect(() => {
    if (editParam) {
      setCanal(CampaignCanal.Push);
      setEditingId(editParam);
    }
  }, [editParam]);

  const { data: templates = [], isFetching } = useCampaignTemplates({ canal, cible });
  const { data: editing, isFetching: loadingEditing, isError: editingError, error } = useCampaignTemplate(editingId);

  const createTemplate = useCreatePushTemplate();
  const updateTemplate = useUpdatePushTemplate();
  const deleteTemplate = useDeletePushTemplate();

  const closeModal = () => {
    setCreating(false);
    setEditingId(undefined);
    if (editParam) {
      searchParams.delete("edit");
      setSearchParams(searchParams, { replace: true });
    }
  };

  useEffect(() => {
    if (editingError) {
      message.error(extractErrorMessage(error, "Modèle introuvable"));
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingError]);

  const handleSubmit = (payload: PushTemplatePayload) => {
    const onError = (err: unknown) =>
      message.error(extractErrorMessage(err, "Erreur lors de l'enregistrement du modèle"));

    if (editingId) {
      updateTemplate.mutate(
        { templateId: editingId, ...payload },
        {
          onSuccess: (tpl) => {
            message.success(
              tpl.statutApprobation === TemplateApprovalStatus.Approved
                ? "Modèle enregistré : il peut de nouveau être envoyé"
                : "Modèle enregistré"
            );
            closeModal();
          },
          onError,
        }
      );
    } else {
      createTemplate.mutate(payload, {
        onSuccess: () => {
          message.success("Modèle créé");
          closeModal();
        },
        onError,
      });
    }
  };

  const handleDelete = (tpl: CampaignTemplate) => {
    deleteTemplate.mutate(tpl.templateId, {
      onSuccess: () => message.success("Modèle supprimé"),
      onError: (err) => message.error(extractErrorMessage(err, "Erreur lors de la suppression")),
    });
  };

  const toRewriteCount =
    canal === CampaignCanal.Push
      ? templates.filter((t) => t.statutApprobation === TemplateApprovalStatus.Rejected).length
      : 0;

  const columns = [
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      render: (nom: string) => <Text strong>{nom}</Text>,
    },
    {
      title: "Variables",
      dataIndex: "variables",
      key: "variables",
      render: (vars: string[]) =>
        vars.length ? vars.map((v) => <Text code key={v}>{`{{${v}}}`}</Text>) : <Text type="secondary">—</Text>,
    },
    {
      title: "Statut",
      key: "statut",
      width: 220,
      render: (_: unknown, tpl: CampaignTemplate) => (
        <TemplateStatusBadge template={tpl} canal={canal} showApproved />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_: unknown, tpl: CampaignTemplate) =>
        isTemplateEditable(tpl) ? (
          <Space size="small">
            <Tooltip title="Modifier">
              <Button
                size="small"
                type={tpl.statutApprobation === TemplateApprovalStatus.Rejected ? "primary" : "default"}
                icon={<EditOutlined />}
                loading={loadingEditing && editingId === tpl.templateId}
                onClick={() => setEditingId(tpl.templateId)}
              />
            </Tooltip>
            <Popconfirm
              title="Supprimer ce modèle ?"
              description="Impossible s'il est utilisé par une campagne."
              okText="Supprimer"
              cancelText="Annuler"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(tpl)}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Géré par Twilio
          </Text>
        ),
    },
  ];

  const modalOpen = creating || (!!editingId && !!editing);

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
        <Space wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/campaigns")}>
            Retour aux campagnes
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            Modèles de campagne
          </Title>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
          Nouveau modèle push
        </Button>
      </div>

      <Space wrap style={{ marginBottom: 16 }}>
        <Segmented
          value={canal}
          options={canalOptions}
          onChange={(v) => setCanal(v as CampaignCanal)}
        />
        <Select
          allowClear
          style={{ width: 220 }}
          placeholder="Toutes les cibles"
          options={cibleOptions}
          value={cible}
          onChange={setCible}
        />
      </Space>

      {toRewriteCount > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`${toRewriteCount} modèle(s) push à réécrire`}
          description="Ces modèles convertis depuis OneSignal n'ont pas de titre ou utilisent une syntaxe non supportée. Ils ne peuvent pas être envoyés tant qu'ils n'ont pas été modifiés (titre et texte obligatoires)."
        />
      )}

      <Table<CampaignTemplate>
        rowKey="templateId"
        dataSource={templates}
        columns={columns}
        loading={isFetching}
        size="small"
        pagination={{ pageSize: 20, showSizeChanger: true }}
        locale={{ emptyText: "Aucun modèle pour ce canal" }}
      />

      <PushTemplateFormModal
        open={modalOpen}
        template={creating ? null : editing}
        loading={createTemplate.isLoading || updateTemplate.isLoading}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />
    </div>
  );
}
