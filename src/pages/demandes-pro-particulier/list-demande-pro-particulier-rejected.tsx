import React from "react";
import { ListDemandeProParticulierTable } from "./components/list-demande-pro-particulier-table";

export const ListDemandeProParticulierRejected = () => {
    return (
        <ListDemandeProParticulierTable
            activeMenu="rejected"
            filters={{
                permanent: [{ field: "status", operator: "eq", value: "rejected" }],
            }}
        />
    );
};
