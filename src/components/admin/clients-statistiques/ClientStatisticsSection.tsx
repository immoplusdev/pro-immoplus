import type { ReactNode } from "react";
import { Alert, Button, Card, Col, Descriptions, Empty, Progress, Rate, Row, Skeleton, Space, Typography, message } from "antd";
import { CheckCircleFilled, CloseCircleFilled, SyncOutlined } from "@ant-design/icons";
import { useClientDetail, useRecomputeClientScore } from "@/hooks/useClientsStatistiques";
import { ApiErrorAlert } from "@/components/admin/common/ApiErrorAlert";
import { extractErrorMessage, getErrorStatus } from "@/lib/helpers";
import { T } from "@/lib/design-tokens";
import { ClientStatutTag } from "./ClientStatutTag";
import { RisqueTag } from "./RisqueTag";
import { ScoreBadgeTag } from "./ScoreBadgeTag";
import { ClientStatisticsHistory } from "./ClientStatisticsHistory";
import {
  ClientDetailDto,
  ClientRisqueNiveau,
  comportementLabel,
  EMPTY_VALUE,
  formatDateFr,
  formatFcfa,
  formatFrequence,
  formatNote,
  formatPercent,
  segmentLabel,
  verificationLabel,
} from "@/types/clients-statistiques.types";

const { Title, Text } = Typography;

interface Props {
  /** Id utilisateur du client (role customer). */
  clientId: string;
}

/**
 * Section « Statistiques & score » de la fiche utilisateur (Admin, clients uniquement).
 * Même query que /admin/clients-statistiques/:clientId : recalcul / suspension / bannissement
 * invalident la même clé et rafraîchissent les deux écrans.
 */
export function ClientStatisticsSection({ clientId }: Props) {
  const { data, isLoading, isError, error, refetch, isFetching } = useClientDetail(clientId);
  const recompute = useRecomputeClientScore();

  const handleRecompute = () =>
    recompute.mutate(clientId, {
      onSuccess: () => message.success("Score recalculé"),
      onError: (err) => message.error(extractErrorMessage(err, "Échec du recalcul du score")),
    });

  const recomputeButton = (
    <Button icon={<SyncOutlined />} loading={recompute.isLoading} onClick={handleRecompute}>
      Recalculer le score
    </Button>
  );

  if (isLoading) {
    return (
      <div style={{ marginTop: 16 }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (isError) {
    if (getErrorStatus(error) === 404) {
      return (
        <Card style={{ marginTop: 16 }}>
          <Empty description="Statistiques indisponibles pour ce client">{recomputeButton}</Empty>
        </Card>
      );
    }
    // 401 : déjà géré par l'intercepteur axios (refresh / déconnexion). 403 et autres : alerte + Réessayer.
    return (
      <div style={{ marginTop: 16 }}>
        <ApiErrorAlert
          error={error}
          onRetry={() => refetch()}
          forbiddenMessage="Vous n'avez pas accès aux statistiques de ce client."
          loadErrorMessage="Impossible de charger les statistiques du client"
        />
      </div>
    );
  }

  if (!data) return null;

  return (
    <Space direction="vertical" size={16} style={{ width: "100%", marginTop: 16 }}>
      <ScoreHeader client={data} action={recomputeButton} refreshing={isFetching} />
      <RiskBlock client={data} />
      <KpiGrid client={data} />
      <ProfileBlock client={data} />
      <ClientStatisticsHistory historique={data.historique} />
    </Space>
  );
}

function ScoreHeader({ client, action, refreshing }: { client: ClientDetailDto; action: ReactNode; refreshing: boolean }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <Progress
          type="dashboard"
          percent={client.score.global}
          strokeColor={T.primary}
          size={120}
          format={(value) => (
            <span style={{ color: T.ink }}>
              <span style={{ fontSize: 28, fontWeight: 600 }}>{value}</span>
              <span style={{ fontSize: 14, color: T.ink60 }}>/100</span>
            </span>
          )}
        />
        <div style={{ flex: 1, minWidth: 200 }}>
          <Title level={4} style={{ margin: 0 }}>
            Statistiques &amp; score
          </Title>
          <Text type="secondary">{client.nom}</Text>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <ClientStatutTag statut={client.statut} />
            <ScoreBadgeTag badge={client.score.badge} />
          </div>
        </div>
        <Space>
          {refreshing && <Text type="secondary">Actualisation…</Text>}
          {action}
        </Space>
      </div>
    </Card>
  );
}

function RiskBlock({ client }: { client: ClientDetailDto }) {
  const { niveau, raisons } = client.risque;
  return (
    <Card
      size="small"
      title={
        <Space>
          <span>Niveau de risque</span>
          <RisqueTag niveau={niveau} />
        </Space>
      }
    >
      {raisons.length > 0 ? (
        <Alert
          type={niveau === ClientRisqueNiveau.Critique ? "error" : niveau === ClientRisqueNiveau.Eleve ? "warning" : "info"}
          showIcon
          message="Raisons"
          description={
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {raisons.map((raison, i) => (
                <li key={`${i}-${raison}`}>{raison}</li>
              ))}
            </ul>
          }
        />
      ) : (
        <Text type="secondary">Aucun signal de risque.</Text>
      )}
    </Card>
  );
}

function KpiCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card size="small" title={title} style={{ height: "100%" }}>
      {children}
    </Card>
  );
}

function KpiGrid({ client }: { client: ClientDetailDto }) {
  const { reservations, paiements, reputation, fidelite } = client;
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12} xl={6}>
        <KpiCard title="Réservations">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Total">{reservations.total}</Descriptions.Item>
            <Descriptions.Item label="Terminées">{reservations.terminees}</Descriptions.Item>
            <Descriptions.Item label="Annulées par le client">{reservations.annuleesClient}</Descriptions.Item>
            <Descriptions.Item label="Sans réponse">{reservations.sansReponse}</Descriptions.Item>
            <Descriptions.Item label="Taux d'annulation">{formatPercent(reservations.tauxAnnulation)}</Descriptions.Item>
          </Descriptions>
        </KpiCard>
      </Col>
      <Col xs={24} md={12} xl={6}>
        <KpiCard title="Paiements">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Taux d'échec">{formatPercent(paiements.tauxEchec)}</Descriptions.Item>
            <Descriptions.Item label="Total dépensé">{formatFcfa(paiements.montantTotalDepenseFcfa)}</Descriptions.Item>
          </Descriptions>
        </KpiCard>
      </Col>
      <Col xs={24} md={12} xl={6}>
        <KpiCard title="Réputation">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Note des hôtes">
              {reputation.noteMoyenneHoteClient != null ? (
                <Space size={6} wrap>
                  <Rate disabled allowHalf value={reputation.noteMoyenneHoteClient} style={{ fontSize: 14 }} />
                  <Text type="secondary">{formatNote(reputation.noteMoyenneHoteClient)}</Text>
                </Space>
              ) : (
                EMPTY_VALUE
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Comportement">
              {reputation.comportement ? comportementLabel[reputation.comportement] : EMPTY_VALUE}
            </Descriptions.Item>
            <Descriptions.Item label="Recommandation">{formatPercent(reputation.tauxRecommandation)}</Descriptions.Item>
          </Descriptions>
        </KpiCard>
      </Col>
      <Col xs={24} md={12} xl={6}>
        <KpiCard title="Fidélité">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Segment">{segmentLabel[fidelite.segment]}</Descriptions.Item>
            <Descriptions.Item label="Client récurrent">{fidelite.clientRecurrent ? "Oui" : "Non"}</Descriptions.Item>
            <Descriptions.Item label="Première réservation">{formatDateFr(fidelite.premiereReservation)}</Descriptions.Item>
            <Descriptions.Item label="Dernière réservation">{formatDateFr(fidelite.derniereReservation)}</Descriptions.Item>
            <Descriptions.Item label="Fréquence moyenne">{formatFrequence(fidelite.frequenceMoyenneJours)}</Descriptions.Item>
          </Descriptions>
        </KpiCard>
      </Col>
    </Row>
  );
}

function VerificationIndicator({ label, ok }: { label: string; ok: boolean }) {
  return (
    <Space size={6}>
      {ok ? (
        <CheckCircleFilled style={{ color: T.successDark }} aria-label="vérifié" />
      ) : (
        <CloseCircleFilled style={{ color: T.errorDark }} aria-label="non vérifié" />
      )}
      <span>{label}</span>
    </Space>
  );
}

function ProfileBlock({ client }: { client: ClientDetailDto }) {
  const { anciennete, verification } = client;
  const jours = anciennete.joursDepuisInscription;
  return (
    <Card size="small" title="Profil">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Text strong>Ancienneté</Text>
          <div>
            Inscrit depuis {jours} jour{jours > 1 ? "s" : ""}
          </div>
          <Text type="secondary">Le {formatDateFr(anciennete.createdAt)}</Text>
        </Col>
        <Col xs={24} md={12}>
          <Text strong>Vérifications</Text>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
            {(Object.keys(verificationLabel) as Array<keyof typeof verificationLabel>).map((key) => (
              <VerificationIndicator key={key} label={verificationLabel[key]} ok={verification[key]} />
            ))}
          </div>
        </Col>
      </Row>
    </Card>
  );
}
