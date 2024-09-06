import {ListUsersTable} from "@/pages/users/components/list-users-table";


export const ListUsersNonValides = () => {
    return (<ListUsersTable activeMenu={"utilisateurs_non_valides"}
                            filters={{
                                permanent: [
                                    {
                                        field: "compteProValide",
                                        operator: "ne",
                                        value: "true"
                                    },
                                ]
                            }}
    />)
}