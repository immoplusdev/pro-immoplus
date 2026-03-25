import React from "react";
import { ListDemandeProParticulierTable } from "./components/list-demande-pro-particulier-table";

export const ListDemandeProParticulierApproved = () => {
    return (
        <ListDemandeProParticulierTable
            activeMenu="approved"
            filters={{
                permanent: [{ field: "status", operator: "eq", value: "approved" }],
            }}
        />
    );
};
