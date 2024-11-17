import React from "react";
import {ListUsersTable} from "./components/list-users-table";
import {UserRole} from "@/core/domain/users";


export const ListProEntreprise = () => {
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
