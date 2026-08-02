import { useState, useEffect } from "react";
import { useTranslate } from "@refinedev/core";
import { Show, ListButton, DeleteButton } from "@refinedev/antd";
import { axiosInstance } from "@/lib/providers/utils/axios";
import {
    Card,
    Row,
    Col,
    Typography,
    Space,
    Divider,
    Button,
    Popconfirm,
    message,
} from "antd";
import {
    EyeOutlined,
    LikeOutlined,
    LinkOutlined,
    UserOutlined,
    SwapOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { useParams, Link, useLocation } from "react-router-dom";
import { DateDisplayField, OutlineTag } from "@/components/table";
import { SpinLoader } from "@/components/loading";
import { FeedEntityTag, FeedParentType } from "./components/feed-entity-tag";
import { FeedVideoStatusTag } from "./components/feed-video-status-tag";
import { API_URL } from "@/configs/app.config";

const { Text, Paragraph, Title } = Typography;

export const ShowFeedLegacy = () => {
    const translate = useTranslate();
    const { id } = useParams<{ id: string }>();
    const { state } = useLocation();
    const [migrating, setMigrating] = useState(false);
    const [data, setData] = useState<any>(state?.record ?? null);
    const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!data?.videoUrl) return;
        let objectUrl: string;
        axiosInstance
            .get(data.videoUrl, { responseType: "blob" })
            .then((res) => {
                objectUrl = URL.createObjectURL(res.data);
                setVideoBlobUrl(objectUrl);
            })
            .catch(() => setVideoBlobUrl(null));
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [data?.videoUrl]);

    if (!data) {
        return (
            <Show headerButtons={[<ListButton key="list" />]}>
                <div style={{ textAlign: "center", padding: "40px" }}>
                    <Text type="danger">{translate("common.notFound")}</Text>
                </div>
            </Show>
        );
    }

    const entityPathMap: Record<string, string> = {
        [FeedParentType.Residence]: "residences",
        [FeedParentType.BienImmobilier]: "biens-immobiliers",
        [FeedParentType.Furniture]: "furnitures",
    };
    const entityPath = entityPathMap[data?.relatedTo?.entity] ?? "residences";
    const isMigrated = Boolean(data?.migratedAt);

    const handleMigrate = async () => {
        setMigrating(true);
        try {
            await axiosInstance.post(
                `${API_URL}/feed/admin/legacy/${id}/migrate`
            );
            message.success(translate("feed.legacy.migrateSuccess"));
            setData((prev: any) => ({ ...prev, migratedAt: new Date().toISOString() }));
        } catch (error: any) {
            console.error("❌ Erreur migration:", error);
            message.error(error?.response?.data?.message || translate("common.error"));
        } finally {
            setMigrating(false);
        }
    };

    return (
        <Show
            headerButtons={[
                <Link key="back" to="/feed/legacy">
                    <Button icon={<ArrowLeftOutlined />}>
                        {translate("common.back") || "← Retour"}
                    </Button>
                </Link>,
                <DeleteButton
                    key="delete"
                    resource="feed/videos"
                    recordItemId={id}
                />,
            ]}
        >
            <Row gutter={[16, 16]}>
                {/* Vidéo */}
                <Col xs={24} md={12}>
                    <Card title={translate("feed.sections.video")} size="small">
                        {videoBlobUrl ? (
                            <video
                                src={videoBlobUrl}
                                controls
                                style={{ width: "100%", borderRadius: 8, maxHeight: 400 }}
                            />
                        ) : data?.videoUrl ? (
                            <SpinLoader />
                        ) : (
                            <Text type="secondary">{translate("common.notAvailable")}</Text>
                        )}
                    </Card>
                </Col>

                {/* Contenu */}
                <Col xs={24} md={12}>
                    <Card title={translate("feed.sections.content")} size="small">
                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                            <div>
                                <Title level={5} style={{ margin: 0 }}>{data?.content?.title}</Title>
                            </div>
                            <div>
                                <Text strong>{translate("feed.fields.price")}: </Text>
                                <OutlineTag color="#1F8A5B">{data?.content?.price || translate("common.notAvailable")}</OutlineTag>
                            </div>
                            <div>
                                <Text strong>{translate("feed.fields.location")}: </Text>
                                <Text>{data?.content?.location || translate("common.notAvailable")}</Text>
                            </div>
                            <div>
                                <Text strong>{translate("feed.fields.description")}: </Text>
                                <Paragraph
                                    ellipsis={{ rows: 4, expandable: true, symbol: translate("feed.actions.readMore") }}
                                    style={{ marginBottom: 0, whiteSpace: "pre-line" }}
                                >
                                    {data?.content?.description}
                                </Paragraph>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
                {/* Métadonnées */}
                <Col xs={24} md={12}>
                    <Card title={translate("feed.sections.metadata")} size="small">
                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                            <div>
                                <Text strong>{translate("feed.fields.status")}: </Text>
                                {data?.status ? (
                                    <FeedVideoStatusTag status={data.status} />
                                ) : (
                                    <Text type="secondary">{translate("common.notAvailable")}</Text>
                                )}
                            </div>
                            <div>
                                <Text strong>{translate("feed.fields.shortCode")}: </Text>
                                <OutlineTag color="#5F5E5A">{data?.shortCode}</OutlineTag>
                            </div>
                            <div>
                                <Text strong>{translate("feed.fields.source")}: </Text>
                                <OutlineTag color="#5F5E5A">{data?.source}</OutlineTag>
                            </div>
                            <div>
                                <Text strong>{translate("feed.fields.entity")}: </Text>
                                {data?.relatedTo?.entity && (
                                    <FeedEntityTag entity={data.relatedTo.entity} />
                                )}
                            </div>
                            {data?.relatedTo?.id && (
                                <div>
                                    <Text strong>{translate("feed.fields.relatedLink")}: </Text>
                                    <Link to={`/${entityPath}/show/${data.relatedTo.id}`}>
                                        <LinkOutlined /> {translate("feed.actions.viewRelated")}
                                    </Link>
                                </div>
                            )}
                            <div>
                                <Text strong>{translate("fields.created_at")}: </Text>
                                <DateDisplayField value={data?.createdAt} />
                            </div>
                        </Space>
                    </Card>
                </Col>

                {/* Auteur & Stats */}
                <Col xs={24} md={12}>
                    <Card title={translate("feed.sections.authorStats")} size="small">
                        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                            <div>
                                <Text strong><UserOutlined /> {translate("feed.fields.author")}: </Text>
                                {data?.author?.id ? (
                                    <Link to={`/users/show/${data.author.id}`}>
                                        {data.author.name}
                                    </Link>
                                ) : (
                                    <Text>{data?.author?.name || translate("common.notAvailable")}</Text>
                                )}
                            </div>
                            <div>
                                <Text strong><LikeOutlined /> {translate("feed.fields.likes")}: </Text>
                                <Text>{data?.stats?.likes ?? 0}</Text>
                            </div>
                            <div>
                                <Text strong><EyeOutlined /> {translate("feed.fields.views")}: </Text>
                                <Text>{data?.stats?.views ?? 0}</Text>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Divider />

            {/* Bouton Migration */}
            <Row justify="center" style={{ marginTop: 24 }}>
                <Col style={{ textAlign: "center" }}>
                    {isMigrated ? (
                        <Space direction="vertical" size={4}>
                            <OutlineTag color="#1F8A5B">
                                <CheckCircleOutlined /> {translate("feed.legacy.alreadyMigrated")}
                            </OutlineTag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                <DateDisplayField value={data.migratedAt} />
                            </Text>
                        </Space>
                    ) : (
                        <Popconfirm
                            title={translate("feed.legacy.migrateTitle")}
                            description={translate("feed.legacy.migrateDescription")}
                            onConfirm={handleMigrate}
                            okText={translate("common.yes")}
                            cancelText={translate("common.no")}
                        >
                            <Button
                                type="primary"
                                size="large"
                                icon={<SwapOutlined />}
                                loading={migrating}
                                disabled={migrating}
                            >
                                {translate("feed.legacy.migrateButton")}
                            </Button>
                        </Popconfirm>
                    )}
                </Col>
            </Row>
        </Show>
    );
};
