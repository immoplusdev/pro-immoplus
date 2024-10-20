import {ListUsersTable} from "@/pages/users/components/list-users-table";
import {StatusValidationResidence} from "@/core/domain/residences";



export const ListUsersValides = () => {
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