import React from "react";
import {ListUsersTable} from "./components/list-users-table";
import {StatisticsUtilisateurs} from "./statistics-utilisateurs";

export const ListUsers = () => {
    return (
        <>
            <StatisticsUtilisateurs />
            <ListUsersTable activeMenu={'all_e'}/>
        </>
    );
};
