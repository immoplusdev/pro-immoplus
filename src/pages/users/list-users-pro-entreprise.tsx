import React from "react";
import {ListUsersTable} from "@/pages/users/components/list-users-table";
import {UserRole} from "@/core/domain/users";


export const ListUsersProEntreprise = () => {
    return (
        <ListUsersTable activeMenu={"pro_entreprise"}
                            filters={{
                                permanent: [
                                    {
                                        field: "role",
                                        operator: "eq",
                                        value: UserRole.ProEntreprise
                                    },
                                ]
                            }}
        />
    );


}
