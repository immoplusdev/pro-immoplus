import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Segmented, Space, Typography } from "antd";
import { ArrowLeftOutlined, BarChartOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useFailureReasons } from "@/hooks/useFailureReasons";
import { useUrlFilters } from "@/components/admin/common/useUrlFilters";
import { ApiErrorAlert } from "@/components/admin/common/ApiErrorAlert";
import { FailureReasonsFilters } from "@/components/admin/failure-reasons/FailureReasonsFilters";
import { FailureReasonsTable, type FailureReasonRow } from "@/components/admin/failure-reasons/FailureReasonsTable";
import { FailureReasonsStats } from "@/components/admin/failure-reasons/FailureReasonsStats";
import { ExportFailureReasonsCsvButton } from "@/components/admin/failure-reasons/ExportFailureReasonsCsvButton";
import { sanitizeFailureFilters, type FailureFilterValues } from "@/lib/helpers/failure-reasons.helper";

const { Title, Text } = Typography;

const PAGE_SIZES = [20, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 20;
type View = "list" | "stats";

const URL_KEYS = ["actor", "status", "reasonCode", "dateDebut", "dateFin", "limit", "view"] as const;

/** Motifs d'échec des réservations (Admin / Commercial — route protégée par ResourceRoute "reservations"). */
export function ListMotifsEchec() {
  const navigate = useNavigate();
  const { values, update, page } = useUrlFilters(URL_KEYS);

  // URL assainie : une URL bricolée ne produit ni requête invalide ni combinaison incohérente.
  const applied = useMemo<FailureFilterValues>(
    () =>
      sanitizeFailureFilters({
        actor: values.actor,
        status: values.status,
        reasonCode: values.reasonCode,
        dateDebut: values.dateDebut,
        dateFin: values.dateFin,
      }),
    [values.actor, values.status, values.reasonCode, values.dateDebut, values.dateFin]
  );

  const limitParam = Number(values.limit);
  const limit = (PAGE_SIZES as readonly number[]).includes(limitParam) ? limitParam : DEFAULT_PAGE_SIZE;
  const view: View = values.view === "stats" ? "stats" : "list";

  const { data, isInitialLoading, isFetching, isError, error, refetch } = useFailureReasons(
    { ...applied, page, limit },
    view === "list"
  );

  const rows = useMemo<FailureReasonRow[]>(
    () =>
      (data?.items ?? []).map((item, i) => ({
        ...item,
        key: `${data?.page ?? page}-${i}-${item.reservationId ?? ""}-${item.respondedAt}`,
      })),
    [data, page]
  );

  const onSearch = (next: FailureFilterValues) =>
    update({
      actor: next.actor,
      status: next.status,
      reasonCode: next.reasonCode,
      dateDebut: next.dateDebut,
      dateFin: next.dateFin,
    });

  // Réinitialise filtres, taille de page et pagination, en gardant la vue courante.
  const onReset = () =>
    update({
      actor: undefined,
      status: undefined,
      reasonCode: undefined,
      dateDebut: undefined,
      dateFin: undefined,
      limit: undefined,
    });

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap align="start">
        <div>
          <Space>
            <Button type="text" icon={<ArrowLeftOutlined />} aria-label="Retour" onClick={() => navigate("/reservations/echoue-annule")} />
            <Title level={4} style={{ margin: 0 }}>
              Motifs d'échec des réservations
            </Title>
          </Space>
          <div>
            <Text type="secondary">
              Réponses des clients et des pros après une annulation ou une absence de réponse.
            </Text>
          </div>
        </div>
        <Space wrap>
          <Segmented<View>
            aria-label="Affichage"
            value={view}
            onChange={(v) => update({ view: v === "stats" ? "stats" : undefined, page: String(page) })}
            options={[
              { value: "list", label: "Liste", icon: <UnorderedListOutlined /> },
              { value: "stats", label: "Statistiques", icon: <BarChartOutlined /> },
            ]}
          />
          <ExportFailureReasonsCsvButton
            filters={applied}
            knownTotal={view === "list" ? data?.total : undefined}
            disabled={view === "list" && isError}
          />
        </Space>
      </Space>

      <FailureReasonsFilters
        key={`${applied.actor}|${applied.status}|${applied.reasonCode}|${applied.dateDebut}|${applied.dateFin}`}
        value={applied}
        onSearch={onSearch}
        onReset={onReset}
      />

      {view === "stats" ? (
        <FailureReasonsStats filters={applied} />
      ) : isError ? (
        <ApiErrorAlert
          error={error}
          onRetry={() => refetch()}
          forbiddenMessage="Accès refusé : la lecture des réservations est requise"
          loadErrorMessage="Impossible de charger les motifs d'échec"
        />
      ) : (
        <FailureReasonsTable
          rows={rows}
          loading={isInitialLoading || isFetching}
          pagination={{
            current: data?.page ?? page,
            pageSize: data?.limit ?? limit,
            total: data?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZES.map(String),
            showTotal: (total) => `${total} réponse(s)`,
            onChange: (p, size) =>
              size !== limit
                ? update({ limit: size === DEFAULT_PAGE_SIZE ? undefined : String(size) })
                : update({ page: String(p) }),
          }}
        />
      )}
    </div>
  );
}
