import React, { useState } from "react";
import { useCustom, useApiUrl } from "@refinedev/core";
import { Card, Col, Row, Spin, Typography, DatePicker, Statistic, theme } from "antd";
import { HomeOutlined, CalendarOutlined, ShoppingOutlined, CheckCircleOutlined, RiseOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

const { Title } = Typography;

interface TotauxData {
    residences: number;
    visites: {
        normal: number;
        express: number;
        total: number;
    };
    biensImmobiliers: number;
    reservationsEffectuees: number;
    reservationsEchouees: number;
    reservationsTotal: number;
}

export function StatisticsTotaux() {
    const apiUrl = useApiUrl();
    const [date, setDate] = useState<Dayjs>(dayjs());
    const { token } = theme.useToken();

    const { data, isFetching } = useCustom<{ data: TotauxData }>({
        url: `${apiUrl}/v1/statistics/totaux`,
        method: "get",
        config: { query: { date: date.format("YYYY-MM-DD") } },
    });

    const totaux = data?.data as unknown as TotauxData | undefined;

    const stats = [
        {
            title: "Résidences",
            value: totaux?.residences ?? 0,
            icon: <HomeOutlined style={{ fontSize: 24, color: token.colorPrimary }} />,
            bgCard: "#FFFFFF",
            bgIcon: "#EEF1FE",
        },
        {
            title: "Visites totales",
            value: totaux?.visites?.total ?? 0,
            icon: <CalendarOutlined style={{ fontSize: 24, color: "#7B8DFF" }} />,
            bgCard: "#FFFFFF",
            bgIcon: "#E8EBFF",
            extra: totaux
                ? `${totaux.visites.normal} normale${totaux.visites.normal !== 1 ? "s" : ""} · ${totaux.visites.express} express`
                : undefined,
        },
        {
            title: "Biens immobiliers",
            value: totaux?.biensImmobiliers ?? 0,
            icon: <ShoppingOutlined style={{ fontSize: 24, color: "#FA9F42" }} />,
            bgCard: "#FFFFFF",
            bgIcon: "#FDE8D3",
        },
        {
            title: "Réservations finalisées",
            value: totaux?.reservationsEffectuees ?? 0,
            icon: <CheckCircleOutlined style={{ fontSize: 24, color: "#1F8A5B" }} />,
            bgCard: "#FFFFFF",
            bgIcon: "#E8F4EE",
        },
        {
            title: "Réservations Total initiées",
            value: totaux?.reservationsTotal ?? 0,
            icon: <RiseOutlined style={{ fontSize: 24, color: token.colorPrimary }} />,
            bgCard: "#FFFFFF",
            bgIcon: "#DDE2FD",
        },
    ];

    return (
        <Card
            title={<Title level={5} style={{ margin: 0 }}>Totaux du jours</Title>}
            extra={
                <DatePicker
                    value={date}
                    onChange={(val) => val && setDate(val)}
                    format="DD/MM/YYYY"
                    allowClear={false}
                />
            }
        >
            {isFetching ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                    <Spin />
                </div>
            ) : (
                <Row gutter={[16, 16]}>
                    {stats.map((stat) => (
                        <Col key={stat.title} xs={24} sm={12} lg={8}>
                            <Card
                                style={{
                                    background: stat.bgCard,
                                    border: "1px solid #E8E8E8",
                                    boxShadow: "none",
                                }}
                                styles={{ body: { display: "flex", alignItems: "center", gap: 16 } }}
                            >
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 12,
                                        background: stat.bgIcon,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {stat.icon}
                                </div>
                                <div>
                                    <Statistic
                                        title={stat.title}
                                        value={stat.value}
                                        valueStyle={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}
                                    />
                                    {stat.extra && (
                                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                            {stat.extra}
                                        </Typography.Text>
                                    )}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Card>
    );
}
