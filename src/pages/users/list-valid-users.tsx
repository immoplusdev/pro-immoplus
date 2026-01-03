import {ListUsersTable} from "./components/list-users-table";

export const ListValidUsers = () => {
    return (
        <ListUsersTable activeMenu={"utilisateurs_valides"}
                        filters={{
                            permanent: [
                                {
                                    field: "compteProValide",
                                    operator: "eq",
                                    value: true
                                },
                            ]
                        }}
        />
    )
}
