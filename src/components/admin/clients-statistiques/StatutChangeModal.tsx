import type { ReactNode } from "react";
import { Modal, Form, Input, Typography } from "antd";
import { WarningOutlined, StopOutlined } from "@ant-design/icons";

const { Text } = Typography;

type ActionType = "suspendre" | "bannir";

interface Props {
  open: boolean;
  type: ActionType;
  loading: boolean;
  onConfirm: (raison: string) => void;
  onCancel: () => void;
}

const ACTION_CONFIG: Record<
  ActionType,
  { title: string; icon: ReactNode; okText: string; okDanger: boolean; note: string }
> = {
  suspendre: {
    title: "Suspendre le client",
    icon: <WarningOutlined style={{ color: "#fa8c16", marginRight: 8 }} />,
    okText: "Suspendre",
    okDanger: false,
    note: "La suspension n'empêche pas la connexion du client à l'application.",
  },
  bannir: {
    title: "Bannir le client",
    icon: <StopOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />,
    okText: "Bannir",
    okDanger: true,
    note: "Le bannissement bloque totalement la connexion du client à l'application.",
  },
};

export function StatutChangeModal({ open, type, loading, onConfirm, onCancel }: Props) {
  const [form] = Form.useForm<{ raison: string }>();
  const config = ACTION_CONFIG[type];

  const handleOk = async () => {
    const values = await form.validateFields();
    onConfirm(values.raison);
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      title={
        <span>
          {config.icon}
          {config.title}
        </span>
      }
      okText={config.okText}
      cancelText="Annuler"
      okButtonProps={{ danger: config.okDanger, loading }}
      onOk={handleOk}
      onCancel={handleCancel}
      afterClose={() => form.resetFields()}
      destroyOnClose
    >
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        {config.note}
      </Text>
      <Form form={form} layout="vertical">
        <Form.Item
          name="raison"
          label="Raison"
          rules={[
            { required: true, message: "La raison est obligatoire" },
            { min: 3, message: "La raison doit comporter au moins 3 caractères" },
            { max: 1000, message: "La raison ne peut pas dépasser 1000 caractères" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Expliquez la raison de cette action (3 à 1000 caractères)…"
            showCount
            maxLength={1000}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
