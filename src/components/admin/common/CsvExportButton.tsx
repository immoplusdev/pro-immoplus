import { useEffect, useRef, useState } from "react";
import { App, Button, Modal, Progress, Typography } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { extractErrorMessage } from "@/lib/helpers";
import { downloadCsv, ExportTooLargeError } from "@/lib/helpers/csv.helper";

const { Text } = Typography;
const nf = new Intl.NumberFormat("fr-FR");

interface Props<T> {
  /** Récupère toutes les lignes (pagination), en signalant la progression ; doit respecter `signal`. */
  fetchAll: (options: { signal: AbortSignal; onProgress: (loaded: number, total: number) => void }) => Promise<T[]>;
  toCsv: (items: T[]) => string;
  /** Préfixe du fichier, suffixé par la date/heure. */
  filenamePrefix: string;
  maxRows: number;
  /** `total` déjà connu pour ces filtres : bloque sans appel s'il dépasse `maxRows`. */
  knownTotal?: number;
  /** Conseil affiché quand l'export est trop volumineux. */
  tooLargeHint: string;
  disabled?: boolean;
}

/** Export CSV côté client avec progression, annulation et plafond de lignes. */
export function CsvExportButton<T>({
  fetchAll,
  toCsv,
  filenamePrefix,
  maxRows,
  knownTotal,
  tooLargeHint,
  disabled,
}: Props<T>) {
  const { message, modal } = App.useApp();
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const warnTooLarge = (total: number) =>
    modal.warning({
      title: "Export trop volumineux",
      content: `Ces filtres renvoient ${nf.format(total)} lignes. L'export est limité à ${nf.format(
        maxRows
      )} lignes : ${tooLargeHint}`,
    });

  const run = async () => {
    if (knownTotal !== undefined && knownTotal > maxRows) {
      warnTooLarge(knownTotal);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setProgress({ loaded: 0, total: knownTotal ?? 0 });
    try {
      const items = await fetchAll({
        signal: controller.signal,
        onProgress: (loaded, total) => setProgress({ loaded, total }),
      });
      if (controller.signal.aborted) return;
      if (items.length === 0) {
        message.info("Aucune ligne à exporter pour ces filtres.");
        return;
      }
      downloadCsv(toCsv(items), `${filenamePrefix}_${dayjs().format("YYYY-MM-DD_HHmm")}.csv`);
      message.success(`${nf.format(items.length)} ligne(s) exportée(s).`);
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err instanceof ExportTooLargeError) warnTooLarge(err.total);
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
            ? `${nf.format(progress.loaded)} / ${nf.format(progress.total)} lignes récupérées`
            : "Préparation…"}
        </Text>
      </Modal>
    </>
  );
}
