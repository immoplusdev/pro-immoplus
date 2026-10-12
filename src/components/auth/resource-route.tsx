import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button, Result } from "antd";
import { canAccessResource } from "@/configs/role-permissions.config";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";

const localStorageProvider = getLocalStorageProvider();

/**
 * Guard de route aligné sur les permissions du menu (`role-permissions.config.ts`) :
 * n'affiche les routes enfants que si le rôle connecté a accès à `resource`.
 * Le back reste la vraie barrière (403 sinon).
 */
export const ResourceRoute: React.FC<{ resource: string }> = ({ resource }) => {
    const navigate = useNavigate();
    const role: string | undefined = localStorageProvider.getAuthData()?.role;

    if (!role || !canAccessResource(role, resource)) {
        return (
            <Result
                status="403"
                title="Accès refusé"
                subTitle="Vous n'avez pas les droits nécessaires pour consulter cette page."
                extra={<Button type="primary" onClick={() => navigate("/", { replace: true })}>Retour</Button>}
            />
        );
    }

    return <Outlet />;
};
