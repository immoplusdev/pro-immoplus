import React from "react";
import { useCustom, useApiUrl, useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import {
    AppstoreOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";

interface BiensImmobiliersParStatutValidation {
    enAttenteValidation: number;
    valide: number;
    rejete: number;
    total: number;
}

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

type ActiveMenu = "all_e" | "valide" | "en_attente_validation" | "rejete" | "en_validation" | "disponible" | "non_disponible";

interface Props {
    activeMenu?: ActiveMenu;
}

// Normalize old activeMenu values to new ones
function normalizeActiveMenu(menu?: ActiveMenu): "all_e" | "valide" | "en_attente_validation" | "rejete" | undefined {
    if (!menu) return undefined;
    if (menu === "en_validation") return "en_attente_validation";
    if (menu === "disponible" || menu === "non_disponible") return "rejete";
    return menu as any;
}

export function BiensImmobiliersTabs({ activeMenu }: Props) {
    const apiUrl = useApiUrl();
    const translate = useTranslate();
    const normalizedMenu = normalizeActiveMenu(activeMenu);

    const { data } = useCustom<{ data: BiensImmobiliersParStatutValidation }>({
        url: `${apiUrl}/v1/statistics/biens-immobiliers/par-statut-validation`,
        method: "get",
    });

    const stats = data?.data as unknown as BiensImmobiliersParStatutValidation | undefined;

    const tabs = [
        {
            key: "all_e" as const,
            to: "/biens-immobiliers",
            label: "Tous",
            value: stats?.total ?? 0,
            icon: AppstoreOutlined,
            color: TEXT_SECONDARY,
        },
        {
            key: "valide" as const,
            to: "/biens-immobiliers/validé",
            label: "Validés",
            value: stats?.valide ?? 0,
            icon: CheckCircleOutlined,
            color: "#1F8A5B",
        },
        {
            key: "en_attente_validation" as const,
            to: "/biens-immobiliers/en-validation",
            label: "En validation",
            value: stats?.enAttenteValidation ?? 0,
            icon: ClockCircleOutlined,
            color: "#B86B0A",
        },
        {
            key: "rejete" as const,
            to: "/biens-immobiliers/non-disponible",
            label: "Non disponibles",
            value: stats?.rejete ?? 0,
            icon: CloseCircleOutlined,
            color: "#C13838",
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
                const isActive = normalizedMenu === tab.key;
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
