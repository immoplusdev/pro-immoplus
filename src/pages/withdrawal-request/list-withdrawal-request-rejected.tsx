import React from "react";
import { ListWithdrawalRequestTable } from "./list-withdrawal-request";

export const ListWithdrawalRequestRejected = () => {
    return (
        <ListWithdrawalRequestTable
            activeMenu="rejected"
            filters={{
                permanent: [{ field: "status", operator: "eq", value: "REJECTED" }],
            }}
        />
    );
};

export default ListWithdrawalRequestRejected;
