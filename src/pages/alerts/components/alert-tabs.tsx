import React from "react";
import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { BellOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

type ActiveMenu = "toutes" | "en_attente" | "propositions" | "cloturees";

interface Props {
    activeMenu?: ActiveMenu;
}

export function AlertTabs({ activeMenu }: Props) {
    const translate = useTranslate();

    const tabs = [
        {
            key: "toutes" as const,
            to: "/alerts",
            label: "Tous",
            icon: BellOutlined,
            color: TEXT_SECONDARY,
        },
        {
            key: "en_attente" as const,
            to: "/alerts/en-attente",
            label: "En attente",
            icon: ClockCircleOutlined,
            color: "#B86B0A",
        },
        {
            key: "propositions" as const,
            to: "/alerts/propositions",
            label: "Propositions",
            icon: CheckCircleOutlined,
            color: "#1F8A5B",
        },
        {
            key: "cloturees" as const,
            to: "/alerts/clôturées",
            label: "Clôturées",
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
                            </div>
                            <span style={{ fontSize: 12 }}>{tab.label}</span>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
