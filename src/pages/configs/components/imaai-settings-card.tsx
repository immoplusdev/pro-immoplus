import React, { useEffect, useMemo } from "react";
import { Alert, Button, Card, Form, Select, Space, Tag, TimePicker, Typography, message } from "antd";
import { RobotOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import {
  ImaaiSettingsUpdate,
  useImaaiSettings,
  useUpdateImaaiSettings,
} from "@/hooks/useImaaiSettings";
import { extractErrorMessage } from "@/lib/helpers/http-exception.helper";
import { SpinLoader } from "@/components/loading";

const TIME_FORMAT = "HH:mm";

interface FormValues {
  morningPulseTime: Dayjs;
  autoBlockTime: Dayjs;
  claudeModel: string;
}

const toTime = (value: string) => dayjs(value, TIME_FORMAT);

export const ImaaiSettingsCard: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const { data, isLoading, error, refetch } = useImaaiSettings();
  const update = useUpdateImaaiSettings();

  const initialValues = useMemo<FormValues | undefined>(
    () =>
      data && {
        morningPulseTime: toTime(data.morningPulseTime),
        autoBlockTime: toTime(data.autoBlockTime),
        claudeModel: data.claudeModel,
      },
    [data],
  );

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const onFinish = async (values: FormValues) => {
    if (!data) return;
    // N'envoie que les champs modifiés.
    const payload: ImaaiSettingsUpdate = {};
    const pulse = values.morningPulseTime.format(TIME_FORMAT);
    const block = values.autoBlockTime.format(TIME_FORMAT);
    if (pulse !== data.morningPulseTime) payload.morningPulseTime = pulse;
    if (block !== data.autoBlockTime) payload.autoBlockTime = block;
    if (values.claudeModel !== data.claudeModel) payload.claudeModel = values.claudeModel;

    if (Object.keys(payload).length === 0) {
      message.info("Aucune modification à enregistrer");
      return;
    }

    try {
      await update.mutateAsync(payload);
      message.success("Réglages IMAAI mis à jour");
    } catch (err) {
      message.error(extractErrorMessage(err, "Impossible de mettre à jour les réglages IMAAI"));
    }
  };

  return (
    <Card
      style={{ border: "1px solid #E8E9EE", borderRadius: 10 }}
      title={
        <Space>
          <RobotOutlined />
          <span>Réglages IMAAI</span>
        </Space>
      }
      headStyle={{ padding: "1rem" }}
      bodyStyle={{ padding: "2rem" }}
    >
      {isLoading ? (
        <SpinLoader />
      ) : error || !data ? (
        <Alert
          type="error"
          showIcon
          message="Impossible de charger les réglages IMAAI"
          description={extractErrorMessage(error)}
          action={<Button size="small" onClick={() => refetch()}>Réessayer</Button>}
        />
      ) : (
        <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish}>
          <Typography.Paragraph type="secondary">
            Ces réglages sont pris en compte sans redéploiement (délai maximum : environ une minute).
            L'activation de la fonctionnalité reste pilotée par les variables d'environnement{" "}
            <Tag>IMAAI</Tag> et <Tag>IMAAI_MORNING_PULSE</Tag>.
          </Typography.Paragraph>

          <Space size="large" wrap align="start">
            <Form.Item
              label="Heure d'envoi du pulse du matin"
              name="morningPulseTime"
              extra="Fuseau Africa/Abidjan (UTC+0)"
              rules={[{ required: true, message: "Heure requise" }]}
            >
              <TimePicker format={TIME_FORMAT} minuteStep={5} allowClear={false} needConfirm={false} />
            </Form.Item>

            <Form.Item
              label="Heure du blocage automatique"
              name="autoBlockTime"
              extra="Résidences dont le propriétaire n'a pas répondu — Africa/Abidjan (UTC+0)"
              dependencies={["morningPulseTime"]}
              rules={[
                { required: true, message: "Heure requise" },
                ({ getFieldValue }) => ({
                  validator(_, value?: Dayjs) {
                    const pulse = getFieldValue("morningPulseTime") as Dayjs | undefined;
                    if (!value || !pulse) return Promise.resolve();
                    return value.format(TIME_FORMAT) > pulse.format(TIME_FORMAT)
                      ? Promise.resolve()
                      : Promise.reject(new Error("Doit être strictement après l'heure du pulse"));
                  },
                }),
              ]}
            >
              <TimePicker format={TIME_FORMAT} minuteStep={5} allowClear={false} needConfirm={false} />
            </Form.Item>
          </Space>

          <Form.Item
            label="Modèle Claude"
            name="claudeModel"
            extra="Modèle qui interprète les réponses WhatsApp des propriétaires"
            rules={[{ required: true, message: "Modèle requis" }]}
            style={{ maxWidth: 360 }}
          >
            <Select options={data.availableModels.map((m) => ({ value: m, label: m }))} />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={update.isLoading}>
              Enregistrer
            </Button>
            <Button onClick={() => initialValues && form.setFieldsValue(initialValues)}>Réinitialiser</Button>
          </Space>
        </Form>
      )}
    </Card>
  );
};
