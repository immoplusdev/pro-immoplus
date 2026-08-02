import React, { useState } from "react";
import { useCustom, useApiUrl } from "@refinedev/core";
import { Card, Select, Space, Spin, Empty } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import { ProPerformanceRow, ProKpiPeriod, periodOptions } from "@/pages/statistics/pro-performance/types";
import { ProDetailContent } from "@/pages/statistics/pro-performance/pro-detail-content";

interface Props {
    proId?: string;
}

export function UserProStatistics({ proId }: Props) {
    const apiUrl = useApiUrl();
    const [period, setPeriod] = useState<ProKpiPeriod>("month");

    const { data, isFetching } = useCustom<{ data: ProPerformanceRow }>({
        url: `${apiUrl}/v1/statistics/pros/${proId}`,
        method: "get",
        config: { query: { period } },
        queryOptions: { enabled: !!proId },
    });

    const pro = data?.data as unknown as ProPerformanceRow | undefined;

    return (
        <Card
            style={{ marginTop: "2rem" }}
            title={
                <Space>
                    <BarChartOutlined />
                    <p style={{ margin: 0 }}>Statistiques Pro</p>
                </Space>
            }
            extra={
                <Select
                    size="small"
                    value={period}
                    options={periodOptions.filter((option) => option.value !== "custom")}
                    onChange={setPeriod}
                    style={{ width: 130 }}
                />
            }
            headStyle={{ padding: "1rem", border: "0.5px solid black" }}
            bodyStyle={{ padding: "2rem", border: "0.5px solid black" }}
        >
            {isFetching ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                    <Spin />
                </div>
            ) : pro ? (
                <ProDetailContent pro={pro} />
            ) : (
                <Empty description="Aucune statistique disponible" />
            )}
        </Card>
    );
}
