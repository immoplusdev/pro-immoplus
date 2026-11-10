import { useEffect } from "react";
import { Alert, App, Button, Card, Form, InputNumber, Select, Space, Switch, Typography } from "antd";
import { SafetyOutlined, SaveOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";

const CONFIG_URL = `${API_URL}/configs`;
type PaymentMode = "REQUEST" | "DEFAULT";
interface PaymentPolicySettings {
  paymentDirectBookingEnabled: boolean;
  paymentGlobalMode: PaymentMode;
  paymentRiskWindowDays: number;
  paymentRiskPaymentThreshold: number;
}

const defaults: PaymentPolicySettings = {
  paymentDirectBookingEnabled: true,
  paymentGlobalMode: "DEFAULT",
  paymentRiskWindowDays: 30,
  paymentRiskPaymentThreshold: 5,
};

export function PaymentPolicySettingsCard() {
  const [form] = Form.useForm<PaymentPolicySettings>();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const configQuery = useQuery({
    queryKey: ["admin-configs-payment-policy"],
    queryFn: async () => {
      const response = await axiosInstance.get<{ data: Partial<PaymentPolicySettings> }>(CONFIG_URL);
      return response.data.data;
    },
    retry: false,
  });
  const update = useMutation({
    mutationFn: async (payload: PaymentPolicySettings) => {
      const response = await axiosInstance.patch<{ data: Partial<PaymentPolicySettings> }>(CONFIG_URL, payload);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["admin-configs-payment-policy"], data);
      queryClient.invalidateQueries({ queryKey: ["admin-configs-payment-policy"] });
      message.success("Paramètres de paiement enregistrés");
    },
    onError: () => message.error("Impossible d’enregistrer les paramètres de paiement"),
  });

  useEffect(() => {
    if (configQuery.data) {
      form.setFieldsValue({
        paymentDirectBookingEnabled: configQuery.data.paymentDirectBookingEnabled ?? defaults.paymentDirectBookingEnabled,
        paymentGlobalMode: configQuery.data.paymentGlobalMode === "DEFAULT" ? "DEFAULT" : "REQUEST",
        paymentRiskWindowDays: configQuery.data.paymentRiskWindowDays ?? defaults.paymentRiskWindowDays,
        paymentRiskPaymentThreshold: configQuery.data.paymentRiskPaymentThreshold ?? defaults.paymentRiskPaymentThreshold,
      });
    }
  }, [configQuery.data, form]);

  return (
    <Card
      title={<Space><SafetyOutlined /><span>Politique de paiement direct</span></Space>}
      style={{ border: "1px solid #E8E9EE", borderRadius: 10 }}
      headStyle={{ padding: "1rem" }}
      bodyStyle={{ padding: "2rem" }}
    >
      {configQuery.isError ? (
        <Alert
          type="error"
          showIcon
          message="Impossible de charger les paramètres de paiement"
          description="Vérifiez que l’API /configs renvoie les champs de politique de paiement."
          action={<Button size="small" onClick={() => configQuery.refetch()}>Réessayer</Button>}
        />
      ) : (
        <Form<PaymentPolicySettings>
          form={form}
          layout="vertical"
          initialValues={defaults}
          onFinish={(values) => update.mutate(values)}
          disabled={configQuery.isLoading || update.isPending}
        >
          <Typography.Paragraph type="secondary">
            Ces options pilotent le parcours de réservation et les seuils de risque utilisés pour appliquer le paiement direct.
          </Typography.Paragraph>
          <Form.Item
            name="paymentDirectBookingEnabled"
            label="Activer la réservation avec paiement direct"
            valuePropName="checked"
          >
            <Switch checkedChildren="Activé" unCheckedChildren="Désactivé" />
          </Form.Item>
          <Form.Item
            name="paymentGlobalMode"
            label="Mode global de paiement"
            rules={[{ required: true, message: "Choisissez un mode" }]}
          >
            <Select options={[
              { value: "REQUEST", label: "REQUEST — demande de réservation classique" },
              { value: "DEFAULT", label: "DEFAULT — mode automatique selon le risque" },
            ]} />
          </Form.Item>
          <Form.Item
            name="paymentRiskWindowDays"
            label="Fenêtre de risque (jours)"
            rules={[{ required: true, message: "Indiquez une durée" }]}
          >
            <InputNumber min={1} precision={0} style={{ width: 240 }} addonAfter="jours" />
          </Form.Item>
          <Form.Item
            name="paymentRiskPaymentThreshold"
            label="Seuil de paiements pour appliquer le paiement direct"
            rules={[{ required: true, message: "Indiquez un seuil" }]}
          >
            <InputNumber min={1} precision={0} style={{ width: 240 }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={update.isPending}>
            Enregistrer les paramètres
          </Button>
        </Form>
      )}
    </Card>
  );
}
