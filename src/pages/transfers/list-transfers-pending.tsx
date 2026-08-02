import React from "react";
import { ListTransfers } from "./list-transfers";

export const ListTransfersPending = () => {
    return (
        <ListTransfers
            activeMenu="pending"
            filters={{
                permanent: [{ field: "transfetStatus", operator: "eq", value: "pending" }],
            }}
        />
    );
};

export default ListTransfersPending;
