import {ListReservationTable} from "@/pages/reservations/components/list-reservation-table";
import {StatusReservation} from "@/lib/ts-utilities/enums/status-reservation";


export function ListReservationsEnValidation () {
    return(
       <ListReservationTable
           activeMenu={"en_validation"}
           filters={
               {
                   permanent: [
                       {
                           field: "statusReservation",
                           operator: "eq",
                           value: StatusReservation.EnCoursValidationAdmin || StatusReservation.EnCoursValidationUser
                       }
                   ]
               }
           }
       />
    )
}