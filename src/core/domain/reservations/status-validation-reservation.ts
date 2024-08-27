import {enumToList} from "@/lib/ts-utilities";
import {StatusValidationReservation} from "@/core/domain/reservations/reservation.model";

export const statusValidationReservation = enumToList(StatusValidationReservation);