import React from "react";
import {ListResidenceTable} from "@/pages/residences/components";
import {StatusValidationResidence} from "@/core/domain/residences";


export const ListResidencesEnValidation = () => {
    return (
        <ListResidenceTable activeMenu={"en_validation"}
                            filters={{
                                permanent: [
                                    {
                                        field: "statusValidation",
                                        operator: "eq",
                                        value: StatusValidationResidence.EnAttenteValidation.toString(),
                                    },
                                ]
                            }}
        />
    );
}
