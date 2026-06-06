import React from "react";
import { useCustom, useApiUrl } from "@refinedev/core";
import { Card, Col, Row, Spin, Statistic, theme } from "antd";
import { AppstoreOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

interface BiensImmobiliersParStatutValidation {
    enAttenteValidation: number;
    valide: number;
    rejete: number;
    total: number;
}

export function BiensImmobiliersParStatutValidation() {
    const apiUrl = useApiUrl();
    const { token } = theme.useToken();

    const { data, isFetching } = useCustom<{ data: BiensImmobiliersParStatutValidation }>({
        url: `${apiUrl}/v1/statistics/biens-immobiliers/par-statut-validation`,
        method: "get",
    });

    const stats_data = data?.data as unknown as BiensImmobiliersParStatutValidation | undefined;

    const stats = [
        {
            title: "Total biens immobiliers",
            value: stats_data?.total ?? 0,
            icon: <AppstoreOutlined style={{ fontSize: 24, color: token.colorPrimary }} />,
            bgCard: token.colorPrimaryBg,
            bgIcon: token.colorPrimaryBgHover,
        },
        {
            title: "Validés",
            value: stats_data?.valide ?? 0,
            icon: <CheckCircleOutlined style={{ fontSize: 24, color: token.colorSuccess }} />,
            bgCard: token.colorSuccessBg,
            bgIcon: token.colorSuccessBgHover,
        },
        {
            title: "En attente de validation",
            value: stats_data?.enAttenteValidation ?? 0,
            icon: <ClockCircleOutlined style={{ fontSize: 24, color: token.colorWarning }} />,
            bgCard: token.colorWarningBg,
            bgIcon: token.colorWarningBgHover,
        },
        {
            title: "Rejetés",
            value: stats_data?.rejete ?? 0,
            icon: <CloseCircleOutlined style={{ fontSize: 24, color: token.colorError }} />,
            bgCard: token.colorErrorBg,
            bgIcon: token.colorErrorBgHover,
        },
    ];

    if (isFetching) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                <Spin />
            </div>
        );
    }

    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {stats.map((stat) => (
                <Col key={stat.title} xs={24} sm={12} lg={6}>
                    <Card
                        style={{ background: stat.bgCard, border: "none" }}
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
                        <Statistic
                            title={stat.title}
                            value={stat.value}
                            valueStyle={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
}
