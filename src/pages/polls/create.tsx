import { useForm } from "@refinedev/antd";
import { Button, Space, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { PollForm } from "./form";

export const PollCreate = () => {
  const navigate = useNavigate();

  const { formProps, form } = useForm({
    resource: "polls",
    action: "create",
    redirect: false,
    successNotification: false,
    onMutationSuccess: (data) => {
      message.success("Sondage créé avec succès");
      const id = (data?.data as { id?: string })?.id;
      if (id) {
        navigate(`/polls/show/${id}`);
      } else {
        navigate("/polls");
      }
    },
    onMutationError: () => {
      message.error("Erreur lors de la création du sondage");
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
        <Link to="/polls">
          <Button icon={<ArrowLeftOutlined />}>Retour</Button>
        </Link>
        <Space>
          <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
            Créer le sondage
          </Button>
        </Space>
      </div>

      <PollForm
        formProps={{
          ...formProps,
          initialValues: {
            options: [{ label: "" }, { label: "" }],
            sectionPosition: "after",
          },
        }}
        form={form}
        mode="create"
        submitLabel="Créer le sondage"
      />
    </div>
  );
};
