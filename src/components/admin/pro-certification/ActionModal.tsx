import type { ReactNode } from "react";
import { Modal, Form, Input, Typography } from "antd";
import { WarningOutlined, StopOutlined } from "@ant-design/icons";

const { Text } = Typography;

type ActionType = "suspend" | "retirer";

interface Props {
  open: boolean;
  type: ActionType;
  loading: boolean;
  onConfirm: (motif: string) => void;
  onCancel: () => void;
}

const ACTION_CONFIG: Record<ActionType, { title: string; icon: ReactNode; okText: string; okDanger: boolean }> = {
  suspend: {
    title: "Suspendre la certification",
    icon: <WarningOutlined style={{ color: "#fa8c16", marginRight: 8 }} />,
    okText: "Suspendre",
    okDanger: false,
  },
  retirer: {
    title: "Retirer définitivement la certification",
    icon: <StopOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />,
    okText: "Retirer définitivement",
    okDanger: true,
  },
};

export function ActionModal({ open, type, loading, onConfirm, onCancel }: Props) {
  const [form] = Form.useForm<{ motif: string }>();
  const config = ACTION_CONFIG[type];

  const handleOk = async () => {
    const values = await form.validateFields();
    onConfirm(values.motif);
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
        {type === "suspend"
          ? "La certification sera suspendue jusqu'à réactivation manuelle."
          : "Cette action est définitive. La certification sera retirée."}
      </Text>
      <Form form={form} layout="vertical">
        <Form.Item
          name="motif"
          label="Motif"
          rules={[
            { required: true, message: "Le motif est obligatoire" },
            { min: 10, message: "Le motif doit comporter au moins 10 caractères" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Expliquez la raison de cette action (min. 10 caractères)…"
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
