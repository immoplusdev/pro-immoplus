import {ListUsersTable} from "./components/list-users-table";


export const ListNoneValidUsers = () => {
    return (<ListUsersTable activeMenu={"utilisateurs_non_valides"}
                            filters={{
                                permanent: [
                                    {
                                        field: "compteProValide",
                                        operator: "eq",
                                        value: false
                                    },
                                ]
                            }}
    />)
}
