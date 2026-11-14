import { useMemo, useRef, useState } from "react";
import { Button, Card, Descriptions, Drawer, Input, Modal, Select, Space, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, EyeOutlined, SafetyOutlined } from "@ant-design/icons";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaymentTabs } from "@/pages/payments/components/payment-tabs";
import { createIdempotencyKeyStore, getIdempotencyErrorKind } from "@/lib/helpers/idempotency.helper";

const BASE = `${API_URL}/admin/payment-protection`;
type State = "PROTECTABLE" | "PENDING_APPROVAL" | "FAILED" | "RESOLVED" | "NOT_PAID";
type CaseItem = {
  reservationId: string; codeReservation?: string; statusReservation?: string; statusFacture?: string;
  dateDebut?: string; dateFin?: string; createdAt?: string; residence?: { id?: string; nom?: string };
  client?: { id?: string; firstName?: string; lastName?: string; phoneNumber?: string; email?: string; masked?: boolean };
  capturedAmount?: number; creditedAmount?: number; pendingApprovalAmount?: number; protectableAmount?: number;
  currency?: string; protectionState: State;
};
type Detail = { reservation?: CaseItem; payments?: any[]; resolutions?: any[]; walletTransactions?: any[]; audit?: any[] };
const label: Record<State, string> = { PROTECTABLE: "À restituer", PENDING_APPROVAL: "En attente de validation", FAILED: "Échec", RESOLVED: "Résolu", NOT_PAID: "Non payé" };
const formatAmount = (amount?: number, currency = "XOF") => `${new Intl.NumberFormat("fr-FR").format(amount ?? 0)} ${currency}`;
const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—";

export function PaymentProtectionPage() {
  const [state, setState] = useState<State | undefined>();
  const [clientId, setClientId] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CaseItem>();
  const [detail, setDetail] = useState<Detail>();
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("OWNER_CANCELLED_AFTER_CAPTURE");
  const [action, setAction] = useState<"create" | "approve" | "reject">();
  const queryClient = useQueryClient();
  // Une clé par intention de restitution : réutilisée pour tout renvoi du même contenu
  // (double-clic, retry après erreur réseau/5xx), renouvelée après succès ou si le contenu change.
  const resolutionKeys = useRef(createIdempotencyKeyStore());
  const refreshCase = () => { queryClient.invalidateQueries({ queryKey: ["payment-protection"] }); if (selected) detailMutation.mutate(selected.reservationId); };
  const params = useMemo(() => ({ page, perPage: 20, ...(state ? { protectionState: state } : {}), ...(clientId ? { clientId } : {}) }), [page, state, clientId]);
  const listQuery = useQuery({ queryKey: ["payment-protection", params], queryFn: async () => (await axiosInstance.get<{data: CaseItem[]; meta: {total: number}}>(`${BASE}/reservations`, { params })).data });
  const detailMutation = useMutation({ mutationFn: async (id: string) => (await axiosInstance.get<{data: Detail}>(`${BASE}/reservations/${id}`)).data.data,
    onSuccess: (data) => { setDetail(data); setSelected(data.reservation ?? selected); } });
  const actionMutation = useMutation({ mutationFn: async () => {
    if (!selected || !action) return;
    if (action === "create") {
      const body = { reason, destination: "WALLET", note: note.trim() };
      const idempotencyKey = resolutionKeys.current.keyFor({ reservationId: selected.reservationId, ...body });
      return (await axiosInstance.post(`${BASE}/reservations/${selected.reservationId}/resolutions`, body, { idempotencyKey })).data;
    }
    const resolutionId = (detail?.resolutions ?? []).find((r: any) => r.status === "PENDING_APPROVAL")?.resolutionId ?? (detail?.resolutions ?? []).find((r: any) => r.status === "PENDING_APPROVAL")?.id;
    if (!resolutionId) throw new Error("Identifiant de restitution en attente introuvable.");
    return (await axiosInstance.post(`${BASE}/resolutions/${resolutionId}/${action}`, { note })).data;
  }, onSuccess: () => { if (action === "create") resolutionKeys.current.reset(); message.success("Action effectuée"); setAction(undefined); setNote(""); refreshCase(); },
    onError: (e: any) => {
      const kind = getIdempotencyErrorKind(e);
      if (kind === "key-reused") { resolutionKeys.current.reset(); message.warning("Cette restitution a déjà été tentée avec un contenu différent. Vérifiez le motif puis confirmez à nouveau."); return; }
      if (kind === "in-progress") { message.info("Cette restitution est déjà en cours de traitement. Le dossier est actualisé."); setAction(undefined); refreshCase(); return; }
      if (kind === "key-required") console.error("[idempotency] Idempotency-Key absente de la requête (bug client)", e);
      message.error(e?.response?.data?.message || e.message || "L’action a échoué");
    } });
  const retryMutation = useMutation({ mutationFn: async (resolutionId: string) => (await axiosInstance.post(`${BASE}/resolutions/${resolutionId}/retry`)).data,
    onSuccess: () => { message.success("Restitution relancée"); queryClient.invalidateQueries({ queryKey: ["payment-protection"] }); if (selected) detailMutation.mutate(selected.reservationId); }, onError: (e: any) => message.error(e?.response?.data?.message || "La relance a échoué") });

  const openDetail = (record: CaseItem) => { setSelected(record); setDetail(undefined); detailMutation.mutate(record.reservationId); };
  const columns: ColumnsType<CaseItem> = [
    { title: "Réservation", dataIndex: "codeReservation", render: (v, r) => v || r.reservationId },
    { title: "Date de réservation", dataIndex: "createdAt", render: formatDateTime },
    { title: "Client", render: (_, r) => `${r.client?.firstName ?? ""} ${r.client?.lastName ?? ""}`.trim() || "—" },
    { title: "Résidence", render: (_, r) => r.residence?.nom || "—" },
    { title: "Encaissé", render: (_, r) => formatAmount(r.capturedAmount, r.currency) },
    { title: "Déjà crédité", render: (_, r) => formatAmount(r.creditedAmount, r.currency) },
    { title: "Restituable", render: (_, r) => <strong>{formatAmount(r.protectableAmount, r.currency)}</strong> },
    { title: "État", dataIndex: "protectionState", render: (v: State) => <Tag color={v === "PROTECTABLE" ? "blue" : v === "FAILED" ? "red" : v === "RESOLVED" ? "green" : "gold"}>{label[v] ?? v}</Tag> },
    { title: "Action", render: (_, r) => <Button icon={<EyeOutlined />} onClick={() => openDetail(r)}>Dossier</Button> },
  ];
  return <>
    <PaymentTabs activeMenu="protection" />
    <Card title={<Space><SafetyOutlined />Protection des paiements</Space>} extra={<Button icon={<ReloadOutlined />} onClick={() => listQuery.refetch()}>Actualiser</Button>}>
      <Space wrap style={{ marginBottom: 16 }}>
        <Select allowClear placeholder="Tous les états" style={{ width: 230 }} value={state} onChange={(v) => { setState(v); setPage(1); }} options={Object.entries(label).map(([value, text]) => ({ value, label: text }))} />
        <Input.Search allowClear placeholder="ID du client" style={{ width: 240 }} value={clientId} onChange={(e) => { setClientId(e.target.value); setPage(1); }} onSearch={() => listQuery.refetch()} />
      </Space>
      <Table rowKey="reservationId" columns={columns} dataSource={listQuery.data?.data ?? []} loading={listQuery.isLoading} pagination={{ current: page, pageSize: 20, total: listQuery.data?.meta?.total ?? 0, onChange: setPage, showSizeChanger: false }} locale={{ emptyText: listQuery.isError ? "Impossible de charger les dossiers" : "Aucun dossier" }} />
    </Card>
    <Drawer title={`Dossier ${selected?.codeReservation ?? ""}`} width={760} open={!!selected} onClose={() => { setSelected(undefined); setDetail(undefined); }} extra={<Space>
      {selected?.protectionState === "PROTECTABLE" && <Button type="primary" onClick={() => setAction("create")}>Créditer le coffre</Button>}
      {selected?.protectionState === "PENDING_APPROVAL" && <><Button type="primary" onClick={() => setAction("approve")}>Valider</Button><Button danger onClick={() => setAction("reject")}>Rejeter</Button></>}
    </Space>}>
      {detailMutation.isPending && <Typography.Text>Chargement du dossier…</Typography.Text>}
      {detail && <>
        <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
          <Descriptions.Item label="Réservation">{detail.reservation?.codeReservation ?? selected?.reservationId}</Descriptions.Item>
          <Descriptions.Item label="Date de réservation">{formatDateTime(detail.reservation?.createdAt ?? selected?.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="État">{label[detail.reservation?.protectionState ?? selected?.protectionState ?? "NOT_PAID"]}</Descriptions.Item>
          <Descriptions.Item label="Client">{[detail.reservation?.client?.firstName, detail.reservation?.client?.lastName].filter(Boolean).join(" ") || "—"}</Descriptions.Item>
          <Descriptions.Item label="Téléphone">{detail.reservation?.client?.phoneNumber || "—"}</Descriptions.Item>
          <Descriptions.Item label="Email">{detail.reservation?.client?.email || "—"}</Descriptions.Item>
          <Descriptions.Item label="Résidence">{detail.reservation?.residence?.nom || "—"}</Descriptions.Item>
          <Descriptions.Item label="Montant encaissé">{formatAmount(detail.reservation?.capturedAmount, detail.reservation?.currency)}</Descriptions.Item>
          <Descriptions.Item label="Montant restituable">{formatAmount(detail.reservation?.protectableAmount, detail.reservation?.currency)}</Descriptions.Item>
        </Descriptions>
        {([ ["Paiements", detail.payments], ["Restitutions", detail.resolutions], ["Transactions du coffre", detail.walletTransactions], ["Audit", detail.audit] ] as [string, any[] | undefined][]).map(([heading, rows]) => <Card key={heading} size="small" title={heading} style={{ marginBottom: 12 }}>
          {(rows ?? []).length ? (rows ?? []).map((row, i) => <div key={row.id ?? row.resolutionId ?? i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "8px 0" }}><span>{row.status ?? row.paymentMethod ?? row.type ?? row.action ?? "Événement"}</span><span>{row.amount != null ? formatAmount(row.amount, row.currency) : row.createdAt ? new Date(row.createdAt).toLocaleString("fr-FR") : ""}</span>{row.status === "FAILED" && row.id && <Button size="small" onClick={() => retryMutation.mutate(row.resolutionId ?? row.id)} loading={retryMutation.isPending}>Relancer</Button>}</div>) : <Typography.Text type="secondary">Aucune donnée</Typography.Text>}
        </Card>)}
      </>}
    </Drawer>
    <Modal title={action === "create" ? "Créer une restitution" : action === "approve" ? "Valider la restitution" : "Rejeter la restitution"} open={!!action} onCancel={() => setAction(undefined)} onOk={() => { if (!actionMutation.isPending) actionMutation.mutate(); }} confirmLoading={actionMutation.isPending} okText={action === "reject" ? "Rejeter" : action === "approve" ? "Valider" : "Créditer le coffre"} okButtonProps={{ danger: action === "reject", disabled: action === "create" && !note.trim() }} cancelButtonProps={{ disabled: actionMutation.isPending }}>
      {action === "create" && <Select value={reason} onChange={setReason} style={{ width: "100%", marginBottom: 12 }} options={[{ value: "OWNER_CANCELLED_AFTER_CAPTURE", label: "Annulation par le propriétaire" }, { value: "ADMIN_CANCELLED_AFTER_CAPTURE", label: "Annulation par l’administration" }, { value: "AVAILABILITY_LOST", label: "Indisponibilité du logement" }, { value: "DISPUTE_RESOLVED_FOR_CLIENT", label: "Litige résolu en faveur du client" }]} />}
      <Input.TextArea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} showCount placeholder={action === "create" ? "Motif (obligatoire)" : "Note (facultative)"} />
    </Modal>
  </>;
}
