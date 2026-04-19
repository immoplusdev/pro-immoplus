import React from "react";
import { Typography } from "antd";
import { StatisticsVisites } from "./statistics-visites";
import { StatisticsVisitesParType } from "./statistics-visites-par-type";
import { StatisticsReservations } from "./statistics-reservations";
import { StatisticsReservationsParStatut } from "./statistics-reservations-par-statut";
import { StatisticsBiensImmobiliers } from "./statistics-biens-immobiliers";
import { StatisticsResidences } from "./statistics-residences";

const { Title } = Typography;

export function Statistics() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Title level={3} style={{ margin: 0 }}>Statistiques</Title>
            <StatisticsVisites />
            <StatisticsVisitesParType />
            <StatisticsReservations />
            <StatisticsReservationsParStatut />
            <StatisticsBiensImmobiliers />
            <StatisticsResidences />
        </div>
    );
}
