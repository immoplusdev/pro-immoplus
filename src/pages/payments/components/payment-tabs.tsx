import React from "react";
import { useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { DollarOutlined, FileTextOutlined, SwapOutlined } from "@ant-design/icons";

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

type ActiveMenu = "all_e" | "factures" | "retraits";

interface Props {
    activeMenu?: ActiveMenu;
}

export function PaymentTabs({ activeMenu }: Props) {
    const translate = useTranslate();

    const tabs = [
        {
            key: "all_e" as const,
            to: "/payments",
            label: "Tous",
            icon: DollarOutlined,
            color: TEXT_SECONDARY,
        },
        {
            key: "factures" as const,
            to: "/payments/factures",
            label: "Factures",
            icon: FileTextOutlined,
            color: "#1F8A5B",
        },
        {
            key: "retraits" as const,
            to: "/payments/retraits",
            label: "Retraits",
            icon: SwapOutlined,
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
