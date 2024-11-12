import {ListReservationTable} from "@/pages/reservations/components/list-reservation-table";
import {StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";


export function ListReservationsValides() {
    return (
        <ListReservationTable
            activeMenu={"valide"}
            filters={{
                permanent: [
                    {
                        field: "statusReservation",
                        operator: "eq",
                        value: StatusReservation.Valide,
                    },
                ],
            }}
        />
    );
}