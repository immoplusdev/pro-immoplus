import React from "react";
import { ListTransfers } from "./list-transfers";

export const ListTransfersFailed = () => {
    return (
        <ListTransfers
            activeMenu="failed"
            filters={{
                permanent: [{ field: "transfetStatus", operator: "eq", value: "failed" }],
            }}
        />
    );
};

export default ListTransfersFailed;
