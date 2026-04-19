import React, { useState } from "react";
import { useCustom, useApiUrl } from "@refinedev/core";
import { Card, Segmented, Spin, Empty, Typography } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PeriodeType, StatItem, periodeOptions, formatPeriode } from "./utils";

const { Title } = Typography;

export function StatisticsVisites() {
    const apiUrl = useApiUrl();
    const [periode, setPeriode] = useState<PeriodeType>("jour");

    const { data, isFetching } = useCustom<{ data: StatItem[] }>({
        url: `${apiUrl}/v1/statistics/visites`,
        method: "get",
        config: { query: { periode } },
    });

    const rawItems: StatItem[] = (data?.data as unknown as StatItem[]) ?? [];
    const chartData = rawItems.map((item) => ({
        label: formatPeriode(item.periode, periode),
        total: item.total,
    }));

    return (
        <Card
            title={<Title level={5} style={{ margin: 0 }}>Évolution des demandes de visites</Title>}
            extra={
                <Segmented
                    options={periodeOptions}
                    value={periode}
                    onChange={(val) => setPeriode(val as PeriodeType)}
                />
            }
        >
            {isFetching ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                    <Spin />
                </div>
            ) : chartData.length === 0 ? (
                <Empty description="Aucune donnée disponible" />
            ) : (
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(value) => [value, "Demandes"]} contentStyle={{ borderRadius: 8 }} />
                        <Line type="monotone" dataKey="total" stroke="#1677ff" strokeWidth={2} dot={{ r: 4, fill: "#1677ff" }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
}
