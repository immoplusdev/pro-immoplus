import { useTranslate } from "@refinedev/core";
import { List } from "@refinedev/antd";
import { Button, Row, Col, Card, Space, Typography } from "antd";
import { Link } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const FeedUploadIndex = () => {
    const translate = useTranslate();

    return (
        <List
            title={translate("feed.sections.uploader")}
            headerButtons={[
                <Link key="home" to="/feed">
                    <Button icon={<HomeOutlined />}>
                        {translate("feed.actions.backToHome")}
                    </Button>
                </Link>,
            ]}
        >
            <Row gutter={[24, 24]} justify="center" style={{ marginTop: 40 }}>
                {/* Mode Promo - Vidéo Simple */}
                <Col xs={24} sm={20} md={10}>
                    <Link to="/feed/videos/upload/promo">
                        <Card
                            hoverable
                            className="feed-card"
                            style={{ height: "100%", cursor: "pointer" }}
                        >
                            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                <div style={{ textAlign: "center", fontSize: 48, color: "#1890ff" }}>
                                    🎥
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <Text strong style={{ fontSize: 16 }}>
                                        {translate("feed.upload.promoTitle")}
                                    </Text>
                                </div>
                                <Text type="secondary" style={{ textAlign: "center" }}>
                                    {translate("feed.upload.promoDescription")}
                                </Text>
                                <Button type="primary" block>
                                    {translate("feed.upload.startPromo")}
                                </Button>
                            </Space>
                        </Card>
                    </Link>
                </Col>

                {/* Mode Lié à un Bien */}
                <Col xs={24} sm={20} md={10}>
                    <Link to="/feed/videos/upload/with-property">
                        <Card
                            hoverable
                            className="feed-card"
                            style={{ height: "100%", cursor: "pointer" }}
                        >
                            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                <div style={{ textAlign: "center", fontSize: 48, color: "#52c41a" }}>
                                    🏠
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <Text strong style={{ fontSize: 16 }}>
                                        {translate("feed.upload.propertyTitle")}
                                    </Text>
                                </div>
                                <Text type="secondary" style={{ textAlign: "center" }}>
                                    {translate("feed.upload.propertyDescription")}
                                </Text>
                                <Button type="default" block>
                                    {translate("feed.upload.startProperty")}
                                </Button>
                            </Space>
                        </Card>
                    </Link>
                </Col>
            </Row>
        </List>
    );
};
