import { useForm } from "@refinedev/antd";
import { Button, Space, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { AdCampaignForm } from "./form";

export const AdCampaignCreate = () => {
  const navigate = useNavigate();

  const { formProps, form } = useForm({
    resource: "ads/campaigns",
    action: "create",
    redirect: false,
    successNotification: false,
    onMutationSuccess: (data) => {
      message.success("Campagne créée avec succès");
      const id = (data?.data as { id?: number })?.id;
      if (id) {
        navigate(`/ads/campaigns/show/${id}`);
      } else {
        navigate("/ads/campaigns");
      }
    },
    onMutationError: () => {
      message.error("Erreur lors de la création de la campagne");
    },
  });

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
        <Link to="/ads/campaigns">
          <Button icon={<ArrowLeftOutlined />}>Retour</Button>
        </Link>
        <Space>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
          >
            Créer la campagne
          </Button>
        </Space>
      </div>

      <AdCampaignForm
        formProps={{
          ...formProps,
          initialValues: {
            status: "DRAFT",
            priority: 0,
            position_index: 0,
            type: "IMAGE",
            action: "NONE",
            media: { images: [], videos: [] },
            scope: { entity_id: null, entity_ids: [], filters: {} },
          },
        }}
        form={form}
        submitLabel="Créer la campagne"
      />
    </div>
  );
};
