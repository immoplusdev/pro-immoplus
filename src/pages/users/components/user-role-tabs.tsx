import React from "react";
import { useCustom, useApiUrl, useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import {
    TeamOutlined,
    UserOutlined,
    SafetyOutlined,
    ShopOutlined,
    HomeOutlined,
    BankOutlined,
    BarChartOutlined,
} from "@ant-design/icons";

interface UtilisateursData {
    total: number;
    parRole: {
        customer: number;
        admin: number;
        proEntreprise: number;
        proParticulier: number;
        financier: number;
        commercial: number;
    };
}

const BORDER_COLOR = "#E5E3DC";
const TEXT_SECONDARY = "#5F5E5A";

type ActiveMenu =
    | "all_e"
    | "admin"
    | "pro_entreprise"
    | "pro_particulier"
    | "utilisateurs_valides"
    | "utilisateurs_non_valides"
    | "customer"
    | "financier"
    | "commercial";

interface Props {
    activeMenu?: ActiveMenu;
}

export function UserRoleTabs({ activeMenu }: Props) {
    const apiUrl = useApiUrl();
    const translate = useTranslate();

    const { data } = useCustom<{ data: UtilisateursData }>({
        url: `${apiUrl}/v1/statistics/utilisateurs`,
        method: "get",
    });

    const stats = data?.data as unknown as UtilisateursData | undefined;

    const tabs = [
        {
            key: "all_e",
            to: "/users",
            label: translate("tags.all_e"),
            value: stats?.total ?? 0,
            icon: TeamOutlined,
            color: TEXT_SECONDARY,
        },
        {
            key: "customer",
            to: "/users/customer",
            label: translate("users.tags.roles.customer"),
            value: stats?.parRole?.customer ?? 0,
            icon: UserOutlined,
            color: "#3B6D11",
        },
        {
            key: "admin",
            to: "/users/admin",
            label: translate("users.tags.roles.admin"),
            value: stats?.parRole?.admin ?? 0,
            icon: SafetyOutlined,
            color: "#A32D2D",
        },
        {
            key: "pro_entreprise",
            to: "/users/pro-entreprise",
            label: translate("users.tags.roles.pro_entreprise"),
            value: stats?.parRole?.proEntreprise ?? 0,
            icon: ShopOutlined,
            color: "#185FA5",
        },
        {
            key: "pro_particulier",
            to: "/users/pro-particulier",
            label: translate("users.tags.roles.pro_particulier"),
            value: stats?.parRole?.proParticulier ?? 0,
            icon: HomeOutlined,
            color: "#854F0B",
        },
        {
            key: "financier",
            to: "/users/financier",
            label: translate("users.tags.roles.financier"),
            value: stats?.parRole?.financier ?? 0,
            icon: BankOutlined,
            color: "#534AB7",
        },
        {
            key: "commercial",
            to: "/users/commercial",
            label: translate("users.tags.roles.commercial"),
            value: stats?.parRole?.commercial ?? 0,
            icon: BarChartOutlined,
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
