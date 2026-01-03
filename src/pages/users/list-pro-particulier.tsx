import {ListUsersTable} from "./components/list-users-table";
import {UserRole} from "@/core/domain/users";

export const ListProParticulier = () => {
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
