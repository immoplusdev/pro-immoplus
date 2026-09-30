import { useMemo } from "react";
import { Alert, Card, Col, Row, Skeleton, Spin, Statistic } from "antd";
import { ApiErrorAlert } from "@/components/admin/common/ApiErrorAlert";
import {
  FAILURE_REASONS_STATS_MAX_ROWS,
  useFailureReasonsForStats,
  type FailureReasonsQueryFilters,
} from "@/hooks/useFailureReasons";
import { ExportTooLargeError } from "@/lib/helpers/csv.helper";
import { aggregateFailureStats } from "@/lib/helpers/failure-reasons.helper";
import { ACTOR_TAGS, FAILURE_ACTORS } from "@/types/failure-reasons.types";
import { HorizontalCountChart, TimelineChart } from "./StatsCharts";

const nf = new Intl.NumberFormat("fr-FR");
const ACTOR_COLORS = { CLIENT: "#2f54eb", PRO: "#722ed1" } as const;

const share = (n: number, total: number) =>
  total > 0 ? `${(Math.round((n / total) * 1000) / 10).toLocaleString("fr-FR")} %` : "—";

/** Onglet Statistiques : tous les résultats des filtres courants (≤ 5 000), agrégés côté front. */
export function FailureReasonsStats({ filters }: { filters: FailureReasonsQueryFilters }) {
  const { data, isInitialLoading, isFetching, isError, error, refetch } = useFailureReasonsForStats(filters, true);

  const stats = useMemo(
    () => (data ? aggregateFailureStats(data, { dateDebut: filters.dateDebut, dateFin: filters.dateFin }) : null),
    [data, filters.dateDebut, filters.dateFin]
  );

  if (isError) {
    if (error instanceof ExportTooLargeError) {
      return (
        <Alert
          type="warning"
          showIcon
          message="Trop de réponses pour calculer les statistiques"
          description={`Ces filtres renvoient ${nf.format(error.total)} réponses (maximum ${nf.format(
            FAILURE_REASONS_STATS_MAX_ROWS
          )}). Réduisez la période ou ajoutez un filtre.`}
        />
      );
    }
    return (
      <ApiErrorAlert
        error={error}
        onRetry={() => refetch()}
        forbiddenMessage="Accès refusé : la lecture des réservations est requise"
        loadErrorMessage="Impossible de calculer les statistiques"
      />
    );
  }
  if (isInitialLoading || !stats) return <Skeleton active paragraph={{ rows: 10 }} />;
  if (stats.total === 0) return <Alert type="info" showIcon message="Aucune réponse pour ces filtres" />;

  return (
    <Spin spinning={isFetching}>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic title="Réponses" value={stats.total} formatter={(v) => nf.format(Number(v))} />
          </Card>
        </Col>
        {FAILURE_ACTORS.map((a) => (
          <Col xs={12} md={6} key={a}>
            <Card size="small">
              <Statistic
                title={`Part ${ACTOR_TAGS[a].label.toLowerCase()}`}
                value={share(stats.byActor[a], stats.total)}
                suffix={<span style={{ fontSize: 14 }}>({nf.format(stats.byActor[a])})</span>}
              />
            </Card>
          </Col>
        ))}
        <Col xs={12} md={6}>
          <Card size="small">
            <Statistic
              title="Part « Autre raison »"
              value={share(stats.otherCount, stats.total)}
              suffix={<span style={{ fontSize: 14 }}>({nf.format(stats.otherCount)})</span>}
            />
          </Card>
        </Col>

        {FAILURE_ACTORS.map((a) => (
          <Col xs={24} xl={12} key={a}>
            <Card size="small" title={`Motifs — ${ACTOR_TAGS[a].label} (${nf.format(stats.byActor[a])})`}>
              <HorizontalCountChart data={stats.byReason[a]} color={ACTOR_COLORS[a]} />
            </Card>
          </Col>
        ))}

        <Col xs={24} xl={12}>
          <Card size="small" title="Répartition par statut">
            <HorizontalCountChart data={stats.byStatus} color="#fa541c" />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card size="small" title={`Évolution par ${stats.granularity === "day" ? "jour" : "semaine"}`}>
            <TimelineChart data={stats.timeline} />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
}
