import { ReservationMergedTable } from "@/pages/reservations/components/reservation-merged-table";

/**
 * Onglet TOUTES
 * Appel A : sans filtre → backend retourne les réservations payées (valide, terminee, rejete)
 * Appel B : statusFacture=non_paye en 1er → override backend, retourne les non-payées
 */
export const ListReservations = () => {
  return (
    <ReservationMergedTable
      activeMenu="all_e"
      filtersA={[]}
      filtersB={[
        { field: "statusFacture", operator: "eq", value: "non_paye" },
      ]}
    />
  );
};
