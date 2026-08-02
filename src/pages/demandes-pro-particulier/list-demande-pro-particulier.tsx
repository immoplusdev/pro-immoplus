import React from "react";
import { ListDemandeProParticulierTable } from "./components/list-demande-pro-particulier-table";
import { DemandeProParticulierTabs } from "./components/demande-pro-particulier-tabs";

export const ListDemandeProParticulier = () => {
    return (
        <>
            <DemandeProParticulierTabs activeMenu="all" />
            <ListDemandeProParticulierTable activeMenu="all" />
        </>
    );
};
