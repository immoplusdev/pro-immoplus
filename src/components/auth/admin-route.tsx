import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button, Result } from "antd";
import { isAdminViewer } from "./is-admin-viewer";

/**
 * Guard de route : n'affiche les routes enfants qu'au rôle Admin.
 * Le masquage du menu ne suffit pas, l'URL reste saisissable à la main.
 * (Le back reste la vraie barrière : il renvoie 403 hors Admin.)
 */
export const AdminRoute: React.FC = () => {
    const navigate = useNavigate();

    if (!isAdminViewer()) {
        return (
            <Result
                status="403"
                title="Accès refusé"
                subTitle="Accès réservé aux administrateurs."
                extra={<Button type="primary" onClick={() => navigate("/", { replace: true })}>Retour</Button>}
            />
        );
    }

    return <Outlet />;
};
