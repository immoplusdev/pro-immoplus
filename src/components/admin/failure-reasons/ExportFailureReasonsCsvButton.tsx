import { CsvExportButton } from "@/components/admin/common/CsvExportButton";
import {
  FAILURE_REASONS_CSV_MAX_ROWS,
  getAllFailureReasons,
  type FailureReasonsQueryFilters,
} from "@/hooks/useFailureReasons";
import { buildFailureReasonsCsv } from "@/lib/helpers/failure-reasons.helper";

interface Props {
  filters: FailureReasonsQueryFilters;
  /** `total` connu pour ces filtres (table courante) : bloque sans appel au-delà du plafond. */
  knownTotal?: number;
  disabled?: boolean;
}

/** Export CSV des motifs d'échec : limit=500, 10 000 lignes au maximum (20 appels). */
export function ExportFailureReasonsCsvButton({ filters, knownTotal, disabled }: Props) {
  return (
    <CsvExportButton
      fetchAll={({ signal, onProgress }) =>
        getAllFailureReasons(filters, { maxRows: FAILURE_REASONS_CSV_MAX_ROWS, signal, onProgress })
      }
      toCsv={buildFailureReasonsCsv}
      filenamePrefix="motifs_echec_reservations"
      maxRows={FAILURE_REASONS_CSV_MAX_ROWS}
      knownTotal={knownTotal}
      tooLargeHint="réduisez la période ou ajoutez un filtre (acteur, statut, motif)."
      disabled={disabled}
    />
  );
}
