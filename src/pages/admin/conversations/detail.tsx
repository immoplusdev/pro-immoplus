import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, Descriptions, Empty, Form, Input, List, Popconfirm, Skeleton, Space, Tag, Typography, message } from "antd";
import { ArrowLeftOutlined, LockOutlined, SendOutlined, StopOutlined, UnlockOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useBlockConversation,
  useConversation,
  useConversationMessages,
  useSendAdminMessage,
  useUnblockConversation,
} from "@/hooks/useMessaging";
import { MappedTag } from "@/components/admin/common/MappedTag";
import { QueryError } from "@/components/admin/common/QueryError";
import { extractErrorMessage, getErrorBody, getErrorStatus } from "@/lib/helpers";
import {
  MESSAGE_MAX_LENGTH,
  conversationStatusMap,
  conversationTypeMap,
  participantRoleMap,
  reportReasonMap,
  type ConversationMessage,
} from "@/types/messaging";

const { Title, Text } = Typography;

const newTempId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function MessageItem({ msg }: { msg: ConversationMessage }) {
  const isSystem = msg.type === "system";
  const isBlocked = msg.moderationStatus === "blocked";
  const isPro = msg.senderRole === "pro";

  if (isSystem) {
    return (
      <div style={{ textAlign: "center", width: "100%" }}>
        <Tag>Système</Tag>
        <Text type="secondary" italic>
          {msg.content}
        </Text>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: isPro ? "flex-end" : "flex-start" }}>
      <div
        style={{
          maxWidth: "75%",
          padding: "8px 12px",
          borderRadius: 8,
          background: isBlocked ? "#fff1f0" : isPro ? "#f0f5ff" : "#f6ffed",
          border: `1px ${isBlocked ? "dashed #ff4d4f" : "solid transparent"}`,
        }}
      >
        <Space size={4} wrap style={{ marginBottom: 4 }}>
          <MappedTag value={msg.senderRole} map={participantRoleMap} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {msg.senderId}
          </Text>
          {isBlocked && (
            <Tag color="red" icon={<StopOutlined />}>
              Contenu bloqué
            </Tag>
          )}
        </Space>
        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {msg.content ?? <Text type="secondary" italic>Contenu masqué</Text>}
        </div>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {dayjs(msg.createdAt).format("DD/MM/YYYY HH:mm")}
          {msg.readAt ? " · lu" : ""}
        </Text>
      </div>
    </div>
  );
}

export function ConversationDetailPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<{ content: string }>();
  const tempIdRef = useRef<string>(newTempId());
  const [sendError, setSendError] = useState<string | null>(null);

  const conv = useConversation(conversationId);
  const messagesQuery = useConversationMessages(conversationId);
  const block = useBlockConversation();
  const unblock = useUnblockConversation();
  const send = useSendAdminMessage();

  // Chaque page arrive du plus récent au plus ancien : on inverse pour l'affichage chronologique.
  const messages = useMemo(
    () => [...(messagesQuery.data?.pages ?? [])].reverse().flatMap((p) => [...p.data].reverse()),
    [messagesQuery.data]
  );

  if (conv.isLoading) return <Skeleton active style={{ padding: 24 }} />;
  if (conv.isError || !conv.data) {
    return (
      <QueryError
        error={conv.error}
        notFoundTitle="Conversation introuvable"
        onRetry={() => conv.refetch()}
        onBack={() => navigate("/admin/conversations")}
      />
    );
  }

  const c = conv.data;
  const isBlocked = c.status === "blocked";
  const isSupport = c.type === "support";

  const handleBlock = (action: "block" | "unblock") => {
    const mutation = action === "block" ? block : unblock;
    mutation.mutate(c.id, {
      onSuccess: () => message.success(action === "block" ? "Conversation bloquée" : "Conversation débloquée"),
      onError: (err) =>
        message.error(
          getErrorStatus(err) === 403 ? "Accès refusé" : extractErrorMessage(err, "Action impossible")
        ),
    });
  };

  const handleSend = ({ content }: { content: string }) => {
    setSendError(null);
    send.mutate(
      { id: c.id, content: content.trim(), clientTempId: tempIdRef.current },
      {
        onSuccess: () => {
          form.resetFields();
          tempIdRef.current = newTempId();
          message.success("Message envoyé");
        },
        onError: (err) => {
          const status = getErrorStatus(err);
          const body = getErrorBody(err);
          if (status === 400 && body?.code === "CONTACT_INFO_DETECTED") {
            setSendError(
              "Message refusé : il contient des coordonnées (téléphone, email, lien, identifiant) ou une proposition de paiement hors plateforme."
            );
          } else if (status === 403) {
            setSendError(
              isBlocked ? "Conversation bloquée" : "Accès refusé : réponse possible uniquement sur les conversations support."
            );
          } else {
            setSendError(extractErrorMessage(err, "Envoi impossible"));
          }
        },
      }
    );
  };

  const links: { label: string; id: string | null; to: string }[] = [
    { label: "Résidence", id: c.residenceId, to: `/residences/show/${c.residenceId}` },
    { label: "Réservation", id: c.reservationId, to: `/reservations/show/${c.reservationId}` },
    { label: "Visite", id: c.visiteId, to: `/demandes-visites/show/${c.visiteId}` },
    { label: "Relais", id: c.relaisId, to: `/admin/relais/${c.relaisId}` },
  ];

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/conversations")} aria-label="Retour aux conversations" />
          <Title level={4} style={{ margin: 0 }}>
            Conversation
          </Title>
          <MappedTag value={c.type} map={conversationTypeMap} />
          <MappedTag value={c.status} map={conversationStatusMap} />
        </Space>
        {isBlocked ? (
          <Popconfirm
            title="Débloquer cette conversation ?"
            okText="Débloquer"
            cancelText="Annuler"
            onConfirm={() => handleBlock("unblock")}
          >
            <Button icon={<UnlockOutlined />} loading={unblock.isLoading}>
              Débloquer
            </Button>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="Bloquer cette conversation ?"
            description="Les participants ne pourront plus échanger."
            okText="Bloquer"
            okButtonProps={{ danger: true }}
            cancelText="Annuler"
            onConfirm={() => handleBlock("block")}
          >
            <Button danger icon={<LockOutlined />} loading={block.isLoading}>
              Bloquer
            </Button>
          </Popconfirm>
        )}
      </Space>

      <Descriptions bordered size="small" column={{ xs: 1, md: 2 }} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="ID">{c.id}</Descriptions.Item>
        <Descriptions.Item label="Client">{c.clientId}</Descriptions.Item>
        <Descriptions.Item label="Pro">{c.proId ?? "Support"}</Descriptions.Item>
        <Descriptions.Item label="Contenus bloqués">{c.blockedContentCount}</Descriptions.Item>
        <Descriptions.Item label="Non lus (pro / client)">
          {c.unreadCountPro} / {c.unreadCountClient}
        </Descriptions.Item>
        {isBlocked && <Descriptions.Item label="Bloquée par">{c.blockedByUserId ?? "—"}</Descriptions.Item>}
        <Descriptions.Item label="Créée le">{dayjs(c.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
        <Descriptions.Item label="Liens">
          <Space wrap>
            {links.filter((l) => l.id).map((l) => (
              <Link key={l.label} to={l.to}>
                {l.label}
              </Link>
            ))}
            {!links.some((l) => l.id) && "—"}
          </Space>
        </Descriptions.Item>
      </Descriptions>

      {c.reports.length > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={`${c.reports.length} signalement(s)`}
          description={
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {c.reports.map((r) => (
                <li key={r.id}>
                  <MappedTag value={r.reason} map={reportReasonMap} /> par {r.reporterId} contre {r.reportedUserId}
                  {r.details ? ` — ${r.details}` : ""} ({dayjs(r.createdAt).format("DD/MM/YYYY HH:mm")})
                </li>
              ))}
            </ul>
          }
        />
      )}

      <Card title="Messages" size="small">
        {messagesQuery.isError ? (
          <QueryError error={messagesQuery.error} onRetry={() => messagesQuery.refetch()} />
        ) : (
          <>
            {messagesQuery.hasNextPage && (
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <Button loading={messagesQuery.isFetchingNextPage} onClick={() => messagesQuery.fetchNextPage()}>
                  Charger les messages plus anciens
                </Button>
              </div>
            )}
            <List
              loading={messagesQuery.isLoading}
              dataSource={messages}
              locale={{ emptyText: <Empty description="Aucun message" /> }}
              renderItem={(m) => (
                <List.Item key={m.id} style={{ border: "none", padding: "6px 0" }}>
                  <MessageItem msg={m} />
                </List.Item>
              )}
              style={{ maxHeight: 520, overflowY: "auto" }}
              aria-live="polite"
            />
          </>
        )}

        {isSupport && (
          <div style={{ marginTop: 16 }}>
            {isBlocked ? (
              <Alert type="error" showIcon message="Conversation bloquée" />
            ) : (
              <Form form={form} onFinish={handleSend} layout="vertical">
                {sendError && <Alert type="error" showIcon closable message={sendError} style={{ marginBottom: 8 }} onClose={() => setSendError(null)} />}
                <Form.Item
                  name="content"
                  label="Répondre en tant que support"
                  rules={[
                    { required: true, whitespace: true, message: "Le message ne peut pas être vide" },
                    { max: MESSAGE_MAX_LENGTH, message: `${MESSAGE_MAX_LENGTH} caractères maximum` },
                  ]}
                >
                  <Input.TextArea rows={3} maxLength={MESSAGE_MAX_LENGTH} showCount disabled={send.isLoading} />
                </Form.Item>
                <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={send.isLoading}>
                  Envoyer
                </Button>
              </Form>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
