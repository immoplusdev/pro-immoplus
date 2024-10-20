

import {ListUsersTable} from "@/pages/users/components/list-users-table";
import {UserRole} from "@/core/domain/users";



export const ListUsersProParticulier = () => {
    return (
      <ListUsersTable activeMenu={"pro_particulier"}
                filters={{
                    permanent: [
                        {
                            field: "role",
                            operator: "eq",
                            value: UserRole.ProParticulier
                        },
                    ]
                }}
      />
);


}
