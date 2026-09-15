import { useForm } from "@refinedev/antd";
import { Button, Space, Spin, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PollForm } from "./form";

export const PollEdit = () => {
  const navigate = useNavigate();

  const { formProps, form, queryResult } = useForm({
    resource: "polls",
    action: "edit",
    redirect: false,
    successNotification: false,
    onMutationSuccess: () => {
      message.success("Sondage mis à jour avec succès");
      navigate(-1);
    },
    onMutationError: () => {
      message.error("Erreur lors de la mise à jour du sondage");
    },
  });

  const isLoading = queryResult?.isLoading ?? false;

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Retour
        </Button>
        <Space>
          <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
            Enregistrer
          </Button>
        </Space>
      </div>

      <PollForm formProps={formProps} form={form} mode="edit" />
    </div>
  );
};
