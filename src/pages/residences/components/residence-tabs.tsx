import React from "react";
import { useCustom, useApiUrl, useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import {
    HomeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";

interface ResidencesParStatutValidation {
    enAttenteValidation: number;
    valide: number;
    rejete: number;
    total: number;
}

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

type ActiveMenu = "all_e" | "valide" | "en_validation" | "rejete" | "reduction";

interface Props {
    activeMenu?: ActiveMenu;
}

export function ResidenceTabs({ activeMenu }: Props) {
    const apiUrl = useApiUrl();
    const translate = useTranslate();

    const { data } = useCustom<{ data: ResidencesParStatutValidation }>({
        url: `${apiUrl}/v1/statistics/residences/par-statut-validation`,
        method: "get",
    });

    const stats = data?.data as unknown as ResidencesParStatutValidation | undefined;

    const tabs = [
        {
            key: "all_e" as const,
            to: "/residences",
            label: "Toutes",
            value: stats?.total ?? 0,
            icon: HomeOutlined,
            color: TEXT_SECONDARY,
        },
        {
            key: "valide" as const,
            to: "/residences/validé",
            label: "Validées",
            value: stats?.valide ?? 0,
            icon: CheckCircleOutlined,
            color: "#1F8A5B",
        },
        {
            key: "en_validation" as const,
            to: "/residences/en-validation",
            label: "En attente",
            value: stats?.enAttenteValidation ?? 0,
            icon: ClockCircleOutlined,
            color: "#B86B0A",
        },
        {
            key: "rejete" as const,
            to: "/residences/rejetées",
            label: "Rejetées",
            value: stats?.rejete ?? 0,
            icon: CloseCircleOutlined,
            color: "#C13838",
        },
        {
            key: "reduction" as const,
            to: "/residences/reduction",
            label: "Réductions",
            value: 0,
            icon: HomeOutlined,
            color: TEXT_SECONDARY,
        },
    ] as const;

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                background: "#FFFFFF",
                marginBottom: 16,
            }}
        >
            {tabs.map((tab) => {
                const isActive = activeMenu === tab.key;
                const Icon = tab.icon;
                return (
                    <Link key={tab.key} to={tab.to} style={{ textDecoration: "none" }}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                padding: "12px 20px",
                                background: "#FFFFFF",
                                borderBottom: isActive
                                    ? `2px solid ${tab.color}`
                                    : `1px solid ${BORDER_COLOR}`,
                                color: isActive ? tab.color : TEXT_SECONDARY,
                                cursor: "pointer",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Icon style={{ fontSize: 16 }} />
                                <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
                                    {tab.value}
                                </span>
                            </div>
                            <span style={{ fontSize: 12 }}>{tab.label}</span>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
