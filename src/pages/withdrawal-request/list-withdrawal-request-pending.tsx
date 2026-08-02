import React from "react";
import { ListWithdrawalRequestTable } from "./list-withdrawal-request";

export const ListWithdrawalRequestPending = () => {
    return (
        <ListWithdrawalRequestTable
            activeMenu="pending"
            filters={{
                permanent: [{ field: "status", operator: "eq", value: "PENDING" }],
            }}
        />
    );
};

export default ListWithdrawalRequestPending;
