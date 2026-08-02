import React from "react";
import { Tabs, Typography } from "antd";
import { StatisticsVisites } from "./statistics-visites";
import { StatisticsVisitesParType } from "./statistics-visites-par-type";
import { StatisticsReservations } from "./statistics-reservations";
import { StatisticsReservationsParStatut } from "./statistics-reservations-par-statut";
import { StatisticsBiensImmobiliers } from "./statistics-biens-immobiliers";
import { StatisticsResidences } from "./statistics-residences";
import { StatisticsTotaux } from "./statistics-totaux";
import { StatisticsFinance } from "./statistics-finance";
import { ProPerformance } from "./pro-performance/pro-performance";

const { Title } = Typography;

export function Statistics() {
    return (
        <div
            style={{
                background: "#FFFFFF",
                padding: 24,
                borderRadius: 8,
            }}
        >
            <Title level={3} style={{ margin: 0, marginBottom: 16 }}>Statistiques</Title>
            <Tabs
                items={[
                    {
                        key: "overview",
                        label: "Vue d'ensemble",
                        children: (
                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                <StatisticsTotaux />
                                <StatisticsFinance />
                                <StatisticsReservations />
                                <StatisticsResidences />
                                <StatisticsBiensImmobiliers />
                                <StatisticsVisites />
                                <StatisticsVisitesParType />
                                <StatisticsReservationsParStatut />
                            </div>
                        ),
                    },
                    {
                        key: "pro-performance",
                        label: "Performance Pros",
                        children: <ProPerformance />,
                    },
                ]}
            />
        </div>
    );
}
