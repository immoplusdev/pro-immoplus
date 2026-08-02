import React from "react";
import { ListTransfers } from "./list-transfers";

export const ListTransfersSuccessful = () => {
    return (
        <ListTransfers
            activeMenu="successful"
            filters={{
                permanent: [{ field: "transfetStatus", operator: "eq", value: "successful" }],
            }}
        />
    );
};

export default ListTransfersSuccessful;
