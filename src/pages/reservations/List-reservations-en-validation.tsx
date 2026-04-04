import { ListReservationTable } from "@/pages/reservations/components/list-reservation-table";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";

/**
 * Onglet EN VALIDATION
 *
 * permanent[0] = statusFacture=non_paye  → écrase le filtre backend (paye forcé)
 * initial[0]   = statusReservation in [en_attente_*] → NON permanent, remplaçable
 *                par les sous-filtres via setFilters sans conflit d'ordre dans _where
 */

const EN_VALIDATION_STATUSES = [
  StatusReservation.EnAttenteReponseProprietaire,
  StatusReservation.EnAttentePaiementClient,
];

export function ListReservationsEnValidation() {
  return (
    <ListReservationTable
      activeMenu="en_validation"
      filters={{
        permanent: [
          { field: "statusFacture", operator: "eq", value: "non_paye" },
        ],
        initial: [
          { field: "statusReservation", operator: "in", value: EN_VALIDATION_STATUSES },
        ],
      }}
      defaultNonPermanentFilters={[
        { field: "statusReservation", operator: "in", value: EN_VALIDATION_STATUSES },
      ]}
    />
  );
}
