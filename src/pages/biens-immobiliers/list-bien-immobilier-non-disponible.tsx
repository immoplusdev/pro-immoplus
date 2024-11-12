import {ListBienImmobilierTable} from "@/pages/biens-immobiliers/list-bien-immobilier-table";
import {StatusValidationBiensImmobilers} from "@/lib/ts-utilities/enums/status-biens-immobiliers";


export function ListBienImmobilierNonDisponible(){
    return(
        <ListBienImmobilierTable
            activeMenu={"non_disponible"}
            filters={{
                permanent: [
                    {
                        field: "bienImmobilierDisponible",
                        operator: "eq",
                        value: false
                    },
                ]
            }}
        />
    )
}