import { useNavigate, useParams } from "react-router-dom";
import { Button, Descriptions, Image, Popconfirm, Progress, Select, Skeleton, Space, Table, Tabs, Tag, Typography, message, notification } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useRelais,
  useRelaisInterests,
  useRelaisMatches,
  useTriggerRelaisMatching,
  useUpdateRelaisStatus,
} from "@/hooks/useImmoRelais";
import { MappedTag } from "@/components/admin/common/MappedTag";
import { QueryError } from "@/components/admin/common/QueryError";
import { extractErrorMessage, getErrorStatus } from "@/lib/helpers";
import { formatFcfa } from "@/pages/admin/relais/format";
import { interestColumns } from "@/pages/admin/relais/interests";
import {
  RELAIS_STATUSES,
  relaisMatchingStatusMap,
  relaisReporterRelationMap,
  relaisStatusMap,
  type ImmoRelaisInterest,
  type ImmoRelaisMatch,
  type ImmoRelaisStatus,
} from "@/types/immo-relais";
import { useState } from "react";

const { Title, Text } = Typography;

const fmtDate = (v?: string | null, f = "DD/MM/YYYY") => (v ? dayjs(v).format(f) : "—");

const matchColumns: ColumnsType<ImmoRelaisMatch> = [
  { title: "Alerte", dataIndex: "alertId", ellipsis: true },
  {
    title: "Score",
    dataIndex: "score",
    width: 220,
    render: (v: number) => {
      // Le score peut être exprimé en 0..1 ou 0..100 : on normalise pour l'affichage.
      const pct = Math.round(v <= 1 ? v * 100 : v);
      return <Progress percent={Math.min(pct, 100)} size="small" />;
    },
  },
  { title: "Date", dataIndex: "createdAt", width: 150, render: (v?: string) => fmtDate(v, "DD/MM/YYYY HH:mm") },
];

export function RelaisDetail() {
  const { relaisId } = useParams<{ relaisId: string }>();
  const navigate = useNavigate();
  const [pendingStatus, setPendingStatus] = useState<ImmoRelaisStatus | null>(null);

  const relais = useRelais(relaisId);
  const interests = useRelaisInterests(relaisId);
  const matches = useRelaisMatches(relaisId);
  const updateStatus = useUpdateRelaisStatus();
  const trigger = useTriggerRelaisMatching();

  if (relais.isLoading) return <Skeleton active style={{ padding: 24 }} />;
  if (relais.isError || !relais.data) {
    return (
      <QueryError
        error={relais.error}
        notFoundTitle="Relais introuvable"
        onRetry={() => relais.refetch()}
        onBack={() => navigate("/admin/relais")}
      />
    );
  }
  const r = relais.data;

  const errorMessage = (err: unknown, fallback: string) =>
    getErrorStatus(err) === 403 ? "Accès refusé" : extractErrorMessage(err, fallback);

  const confirmStatus = () => {
    if (!pendingStatus) return;
    updateStatus.mutate(
      { id: r.id, status: pendingStatus },
      {
        onSuccess: () => message.success("Statut mis à jour"),
        onError: (err) => message.error(errorMessage(err, "Changement de statut impossible")),
        onSettled: () => setPendingStatus(null),
      }
    );
  };

  const handleTrigger = () =>
    trigger.mutate(r.id, {
      onSuccess: () =>
        notification.success({ message: "Matching relancé", description: "Le relais et ses matches sont actualisés." }),
      onError: (err) => message.error(errorMessage(err, "Impossible de relancer le matching")),
    });

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/relais")} aria-label="Retour aux relais" />
          <Title level={4} style={{ margin: 0 }}>
            Relais — {r.location}
          </Title>
          <MappedTag value={r.status} map={relaisStatusMap} />
        </Space>
        <Space wrap>
          <Popconfirm
            title={pendingStatus ? `Passer le statut à « ${relaisStatusMap[pendingStatus].label} » ?` : ""}
            open={pendingStatus !== null}
            okText="Confirmer"
            cancelText="Annuler"
            okButtonProps={{ loading: updateStatus.isLoading }}
            onConfirm={confirmStatus}
            onCancel={() => setPendingStatus(null)}
          >
            <Select<ImmoRelaisStatus>
              aria-label="Changer le statut"
              style={{ width: 170 }}
              value={r.status}
              options={RELAIS_STATUSES.map((s) => ({ value: s, label: relaisStatusMap[s].label }))}
              onChange={(v) => v !== r.status && setPendingStatus(v)}
            />
          </Popconfirm>
          <Popconfirm
            title="Relancer le matching ?"
            okText="Relancer"
            cancelText="Annuler"
            onConfirm={handleTrigger}
          >
            <Button icon={<ReloadOutlined />} loading={trigger.isLoading} disabled={r.matchingStatus === "matching"}>
              Relancer le matching
            </Button>
          </Popconfirm>
        </Space>
      </Space>

      <Descriptions bordered size="small" column={{ xs: 1, md: 2 }} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="ID">{r.id}</Descriptions.Item>
        <Descriptions.Item label="Occupant">{r.occupantId}</Descriptions.Item>
        <Descriptions.Item label="Bien (ID)">{r.propertyId ?? "—"}</Descriptions.Item>
        <Descriptions.Item label="Type">{r.propertyType}</Descriptions.Item>
        <Descriptions.Item label="Lieu">{r.location}</Descriptions.Item>
        <Descriptions.Item label="Repère">{r.landmark ?? "—"}</Descriptions.Item>
        <Descriptions.Item label="Coordonnées">
          {r.latitude !== null && r.longitude !== null ? `${r.latitude}, ${r.longitude}` : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Loyer actuel">{formatFcfa(r.currentRentPrice)}</Descriptions.Item>
        <Descriptions.Item label="Pièces">{r.rooms}</Descriptions.Item>
        <Descriptions.Item label="Surface">{r.surface !== null ? `${r.surface} m²` : "—"}</Descriptions.Item>
        <Descriptions.Item label="Départ approximatif">{fmtDate(r.approximateDepartureDate)}</Descriptions.Item>
        <Descriptions.Item label="Disponibilité">{fmtDate(r.availabilityDate)}</Descriptions.Item>
        <Descriptions.Item label="Motif">{r.reason ?? "—"}</Descriptions.Item>
        <Descriptions.Item label="Déclarant">
          {r.reporterRelation ? relaisReporterRelationMap[r.reporterRelation] : "—"}
          {r.reporterRelationDetails ? ` (${r.reporterRelationDetails})` : ""}
        </Descriptions.Item>
        <Descriptions.Item label="Notes" span={2}>
          {r.additionalNotes ?? "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Matching">
          <MappedTag value={r.matchingStatus} map={relaisMatchingStatusMap} />
        </Descriptions.Item>
        <Descriptions.Item label="Intéressés / matches potentiels">
          {r.interestedCount} / {r.potentialMatches}
        </Descriptions.Item>
        <Descriptions.Item label="Extras" span={2}>
          {r.extras.length ? r.extras.map((e) => <Tag key={e}>{e}</Tag>) : <Text type="secondary">Aucun</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="Créé le">{fmtDate(r.createdAt, "DD/MM/YYYY HH:mm")}</Descriptions.Item>
        <Descriptions.Item label="Modifié le">{fmtDate(r.updatedAt, "DD/MM/YYYY HH:mm")}</Descriptions.Item>
      </Descriptions>

      {r.photos.length > 0 && (
        <Image.PreviewGroup>
          <Space wrap style={{ marginBottom: 16 }}>
            {r.photos.map((url, i) => (
              <Image key={url} src={url} alt={`Photo ${i + 1} du relais`} width={120} height={90} style={{ objectFit: "cover", borderRadius: 4 }} />
            ))}
          </Space>
        </Image.PreviewGroup>
      )}

      <Tabs
        items={[
          {
            key: "interests",
            label: `Intérêts (${interests.data?.length ?? r.interestedCount})`,
            children: interests.isError ? (
              <QueryError error={interests.error} onRetry={() => interests.refetch()} />
            ) : (
              <Table<ImmoRelaisInterest>
                rowKey="id"
                columns={interestColumns}
                dataSource={interests.data}
                loading={interests.isLoading}
                locale={{ emptyText: "Aucun intérêt pour ce relais" }}
                scroll={{ x: 800 }}
                pagination={false}
              />
            ),
          },
          {
            key: "matches",
            label: `Matches (${matches.data?.length ?? r.potentialMatches})`,
            children: matches.isError ? (
              <QueryError error={matches.error} onRetry={() => matches.refetch()} />
            ) : (
              <Table<ImmoRelaisMatch>
                rowKey="id"
                columns={matchColumns}
                dataSource={matches.data}
                loading={matches.isLoading}
                locale={{ emptyText: "Aucun match pour ce relais" }}
                scroll={{ x: 600 }}
                pagination={false}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
