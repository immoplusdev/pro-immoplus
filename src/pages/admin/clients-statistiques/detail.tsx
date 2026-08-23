import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Modal, Skeleton, Space, Typography, message, notification } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined, StopOutlined, SyncOutlined, WarningOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useClientDetail,
  useReactivateClient,
  useRecomputeClientScore,
  useSuspendClient,
  useBanClient,
} from "@/hooks/useClientsStatistiques";
import { StatutChangeModal } from "@/components/admin/clients-statistiques/StatutChangeModal";
import { SignalementsTable } from "./signalements-table";
import { ClientDetailContent } from "./client-detail-content";
import { extractErrorMessage } from "@/lib/helpers";
import { ClientStatut } from "@/types/clients-statistiques.types";

const { Title } = Typography;

type ModalState = { open: boolean; type: "suspendre" | "bannir" };

export function ClientsStatistiquesDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const [modal, setModal] = useState<ModalState>({ open: false, type: "suspendre" });

  const { data: client, isLoading, isError, error } = useClientDetail(clientId ?? null);

  const recompute = useRecomputeClientScore();
  const suspend = useSuspendClient();
  const ban = useBanClient();
  const reactivate = useReactivateClient();

  useEffect(() => {
    if (isError) {
      notification.error({
        message: "Client introuvable",
        description: extractErrorMessage(error, "Impossible de charger la fiche de ce client."),
      });
      navigate("/admin/clients-statistiques");
    }
  }, [isError, error, navigate]);

  const handleRecompute = () => {
    if (!clientId) return;
    recompute.mutate(clientId, {
      onSuccess: () => message.success("Score recalculé avec succès"),
      onError: (err) => message.error(extractErrorMessage(err, "Erreur lors du recalcul du score")),
    });
  };

  const handleReactivate = () => {
    if (!clientId) return;
    reactivate.mutate(clientId, {
      onSuccess: () => message.success("Client réactivé"),
      onError: (err) => message.error(extractErrorMessage(err, "Erreur lors de la réactivation")),
    });
  };

  const handleModalConfirm = (raison: string) => {
    if (!clientId) return;

    if (modal.type === "suspendre") {
      suspend.mutate(
        { clientId, raison },
        {
          onSuccess: () => {
            message.success("Client suspendu");
            setModal({ open: false, type: "suspendre" });
          },
          onError: (err) => message.error(extractErrorMessage(err, "Erreur lors de la suspension")),
        }
      );
    } else {
      ban.mutate(
        { clientId, raison },
        {
          onSuccess: () => {
            message.success("Client banni");
            setModal({ open: false, type: "bannir" });
          },
          onError: (err) => message.error(extractErrorMessage(err, "Erreur lors du bannissement")),
        }
      );
    }
  };

  const openBanConfirm = () => {
    Modal.confirm({
      title: "Bannir ce client ?",
      icon: <StopOutlined style={{ color: "#ff4d4f" }} />,
      content:
        "Cette action bloque totalement la connexion du client à l'application. Vous devrez ensuite préciser une raison.",
      okText: "Continuer",
      okButtonProps: { danger: true },
      cancelText: "Annuler",
      onOk: () => setModal({ open: true, type: "bannir" }),
    });
  };

  if (isLoading || !client) {
    return (
      <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 24 }} onClick={() => navigate("/admin/clients-statistiques")}>
          Retour à la liste
        </Button>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  const modalLoading = modal.type === "suspendre" ? suspend.isLoading : ban.isLoading;
  const canReactivate = client.statut === ClientStatut.Suspendu || client.statut === ClientStatut.Banni;

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/clients-statistiques")}>
            Retour à la liste
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {client.nom}
          </Title>
        </div>

        <Space wrap>
          <Button icon={<SyncOutlined />} loading={recompute.isLoading} onClick={handleRecompute}>
            Recalculer le score
          </Button>

          {client.statut !== ClientStatut.Banni && client.statut !== ClientStatut.Suspendu && (
            <Button
              icon={<WarningOutlined />}
              style={{ borderColor: "#fa8c16", color: "#fa8c16" }}
              onClick={() => setModal({ open: true, type: "suspendre" })}
            >
              Suspendre
            </Button>
          )}

          {client.statut !== ClientStatut.Banni && (
            <Button danger icon={<StopOutlined />} onClick={openBanConfirm}>
              Bannir
            </Button>
          )}

          {canReactivate && (
            <Button
              icon={<CheckCircleOutlined />}
              style={{ borderColor: "#52c41a", color: "#52c41a" }}
              loading={reactivate.isLoading}
              onClick={handleReactivate}
            >
              Réactiver
            </Button>
          )}
        </Space>
      </div>

      {recompute.data && (
        <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16, fontSize: 12 }}>
          Dernier recalcul : {dayjs(recompute.data.recalculeLe).format("DD/MM/YYYY à HH:mm")}
        </Typography.Text>
      )}

      <ClientDetailContent client={client} />

      <Card title="Signalements" style={{ marginTop: 24 }}>
        <SignalementsTable clientId={client.clientId} />
      </Card>

      <StatutChangeModal
        open={modal.open}
        type={modal.type}
        loading={modalLoading}
        onConfirm={handleModalConfirm}
        onCancel={() => setModal((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}
