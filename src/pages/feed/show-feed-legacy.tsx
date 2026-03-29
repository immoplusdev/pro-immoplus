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
    Tag,
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
} from "@ant-design/icons";
import { useParams, Link } from "react-router-dom";
import { DateDisplayField } from "@/components/table";
import { SpinLoader } from "@/components/loading";
import { FeedEntityTag, FeedParentType } from "./components/feed-entity-tag";
import { FeedVideoStatusTag } from "./components/feed-video-status-tag";
import { API_URL } from "@/configs/app.config";

const { Text, Paragraph, Title } = Typography;

export const ShowFeedLegacy = () => {
    const translate = useTranslate();
    const { id } = useParams<{ id: string }>();
    const [migrating, setMigrating] = useState(false);
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Récupérer les détails avec le query param ?id=
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setIsLoading(true);
                console.log(`🔵 Fetch détail: GET ${API_URL}/feed/legacy?id=${id}`);

                const response = await fetch(`${API_URL}/feed/legacy?id=${id}`);
                console.log("📊 Status:", response.status, response.statusText);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }

                const json = await response.json();
                console.log("✅ Données reçues:", json);
                setData(json.data);
            } catch (error) {
                console.error("❌ Erreur fetch détail:", error);
                message.error(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchDetail();
        }
    }, [id]);

    if (isLoading) return <SpinLoader />;

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

    const handleMigrate = async () => {
        setMigrating(true);
        try {
            const result = await axiosInstance.post(
                `${API_URL}/feed/admin/legacy/${id}/migrate`,
                {
                    titre: data?.content?.title,
                    description: data?.content?.description,
                }
            );

            message.success(translate("feed.legacy.migrateSuccess"));
            console.log("✅ Migration réussie:", result.data);

            setTimeout(() => {
                window.location.href = "/feed/list";
            }, 1500);
        } catch (error: any) {
            setMigrating(false);
            console.error("❌ Erreur migration:", error);
            const msg = error?.response?.data?.message || translate("common.error");
            message.error(msg);
        }
    };

    return (
        <Show
            isLoading={isLoading}
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
                        {data?.videoUrl ? (
                            <video
                                src={data.videoUrl}
                                controls
                                style={{ width: "100%", borderRadius: 8, maxHeight: 400 }}
                            />
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
                                <Tag color="green">{data?.content?.price || translate("common.notAvailable")}</Tag>
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
                                <Tag>{data?.shortCode}</Tag>
                            </div>
                            <div>
                                <Text strong>{translate("feed.fields.source")}: </Text>
                                <Tag>{data?.source}</Tag>
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
                <Col>
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
                </Col>
            </Row>
        </Show>
    );
};
