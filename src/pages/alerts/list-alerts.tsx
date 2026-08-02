import React from "react";
import { ListAlertsTable } from "./components/list-alerts-table";
import { AlertTabs } from "./components/alert-tabs";

export const ListAlerts = () => {
    return (
        <>
            <AlertTabs activeMenu="toutes" />
            <ListAlertsTable activeTab="toutes" />
        </>
    );
};
