import React from "react";
import { useTranslate, useShow } from "@refinedev/core";
import { Show, ListButton, DeleteButton } from "@refinedev/antd";
import {
    Card,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Divider,
} from "antd";
import {
    EyeOutlined,
    LikeOutlined,
    LinkOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useParams, Link } from "react-router-dom";
import { DateDisplayField } from "@/components/table";
import { SpinLoader } from "@/components/loading";
import { FeedEntityTag, FeedParentType } from "./components/feed-entity-tag";
import { FeedVideoStatusTag } from "./components/feed-video-status-tag";

const { Text, Paragraph, Title } = Typography;

export const ShowFeed = () => {
    const translate = useTranslate();
    const { id } = useParams<{ id: string }>();

    const { query } = useShow({ resource: "feed", id });
    const data = query?.data?.data;
    const isLoading = query?.isLoading;

    if (isLoading) return <SpinLoader />;

    const entityPathMap: Record<string, string> = {
        [FeedParentType.Residence]: "residences",
        [FeedParentType.BienImmobilier]: "biens-immobiliers",
        [FeedParentType.Furniture]: "furnitures",
    };
    const entityPath = entityPathMap[data?.relatedTo?.entity] ?? "residences";

    return (
        <Show
            isLoading={isLoading}
            headerButtons={[
                <ListButton key="list" />,
                <DeleteButton key="delete" recordItemId={id} />,
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
                                <Text strong>{translate("feed.fields.videoStatus")}: </Text>
                                {data?.videoStatus ? (
                                    <FeedVideoStatusTag status={data.videoStatus} />
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
        </Show>
    );
};
