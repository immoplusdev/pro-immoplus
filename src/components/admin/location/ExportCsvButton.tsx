import { CsvExportButton } from "@/components/admin/common/CsvExportButton";
import { getLocationExport } from "@/hooks/useAdminLocation";
import {
  buildLocationCsv,
  fetchAllLocationExportItems,
  LOCATION_CSV_MAX_ROWS,
} from "@/lib/helpers/location-csv.helper";
import type { LocationExportFilters } from "@/types/location.types";

interface Props {
  filters: Omit<LocationExportFilters, "page" | "limit">;
  /** `total` déjà connu pour ces filtres (table courante) : bloque sans appel si > plafond. */
  knownTotal?: number;
  disabled?: boolean;
}

/** Export CSV des positions : pagine l'API (limit=500) jusqu'à `total`, plafonné à 10 000 lignes (20 appels max). */
export function ExportCsvButton({ filters, knownTotal, disabled }: Props) {
  return (
    <CsvExportButton
      fetchAll={({ signal, onProgress }) =>
        fetchAllLocationExportItems(filters, { fetchPage: getLocationExport, signal, onProgress })
      }
      toCsv={buildLocationCsv}
      filenamePrefix="localisation_export"
      maxRows={LOCATION_CSV_MAX_ROWS}
      knownTotal={knownTotal}
      tooLargeHint="réduisez la période ou ajoutez un filtre (rôle, ville)."
      disabled={disabled}
    />
  );
}
