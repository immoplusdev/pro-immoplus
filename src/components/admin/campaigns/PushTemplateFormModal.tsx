import { useEffect } from "react";
import { Alert, Form, Input, Modal, Select, Space, Typography } from "antd";
import { useCampaignTemplateTags } from "@/hooks/useCampaigns";
import { PUSH_TEMPLATE_LIMITS, TemplateApprovalStatus, cibleOptions } from "@/types/campaigns.types";
import type { CampaignCible, CampaignTemplateDetail, PushTemplatePayload } from "@/types/campaigns.types";

const { Text } = Typography;

interface Props {
  open: boolean;
  /** modèle à modifier ; absent = création */
  template?: CampaignTemplateDetail | null;
  loading: boolean;
  onSubmit: (payload: PushTemplatePayload) => void;
  onCancel: () => void;
}

type FormValues = PushTemplatePayload;

const requiredText = (label: string, max: number) => [
  { required: true, whitespace: true, message: `${label} est obligatoire` },
  { max, message: `${label} : ${max} caractères maximum` },
];

export function PushTemplateFormModal({ open, template, loading, onSubmit, onCancel }: Props) {
  const [form] = Form.useForm<FormValues>();
  const isEdit = !!template;
  const cible = Form.useWatch("cible", form) as CampaignCible | undefined;
  const { data: tags = [] } = useCampaignTemplateTags(cible);

  useEffect(() => {
    if (!open) return;
    if (template) {
      form.setFieldsValue({
        cible: template.cible,
        nom: template.nom,
        title: template.title ?? "",
        body: template.body ?? "",
      });
    } else {
      form.resetFields();
    }
  }, [open, template, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit({
      cible: values.cible,
      nom: values.nom.trim(),
      title: values.title.trim(),
      body: values.body.trim(),
    });
  };

  const toRewrite = template?.statutApprobation === TemplateApprovalStatus.Rejected;

  return (
    <Modal
      open={open}
      title={isEdit ? "Modifier le modèle push" : "Nouveau modèle push"}
      okText={isEdit ? "Enregistrer" : "Créer"}
      cancelText="Annuler"
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={onCancel}
      afterClose={() => form.resetFields()}
      destroyOnClose
      width={640}
    >
      {toRewrite && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Modèle à réécrire"
          description="Ce modèle a été converti depuis OneSignal sans titre ou avec une syntaxe non supportée. Il ne peut pas être envoyé tant qu'il n'a pas un titre et un texte. L'enregistrer le rend de nouveau utilisable."
        />
      )}
      <Form form={form} layout="vertical" requiredMark>
        <Form.Item
          name="cible"
          label="Cible"
          rules={[{ required: true, message: "La cible est obligatoire" }]}
          extra={isEdit ? "La cible ne peut pas être modifiée après création." : undefined}
        >
          <Select options={cibleOptions} placeholder="Application concernée" disabled={isEdit} />
        </Form.Item>
        <Form.Item name="nom" label="Nom du modèle" rules={requiredText("Le nom", PUSH_TEMPLATE_LIMITS.nom)}>
          <Input maxLength={PUSH_TEMPLATE_LIMITS.nom} placeholder="Relance clients inactifs" />
        </Form.Item>
        <Form.Item name="title" label="Titre de la notification" rules={requiredText("Le titre", PUSH_TEMPLATE_LIMITS.title)}>
          <Input showCount maxLength={PUSH_TEMPLATE_LIMITS.title} placeholder="{{prenom}}, on vous attend !" />
        </Form.Item>
        <Form.Item name="body" label="Texte de la notification" rules={requiredText("Le texte", PUSH_TEMPLATE_LIMITS.body)}>
          <Input.TextArea
            showCount
            maxLength={PUSH_TEMPLATE_LIMITS.body}
            autoSize={{ minRows: 4, maxRows: 10 }}
            placeholder="Découvrez nos nouvelles résidences."
          />
        </Form.Item>
      </Form>
      <Space direction="vertical" size={4}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Variables : <Text code>{"{{tag}}"}</Text> uniquement, avec les tags de la cible (pas de Liquid ni de{" "}
          <Text code>{"{% %}"}</Text>).
        </Text>
        {cible && tags.length > 0 && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tags disponibles :{" "}
            {tags.map((t) => (
              <Text code key={t.tag}>
                {t.tag}
              </Text>
            ))}
          </Text>
        )}
      </Space>
    </Modal>
  );
}
