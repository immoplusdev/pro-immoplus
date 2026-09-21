import React, { useEffect, useState } from "react";
import { useApiUrl, useCustom, useGetIdentity } from "@refinedev/core";
import {
  Alert,
  Button,
  Col,
  InputNumber,
  Row,
  Space,
  Spin,
  Switch,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  HolderOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { T } from "@/lib/design-tokens";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { API_URL } from "@/configs/app.config";
import { UserRole } from "@/core/domain/users";
import { getLocalStorageProvider } from "@/lib/providers/local-storage.provider";
import { HomeFeedConfig, HomeFeedGlobals, HomeFeedSectionConfig } from "./types";

const { Text, Title } = Typography;
const localStorageProvider = getLocalStorageProvider();

const cardStyle: React.CSSProperties = {
  border: `1px solid ${T.ink12}`,
  borderRadius: 12,
  boxShadow: "0 1px 2px rgba(26,20,35,0.04), 0 4px 12px rgba(26,20,35,0.04)",
  background: T.bg,
};

const GLOBAL_FIELDS: {
  key: keyof HomeFeedGlobals;
  label: string;
  hint: string;
  min: number;
}[] = [
  {
    key: "defaultSectionsPageSize",
    label: "Sections par page",
    hint: "Nombre de sections renvoyées par page (scroll vertical), si le client n'envoie pas ?limit=.",
    min: 1,
  },
  {
    key: "defaultItemsPerSection",
    label: "Items par section (défaut)",
    hint: "Utilisé pour une section dont la limite n'est pas définie ci-dessous.",
    min: 1,
  },
  {
    key: "locationRowsLimit",
    label: "Cartes ville",
    hint: "Nombre de cartes ville dans les sections groupées par localisation.",
    min: 1,
  },
  {
    key: "nearYouRadiusKm",
    label: "Rayon \"Près de chez vous\" (km)",
    hint: "Rayon de recherche de la section near_you.",
    min: 1,
  },
  {
    key: "maxAdsPerSection",
    label: "Plafond de pubs par section",
    hint: "Nombre maximum de pubs par section/emplacement (inline ou bannière).",
    min: 0,
  },
];

function useCurrentRole(): string | undefined {
  const { data: identity } = useGetIdentity<{ role?: { id: string } }>();
  const authData = localStorageProvider.getAuthData();
  return authData?.role || identity?.role?.id;
}

export const FeedHomeConfig = () => {
  const role = useCurrentRole();
  const apiUrl = useApiUrl();

  const { data, isLoading, isError, refetch } = useCustom<HomeFeedConfig>({
    url: `${apiUrl}/admin/home-feed-sections`,
    method: "get",
    queryOptions: { enabled: role === UserRole.Admin },
  });

  const config = data?.data;

  const [sections, setSections] = useState<HomeFeedSectionConfig[]>([]);
  const [globals, setGlobals] = useState<HomeFeedGlobals | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!config) return;
    setSections([...config.sections].sort((a, b) => a.position - b.position));
    setGlobals({
      defaultSectionsPageSize: config.defaultSectionsPageSize,
      defaultItemsPerSection: config.defaultItemsPerSection,
      locationRowsLimit: config.locationRowsLimit,
      nearYouRadiusKm: config.nearYouRadiusKm,
      maxAdsPerSection: config.maxAdsPerSection,
    });
  }, [config]);

  if (role !== UserRole.Admin) {
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <Alert
          type="warning"
          showIcon
          message="Accès réservé aux administrateurs"
          description="La configuration du Home Feed n'est modifiable que par un compte Admin."
        />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        message="Impossible de charger la configuration du Home Feed"
        action={
          <Button size="small" icon={<ReloadOutlined />} onClick={() => refetch()}>
            Réessayer
          </Button>
        }
      />
    );
  }

  // isLoading couvre le chargement réseau ; !globals couvre le tick avant que l'effet ne
  // synchronise l'état local depuis `config` une fois la requête résolue.
  if (isLoading || !globals) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  const moveSection = (from: number, to: number) => {
    if (from === to) return;
    setSections((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const updateSection = (sectionKey: string, patch: Partial<HomeFeedSectionConfig>) => {
    setSections((prev) => prev.map((s) => (s.sectionKey === sectionKey ? { ...s, ...patch } : s)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...globals,
        sections: sections.map(({ sectionKey, itemsLimit, enabled }) => ({
          sectionKey,
          itemsLimit,
          enabled,
        })),
      };
      const { data: response } = await axiosInstance.put(
        `${API_URL}/admin/home-feed-sections`,
        payload,
      );
      message.success("Configuration du Home Feed enregistrée");
      const updated: HomeFeedConfig | undefined = response?.data;
      if (updated) {
        setSections([...updated.sections].sort((a, b) => a.position - b.position));
        setGlobals({
          defaultSectionsPageSize: updated.defaultSectionsPageSize,
          defaultItemsPerSection: updated.defaultItemsPerSection,
          locationRowsLimit: updated.locationRowsLimit,
          nearYouRadiusKm: updated.nearYouRadiusKm,
          maxAdsPerSection: updated.maxAdsPerSection,
        });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      message.error(msg ?? "Erreur lors de l'enregistrement de la configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Link to="/feed">
          <Button icon={<ArrowLeftOutlined />}>Retour</Button>
        </Link>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          style={{ background: T.primary, borderColor: T.primary }}
        >
          Enregistrer
        </Button>
      </div>

      <Title level={4} style={{ marginBottom: 4 }}>
        Home Feed
      </Title>
      <Text style={{ display: "block", color: T.ink60, marginBottom: 20 }}>
        Ordre, visibilité et volumétrie des sections de l'écran d'accueil (<code>GET /me/home</code>).
      </Text>

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
        message="Effet immédiat, sans déploiement"
        description="Les changements sont appliqués dès l'enregistrement (cache de configuration invalidé). Le placement des pubs et sondages se gère séparément, dans les onglets « Campagnes pub » et « Sondages » — seul le plafond de pubs par section se règle ici."
      />

      <Row gutter={24} align="top">
        <Col xs={24} lg={15}>
          <div style={{ ...cardStyle, padding: 24 }}>
            <Title level={5} style={{ margin: 0, marginBottom: 4, color: T.ink }}>
              Sections
            </Title>
            <Text style={{ display: "block", fontSize: 12, color: T.ink60, marginBottom: 16 }}>
              Glissez une ligne pour changer l'ordre d'affichage.
            </Text>

            <Space direction="vertical" style={{ width: "100%" }} size={8}>
              {sections.map((section, index) => (
                <div
                  key={section.sectionKey}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null) moveSection(dragIndex, index);
                    setDragIndex(null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: section.enabled ? T.surfaceMuted : T.ink8,
                    opacity: dragIndex === index ? 0.5 : 1,
                  }}
                >
                  <span
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={() => setDragIndex(null)}
                    style={{ display: "flex", cursor: "grab" }}
                  >
                    <HolderOutlined style={{ color: T.ink60, fontSize: 16 }} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      strong
                      style={{ display: "block", color: section.enabled ? T.ink : T.ink60 }}
                      ellipsis
                    >
                      {section.label}
                    </Text>
                    <Text style={{ fontSize: 11, color: T.ink40, fontFamily: "monospace" }}>
                      {section.sectionKey}
                    </Text>
                  </div>
                  <Tooltip title={`Défaut : ${globals.defaultItemsPerSection}`}>
                    <InputNumber
                      min={1}
                      value={section.itemsLimit ?? undefined}
                      placeholder={String(globals.defaultItemsPerSection)}
                      style={{ width: 90 }}
                      onChange={(v) => updateSection(section.sectionKey, { itemsLimit: v ?? null })}
                    />
                  </Tooltip>
                  <Switch
                    checked={section.enabled}
                    onChange={(checked) => updateSection(section.sectionKey, { enabled: checked })}
                    checkedChildren="Visible"
                    unCheckedChildren="Masquée"
                  />
                </div>
              ))}
            </Space>
          </div>
        </Col>

        <Col xs={24} lg={9}>
          <div style={{ ...cardStyle, padding: 24, position: "sticky", top: 24 }}>
            <Title level={5} style={{ margin: 0, marginBottom: 16, color: T.ink }}>
              Réglages globaux
            </Title>
            <Space direction="vertical" style={{ width: "100%" }} size={16}>
              {GLOBAL_FIELDS.map((field) => (
                <div key={field.key}>
                  <Text style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                    {field.label}
                  </Text>
                  <InputNumber
                    min={field.min}
                    value={globals[field.key]}
                    style={{ width: "100%" }}
                    onChange={(v) =>
                      setGlobals((prev) => (prev ? { ...prev, [field.key]: v ?? field.min } : prev))
                    }
                  />
                  <Text style={{ display: "block", fontSize: 12, color: T.ink60, marginTop: 4 }}>
                    {field.hint}
                  </Text>
                </div>
              ))}
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );
};
