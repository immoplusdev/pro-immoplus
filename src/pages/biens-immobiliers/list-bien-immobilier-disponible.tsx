import {ListBienImmobilierTable} from "@/pages/biens-immobiliers/list-bien-immobilier-table";


export function ListBienImmobilierDisponible(){
    return(
        <ListBienImmobilierTable
            activeMenu={"disponible"}
            filters={
                {
                    permanent: [
                        {
                            field: "bienImmobilierDisponible",
                            operator: "eq",
                            value: true
                        },
                    ]
                }
            }
        />
    );
}