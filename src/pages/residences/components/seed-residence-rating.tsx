import React, { useState } from "react";
import { useApiUrl, useCustomMutation, useGetIdentity } from "@refinedev/core";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Input,
  Rate,
  Space,
  Typography,
  message,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import { UserRole } from "@/core/domain/users";
import { getApiFileUrl } from "@/lib/helpers";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";
import { ClientPickerModal, ClientPick } from "./client-picker-modal";

const { Text } = Typography;
const { TextArea } = Input;
const localStorageProvider = getLocalStorageProvider();

const PROPERTY_TAGS = ["Propre", "Accueillant", "Confortable", "Bien équipé", "Calme", "Proche services"];

interface Props {
  residenceId?: string | number;
}

export function SeedResidenceRating({ residenceId }: Props) {
  const apiUrl = useApiUrl();
  const { data: identity } = useGetIdentity<{ role?: { id: string } }>();
  const authData = localStorageProvider.getAuthData();
  const role = authData?.role || identity?.role?.id;

  const { mutateAsync, isLoading } = useCustomMutation();

  const [propertyRating, setPropertyRating] = useState(5);
  const [propertyFeedback, setPropertyFeedback] = useState("");
  const [propertyTags, setPropertyTags] = useState<string[]>([]);
  const [hostRating, setHostRating] = useState<number | null>(null);
  const [hostFeedback, setHostFeedback] = useState("");
  const [ratedAt, setRatedAt] = useState<Dayjs | null>(null);
  const [client, setClient] = useState<ClientPick | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (role !== UserRole.Admin) return null;

  const resetForm = () => {
    setPropertyRating(5);
    setPropertyFeedback("");
    setPropertyTags([]);
    setHostRating(null);
    setHostFeedback("");
    setRatedAt(null);
    setClient(null);
  };

  const handleSubmit = async () => {
    if (!residenceId) return;
    try {
      const { data } = await mutateAsync({
        url: `${apiUrl}/ratings/admin/seed`,
        method: "post",
        values: {
          propertyId: String(residenceId),
          propertyRating,
          propertyFeedback: propertyFeedback.trim() || undefined,
          propertyTags: propertyTags.length ? propertyTags : undefined,
          hostRating: hostRating ?? undefined,
          hostFeedback: hostFeedback.trim() || undefined,
          clientId: client?.id,
          ratedAt: ratedAt ? ratedAt.toISOString() : undefined,
        },
      });
      const created = (data as any)?.data ?? data;
      message.success(`Avis de test créé (note ${created?.propertyRating ?? propertyRating}/5)`);
      resetForm();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Erreur lors de la création de l'avis");
    }
  };

  return (
    <Card
      title="Créer un avis test"
      style={{ marginTop: 24 }}
      extra={<Text type="secondary" style={{ fontSize: 12 }}>Outil admin — POST /ratings/admin/seed</Text>}
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Contourne le cycle réservation/paiement/checkout"
        description="Crée directement un avis soumis, visible immédiatement sur la fiche résidence et le top des mieux notées."
      />

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            Note de la résidence <span style={{ color: "#F72585" }}>*</span>
          </Text>
          <Rate value={propertyRating} onChange={setPropertyRating} allowClear={false} />
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            Commentaire (optionnel)
          </Text>
          <TextArea
            value={propertyFeedback}
            onChange={(e) => setPropertyFeedback(e.target.value)}
            maxLength={500}
            showCount
            rows={3}
            placeholder="Séjour parfait, très bien situé"
          />
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            Tags (optionnel)
          </Text>
          <Checkbox.Group
            options={PROPERTY_TAGS}
            value={propertyTags}
            onChange={(vals) => setPropertyTags(vals as string[])}
          />
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            Note du pro (optionnel)
          </Text>
          <Rate
            value={hostRating ?? 0}
            onChange={(v) => setHostRating(v === 0 ? null : v)}
            allowClear
          />
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            Commentaire sur le pro (optionnel)
          </Text>
          <TextArea
            value={hostFeedback}
            onChange={(e) => setHostFeedback(e.target.value)}
            rows={2}
            placeholder="Client sympa"
          />
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            Utilisateur test (optionnel)
          </Text>
          {client ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar src={client.avatar ? getApiFileUrl(client.avatar) : undefined} icon={<UserOutlined />} />
              <div>
                <Text strong style={{ display: "block" }}>
                  {client.lastName} {client.firstName}
                </Text>
                <Text style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>{client.email}</Text>
              </div>
              <Button size="small" onClick={() => setClient(null)}>
                Retirer
              </Button>
            </div>
          ) : (
            <Space direction="vertical" size={4}>
              <Button onClick={() => setPickerOpen(true)}>Choisir un client</Button>
              <Text style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>
                Sans client, l'avis apparaît "anonyme" (pas de nom/photo affichés).
              </Text>
            </Space>
          )}
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            Date de l'avis (optionnel)
          </Text>
          <DatePicker
            showTime
            value={ratedAt}
            onChange={setRatedAt}
            format="DD/MM/YYYY HH:mm"
            placeholder="Défaut : maintenant"
            style={{ width: "100%", maxWidth: 280 }}
          />
        </div>

        <Button type="primary" loading={isLoading} disabled={!residenceId} onClick={handleSubmit}>
          Créer l'avis test
        </Button>
      </Space>

      <ClientPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={(picked) => setClient(picked)}
      />
    </Card>
  );
}
