import React from "react";
import { ListWithdrawalRequestTable } from "./list-withdrawal-request";

export const ListWithdrawalRequestProcessing = () => {
    return (
        <ListWithdrawalRequestTable
            activeMenu="processing"
            filters={{
                permanent: [{ field: "status", operator: "eq", value: "PROCESSING" }],
            }}
        />
    );
};

export default ListWithdrawalRequestProcessing;
