import React from "react";
import { ListAlertsTable } from "./components/list-alerts-table";
import { AlertTabs } from "./components/alert-tabs";

export const ListAlertsPropositions = () => {
    return (
        <>
            <AlertTabs activeMenu="propositions" />
            <ListAlertsTable activeTab="propositions" />
        </>
    );
};
