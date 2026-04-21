import React, { useState } from "react";
import { useCustom, useApiUrl, useTranslate } from "@refinedev/core";
import { Card, Col, Row, Spin, Typography, DatePicker, Statistic, theme } from "antd";
import {
    TeamOutlined,
    UserOutlined,
    SafetyOutlined,
    ShopOutlined,
    HomeOutlined,
    BankOutlined,
    BarChartOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

const { Title } = Typography;

interface UtilisateursData {
    total: number;
    parRole: {
        customer: number;
        admin: number;
        proEntreprise: number;
        proParticulier: number;
        financier: number;
        commercial: number;
    };
}

export function StatisticsUtilisateurs() {
    const apiUrl = useApiUrl();
    const translate = useTranslate();
    const [date, setDate] = useState<Dayjs>(dayjs());
    const { token } = theme.useToken();

    const { data, isFetching } = useCustom<{ data: UtilisateursData }>({
        url: `${apiUrl}/v1/statistics/utilisateurs`,
        method: "get",
        config: { query: { date: date.format("YYYY-MM-DD") } },
    });

    const stats = data?.data as unknown as UtilisateursData | undefined;

    const cards = [
        {
            title: translate("tags.all_e"),
            value: stats?.total ?? 0,
            icon: <TeamOutlined style={{ fontSize: 24, color: token.colorPrimary }} />,
            bgCard: token.colorPrimaryBg,
            bgIcon: token.colorPrimaryBgHover,
        },
        {
            title: translate("users.tags.roles.customer"),
            value: stats?.parRole?.customer ?? 0,
            icon: <UserOutlined style={{ fontSize: 24, color: token.colorSuccess }} />,
            bgCard: token.colorSuccessBg,
            bgIcon: token.colorSuccessBgHover,
        },
        {
            title: translate("users.tags.roles.admin"),
            value: stats?.parRole?.admin ?? 0,
            icon: <SafetyOutlined style={{ fontSize: 24, color: token.colorError }} />,
            bgCard: token.colorErrorBg,
            bgIcon: token.colorErrorBgHover,
        },
        {
            title: translate("users.tags.roles.pro_entreprise"),
            value: stats?.parRole?.proEntreprise ?? 0,
            icon: <ShopOutlined style={{ fontSize: 24, color: token.colorInfoActive }} />,
            bgCard: token.colorInfoBg,
            bgIcon: token.colorInfoBgHover,
        },
        {
            title: translate("users.tags.roles.pro_particulier"),
            value: stats?.parRole?.proParticulier ?? 0,
            icon: <HomeOutlined style={{ fontSize: 24, color: token.colorWarning }} />,
            bgCard: token.colorWarningBg,
            bgIcon: token.colorWarningBgHover,
        },
        {
            title: translate("users.tags.roles.financier"),
            value: stats?.parRole?.financier ?? 0,
            icon: <BankOutlined style={{ fontSize: 24, color: token.colorTextSecondary }} />,
            bgCard: token.colorFillAlter,
            bgIcon: token.colorFillSecondary,
        },
        {
            title: translate("users.tags.roles.commercial"),
            value: stats?.parRole?.commercial ?? 0,
            icon: <BarChartOutlined style={{ fontSize: 24, color: token.colorTextSecondary }} />,
            bgCard: token.colorFillAlter,
            bgIcon: token.colorFillSecondary,
        },
    ];

    return (
        <Card
            title={<Title level={5} style={{ margin: 0 }}>Statistiques utilisateurs</Title>}
            extra={
                <DatePicker
                    value={date}
                    onChange={(val) => val && setDate(val)}
                    format="DD/MM/YYYY"
                    allowClear={false}
                />
            }
            style={{ marginBottom: 16 }}
        >
            {isFetching ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                    <Spin />
                </div>
            ) : (
                <Row gutter={[16, 16]}>
                    {cards.map((card) => (
                        <Col key={card.title} xs={24} sm={12} md={8} lg={6} xl={4}>
                            <Card
                                style={{ background: card.bgCard, border: "none" }}
                                styles={{ body: { display: "flex", alignItems: "center", gap: 12 } }}
                            >
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 10,
                                        background: card.bgIcon,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {card.icon}
                                </div>
                                <Statistic
                                    title={card.title}
                                    value={card.value}
                                    valueStyle={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Card>
    );
}
