import React from "react";
import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

type ActiveMenu = "all" | "pending" | "approved" | "rejected" | "processing";

interface Props {
    activeMenu?: ActiveMenu;
}

export function WithdrawalRequestTabs({ activeMenu }: Props) {
    const translate = useTranslate();

    const tabs = [
        {
            key: "all" as const,
            to: "/withdrawal-requests",
            label: "Tous",
            icon: FileTextOutlined,
            color: TEXT_SECONDARY,
        },
        {
            key: "pending" as const,
            to: "/withdrawal-requests/pending",
            label: "En attente",
            icon: ClockCircleOutlined,
            color: "#B86B0A",
        },
        {
            key: "approved" as const,
            to: "/withdrawal-requests/approved",
            label: "Approuvés",
            icon: CheckCircleOutlined,
            color: "#1F8A5B",
        },
        {
            key: "processing" as const,
            to: "/withdrawal-requests/processing",
            label: "En traitement",
            icon: ClockCircleOutlined,
            color: "#5A5A8A",
        },
        {
            key: "rejected" as const,
            to: "/withdrawal-requests/rejected",
            label: "Rejetés",
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
