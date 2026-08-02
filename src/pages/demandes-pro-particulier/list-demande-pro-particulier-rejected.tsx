import React from "react";
import { ListDemandeProParticulierTable } from "./components/list-demande-pro-particulier-table";
import { DemandeProParticulierTabs } from "./components/demande-pro-particulier-tabs";

export const ListDemandeProParticulierRejected = () => {
    return (
        <>
            <DemandeProParticulierTabs activeMenu="rejected" />
            <ListDemandeProParticulierTable
                activeMenu="rejected"
                filters={{
                    permanent: [{ field: "status", operator: "eq", value: "rejected" }],
                }}
            />
        </>
    );
};
