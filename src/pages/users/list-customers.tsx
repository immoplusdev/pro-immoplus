import React from "react";

import {UserRole} from "@/core/domain/users";
import {ListUsersTable} from "./components/list-users-table";


export const ListCustomers = () => {
    return (
        <ListUsersTable activeMenu={"customer"}
                        filters={{
                            permanent: [
                                {
                                    field: "role",
                                    operator: "eq",
                                    value: UserRole.Customer
                                },
                            ]
                        }}
        />
    );
}
