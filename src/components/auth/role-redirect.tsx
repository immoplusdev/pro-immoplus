import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { getDefaultRedirect } from "@/configs/role-permissions.config";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";

const localStorageProvider = getLocalStorageProvider();

export const RoleBasedRedirect: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const authData = localStorageProvider.getAuthData();
        const role = authData?.role;

        if (role) {
            const defaultRoute = getDefaultRedirect(role);
            navigate(defaultRoute, { replace: true });
        } else {
            // Fallback to demandes-visites for admin
            navigate("/demandes-visites", { replace: true });
        }
    }, [navigate]);

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh"
        }}>
            <Spin size="large" />
        </div>
    );
};
