import {ListResidenceTable} from "@/pages/residences/components";
import {StatusValidationResidence} from "@/core/domain/residences";
import React from "react";

export const ListResidencesRejetees = () => {
    return (
        <ListResidenceTable activeMenu={"rejete"}
                            filters={{
                                permanent: [
                                    {
                                        field: "statusValidation",
                                        operator: "eq",
                                        value: StatusValidationResidence.Rejete
                                    },
                                ]
                            }}
        />
    );
}
