import {ListBienImmobilierTable} from "@/pages/biens-immobiliers/list-bien-immobilier-table";
import {StatusValidationBiensImmobilers} from "@/lib/ts-utilities/enums/status-biens-immobiliers";


export function ListBienImmobilierEnValidation(){
    return(
        <ListBienImmobilierTable
            activeMenu={"en_validation"}
            filters={{
                permanent: [
                    {
                        field: "statusValidation",
                        operator: "eq",
                        value: StatusValidationBiensImmobilers.EnAttenteValidation
                    },
                ]
            }}
        />
    )

}