import React from "react";
import { ListDemandeProParticulierTable } from "./components/list-demande-pro-particulier-table";

export const ListDemandeProParticulierPending = () => {
    return (
        <ListDemandeProParticulierTable
            activeMenu="pending"
            filters={{
                permanent: [{ field: "status", operator: "eq", value: "pending" }],
            }}
        />
    );
};
