import React from "react";
import {
  Form,
  Input,
  Select,
  Radio,
  InputNumber,
  DatePicker,
  Card,
  Row,
  Col,
  Image,
  Space,
  Typography,
  FormProps,
  FormInstance,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  AD_PLACEMENTS,
  AD_ACTIONS,
  AD_CATEGORIES,
  AD_STATUSES,
  AD_TYPES,
  ENTITY_ID_ACTIONS,
  FILTERS_ACTIONS,
  AdAction,
} from "./types";

const { Text } = Typography;

interface AdCampaignFormProps {
  formProps: FormProps;
  form: FormInstance;
}

export const AdCampaignForm = ({ formProps, form }: AdCampaignFormProps) => {
  const action: AdAction | undefined = Form.useWatch("action", form);
  const images: string[] = Form.useWatch(["media", "images"], form) ?? [];

  const showUrl = action === "OPEN_URL";
  const showEntityId = ENTITY_ID_ACTIONS.includes(action as AdAction);
  const showEntityIds = action === "OPEN_CATEGORY";
  const showFilters = FILTERS_ACTIONS.includes(action as AdAction);

  const handleFinish = async (values: Record<string, unknown>) => {
    const scopeRaw = (values.scope ?? {}) as {
      entity_id?: string | number | null;
      entity_ids?: (string | number)[];
      filters?: unknown;
    };

    const filtersRaw = scopeRaw.filters;
    let filters: Record<string, unknown> = {};
    if (typeof filtersRaw === "string") {
      try {
        filters = JSON.parse(filtersRaw);
      } catch {
        filters = {};
      }
    } else if (filtersRaw && typeof filtersRaw === "object") {
      filters = filtersRaw as Record<string, unknown>;
    }

    const payload = {
      ...values,
      start_date: values.start_date
        ? dayjs.isDayjs(values.start_date)
          ? (values.start_date as Dayjs).toISOString()
          : values.start_date
        : undefined,
      end_date: values.end_date
        ? dayjs.isDayjs(values.end_date)
          ? (values.end_date as Dayjs).toISOString()
          : values.end_date
        : undefined,
      scope: {
        entity_id: scopeRaw.entity_id ?? null,
        entity_ids: (scopeRaw.entity_ids ?? [])
          .map(Number)
          .filter((n) => !isNaN(n)),
        filters,
      },
    };

    return formProps.onFinish?.(payload);
  };

  const validImages = images.filter((url) => {
    try {
      return Boolean(new URL(url));
    } catch {
      return false;
    }
  });

  return (
    <Form
      {...formProps}
      onFinish={handleFinish}
      layout="vertical"
      scrollToFirstError
    >
      {/* Section 1 — Paramètres généraux */}
      <Card title="Paramètres généraux" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="placement"
              label="Placement"
              rules={[{ required: true, message: "Le placement est requis" }]}
            >
              <Select
                showSearch
                options={AD_PLACEMENTS.map((p) => ({ label: p, value: p }))}
                placeholder="Sélectionner un placement"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="campaign_category"
              label="Catégorie"
              rules={[{ required: true, message: "La catégorie est requise" }]}
            >
              <Select
                options={AD_CATEGORIES.map((c) => ({ label: c, value: c }))}
                placeholder="Sélectionner une catégorie"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: "Le type est requis" }]}
            >
              <Radio.Group>
                {AD_TYPES.map((t) => (
                  <Radio.Button key={t} value={t}>
                    {t}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="status"
              label="Statut"
              rules={[{ required: true, message: "Le statut est requis" }]}
            >
              <Select
                options={AD_STATUSES.map((s) => ({ label: s, value: s }))}
                placeholder="Sélectionner un statut"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="priority" label="Priorité">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="start_date"
              label="Date de début"
              rules={[{ required: true, message: "La date de début est requise" }]}
              getValueProps={(value) => ({
                value: value ? dayjs(value) : undefined,
              })}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                placeholder="Sélectionner une date"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="end_date"
              label="Date de fin"
              dependencies={["start_date"]}
              rules={[
                { required: true, message: "La date de fin est requise" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue("start_date");
                    if (!value || !start) return Promise.resolve();
                    const startDay = dayjs.isDayjs(start) ? start : dayjs(start);
                    const endDay = dayjs.isDayjs(value) ? value : dayjs(value);
                    if (endDay.isAfter(startDay)) return Promise.resolve();
                    return Promise.reject(
                      new Error("La date de fin doit être postérieure à la date de début")
                    );
                  },
                }),
              ]}
              getValueProps={(value) => ({
                value: value ? dayjs(value) : undefined,
              })}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                placeholder="Sélectionner une date"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Section 2 — Contenu */}
      <Card title="Contenu" style={{ marginBottom: 24 }}>
        <Form.Item
          name={["content", "title"]}
          label="Titre"
          rules={[
            { required: true, message: "Le titre est requis" },
            { max: 255, message: "255 caractères maximum" },
          ]}
        >
          <Input placeholder="Titre de la campagne" showCount maxLength={255} />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name={["content", "subtitle"]} label="Sous-titre">
              <Input placeholder="Sous-titre (optionnel)" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name={["content", "badge"]} label="Badge">
              <Input placeholder="-20%" />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item name={["content", "cta_label"]} label="Libellé CTA">
              <Input placeholder="En savoir plus" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Section 3 — Médias */}
      <Card title="Médias" style={{ marginBottom: 24 }}>
        <Form.Item
          name={["media", "images"]}
          label="Images (URLs)"
          extra="Saisissez des URLs d'images et appuyez sur Entrée pour les ajouter."
        >
          <Select
            mode="tags"
            tokenSeparators={[","]}
            placeholder="https://..."
            style={{ width: "100%" }}
            open={false}
          />
        </Form.Item>

        {validImages.length > 0 && (
          <Space wrap style={{ marginBottom: 16 }}>
            {validImages.map((url) => (
              <Image
                key={url}
                src={url}
                width={80}
                height={80}
                style={{ objectFit: "cover", borderRadius: 4 }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
              />
            ))}
          </Space>
        )}

        <Form.Item
          name={["media", "videos"]}
          label="Vidéos (URLs)"
          extra="Saisissez des URLs de vidéos et appuyez sur Entrée pour les ajouter."
        >
          <Select
            mode="tags"
            tokenSeparators={[","]}
            placeholder="https://..."
            style={{ width: "100%" }}
            open={false}
          />
        </Form.Item>
      </Card>

      {/* Section 4 — Action & Scope */}
      <Card title="Action & Scope">
        <Form.Item
          name="action"
          label="Action"
          rules={[{ required: true, message: "L'action est requise" }]}
        >
          <Select
            options={AD_ACTIONS.map((a) => ({ label: a, value: a }))}
            placeholder="Sélectionner une action"
          />
        </Form.Item>

        {showUrl && (
          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: "L'URL est requise pour cette action" },
              { type: "url", message: "URL invalide" },
            ]}
          >
            <Input placeholder="https://exemple.com" />
          </Form.Item>
        )}

        {showEntityId && (
          <Form.Item
            name={["scope", "entity_id"]}
            label="ID de l'entité"
            rules={[
              {
                required: true,
                message: "L'ID de l'entité est requis pour cette action",
              },
            ]}
          >
            <Input placeholder="Ex : 42" />
          </Form.Item>
        )}

        {showEntityIds && (
          <Form.Item
            name={["scope", "entity_ids"]}
            label="IDs des entités"
            extra="Saisissez des identifiants numériques et appuyez sur Entrée."
          >
            <Select
              mode="tags"
              tokenSeparators={[","]}
              placeholder="Ex : 1, 2, 3"
              style={{ width: "100%" }}
              open={false}
            />
          </Form.Item>
        )}

        {showFilters && (
          <Form.Item
            name={["scope", "filters"]}
            label="Filtres (JSON)"
            getValueProps={(value) => ({
              value:
                value && typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : (value as string) ?? "",
            })}
            getValueFromEvent={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              try {
                return JSON.parse(e.target.value);
              } catch {
                return e.target.value;
              }
            }}
          >
            <Input.TextArea
              rows={4}
              placeholder='{"key": "value"}'
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        )}

        {!showEntityId && !showEntityIds && !showFilters && action && action !== "NONE" && action !== "OPEN_URL" && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Aucun scope requis pour l'action sélectionnée.
          </Text>
        )}
      </Card>
    </Form>
  );
};
