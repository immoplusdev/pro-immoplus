import React from "react";
import { ListResidenceTable, ResidencesParStatutValidation } from "@/pages/residences/components";


export const ListResidences = () => {
    return (
        <>
            <ResidencesParStatutValidation />
            <ListResidenceTable activeMenu={"all_e"}/>
        </>
    );
}
