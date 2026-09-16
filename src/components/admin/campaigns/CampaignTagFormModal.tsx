import { useEffect } from "react";
import { Form, Input, Modal, Select, Typography } from "antd";
import {
  CampaignTagType,
  SOURCE_FIELDS_BY_CIBLE,
  cibleOptions,
  prioriteOptions,
  tagTypeOptions,
} from "@/types/campaigns.types";
import type { CampaignCible, CampaignTagDetail, CampaignTagPayload } from "@/types/campaigns.types";

const { Text } = Typography;

interface Props {
  open: boolean;
  /** tag à éditer ; absent = création */
  tag?: CampaignTagDetail | null;
  loading: boolean;
  onSubmit: (payload: CampaignTagPayload) => void;
  onCancel: () => void;
}

type FormValues = {
  tag: string;
  cible: CampaignCible;
  type: CampaignTagType;
  sourceField?: string;
  priorite: CampaignTagPayload["priorite"];
};

export function CampaignTagFormModal({ open, tag, loading, onSubmit, onCancel }: Props) {
  const [form] = Form.useForm<FormValues>();
  const isEdit = !!tag;

  const type = Form.useWatch("type", form);
  const cible = Form.useWatch("cible", form);

  useEffect(() => {
    if (!open) return;
    if (tag) {
      form.setFieldsValue({
        tag: tag.tag,
        cible: tag.cible,
        type: tag.type,
        sourceField: tag.sourceField ?? undefined,
        priorite: tag.priorite,
      });
    } else {
      form.resetFields();
    }
  }, [open, tag, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload: CampaignTagPayload = {
      tag: values.tag.trim(),
      cible: values.cible,
      type: values.type,
      priorite: values.priorite,
      ...(values.type === CampaignTagType.DbField ? { sourceField: values.sourceField } : {}),
    };
    onSubmit(payload);
  };

  const sourceFieldOptions = cible
    ? SOURCE_FIELDS_BY_CIBLE[cible as CampaignCible].map((f) => ({ label: f, value: f }))
    : [];

  return (
    <Modal
      open={open}
      title={isEdit ? "Modifier le tag" : "Nouveau tag"}
      okText={isEdit ? "Enregistrer" : "Créer"}
      cancelText="Annuler"
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={onCancel}
      afterClose={() => form.resetFields()}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="tag"
          label="Nom du tag"
          extra="Sans accolades. Lettres, chiffres et underscore uniquement."
          rules={[
            { required: true, message: "Le nom du tag est obligatoire" },
            {
              pattern: /^\w+$/,
              message: "Format invalide (regex ^\\w+$ : lettres, chiffres, underscore)",
            },
          ]}
        >
          <Input placeholder="prenom" addonBefore="{{" addonAfter="}}" />
        </Form.Item>

        <Form.Item
          name="cible"
          label="Cible"
          rules={[{ required: true, message: "La cible est obligatoire" }]}
        >
          <Select
            options={cibleOptions}
            placeholder="Choisir une cible"
            onChange={() => form.setFieldValue("sourceField", undefined)}
          />
        </Form.Item>

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: "Le type est obligatoire" }]}
        >
          <Select
            options={tagTypeOptions}
            placeholder="Choisir un type"
            onChange={() => form.setFieldValue("sourceField", undefined)}
          />
        </Form.Item>

        {type === CampaignTagType.DbField && (
          <Form.Item
            name="sourceField"
            label="Champ source"
            extra="Champ de la base de données qui alimentera automatiquement ce tag."
            rules={[{ required: true, message: "Le champ source est obligatoire pour un tag db_field" }]}
          >
            <Select
              options={sourceFieldOptions}
              placeholder={cible ? "Choisir un champ" : "Choisissez d'abord une cible"}
              disabled={!cible}
              showSearch
            />
          </Form.Item>
        )}

        {type === CampaignTagType.Fixe && (
          <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            Un tag fixe n'a pas de champ source : sa valeur est saisie manuellement
            au moment de l'envoi de chaque campagne qui l'utilise.
          </Text>
        )}

        <Form.Item
          name="priorite"
          label="Priorité"
          rules={[{ required: true, message: "La priorité est obligatoire" }]}
        >
          <Select options={prioriteOptions} placeholder="Choisir une priorité" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
