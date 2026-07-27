import { useForm } from "@refinedev/antd";
import { Button, Space, Spin, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AdCampaignForm } from "./form";

export const AdCampaignEdit = () => {
  const navigate = useNavigate();

  const { formProps, form, queryResult } = useForm({
    resource: "ads/campaigns",
    action: "edit",
    redirect: false,
    successNotification: false,
    onMutationSuccess: () => {
      message.success("Campagne mise à jour avec succès");
      navigate(-1);
    },
    onMutationError: () => {
      message.error("Erreur lors de la mise à jour de la campagne");
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
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
          >
            Enregistrer
          </Button>
        </Space>
      </div>

      <AdCampaignForm formProps={formProps} form={form} />
    </div>
  );
};
