import React from "react";
import { ApplyResidenceReduction, ListResidenceTable } from "@/pages/residences/components";

export const ListResidencesReduction = () => {
    return (
        <>
            <ApplyResidenceReduction />
            <ListResidenceTable
                activeMenu="reduction"
                filters={{
                    permanent: [
                        {
                            field: "reduction",
                            operator: "gt",
                            value: 0,
                        },
                    ],
                }}
            />
        </>
    );
};
