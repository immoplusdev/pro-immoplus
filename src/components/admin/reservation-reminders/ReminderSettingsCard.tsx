import { useEffect, useMemo } from "react";
import { Alert, App, Button, Card, Col, Form, InputNumber, Row, Skeleton, Space, Switch } from "antd";
import { NotificationOutlined, SaveOutlined } from "@ant-design/icons";
import { extractErrorMessage, getErrorStatus } from "@/lib/helpers";
import { useReminderSettingsSource, useUpdateReminderSettings } from "@/hooks/useReservationReminders";
import {
  describeStepTimings,
  normalizeReminderSettings,
  toReminderFormValues,
  toReminderSettingsPayload,
  type ReminderSettingsFormValues,
} from "@/lib/helpers/reservation-reminders.helper";
import { REMINDER_STEP_MAX, REMINDER_STEP_MIN } from "@/types/reservation-reminders.types";

const integerRule = { type: "integer" as const, message: "Nombre entier attendu" };

/**
 * Section « Relances » de la page Configuration. Formulaire indépendant du formulaire principal :
 * le PATCH /configs n'envoie que les champs `relance*`.
 */
export function ReminderSettingsCard() {
  const { message } = App.useApp();
  const [form] = Form.useForm<ReminderSettingsFormValues>();
  const { data, isInitialLoading, isError, error, refetch } = useReminderSettingsSource();
  const update = useUpdateReminderSettings();

  const initialValues = useMemo(() => (data ? toReminderFormValues(normalizeReminderSettings(data)) : undefined), [data]);

  // Resynchronise le formulaire après chaque lecture (chargement initial, rafraîchissement post-enregistrement).
  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const enabled = Form.useWatch("relancesEnabled", form) ?? initialValues?.relancesEnabled ?? true;
  const step1 = Form.useWatch("step1", form);
  const step2 = Form.useWatch("step2", form);

  const timings = [
    describeStepTimings("Paiement", data?.customerPaymentMinutes, [step1, step2]),
    describeStepTimings("Réponse pro", data?.proValidationMinutes, [step1, step2]),
  ].filter(Boolean);

  const onFinish = (values: ReminderSettingsFormValues) => {
    update.mutate(toReminderSettingsPayload(values), {
      onSuccess: () => message.success("Paramètres de relance enregistrés"),
      onError: (err) =>
        message.error(
          getErrorStatus(err) === 400
            ? extractErrorMessage(err, "Paramètres invalides")
            : extractErrorMessage(err, "Impossible d'enregistrer les paramètres de relance")
        ),
    });
  };

  const disabled = !enabled || update.isLoading;

  return (
    <Card
      style={{ border: "1px solid #E8E9EE", borderRadius: 10 }}
      title={
        <Space>
          <NotificationOutlined />
          <span>Relances</span>
        </Space>
      }
      styles={{ header: { padding: "1rem" }, body: { padding: "2rem" } }}
    >
      {isError ? (
        <Alert
          type="error"
          showIcon
          message="Impossible de charger les paramètres de relance"
          description={extractErrorMessage(error, "Une erreur est survenue.")}
          action={
            <Button size="small" onClick={() => refetch()}>
              Réessayer
            </Button>
          }
        />
      ) : isInitialLoading || !initialValues ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Form<ReminderSettingsFormValues>
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={onFinish}
          disabled={update.isLoading}
        >
          <Form.Item name="relancesEnabled" label="Relances activées" valuePropName="checked">
            <Switch checkedChildren="Oui" unCheckedChildren="Non" />
          </Form.Item>

          <Form.Item
            label="Seuils des relances automatiques (% du délai)"
            extra={timings.length ? timings.map((t) => <div key={t}>{t}</div>) : undefined}
            style={{ marginBottom: 0 }}
            required
          >
            <Row gutter={12}>
              <Col xs={12} md={8}>
                <Form.Item
                  name="step1"
                  rules={[
                    { required: true, message: "1re relance requise" },
                    integerRule,
                    {
                      type: "number",
                      min: REMINDER_STEP_MIN,
                      max: REMINDER_STEP_MAX,
                      message: `Entre ${REMINDER_STEP_MIN} et ${REMINDER_STEP_MAX}`,
                    },
                  ]}
                >
                  <InputNumber
                    aria-label="1re relance (%)"
                    min={REMINDER_STEP_MIN}
                    max={REMINDER_STEP_MAX}
                    precision={0}
                    addonBefore="1re"
                    addonAfter="%"
                    disabled={disabled}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={8}>
                <Form.Item
                  name="step2"
                  dependencies={["step1"]}
                  rules={[
                    integerRule,
                    {
                      type: "number",
                      min: REMINDER_STEP_MIN,
                      max: REMINDER_STEP_MAX,
                      message: `Entre ${REMINDER_STEP_MIN} et ${REMINDER_STEP_MAX}`,
                    },
                    ({ getFieldValue }) => ({
                      validator: (_, value: number | null | undefined) => {
                        const first = getFieldValue("step1");
                        if (value == null || first == null || value > first) return Promise.resolve();
                        return Promise.reject(new Error("Doit être supérieur à la 1re relance"));
                      },
                    }),
                  ]}
                >
                  <InputNumber
                    aria-label="2e relance (%), facultative"
                    placeholder="Aucune"
                    min={REMINDER_STEP_MIN}
                    max={REMINDER_STEP_MAX}
                    precision={0}
                    addonBefore="2e"
                    addonAfter="%"
                    disabled={disabled}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>

          <Row gutter={12} style={{ marginTop: 16 }}>
            <Col xs={24} md={8}>
              <Form.Item
                name="relanceManualMax"
                label="Relances manuelles max par réservation"
                rules={[{ required: true, message: "Valeur requise" }, integerRule, { type: "number", min: 0, message: "Minimum 0" }]}
              >
                <InputNumber min={0} precision={0} disabled={disabled} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="relanceManualMinIntervalMinutes"
                label="Délai entre deux relances manuelles"
                rules={[{ required: true, message: "Valeur requise" }, integerRule, { type: "number", min: 0, message: "Minimum 0" }]}
              >
                <InputNumber min={0} precision={0} addonAfter="min" disabled={disabled} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="relanceFailClientDelayMinutes"
                label="Délai avant relance après échec client"
                rules={[{ required: true, message: "Valeur requise" }, integerRule, { type: "number", min: 0, message: "Minimum 0" }]}
              >
                <InputNumber min={0} precision={0} addonAfter="min" disabled={disabled} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="Aucune relance après échec client entre 22 h et 7 h (heure d'Abidjan) : ces relances sont reportées à 7 h."
          />

          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={update.isLoading}>
            Enregistrer les relances
          </Button>
        </Form>
      )}
    </Card>
  );
}
