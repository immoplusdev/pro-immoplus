import React from "react";
import { ListDemandeProParticulierTable } from "./components/list-demande-pro-particulier-table";
import { DemandeProParticulierTabs } from "./components/demande-pro-particulier-tabs";

export const ListDemandeProParticulierApproved = () => {
    return (
        <>
            <DemandeProParticulierTabs activeMenu="approved" />
            <ListDemandeProParticulierTable
                activeMenu="approved"
                filters={{
                    permanent: [{ field: "status", operator: "eq", value: "approved" }],
                }}
            />
        </>
    );
};
