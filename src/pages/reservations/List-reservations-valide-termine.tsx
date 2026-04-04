import { ListReservationTable } from "@/pages/reservations/components/list-reservation-table";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";

/**
 * Onglet VALIDÉ / TERMINÉ
 * statusReservation in [valide, terminee]
 * Les deux ont statusFacture=paye → filtre backend par défaut suffisant
 */
export function ListReservationsValideTermine() {
  return (
    <ListReservationTable
      activeMenu="valide_termine"
      filters={{
        permanent: [
          {
            field: "statusReservation",
            operator: "in",
            value: [StatusReservation.Valide, StatusReservation.Terminee],
          },
        ],
      }}
    />
  );
}
