import { useState } from "react";
import { useTranslate, useCreate } from "@refinedev/core";
import { List } from "@refinedev/antd";
import {
    Form,
    Button,
    Upload,
    Input,
    Select,
    Collapse,
    Space,
    Card,
    Progress,
    message,
    Row,
    Col,
    AutoComplete,
} from "antd";
import { Link } from "react-router-dom";
import { HomeOutlined, CloudUploadOutlined, RocketOutlined } from "@ant-design/icons";
import { useTable } from "@refinedev/antd";

type UploadFormType = {
    video: any[];
    title?: string;
    description?: string;
    parentType?: string;
    parentId?: string;
};

export const FeedVideosUpload = () => {
    const translate = useTranslate();
    const [form] = Form.useForm<UploadFormType>();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [parentType, setParentType] = useState<string | undefined>();
    const [searchResults, setSearchResults] = useState<{ label: string; value: string }[]>([]);

    const { mutate: createFeed } = useCreate();

    // Récupérer les données pour la recherche
    const { tableProps: residenceProps } = useTable({
        resource: "residences",
        queryOptions: { enabled: parentType === "residence" },
    });

    const { tableProps: bienProps } = useTable({
        resource: "biens-immobiliers",
        queryOptions: { enabled: parentType === "bien_immobilier" },
    });

    const { tableProps: furnitureProps } = useTable({
        resource: "furnitures",
        queryOptions: { enabled: parentType === "furniture" },
    });

    const handleSearch = (value: string) => {
        if (!value || !parentType) {
            setSearchResults([]);
            return;
        }

        // Déterminer la source selon le type
        let dataSource: any[] = [];
        if (parentType === "residence") {
            dataSource = (residenceProps.dataSource || []) as any[];
        } else if (parentType === "bien_immobilier") {
            dataSource = (bienProps.dataSource || []) as any[];
        } else if (parentType === "furniture") {
            dataSource = (furnitureProps.dataSource || []) as any[];
        }

        // Filtrer et mapper
        const filtered = dataSource
            .filter((item: any) => {
                const searchText = (item.nom || item.name || "").toLowerCase();
                return searchText.includes(value.toLowerCase());
            })
            .slice(0, 10)
            .map((item: any) => ({
                label: item.nom || item.name || `ID: ${item.id}`,
                value: item.id,
            }));

        setSearchResults(filtered);
    };

    const onFinish = async (values: UploadFormType) => {
        try {
            if (!values.video || values.video.length === 0) {
                message.error(translate("feed.validation.videoRequired"));
                return;
            }

            setUploading(true);
            setUploadProgress(0);

            const file = values.video[0].originFileObj;

            // Simuler la progression (dans la vraie app, utiliser les events du upload)
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + Math.random() * 30;
                });
            }, 500);

            // Préparer les données pour l'upload multipart
            const formData = new FormData();
            formData.append("file", file);
            formData.append("titre", values.title || translate("feed.upload.defaultTitle"));
            if (values.description) formData.append("description", values.description);
            if (values.parentType) formData.append("parentType", values.parentType);
            if (values.parentId) formData.append("parentId", values.parentId);

            // Créer le feed (l'API gérera l'upload et le traitement)
            createFeed(
                {
                    resource: "feed",
                    values: formData,
                },
                {
                    onSuccess: () => {
                        clearInterval(progressInterval);
                        setUploadProgress(100);
                        message.success(translate("feed.upload.success"));
                        setUploading(false);
                        form.resetFields();
                        setUploadProgress(0);
                    },
                    onError: () => {
                        clearInterval(progressInterval);
                        setUploading(false);
                        message.error(translate("common.error"));
                    },
                }
            );
        } catch (error) {
            message.error(translate("common.error"));
            setUploading(false);
        }
    };

    const parentTypeOptions = [
        { label: translate("feed.entities.residence"), value: "residence" },
        { label: translate("feed.entities.bien_immobilier"), value: "bien_immobilier" },
        { label: translate("feed.entities.furniture"), value: "furniture" },
    ];

    return (
        <List
            title={translate("feed.upload.propertyTitle")}
            headerButtons={[
                <Link key="back" to="/feed/videos/upload">
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
                                    if (Array.isArray(e)) {
                                        return e;
                                    }
                                    return e?.fileList;
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: translate(
                                            "feed.validation.videoRequired"
                                        ),
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
                                    style={{
                                        borderRadius: 8,
                                        padding: 40,
                                    }}
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

                            {/* Titre et Description */}
                            <Form.Item
                                name="title"
                                label={translate("feed.fields.title")}
                                rules={[
                                    {
                                        max: 200,
                                        message: translate("feed.validation.titleMax"),
                                    },
                                ]}
                            >
                                <Input
                                    placeholder={translate("feed.upload.titlePlaceholder")}
                                    maxLength={200}
                                />
                            </Form.Item>

                            <Form.Item
                                name="description"
                                label={translate("feed.fields.description")}
                                rules={[
                                    {
                                        max: 1000,
                                        message: translate("feed.validation.descriptionMax"),
                                    },
                                ]}
                            >
                                <Input.TextArea
                                    placeholder={translate("feed.upload.descriptionPlaceholder")}
                                    rows={5}
                                    maxLength={1000}
                                    showCount
                                />
                            </Form.Item>

                            {/* Accordéon - Lier à une Annonce */}
                            <Collapse
                                items={[
                                    {
                                        key: "advanced",
                                        label: (
                                            <Space size={8}>
                                                <span>➕</span>
                                                <span>
                                                    {translate("feed.upload.advancedOption")}
                                                </span>
                                            </Space>
                                        ),
                                        children: (
                                            <Space
                                                direction="vertical"
                                                style={{ width: "100%" }}
                                                size="large"
                                            >
                                                <Form.Item
                                                    name="parentType"
                                                    label={translate("feed.fields.parentType")}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Select
                                                        placeholder={translate("feed.upload.selectType")}
                                                        options={parentTypeOptions}
                                                        onChange={(value) =>
                                                            setParentType(value)
                                                        }
                                                        allowClear
                                                    />
                                                </Form.Item>

                                                {parentType && (
                                                    <Form.Item
                                                        name="parentId"
                                                        label={translate("feed.fields.identifier")}
                                                        style={{ marginBottom: 0 }}
                                                    >
                                                        <AutoComplete
                                                            placeholder={translate("feed.upload.searchPlaceholder")}
                                                            options={searchResults}
                                                            onSearch={handleSearch}
                                                            filterOption={false}
                                                        />
                                                    </Form.Item>
                                                )}
                                            </Space>
                                        ),
                                    },
                                ]}
                            />

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
