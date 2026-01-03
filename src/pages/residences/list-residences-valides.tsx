import {ListResidenceTable} from "@/pages/residences/components";
import {StatusValidationResidence} from "@/core/domain/residences";
import React from "react";

export const ListResidencesValides = () => {
    return (
        <ListResidenceTable activeMenu={"valide"}
                            filters={{
                                permanent: [
                                    {
                                        field: "statusValidation",
                                        operator: "eq",
                                        value: StatusValidationResidence.Valide
                                    },
                                ]
                            }}
        />
    );


}