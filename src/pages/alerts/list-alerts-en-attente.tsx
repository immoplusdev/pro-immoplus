import React from "react";
import { ListAlertsTable } from "./components/list-alerts-table";
import { AlertTabs } from "./components/alert-tabs";

export const ListAlertsEnAttente = () => {
    return (
        <>
            <AlertTabs activeMenu="en_attente" />
            <ListAlertsTable activeTab="en_attente" />
        </>
    );
};
