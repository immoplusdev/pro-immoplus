import React from "react";
import { useMenu, useGetIdentity } from "@refinedev/core";
import { ThemedSiderV2 } from "@refinedev/antd";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import { getAllowedResources } from "@/configs/role-permissions.config";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";

const localStorageProvider = getLocalStorageProvider();

interface CustomSiderProps {
    fixed?: boolean;
}

export const CustomSider: React.FC<CustomSiderProps> = (props) => {
    const { menuItems, selectedKey } = useMenu();
    const { data: identity } = useGetIdentity<{ role?: { id: string } }>();

    // Get role from localStorage (more reliable during initial render)
    const authData = localStorageProvider.getAuthData();
    const role = authData?.role || identity?.role?.id;

    // Get allowed resources for this role
    const allowedResources = role ? getAllowedResources(role) : [];

    // Filter menu items based on role permissions
    const filteredMenuItems = menuItems.filter((item) => {
        if (!role) return false;
        return allowedResources.includes(item.name);
    });

    return (
        <ThemedSiderV2
            {...props}
            render={({ items, logout, collapsed }) => {
                return (
                    <>
                        <Menu
                            selectedKeys={selectedKey ? [selectedKey] : []}
                            mode="inline"
                            style={{
                                marginTop: "8px",
                                border: "none",
                            }}
                        >
                            {filteredMenuItems.map((item) => {
                                const isSelected = item.key === selectedKey;
                                return (
                                    <Menu.Item
                                        key={item.key}
                                        icon={item.icon}
                                        style={{
                                            fontWeight: isSelected ? 700 : 400,
                                        }}
                                    >
                                        <Link to={item.route ?? "/"}>
                                            {item.label}
                                        </Link>
                                    </Menu.Item>
                                );
                            })}
                        </Menu>
                        {logout}
                    </>
                );
            }}
        />
    );
};
