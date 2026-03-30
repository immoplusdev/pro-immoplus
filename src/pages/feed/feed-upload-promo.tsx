import { useState } from "react";
import { useTranslate } from "@refinedev/core";
import { List } from "@refinedev/antd";
import {
    Form,
    Button,
    Upload,
    Input,
    Space,
    Card,
    Progress,
    message,
    Row,
    Col,
} from "antd";
import { Link } from "react-router-dom";
import { HomeOutlined, CloudUploadOutlined, RocketOutlined } from "@ant-design/icons";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";

type UploadFormType = {
    video: any[];
    title?: string;
    description?: string;
};

export const FeedUploadPromo = () => {
    const translate = useTranslate();
    const [form] = Form.useForm<UploadFormType>();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onFinish = async (values: UploadFormType) => {
        if (!values.video || values.video.length === 0) {
            message.error(translate("feed.validation.videoRequired"));
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const file = values.video[0].originFileObj;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("titre", values.title || translate("feed.upload.defaultTitle"));
        if (values.description) formData.append("description", values.description);

        try {
            const response = await axiosInstance.post(
                `${API_URL}/feed/videos/upload`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(Math.min(percent, 90));
                        }
                    },
                }
            );

            setUploadProgress(100);
            message.success(translate("feed.upload.success"));
            console.log("✅ Vidéo uploadée:", response.data);
            form.resetFields();
            setUploadProgress(0);
        } catch (error: any) {
            console.error("❌ Erreur upload:", error);
            const msg = error?.response?.data?.message || translate("common.error");
            message.error(msg);
        } finally {
            setUploading(false);
        }
    };

    return (
        <List
            title={translate("feed.upload.promoTitle")}
            headerButtons={[
                <Link key="home" to="/feed/videos/upload">
                    <Button icon={<HomeOutlined />}>
                        {translate("feed.upload.backToUpload")}
                    </Button>
                </Link>,
            ]}
        >
            <Row justify="center" style={{ marginTop: 40, marginBottom: 40 }}>
                <Col xs={24} sm={22} md={18} lg={14}>
                    <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            requiredMark="optional"
                        >
                            {/* Zone d'Upload Vidéo */}
                            <Form.Item
                                name="video"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => {
                                    if (Array.isArray(e)) return e;
                                    return e?.fileList;
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: translate("feed.validation.videoRequired"),
                                    },
                                ]}
                            >
                                <Upload.Dragger
                                    name="video"
                                    multiple={false}
                                    maxCount={1}
                                    beforeUpload={() => false}
                                    accept="video/mp4"
                                    listType="picture"
                                    style={{ borderRadius: 8, padding: 40 }}
                                >
                                    <Space direction="vertical" align="center" size={0}>
                                        <CloudUploadOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                                        <p style={{ marginTop: 16, fontSize: 14, fontWeight: 600 }}>
                                            {translate("feed.upload.dragHint")}
                                        </p>
                                        <p style={{ fontSize: 12, color: "#666" }}>
                                            {translate("feed.upload.formatWarning")}
                                        </p>
                                    </Space>
                                </Upload.Dragger>
                            </Form.Item>

                            {/* Titre */}
                            <Form.Item
                                name="title"
                                label={translate("feed.fields.title")}
                                rules={[{ max: 200, message: translate("feed.validation.titleMax") }]}
                            >
                                <Input
                                    placeholder={translate("feed.upload.titlePlaceholder")}
                                    maxLength={200}
                                />
                            </Form.Item>

                            {/* Description */}
                            <Form.Item
                                name="description"
                                label={translate("feed.fields.description")}
                                rules={[{ max: 1000, message: translate("feed.validation.descriptionMax") }]}
                            >
                                <Input.TextArea
                                    placeholder={translate("feed.upload.descriptionPlaceholder")}
                                    rows={5}
                                    maxLength={1000}
                                    showCount
                                />
                            </Form.Item>

                            {/* Progress */}
                            {uploading && uploadProgress > 0 && (
                                <Form.Item style={{ marginTop: 24 }}>
                                    <Progress
                                        percent={Math.round(uploadProgress)}
                                        status={uploadProgress === 100 ? "success" : "active"}
                                    />
                                </Form.Item>
                            )}

                            {/* Bouton Publier */}
                            <Form.Item style={{ marginTop: 32 }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    icon={<RocketOutlined />}
                                    htmlType="submit"
                                    loading={uploading}
                                    disabled={uploading}
                                >
                                    {translate("feed.upload.submitButton")}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </List>
    );
};
