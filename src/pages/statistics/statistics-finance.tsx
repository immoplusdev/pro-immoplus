import React, { useState } from "react";
import { useCustom, useApiUrl } from "@refinedev/core";
import { Card, Col, Row, Spin, Typography, DatePicker, Statistic, theme } from "antd";
import { DollarOutlined, FileTextOutlined, WalletOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

const { Title } = Typography;

interface FinanceData {
    montantTotalReservations: number;
    montantTotalReservationImpayees: number;
    montantTotalDemandesVisites: number;
}

function formatCFA(value: number) {
    return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

export function StatisticsFinance() {
    const apiUrl = useApiUrl();
    const [date, setDate] = useState<Dayjs>(dayjs());
    const { token } = theme.useToken();

    const { data, isFetching } = useCustom<{ data: FinanceData }>({
        url: `${apiUrl}/v1/statistics/finance`,
        method: "get",
        config: { query: { date: date.format("YYYY-MM-DD") } },
    });

    const finance = data?.data as unknown as FinanceData | undefined;

    const stats = [
        {
            title: "Montant total réservation finalisé",
            value: finance?.montantTotalReservations ?? 0,
            icon: <DollarOutlined style={{ fontSize: 24, color: "#1F8A5B" }} />,
            bgCard: "#FFFFFF",
            bgIcon: "#E8F4EE",
        },
        {
            title: "Montant total des réservations initiées",
            value: finance?.montantTotalReservationImpayees ?? 0,
            icon: <WalletOutlined style={{ fontSize: 24, color: token.colorPrimary }} />,
            bgCard: "#FFFFFF",
            bgIcon: "#EEF1FE",
        },
        {
            title: "Montant total demandes de visites",
            value: finance?.montantTotalDemandesVisites ?? 0,
            icon: <FileTextOutlined style={{ fontSize: 24, color: "#9B8FC4" }} />,
            bgCard: "#FFFFFF",
            bgIcon: "#E8E6F5",
        },
    ];

    return (
        <Card
            title={<Title level={5} style={{ margin: 0 }}>Finance du jour</Title>}
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
                                        formatter={(val) => formatCFA(Number(val))}
                                        valueStyle={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}
                                    />
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Card>
    );
}
