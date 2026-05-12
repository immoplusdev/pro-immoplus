import { useRef } from "react";
import { useTranslate } from "@refinedev/core";
import { useForm } from "@refinedev/antd";
import { Form, Button, Space, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined, SendOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { BannerFormFields } from "./components/banner-form-fields";

export const EditBanner = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const publishModeRef = useRef(false);

    const { formProps, form } = useForm({
        resource: "banners",
        action: "edit",
        redirect: false,
        successNotification: false,
        onMutationSuccess: () => {
            message.success(
                publishModeRef.current
                    ? translate("banners.messages.publishSuccess") || "Bannière publiée"
                    : translate("banners.messages.saveSuccess") || "Bannière enregistrée"
            );
            navigate("/banners");
        },
    });

    const handleSave = () => {
        publishModeRef.current = false;
        form.submit();
    };

    const handlePublish = () => {
        publishModeRef.current = true;
        form.setFieldValue("active", true);
        form.submit();
    };

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
                <Link to="/banners">
                    <Button icon={<ArrowLeftOutlined />}>
                        {translate("common.back") || "Retour"}
                    </Button>
                </Link>
                <Space>
                    <Button icon={<SaveOutlined />} onClick={handleSave}>
                        {translate("buttons.save") || "Enregistrer"}
                    </Button>
                    <Button type="primary" icon={<SendOutlined />} onClick={handlePublish}>
                        {translate("banners.actions.publish") || "Publier"}
                    </Button>
                </Space>
            </div>

            <Form {...formProps} layout="vertical">
                <BannerFormFields form={form} />
            </Form>
        </div>
    );
};
