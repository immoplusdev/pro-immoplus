import React from "react";
import {ListUsersTable} from "@/pages/users/components/list-users-table";
import {UserRole} from "@/core/domain/users";


export const ListUsersCustomers = () => {
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
