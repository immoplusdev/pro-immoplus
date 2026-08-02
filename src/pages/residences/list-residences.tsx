import React from "react";
import { ListResidenceTable, ResidenceTabs } from "@/pages/residences/components";


export const ListResidences = () => {
    return (
        <>
            <ResidenceTabs activeMenu={"all_e"} />
            <ListResidenceTable activeMenu={"all_e"}/>
        </>
    );
}
