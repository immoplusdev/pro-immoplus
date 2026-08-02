import React, { useState } from "react";
import { useCustom, useApiUrl } from "@refinedev/core";
import { Card, Segmented, Spin, Empty, Typography, DatePicker } from "antd";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PeriodeType, StatItem, periodeOptions, formatPeriode } from "./utils";
import type { Dayjs } from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;

function periodeToDate(periode: string | number, type: PeriodeType): Date | null {
    if (type === "jour") {
        const d = new Date(String(periode));
        return isNaN(d.getTime()) ? null : d;
    }
    if (type === "semaine") {
        const str = String(periode);
        if (str.length < 5) return null;
        const year = parseInt(str.slice(0, 4));
        const week = parseInt(str.slice(4));
        const jan4 = new Date(year, 0, 4);
        const dayOfWeek = jan4.getDay() || 7;
        const monday = new Date(jan4);
        monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
        return monday;
    }
    // mois: "2026-05"
    const parts = String(periode).split("-");
    if (parts.length < 2) return null;
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
}

export function StatisticsResidences() {
    const apiUrl = useApiUrl();
    const [periode, setPeriode] = useState<PeriodeType>("jour");
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    const { data, isFetching } = useCustom<{ data: StatItem[] }>({
        url: `${apiUrl}/v1/statistics/residences`,
        method: "get",
        config: { query: { periode } },
    });

    const rawItems: StatItem[] = (data?.data as unknown as StatItem[]) ?? [];

    const filteredItems = rawItems.filter((item) => {
        if (!dateRange || (!dateRange[0] && !dateRange[1])) return true;
        const d = periodeToDate(item.periode, periode);
        if (!d) return true;
        const start = dateRange[0]?.startOf("day").toDate();
        const end = dateRange[1]?.endOf("day").toDate();
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
    });

    const chartData = filteredItems.map((item) => ({
        label: formatPeriode(item.periode, periode),
        total: item.total,
    }));

    return (
        <Card
            title={<Title level={5} style={{ margin: 0 }}>Évolution des résidences</Title>}
            extra={
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <RangePicker
                        value={dateRange}
                        onChange={(val) => setDateRange(val as [Dayjs | null, Dayjs | null] | null)}
                        format="DD/MM/YYYY"
                        allowClear
                        placeholder={["Date début", "Date fin"]}
                        size="small"
                    />
                    <Segmented
                        options={periodeOptions}
                        value={periode}
                        onChange={(val) => {
                            setPeriode(val as PeriodeType);
                            setDateRange(null);
                        }}
                    />
                </div>
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
                        <Tooltip
                            formatter={(value) => [value, "Résidences"]}
                            contentStyle={{
                                borderRadius: 8,
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #E8E8E8",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#6240E0"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "#6240E0" }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
}
