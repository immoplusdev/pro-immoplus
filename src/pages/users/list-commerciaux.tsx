import React from "react";

import {UserRole} from "@/core/domain/users";
import {ListUsersTable} from "./components/list-users-table";


export const ListCommerciaux = () => {
    return (
        <ListUsersTable activeMenu={"commercial"}
                        filters={{
                            permanent: [
                                {
                                    field: "role",
                                    operator: "eq",
                                    value: UserRole.Commercial
                                },
                            ]
                        }}
        />
    );
}
