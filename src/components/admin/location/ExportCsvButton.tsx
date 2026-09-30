import { useEffect, useRef, useState } from "react";
import { App, Button, Modal, Progress, Typography } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getLocationExport } from "@/hooks/useAdminLocation";
import { extractErrorMessage } from "@/lib/helpers";
import {
  buildLocationCsv,
  downloadCsv,
  fetchAllLocationExportItems,
  LOCATION_CSV_MAX_ROWS,
  LocationExportTooLargeError,
} from "@/lib/helpers/location-csv.helper";
import type { LocationExportFilters } from "@/types/location.types";

const { Text } = Typography;

interface Props {
  filters: Omit<LocationExportFilters, "page" | "limit">;
  /** `total` déjà connu pour ces filtres (table courante) : bloque sans appel si > plafond. */
  knownTotal?: number;
  disabled?: boolean;
}

const nf = new Intl.NumberFormat("fr-FR");

/** Export CSV côté client : pagine l'API (limit=500) jusqu'à `total`, plafonné à 10 000 lignes (20 appels max). */
export function ExportCsvButton({ filters, knownTotal, disabled }: Props) {
  const { message, modal } = App.useApp();
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const warnTooLarge = (total: number) =>
    modal.warning({
      title: "Export trop volumineux",
      content: `Ces filtres renvoient ${nf.format(total)} positions. L'export est limité à ${nf.format(
        LOCATION_CSV_MAX_ROWS
      )} lignes : réduisez la période ou ajoutez un filtre (rôle, ville).`,
    });

  const run = async () => {
    if (knownTotal !== undefined && knownTotal > LOCATION_CSV_MAX_ROWS) {
      warnTooLarge(knownTotal);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setProgress({ loaded: 0, total: knownTotal ?? 0 });
    try {
      const items = await fetchAllLocationExportItems(filters, {
        fetchPage: getLocationExport,
        signal: controller.signal,
        onProgress: (loaded, total) => setProgress({ loaded, total }),
      });
      if (controller.signal.aborted) return;
      if (items.length === 0) {
        message.info("Aucune position à exporter pour ces filtres.");
        return;
      }
      downloadCsv(buildLocationCsv(items), `localisation_export_${dayjs().format("YYYY-MM-DD_HHmm")}.csv`);
      message.success(`${nf.format(items.length)} position(s) exportée(s).`);
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err instanceof LocationExportTooLargeError) warnTooLarge(err.total);
      else message.error(extractErrorMessage(err, "Erreur lors de l'export. Réessayez."));
    } finally {
      abortRef.current = null;
      setProgress(null);
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    setProgress(null);
    message.info("Export annulé.");
  };

  const percent = progress && progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0;

  return (
    <>
      <Button icon={<DownloadOutlined />} onClick={run} loading={!!progress} disabled={disabled}>
        Exporter CSV
      </Button>
      <Modal
        open={!!progress}
        title="Export CSV en cours"
        closable={false}
        maskClosable={false}
        okButtonProps={{ style: { display: "none" } }}
        cancelText="Annuler"
        onCancel={cancel}
      >
        <Progress percent={percent} status="active" />
        <Text type="secondary">
          {progress && progress.total > 0
            ? `${nf.format(progress.loaded)} / ${nf.format(progress.total)} positions récupérées`
            : "Préparation…"}
        </Text>
      </Modal>
    </>
  );
}
