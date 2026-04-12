import React from "react";
import { useMenu, useGetIdentity, useLogout } from "@refinedev/core";
import { useThemedLayoutContext } from "@refinedev/antd";
import { Layout, Menu, Button } from "antd";
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { AppIcon } from "@/components/app-icon";
import { getAllowedResources } from "@/configs/role-permissions.config";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";

const localStorageProvider = getLocalStorageProvider();

interface CustomSiderProps {
    fixed?: boolean;
}

export const CustomSider: React.FC<CustomSiderProps> = ({ fixed }) => {
    const { menuItems, selectedKey } = useMenu();
    const { data: identity } = useGetIdentity<{ role?: { id: string } }>();
    const { siderCollapsed, setSiderCollapsed } = useThemedLayoutContext();
    const { mutate: logout } = useLogout();

    const authData = localStorageProvider.getAuthData();
    const role = authData?.role || identity?.role?.id;
    const allowedResources = role ? getAllowedResources(role) : [];

    const filteredMenuItems = menuItems.filter((item) => {
        if (!role) return false;
        return allowedResources.includes(item.name);
    });

    const menuItemsConfig = filteredMenuItems.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: <Link to={item.route ?? "/"}>{item.label}</Link>,
        style: { fontWeight: item.key === selectedKey ? 700 : 400 },
    }));

    return (
        <Layout.Sider
            collapsible
            collapsed={siderCollapsed}
            onCollapse={setSiderCollapsed}
            trigger={null}
            width={200}
            style={{
                ...(fixed ? { position: "sticky", top: 0, height: "100vh", overflow: "auto" } : {}),
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "12px 8px",
                    minHeight: 64,
                }}
            >
                <AppIcon />
            </div>

            <Menu
                theme="dark"
                selectedKeys={selectedKey ? [selectedKey] : []}
                mode="inline"
                style={{ flex: 1, border: "none" }}
                items={menuItemsConfig}
            />

            <div style={{ padding: "8px" }}>
                <Button
                    type="text"
                    icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setSiderCollapsed(!siderCollapsed)}
                    style={{ width: "100%", color: "rgba(255,255,255,0.65)" }}
                />
                <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={() => logout()}
                    style={{ width: "100%", color: "rgba(255,255,255,0.65)" }}
                >
                    {!siderCollapsed && "Déconnexion"}
                </Button>
            </div>
        </Layout.Sider>
    );
};
