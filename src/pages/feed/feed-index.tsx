import { useGetIdentity, useTranslate } from "@refinedev/core";
import { List } from "@refinedev/antd";
import { Button, Row, Col, Card, Space, Typography } from "antd";
import { Link } from "react-router-dom";
import { PlayCircleOutlined, InboxOutlined, CloudUploadOutlined, HomeOutlined } from "@ant-design/icons";
import { UserRole } from "@/core/domain/users";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";

const { Text } = Typography;
const localStorageProvider = getLocalStorageProvider();

export const FeedIndex = () => {
    const translate = useTranslate();
    const { data: identity } = useGetIdentity<{ role?: { id: string } }>();
    const authData = localStorageProvider.getAuthData();
    const role = authData?.role || identity?.role?.id;
    const isAdmin = role === UserRole.Admin;

    return (
        <List title={translate("feed.title")} wrapperProps={{ className: "feed-index-wrapper" }}>
            <Row gutter={[24, 24]} justify="center" style={{ marginTop: 40 }}>
                {/* Flux Actif */}
                <Col xs={24} sm={12} md={6}>
                    <Link to="/feed/list">
                        <Card
                            hoverable
                            className="feed-card"
                            style={{ height: "100%", cursor: "pointer" }}
                        >
                            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                <div style={{ textAlign: "center", fontSize: 32, color: "#1890ff" }}>
                                    <PlayCircleOutlined />
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <Text strong style={{ fontSize: 16 }}>
                                        {translate("feed.sections.activeFlow")}
                                    </Text>
                                </div>
                                <Text type="secondary" style={{ textAlign: "center" }}>
                                    {translate("feed.descriptions.activeFlow")}
                                </Text>
                                <Button
                                    type="primary"
                                    block
                                    style={{ marginTop: "auto" }}
                                >
                                    {translate("feed.actions.viewActive")}
                                </Button>
                            </Space>
                        </Card>
                    </Link>
                </Col>

                {/* Flux Legacy */}
                <Col xs={24} sm={12} md={6}>
                    <Link to="/feed/legacy">
                        <Card
                            hoverable
                            className="feed-card"
                            style={{ height: "100%", cursor: "pointer" }}
                        >
                            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                <div style={{ textAlign: "center", fontSize: 32, color: "#faad14" }}>
                                    <InboxOutlined />
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <Text strong style={{ fontSize: 16 }}>
                                        {translate("feed.sections.legacyFlow")}
                                    </Text>
                                </div>
                                <Text type="secondary" style={{ textAlign: "center" }}>
                                    {translate("feed.descriptions.legacyFlow")}
                                </Text>
                                <Button
                                    type="default"
                                    block
                                    style={{ marginTop: "auto" }}
                                >
                                    {translate("feed.actions.viewLegacy")}
                                </Button>
                            </Space>
                        </Card>
                    </Link>
                </Col>

                {/* Upload */}
                <Col xs={24} sm={12} md={6}>
                    <Link to="/feed/videos/upload">
                        <Card
                            hoverable
                            className="feed-card"
                            style={{ height: "100%", cursor: "pointer" }}
                        >
                            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                <div style={{ textAlign: "center", fontSize: 32, color: "#52c41a" }}>
                                    <CloudUploadOutlined />
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <Text strong style={{ fontSize: 16 }}>
                                        {translate("feed.sections.uploader")}
                                    </Text>
                                </div>
                                <Text type="secondary" style={{ textAlign: "center" }}>
                                    {translate("feed.descriptions.uploader")}
                                </Text>
                                <Button
                                    type="default"
                                    block
                                    style={{ marginTop: "auto" }}
                                >
                                    {translate("feed.actions.upload")}
                                </Button>
                            </Space>
                        </Card>
                    </Link>
                </Col>

                {/* Home Feed */}
                {isAdmin && (
                    <Col xs={24} sm={12} md={6}>
                        <Link to="/feed/home">
                            <Card
                                hoverable
                                className="feed-card"
                                style={{ height: "100%", cursor: "pointer" }}
                            >
                                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                    <div style={{ textAlign: "center", fontSize: 32, color: "#722ed1" }}>
                                        <HomeOutlined />
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        <Text strong style={{ fontSize: 16 }}>
                                            {translate("feed.sections.home")}
                                        </Text>
                                    </div>
                                    <Text type="secondary" style={{ textAlign: "center" }}>
                                        {translate("feed.descriptions.home")}
                                    </Text>
                                    <Button
                                        type="default"
                                        block
                                        style={{ marginTop: "auto" }}
                                    >
                                        {translate("feed.actions.viewHome")}
                                    </Button>
                                </Space>
                            </Card>
                        </Link>
                    </Col>
                )}
            </Row>
        </List>
    );
};
