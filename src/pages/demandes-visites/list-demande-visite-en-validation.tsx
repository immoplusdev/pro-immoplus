import {ListDemandeVisiteTable} from "@/pages/demandes-visites/components/list-demande-visite-table";
import {StatusDemandeVisite} from "@/core/domain/demande-visite/demande-visite.model";


export function ListDemandeVisiteEnValidation() {
    return (
        <ListDemandeVisiteTable
            activeMenu={"en_validation"}
            filters={{
                permanent: [
                    {
                        field: "statusDemandeVisite",
                        operator: "eq",
                        value: StatusDemandeVisite.EnCoursValidationUser,
                    }
                ]

            }}
        />
    )
}