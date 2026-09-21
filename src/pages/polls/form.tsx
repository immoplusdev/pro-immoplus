import React from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Space,
  Typography,
  Button,
  Alert,
  Tag,
  FormProps,
  FormInstance,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import {
  POLL_SECTION_POSITIONS,
  POLL_STATUSES,
  SECTION_POSITION_LABELS,
  PollOption,
} from "./types";
import { STATUS_LABELS } from "./status-badge";
import { useHomeSectionKeys } from "./use-home-section-keys";
import { T } from "@/lib/design-tokens";

const { Text, Title } = Typography;

const cardStyle: React.CSSProperties = {
  border: `1px solid ${T.ink12}`,
  borderRadius: 12,
  boxShadow: "0 1px 2px rgba(26,20,35,0.04), 0 4px 12px rgba(26,20,35,0.04)",
  background: T.bg,
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ ...cardStyle, padding: 24, marginBottom: 24 }}>
      <Title level={5} style={{ margin: 0, fontSize: 18, fontWeight: 600, color: T.ink }}>
        {title}
      </Title>
      {description && (
        <Text style={{ display: "block", fontSize: 12, color: T.ink60, marginTop: 2, marginBottom: 16 }}>
          {description}
        </Text>
      )}
      {!description && <div style={{ marginTop: 16 }} />}
      {children}
    </div>
  );
}

function OptionalLabel({ children }: { children: React.ReactNode }) {
  return (
    <span>
      {children} <span style={{ color: T.ink60, fontWeight: 400 }}>(optionnel)</span>
    </span>
  );
}

interface PollFormProps {
  formProps: FormProps;
  form: FormInstance;
  submitLabel?: string;
  mode: "create" | "edit";
}

export const PollForm = ({ formProps, form, submitLabel = "Enregistrer", mode }: PollFormProps) => {
  const { options: sectionKeyOptions } = useHomeSectionKeys();
  const question: string = Form.useWatch("question", form) ?? "";
  const description: string = Form.useWatch("description", form) ?? "";
  const existingOptions: PollOption[] = Form.useWatch("options", form) ?? [];

  const questionLength = question.length;
  const descriptionLength = description.length;

  const handleFinish = async (values: Record<string, unknown>) => {
    await formProps.onFinish?.(normalizePollFormValues(values));
  };

  return (
    <div>
      <Form {...formProps} onFinish={handleFinish} layout="vertical" scrollToFirstError>
        <SectionCard title="Contenu" description="La question posée aux utilisateurs">
          <Form.Item
            name="question"
            label="Question"
            rules={[
              { required: true, message: "La question est requise" },
              { max: 500, message: "500 caractères maximum" },
            ]}
          >
            <Input placeholder="Que pensez-vous de...?" maxLength={500} />
          </Form.Item>
          <Text style={{ display: "block", fontSize: 12, color: T.ink60, marginTop: -12, marginBottom: 16 }}>
            {questionLength}/500
          </Text>

          <Form.Item
            name="description"
            label={<OptionalLabel>Description</OptionalLabel>}
            rules={[{ max: 1000, message: "1000 caractères maximum" }]}
          >
            <Input.TextArea rows={3} maxLength={1000} placeholder="Contexte additionnel" />
          </Form.Item>
          <Text style={{ display: "block", fontSize: 12, color: T.ink60, marginTop: -12 }}>
            {descriptionLength}/1000
          </Text>
        </SectionCard>

        <SectionCard
          title="Options"
          description={
            mode === "create"
              ? "Au moins 2 options — impossible à modifier après création"
              : "Les options ne sont pas modifiables après création (pas d'ajout, de suppression ni de renommage)"
          }
        >
          {mode === "create" ? (
            <Form.List
              name="options"
              rules={[
                {
                  validator: async (_, opts) => {
                    if (!opts || opts.filter((o: { label?: string }) => o?.label?.trim()).length < 2) {
                      return Promise.reject(new Error("Ajoutez au moins 2 options"));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item key={field.key} style={{ marginBottom: 12 }}>
                      <Space.Compact style={{ width: "100%" }}>
                        <Form.Item
                          {...field}
                          name={[field.name, "label"]}
                          noStyle
                          rules={[{ required: true, message: "Libellé requis" }]}
                        >
                          <Input placeholder={`Option ${index + 1}`} />
                        </Form.Item>
                        {fields.length > 2 && (
                          <Button
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        )}
                      </Space.Compact>
                    </Form.Item>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    block
                  >
                    Ajouter une option
                  </Button>
                  <Form.ErrorList errors={errors} />
                </>
              )}
            </Form.List>
          ) : (
            <Space direction="vertical" style={{ width: "100%" }} size={8}>
              {existingOptions.length === 0 && <Text type="secondary">Aucune option.</Text>}
              {existingOptions.map((opt, i) => (
                <div
                  key={opt.id ?? i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: T.surfaceMuted,
                    borderRadius: 8,
                  }}
                >
                  <Text>{opt.label}</Text>
                  <Tag>
                    {opt.voteCount ?? 0} vote{(opt.voteCount ?? 0) > 1 ? "s" : ""} (
                    {opt.percentage ?? 0}%)
                  </Tag>
                </div>
              ))}
              <Alert
                type="info"
                showIcon
                message="Pour changer les options, supprimez ce sondage et recréez-en un."
              />
            </Space>
          )}
        </SectionCard>

        <SectionCard title="Ciblage & planification" description="Où et jusqu'à quand ce sondage apparaît">
          <Row gutter={20}>
            <Col xs={24} md={12}>
              <Form.Item
                name="targetSectionKey"
                label="Section ciblée"
                rules={[{ required: true, message: "La section ciblée est requise" }]}
              >
                <Select
                  showSearch
                  options={sectionKeyOptions}
                  placeholder="Sélectionner une section du Home Feed"
                  filterOption={(input, option) =>
                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="sectionPosition"
                label="Position par rapport à la section"
                initialValue="after"
                rules={[{ required: true, message: "La position est requise" }]}
              >
                <Select
                  options={POLL_SECTION_POSITIONS.map((p) => ({
                    label: SECTION_POSITION_LABELS[p],
                    value: p,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={20}>
            <Col xs={24} md={mode === "edit" ? 12 : 24}>
              <Form.Item
                name="expiresAt"
                label="Expire le"
                rules={[{ required: true, message: "La date d'expiration est requise" }]}
                getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: "100%" }}
                  placeholder="Sélectionner une date"
                />
              </Form.Item>
            </Col>
            {mode === "edit" && (
              <Col xs={24} md={12}>
                <Form.Item name="status" label="Statut" rules={[{ required: true }]}>
                  <Select options={POLL_STATUSES.map((s) => ({ label: STATUS_LABELS[s], value: s }))} />
                </Form.Item>
              </Col>
            )}
          </Row>
        </SectionCard>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          style={{ background: T.primary, borderColor: T.primary, height: 48, fontWeight: 600 }}
        >
          {submitLabel}
        </Button>
      </Form>
    </div>
  );
};

// Convertit la valeur du DatePicker (Dayjs) en ISO 8601 avant envoi à l'API.
export function normalizePollFormValues(values: Record<string, unknown>): Record<string, unknown> {
  const expiresAt = values.expiresAt as Dayjs | string | undefined;
  return {
    ...values,
    expiresAt: expiresAt ? (dayjs.isDayjs(expiresAt) ? expiresAt.toISOString() : expiresAt) : undefined,
  };
}
