import { ListReservationTable } from "@/pages/reservations/components/list-reservation-table";
import { StatusReservation } from "@/lib/ts-utilities/enums/status-reservation";

/**
 * Onglet ÉCHOUÉ / ANNULÉ — 1 seul appel
 *
 * permanent[0] = statusFacture=non_paye  → écrase le filtre backend (paye forcé)
 * initial[0]   = statusReservation in [annulés/timeout] → NON permanent, remplaçable
 *                par les sous-filtres via setFilters sans conflit d'ordre dans _where
 *
 * Pourquoi initial et non permanent pour statusReservation ?
 * mapToTypeormWhere garde value[0] → si permanent, il gagne sur le sous-filtre.
 * En initial (non-permanent), setFilters("replace") peut l'écraser proprement.
 */

const ECHOUE_STATUSES = [
  StatusReservation.ProprietaireAnnuleReservation,
  StatusReservation.clientAnnuleReservation,
  StatusReservation.ProprietaireSansReponse,
  StatusReservation.ClientSansReponse,
];

export function ListReservationsEchoueAnnule() {
  return (
    <ListReservationTable
      activeMenu="echoue_annule"
      defaultSortField="updatedAt"
      filters={{
        permanent: [
          { field: "statusFacture", operator: "eq", value: "non_paye" },
        ],
        initial: [
          { field: "statusReservation", operator: "in", value: ECHOUE_STATUSES },
        ],
      }}
      defaultNonPermanentFilters={[
        { field: "statusReservation", operator: "in", value: ECHOUE_STATUSES },
      ]}
    />
  );
}
