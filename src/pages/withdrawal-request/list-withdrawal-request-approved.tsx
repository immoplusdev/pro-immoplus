import React from "react";
import { ListWithdrawalRequestTable } from "./list-withdrawal-request";

export const ListWithdrawalRequestApproved = () => {
    return (
        <ListWithdrawalRequestTable
            activeMenu="approved"
            filters={{
                permanent: [{ field: "status", operator: "eq", value: "APPROVED" }],
            }}
        />
    );
};

export default ListWithdrawalRequestApproved;
