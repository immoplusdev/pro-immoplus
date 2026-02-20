import React from "react";

import {UserRole} from "@/core/domain/users";
import {ListUsersTable} from "./components/list-users-table";


export const ListFinanciers = () => {
    return (
        <ListUsersTable activeMenu={"financier"}
                        filters={{
                            permanent: [
                                {
                                    field: "role",
                                    operator: "eq",
                                    value: UserRole.Financier
                                },
                            ]
                        }}
        />
    );
}
