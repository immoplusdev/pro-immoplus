import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Avatar,
  Typography,
  Space,
  Button,
  Alert,
  Skeleton,
  Divider,
  Rate,
  Badge,
  message,
  Descriptions,
  List,
} from "antd";
import {
  ArrowLeftOutlined,
  SyncOutlined,
  WarningOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  useProCertificationDetail,
  useProUser,
  useRecalculate,
  useSuspend,
  useRetirer,
  useReactiver,
} from "@/hooks/useProCertification";
import { CertificationStatusTag } from "@/components/admin/pro-certification/CertificationStatusTag";
import { ScoreProgress, getScoreColor } from "@/components/admin/pro-certification/ScoreProgress";
import { PilierCard } from "@/components/admin/pro-certification/PilierCard";
import { ActionModal } from "@/components/admin/pro-certification/ActionModal";
import { CertificationStatus, getRoleName, type Piliers, type ConditionsAttribution } from "@/types/pro-certification.types";

const { Text, Title, Paragraph } = Typography;

function ConditionRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
      {ok ? (
        <CheckOutlined style={{ color: "#52c41a", fontSize: 14 }} />
      ) : (
        <CloseOutlined style={{ color: "#ff4d4f", fontSize: 14 }} />
      )}
      <Text style={{ color: ok ? undefined : "#999" }}>{label}</Text>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: number | null | string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
      <Text type="secondary" style={{ fontSize: 13 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 13 }}>
        {value === null || value === undefined ? "N/A" : value}
      </Text>
    </div>
  );
}

function BreakdownRow({ label, pts, max, ok }: { label: string; pts: number; max: number; ok: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0" }}>
      <Space size={6}>
        {ok ? (
          <CheckOutlined style={{ color: "#52c41a", fontSize: 12 }} />
        ) : (
          <CloseOutlined style={{ color: "#ff4d4f", fontSize: 12 }} />
        )}
        <Text style={{ fontSize: 13 }}>{label}</Text>
      </Space>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {pts}/{max}
      </Text>
    </div>
  );
}

type ModalState = { open: boolean; type: "suspend" | "retirer" };

export function ProCertificationDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [modal, setModal] = useState<ModalState>({ open: false, type: "suspend" });

  const { data: user, isLoading: userLoading } = useProUser(userId!);
  const { data: cert, isLoading: certLoading } = useProCertificationDetail(userId!);

  const recalculate = useRecalculate();
  const suspend = useSuspend();
  const retirer = useRetirer();
  const reactiver = useReactiver();

  const isLoading = userLoading || certLoading;

  const certStatus = cert?.status;
  const certScore = cert?.scoreTotal ?? 0;

  const handleRecalculate = () => {
    recalculate.mutate(userId!, {
      onSuccess: () => message.success("Score recalculé avec succès"),
      onError: () => message.error("Erreur lors du recalcul"),
    });
  };

  const handleReactiver = () => {
    reactiver.mutate(userId!, {
      onSuccess: () => message.success("Certification réactivée"),
      onError: () => message.error("Erreur lors de la réactivation"),
    });
  };

  const handleModalConfirm = (motif: string) => {
    if (modal.type === "suspend") {
      suspend.mutate(
        { userId: userId!, motif },
        {
          onSuccess: () => {
            message.success("Certification suspendue");
            setModal({ open: false, type: "suspend" });
          },
          onError: () => message.error("Erreur lors de la suspension"),
        }
      );
    } else {
      retirer.mutate(
        { userId: userId!, motif },
        {
          onSuccess: () => {
            message.success("Certification retirée définitivement");
            setModal({ open: false, type: "retirer" });
          },
          onError: () => message.error("Erreur lors du retrait"),
        }
      );
    }
  };

  const modalLoading =
    modal.type === "suspend" ? suspend.isLoading : retirer.isLoading;

  const canReactivate =
    certStatus === CertificationStatus.SUSPENDU ||
    certStatus === CertificationStatus.RETIRE;

  if (isLoading) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>
          Retour à la liste
        </Button>
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </div>
    );
  }

  const piliers: Piliers | undefined = cert?.piliers;
  const inf = piliers?.informations;
  const res = piliers?.reservations;
  const avis = piliers?.avis;
  const fib = piliers?.fiabilite;
  const cond: ConditionsAttribution | undefined = cert?.conditionsAttribution;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Retour à la liste
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          Certification Pro —{" "}
          {user?.firstName} {user?.lastName}
        </Title>
      </div>

      {certStatus === CertificationStatus.CERTIFIE && (
        <Alert
          type="success"
          message={
            <Text strong style={{ fontSize: 15 }}>
              ⭐ Certifié Immo Plus Pro
            </Text>
          }
          description="Ce professionnel a obtenu la certification Immo Plus Pro."
          style={{ marginBottom: 20 }}
          showIcon={false}
          banner
        />
      )}

      <Row gutter={24}>
        {/* Colonne gauche — Carte identité */}
        <Col xs={24} lg={8}>
          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" align="center" style={{ width: "100%", marginBottom: 16 }}>
              <Avatar src={user?.avatar} size={80}>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Avatar>
              <div style={{ textAlign: "center" }}>
                <Title level={4} style={{ margin: 0 }}>
                  {user?.firstName} {user?.lastName}
                </Title>
                {certStatus === CertificationStatus.CERTIFIE && (
                  <Badge
                    count="⭐ Certifié Immo Plus Pro"
                    style={{ backgroundColor: "#d4a017", color: "#fff", fontWeight: 600, marginTop: 4 }}
                  />
                )}
              </div>
            </Space>

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Rôle">
                {getRoleName(user?.role) === "pro_particulier" ? "Pro Particulier" : "Pro Entreprise"}
              </Descriptions.Item>
              <Descriptions.Item label="Téléphone">{user?.phoneNumber ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="Email">{user?.email ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="Statut certification">
                {certStatus ? <CertificationStatusTag status={certStatus} size="large" /> : "—"}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: "16px 0" }} />

            <div style={{ textAlign: "center" }}>
              <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                Score total
              </Text>
              <ScoreProgress score={certScore} type="circle" width={140} />
              {cert?.lastCalculatedAt && (
                <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 8 }}>
                  Calculé le {dayjs(cert.lastCalculatedAt).format("DD/MM/YYYY à HH:mm")}
                </Text>
              )}
            </div>

            {certStatus === CertificationStatus.SUSPENDU && cert?.motif && (
              <Alert
                type="warning"
                message="Motif de suspension"
                description={cert.motif}
                style={{ marginTop: 16 }}
                showIcon
              />
            )}
            {certStatus === CertificationStatus.RETIRE && cert?.motif && (
              <Alert
                type="error"
                message="Motif de retrait"
                description={cert.motif}
                style={{ marginTop: 16 }}
                showIcon
              />
            )}
          </Card>
        </Col>

        {/* Colonne droite — Score par pilier */}
        <Col xs={24} lg={16}>
          {/* 1. Informations */}
          <PilierCard title="Informations" score={inf?.score ?? 0} maxScore={inf?.max ?? 30}>
            {inf?.detail ? (
              <div>
                <BreakdownRow label="Photo / Logo" pts={inf.detail.photoLogo} max={5} ok={inf.detail.photoLogo > 0} />
                <BreakdownRow label="Numéros vérifiés" pts={inf.detail.numerosVerifies} max={5} ok={inf.detail.numerosVerifies > 0} />
                <BreakdownRow label="Identité + RCCM" pts={inf.detail.identiteRccm} max={5} ok={inf.detail.identiteRccm > 0} />
                <BreakdownRow label="Email" pts={inf.detail.email} max={5} ok={inf.detail.email > 0} />
                <BreakdownRow label="Adresse" pts={inf.detail.adresse} max={5} ok={inf.detail.adresse > 0} />
                <BreakdownRow label="Moyen de paiement" pts={inf.detail.moyenPaiement} max={2} ok={inf.detail.moyenPaiement > 0} />
                <BreakdownRow label="Annonce complète" pts={inf.detail.annonceComplete} max={3} ok={inf.detail.annonceComplete > 0} />
              </div>
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Détail non disponible
              </Text>
            )}
          </PilierCard>

          {/* 2. Réservations */}
          <PilierCard title="Réservations" score={res?.score ?? 0} maxScore={res?.max ?? 30}>
            {res !== undefined && (
              <Text type="secondary" style={{ fontSize: 13 }}>
                {res.nbReservationsEffectuees !== undefined
                  ? `${res.nbReservationsEffectuees} réservations effectuées (fenêtre 30j, plafond : ${res.plafond ?? 10})`
                  : "Données non disponibles"}
              </Text>
            )}
          </PilierCard>

          {/* 3. Avis clients */}
          <PilierCard
            title="Avis clients"
            score={avis?.score ?? null}
            maxScore={avis?.max ?? 20}
            extra={
              avis?.score === null ? (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Score neutre
                </Text>
              ) : undefined
            }
          >
            {avis !== undefined && (
              <Space direction="vertical" style={{ width: "100%" }} size={4}>
                {avis.score === null && (
                  <Alert
                    type="info"
                    message="Score neutre (< 3 avis)"
                    style={{ padding: "4px 8px" }}
                    showIcon
                  />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Rate
                    disabled
                    allowHalf
                    value={avis.noteMoyenne ?? 0}
                    style={{ fontSize: 14 }}
                  />
                  <Text style={{ fontSize: 13 }}>
                    {avis.noteMoyenne !== null ? avis.noteMoyenne.toFixed(1) : "—"} /5
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {avis.nbAvisRecus} avis reçu{avis.nbAvisRecus > 1 ? "s" : ""}
                </Text>
              </Space>
            )}
          </PilierCard>

          {/* 4. Fiabilité */}
          <PilierCard title="Fiabilité" score={fib?.score ?? 0} maxScore={fib?.max ?? 20}>
            {fib !== undefined && (
              <div>
                <MetricRow
                  label="Taux de réponse"
                  value={fib.tauxReponse !== null ? `${fib.tauxReponse}%` : null}
                />
                <MetricRow
                  label="Taux d'annulation Pro"
                  value={fib.tauxAnnulationPro !== null ? `${fib.tauxAnnulationPro}%` : null}
                />
                <MetricRow
                  label="Taux check-in réussi"
                  value={fib.tauxCheckinReussi !== null ? `${fib.tauxCheckinReussi}%` : null}
                />
                <MetricRow
                  label="Délai médian"
                  value={fib.delaiMedianMinutes !== null ? `${fib.delaiMedianMinutes} min` : null}
                />
              </div>
            )}
          </PilierCard>
        </Col>
      </Row>

      {/* Conditions d'attribution */}
      {cond && (
        <Card title="Conditions d'attribution de la certification" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 4]}>
            <Col xs={24} sm={12}>
              <ConditionRow ok={cond.identiteVerifiee} label="Identité vérifiée" />
              <ConditionRow ok={cond.moyenPaiementVerifie} label="Moyen de paiement vérifié" />
              <ConditionRow ok={cond.avisMinimum} label="Minimum 3 avis" />
            </Col>
            <Col xs={24} sm={12}>
              <ConditionRow ok={cond.reservationsMin10} label="Minimum 10 réservations" />
              <ConditionRow ok={cond.fiabiliteMin14} label="Score fiabilité ≥ 14/20" />
              <ConditionRow ok={cond.aucuneSanctionActive} label="Aucune sanction active" />
            </Col>
          </Row>
        </Card>
      )}

      {/* Actions admin */}
      <Card title="Actions admin">
        <Space wrap size="middle">
          <Button
            icon={<SyncOutlined />}
            loading={recalculate.isLoading}
            onClick={handleRecalculate}
          >
            Recalculer
          </Button>

          <Button
            icon={<WarningOutlined />}
            style={{ borderColor: "#fa8c16", color: "#fa8c16" }}
            onClick={() => setModal({ open: true, type: "suspend" })}
          >
            Suspendre
          </Button>

          <Button
            danger
            icon={<StopOutlined />}
            onClick={() => setModal({ open: true, type: "retirer" })}
          >
            Retirer définitivement
          </Button>

          {canReactivate && (
            <Button
              icon={<CheckCircleOutlined />}
              style={{ borderColor: "#52c41a", color: "#52c41a" }}
              loading={reactiver.isLoading}
              onClick={handleReactiver}
            >
              Réactiver
            </Button>
          )}
        </Space>
      </Card>

      <ActionModal
        open={modal.open}
        type={modal.type}
        loading={modalLoading}
        onConfirm={handleModalConfirm}
        onCancel={() => setModal((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}
