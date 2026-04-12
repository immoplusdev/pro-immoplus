import React, { useState } from "react";
import { useCustom, useApiUrl } from "@refinedev/core";
import { Card, Segmented, Spin, Empty, Typography, Space } from "antd";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { PeriodeType, periodeOptions, formatPeriode } from "./utils";

const { Title } = Typography;

interface StatItemParType {
    periode: string | number;
    normal: number;
    express: number;
    total: number;
}

export function StatisticsVisitesParType() {
    const apiUrl = useApiUrl();
    const [periode, setPeriode] = useState<PeriodeType>("jour");

    const { data, isFetching } = useCustom<{ data: StatItemParType[] }>({
        url: `${apiUrl}/v1/statistics/visites/par-type`,
        method: "get",
        config: { query: { periode } },
    });

    const rawItems: StatItemParType[] = (data?.data as unknown as StatItemParType[]) ?? [];
    const chartData = rawItems.map((item) => ({
        label: formatPeriode(item.periode, periode),
        normal: item.normal,
        express: item.express,
    }));

    return (
        <Card
            title={<Title level={5} style={{ margin: 0 }}>Demandes de visites par type</Title>}
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
                    <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip
                            formatter={(value, name) => [value, name === "normal" ? "Normal" : "Express"]}
                            contentStyle={{ borderRadius: 8 }}
                        />
                        <Legend
                            formatter={(value) => value === "normal" ? "Normal" : "Express"}
                        />
                        <Bar dataKey="normal" stackId="a" fill="#1677ff" name="normal" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="express" stackId="a" fill="#fa8c16" name="express" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
}
