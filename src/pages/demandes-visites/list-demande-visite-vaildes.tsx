import {ListDemandeVisiteTable} from "@/pages/demandes-visites/components/list-demande-visite-table";
import {StatusDemandeVisite} from "@/core/domain/demande-visite/demande-visite.model";


export function ListDemandeVisitesValides() {
    return (
        <ListDemandeVisiteTable
            activeMenu={"valide"}
            filters={{
                permanent: [
                    {
                        field: "statusDemandeVisite",
                        operator: "eq",
                        value: StatusDemandeVisite.Valide
                    }
                ]
            }}
        />
    );
}

