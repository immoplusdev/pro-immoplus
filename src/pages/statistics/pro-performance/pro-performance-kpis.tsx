import React from "react";
import { useCustom, useApiUrl } from "@refinedev/core";
import { Card, Col, Row, Spin, Statistic } from "antd";
import {
    FileTextOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    SafetyCertificateOutlined,
    HomeOutlined,
    DollarOutlined,
    RiseOutlined,
} from "@ant-design/icons";
import { ProPerformanceFiltersState, ProsKpisResponse, formatFcfa } from "./types";

interface Props {
    filters: ProPerformanceFiltersState;
}

export function ProPerformanceKpis({ filters }: Props) {
    const apiUrl = useApiUrl();

    const { data, isFetching } = useCustom<{ data: ProsKpisResponse }>({
        url: `${apiUrl}/v1/statistics/pros/kpis`,
        method: "get",
        config: { query: filters },
    });

    const kpis = data?.data as unknown as ProsKpisResponse | undefined;

    const stats = [
        {
            title: "Demandes reçues",
            value: kpis?.demandes.recues ?? 0,
            icon: <FileTextOutlined style={{ fontSize: 22, color: "#7B8DFF" }} />,
            bgIcon: "#E8EBFF",
        },
        {
            title: "Acceptées",
            value: kpis?.decisions.acceptees.nombre ?? 0,
            extra: kpis ? `${kpis.decisions.acceptees.taux.toFixed(1)} %` : undefined,
            icon: <CheckCircleOutlined style={{ fontSize: 22, color: "#1F8A5B" }} />,
            bgIcon: "#E8F4EE",
        },
        {
            title: "Refusées",
            value: kpis?.decisions.refusees.nombre ?? 0,
            extra: kpis ? `${kpis.decisions.refusees.taux.toFixed(1)} %` : undefined,
            icon: <CloseCircleOutlined style={{ fontSize: 22, color: "#C13838" }} />,
            bgIcon: "#FBE9E9",
        },
        {
            title: "Sans réponse",
            value: kpis?.blocages.sansReponse.nombre ?? 0,
            extra: kpis ? `${kpis.blocages.sansReponse.taux.toFixed(1)} %` : undefined,
            icon: <ClockCircleOutlined style={{ fontSize: 22, color: "#B86B0A" }} />,
            bgIcon: "#FCEFDD",
        },
        {
            title: "Confirmées",
            value: kpis?.confirmees ?? 0,
            icon: <SafetyCertificateOutlined style={{ fontSize: 22, color: "#2744DE" }} />,
            bgIcon: "#EEF1FE",
        },
        {
            title: "Effectuées",
            value: kpis?.resultats.effectuees ?? 0,
            icon: <HomeOutlined style={{ fontSize: 22, color: "#FA9F42" }} />,
            bgIcon: "#FDE8D3",
        },
        {
            title: "CA validé",
            value: kpis ? formatFcfa(kpis.resultats.caValideFcfa) : "0 FCFA",
            isText: true,
            icon: <DollarOutlined style={{ fontSize: 22, color: "#1F8A5B" }} />,
            bgIcon: "#E8F4EE",
        },
        {
            title: "Délai médian",
            value: kpis?.delaiMedianMinutes ?? "—",
            suffix: kpis?.delaiMedianMinutes != null ? "min" : undefined,
            icon: <ClockCircleOutlined style={{ fontSize: 22, color: "#6240E0" }} />,
            bgIcon: "#EDE9F9",
        },
        {
            title: "Taux de conversion",
            value: kpis?.tauxConversion ?? 0,
            suffix: "%",
            icon: <RiseOutlined style={{ fontSize: 22, color: "#2744DE" }} />,
            bgIcon: "#EEF1FE",
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
        <Row gutter={[16, 16]}>
            {stats.map((stat) => (
                <Col key={stat.title} xs={24} sm={12} lg={8} xl={6}>
                    <Card
                        style={{ background: "#FFFFFF", border: "1px solid #E8E8E8", boxShadow: "none" }}
                        styles={{ body: { display: "flex", alignItems: "center", gap: 16 } }}
                    >
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 10,
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
                            {stat.isText ? (
                                <>
                                    <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>{stat.title}</div>
                                    <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{stat.value}</div>
                                </>
                            ) : (
                                <Statistic
                                    title={stat.title}
                                    value={stat.value}
                                    suffix={stat.suffix}
                                    valueStyle={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}
                                />
                            )}
                            {stat.extra && (
                                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>{stat.extra}</div>
                            )}
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}
