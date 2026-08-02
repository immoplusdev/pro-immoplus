import React from "react";
import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { SwapOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

type ActiveMenu = "all" | "successful" | "pending" | "failed";

interface Props {
    activeMenu?: ActiveMenu;
}

export function TransferTabs({ activeMenu }: Props) {
    const translate = useTranslate();

    const tabs = [
        {
            key: "all" as const,
            to: "/transfers",
            label: "Tous",
            icon: SwapOutlined,
            color: TEXT_SECONDARY,
        },
        {
            key: "successful" as const,
            to: "/transfers/successful",
            label: "Réussis",
            icon: CheckCircleOutlined,
            color: "#1F8A5B",
        },
        {
            key: "pending" as const,
            to: "/transfers/pending",
            label: "En attente",
            icon: ClockCircleOutlined,
            color: "#B86B0A",
        },
        {
            key: "failed" as const,
            to: "/transfers/failed",
            label: "Échoués",
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
