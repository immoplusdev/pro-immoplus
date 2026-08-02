import React from "react";
import { ListAlertsTable } from "./components/list-alerts-table";
import { AlertTabs } from "./components/alert-tabs";

export const ListAlertsCloturees = () => {
    return (
        <>
            <AlertTabs activeMenu="cloturees" />
            <ListAlertsTable activeTab="cloturees" />
        </>
    );
};
