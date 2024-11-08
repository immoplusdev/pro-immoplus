import {ListBienImmobilierTable} from "@/pages/biens-immobiliers/list-bien-immobilier-table";
import {StatusValidationBiensImmobilers} from "@/lib/ts-utilities/enums/status-biens-immobiliers";


export function ListBienImmobilierValide() {
    return (
        <ListBienImmobilierTable
            activeMenu={"valide"}
            filters={{
                permanent: [
                    {
                        field: "statusValidation",
                        operator: "eq",
                        value: StatusValidationBiensImmobilers.Valide
                    },
                ]
            }}
        />
    );
}