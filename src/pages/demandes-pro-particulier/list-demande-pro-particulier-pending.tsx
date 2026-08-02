import React from "react";
import { ListDemandeProParticulierTable } from "./components/list-demande-pro-particulier-table";
import { DemandeProParticulierTabs } from "./components/demande-pro-particulier-tabs";

export const ListDemandeProParticulierPending = () => {
    return (
        <>
            <DemandeProParticulierTabs activeMenu="pending" />
            <ListDemandeProParticulierTable
                activeMenu="pending"
                filters={{
                    permanent: [{ field: "status", operator: "eq", value: "pending" }],
                }}
            />
        </>
    );
};
