import React, { useState } from "react";
import { useCustom, useApiUrl } from "@refinedev/core";
import { Card, Segmented, Spin, Empty, Typography } from "antd";
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

interface StatItemParStatut {
    periode: string | number;
    total: number;
    effectuees: number;
    nonEffectuees: number;
    clientSansReponse: number;
    clientAnnuleReservation: number;
    proSansReponse: number;
    proAnnuleReservation: number;
}

const LABELS: Record<string, string> = {
    effectuees: "Effectuées",
    clientSansReponse: "Client sans réponse",
    clientAnnuleReservation: "Client annulé",
    proSansReponse: "Pro sans réponse",
    proAnnuleReservation: "Pro annulé",
};

const COLORS: Record<string, string> = {
    effectuees: "#52c41a",
    clientSansReponse: "#fa8c16",
    clientAnnuleReservation: "#ff4d4f",
    proSansReponse: "#1677ff",
    proAnnuleReservation: "#722ed1",
};

const BARS = [
    "effectuees",
    "clientSansReponse",
    "clientAnnuleReservation",
    "proSansReponse",
    "proAnnuleReservation",
] as const;

export function StatisticsReservationsParStatut() {
    const apiUrl = useApiUrl();
    const [periode, setPeriode] = useState<PeriodeType>("jour");

    const { data, isFetching } = useCustom<{ data: StatItemParStatut[] }>({
        url: `${apiUrl}/v1/statistics/reservations/par-statut`,
        method: "get",
        config: { query: { periode } },
    });

    const rawItems: StatItemParStatut[] = (data?.data as unknown as StatItemParStatut[]) ?? [];
    const chartData = rawItems.map((item) => ({
        label: formatPeriode(item.periode, periode),
        effectuees: item.effectuees,
        clientSansReponse: item.clientSansReponse,
        clientAnnuleReservation: item.clientAnnuleReservation,
        proSansReponse: item.proSansReponse,
        proAnnuleReservation: item.proAnnuleReservation,
    }));

    return (
        <Card
            title={<Title level={5} style={{ margin: 0 }}>Réservations par statut</Title>}
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
                            formatter={(value, name) => [value, LABELS[name as string] ?? name]}
                            contentStyle={{ borderRadius: 8 }}
                        />
                        <Legend formatter={(value) => LABELS[value] ?? value} />
                        {BARS.map((key, index) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                stackId="a"
                                fill={COLORS[key]}
                                name={key}
                                radius={index === BARS.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
}
