import React from "react";
import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
} from "@ant-design/icons";

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

type ActiveMenu = "all_e" | "valide" | "en_validation";

interface Props {
    activeMenu?: ActiveMenu;
}

// Normalize old activeMenu values to new ones
function normalizeActiveMenu(menu?: ActiveMenu): "all_e" | "valide" | "en_validation" | undefined {
    return menu;
}

export function DemandeVisiteTabs({ activeMenu }: Props) {
    const translate = useTranslate();
    const normalizedMenu = normalizeActiveMenu(activeMenu);

    const tabs = [
        {
            key: "all_e" as const,
            to: "/demandes-visites",
            label: "Tous",
            icon: FileTextOutlined,
            color: TEXT_SECONDARY,
        },
        {
            key: "valide" as const,
            to: "/demandes-visites/validé",
            label: "Validées",
            icon: CheckCircleOutlined,
            color: "#1F8A5B",
        },
        {
            key: "en_validation" as const,
            to: "/demandes-visites/en-validation",
            label: "En attente",
            icon: ClockCircleOutlined,
            color: "#B86B0A",
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
                            </div>
                            <span style={{ fontSize: 12 }}>{tab.label}</span>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
