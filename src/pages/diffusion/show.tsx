import { useShow } from "@refinedev/core";
import {
  Button,
  Card,
  Descriptions,
  Image,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AdCampaign, STATUS_COLORS, ENTITY_ID_ACTIONS, FILTERS_ACTIONS } from "./types";

const { Text, Title } = Typography;

export const AdCampaignShow = () => {
  const navigate = useNavigate();

  const { queryResult } = useShow<AdCampaign>({
    resource: "ads/campaigns",
  });

  const campaign = queryResult?.data?.data;
  const isLoading = queryResult?.isLoading ?? false;

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!campaign) {
    return <Text type="danger">Campagne introuvable.</Text>;
  }

  const showEntityId = ENTITY_ID_ACTIONS.includes(campaign.action);
  const showEntityIds = campaign.action === "OPEN_CATEGORY";
  const showFilters = FILTERS_ACTIONS.includes(campaign.action);

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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Retour
        </Button>
        <Link to={`/ads/campaigns/edit/${campaign.id}`}>
          <Button type="primary" icon={<EditOutlined />}>
            Modifier
          </Button>
        </Link>
      </div>

      <Title level={4} style={{ marginBottom: 24 }}>
        Campagne #{campaign.id}
      </Title>

      {/* Paramètres généraux */}
      <Card title="Paramètres généraux" style={{ marginBottom: 24 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item label="ID">{campaign.id}</Descriptions.Item>
          <Descriptions.Item label="Statut">
            <Tag color={STATUS_COLORS[campaign.status]}>{campaign.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Priorité">{campaign.priority}</Descriptions.Item>
          <Descriptions.Item label="Placement">{campaign.placement}</Descriptions.Item>
          <Descriptions.Item label="Catégorie">{campaign.campaign_category}</Descriptions.Item>
          <Descriptions.Item label="Type">{campaign.type}</Descriptions.Item>
          <Descriptions.Item label="Date de début">
            {dayjs(campaign.start_date).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Date de fin">
            {dayjs(campaign.end_date).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Créée le">
            {dayjs(campaign.created_at).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
          <Descriptions.Item label="Mise à jour">
            {dayjs(campaign.updated_at).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Contenu */}
      <Card title="Contenu" style={{ marginBottom: 24 }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Titre">{campaign.content.title}</Descriptions.Item>
          {campaign.content.subtitle && (
            <Descriptions.Item label="Sous-titre">
              {campaign.content.subtitle}
            </Descriptions.Item>
          )}
          {campaign.content.badge && (
            <Descriptions.Item label="Badge">
              <Tag>{campaign.content.badge}</Tag>
            </Descriptions.Item>
          )}
          {campaign.content.cta_label && (
            <Descriptions.Item label="Libellé CTA">
              {campaign.content.cta_label}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Médias */}
      <Card title="Médias" style={{ marginBottom: 24 }}>
        {campaign.media.images.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Images
            </Text>
            <Image.PreviewGroup>
              <Space wrap>
                {campaign.media.images.map((url) => (
                  <Image
                    key={url}
                    src={url}
                    width={120}
                    height={80}
                    style={{ objectFit: "cover", borderRadius: 4 }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                  />
                ))}
              </Space>
            </Image.PreviewGroup>
          </div>
        )}

        {campaign.media.videos.length > 0 && (
          <div>
            <Text strong style={{ display: "block", marginBottom: 8 }}>
              Vidéos
            </Text>
            <Space direction="vertical" style={{ width: "100%" }}>
              {campaign.media.videos.map((url) => (
                <Text key={url} copyable>
                  {url}
                </Text>
              ))}
            </Space>
          </div>
        )}

        {campaign.media.images.length === 0 && campaign.media.videos.length === 0 && (
          <Text type="secondary">Aucun média associé.</Text>
        )}
      </Card>

      {/* Action & Scope */}
      <Card title="Action & Scope">
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Action">
            <Tag>{campaign.action}</Tag>
          </Descriptions.Item>

          {campaign.url && (
            <Descriptions.Item label="URL">
              <Text copyable>{campaign.url}</Text>
            </Descriptions.Item>
          )}

          {showEntityId && campaign.scope.entity_id !== null && (
            <Descriptions.Item label="ID entité">
              {String(campaign.scope.entity_id)}
            </Descriptions.Item>
          )}

          {showEntityIds && campaign.scope.entity_ids.length > 0 && (
            <Descriptions.Item label="IDs entités">
              <Space wrap>
                {campaign.scope.entity_ids.map((id) => (
                  <Tag key={String(id)}>{String(id)}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          )}

          {showFilters && Object.keys(campaign.scope.filters).length > 0 && (
            <Descriptions.Item label="Filtres">
              <pre
                style={{
                  margin: 0,
                  fontSize: 12,
                  background: "#f5f5f5",
                  padding: 8,
                  borderRadius: 4,
                }}
              >
                {JSON.stringify(campaign.scope.filters, null, 2)}
              </pre>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
};
