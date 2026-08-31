import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Input,
  List,
  Progress,
  Result,
  Row,
  Skeleton,
  Space,
  Statistic,
  Typography,
  message,
  notification,
} from "antd";
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useCampaignStatus,
  useCampaignTemplateTags,
  usePreviewCampaign,
  useSendCampaign,
} from "@/hooks/useCampaigns";
import { updateCampaignInRegistry, useCampaignRegistry } from "@/hooks/useCampaignRegistry";
import { CampaignCanalTag } from "@/components/admin/campaigns/CampaignCanalTag";
import { CampaignStatutTag } from "@/components/admin/campaigns/CampaignStatutTag";
import {
  FixedVariablesInputs,
  getFixedTagsFromMapping,
} from "@/components/admin/campaigns/FixedVariablesInputs";
import { extractErrorMessage } from "@/lib/helpers";
import { CampaignStatut, cibleLabel, unwrapTag } from "@/types/campaigns.types";
import type { CampaignPreviewItem } from "@/types/campaigns.types";

const { Title, Text } = Typography;

/** Éditeur clé/valeur minimal — fallback quand le mapping local est inconnu. */
function KeyValueEditor({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  const [rows, setRows] = useState<{ k: string; v: string }[]>(() => {
    const e = Object.entries(value);
    return e.length ? e.map(([k, v]) => ({ k, v })) : [{ k: "", v: "" }];
  });

  const emit = (next: { k: string; v: string }[]) => {
    setRows(next);
    const rec: Record<string, string> = {};
    next.forEach((r) => {
      if (r.k.trim()) rec[r.k.trim()] = r.v;
    });
    onChange(rec);
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={8}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 8 }}>
          <Input
            placeholder="nom de la variable fixe"
            style={{ width: 240 }}
            value={row.k}
            onChange={(e) => emit(rows.map((r, j) => (j === i ? { ...r, k: e.target.value } : r)))}
          />
          <Input
            placeholder="valeur"
            style={{ flex: 1 }}
            value={row.v}
            onChange={(e) => emit(rows.map((r, j) => (j === i ? { ...r, v: e.target.value } : r)))}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            disabled={rows.length === 1}
            onClick={() => emit(rows.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      <Button type="dashed" icon={<PlusOutlined />} onClick={() => emit([...rows, { k: "", v: "" }])}>
        Ajouter une variable
      </Button>
    </Space>
  );
}

export function CampaignDetail() {
  const { campagneId } = useParams<{ campagneId: string }>();
  const navigate = useNavigate();
  const { get } = useCampaignRegistry();

  const entry = campagneId ? get(campagneId) : undefined;

  const { data: status, isLoading, isError, error } = useCampaignStatus(campagneId);
  const { data: tags = [] } = useCampaignTemplateTags(entry?.cible);

  const sendCampaign = useSendCampaign();
  const previewCampaign = usePreviewCampaign();

  const [sendFixes, setSendFixes] = useState<Record<string, string>>({});
  const [manualFixes, setManualFixes] = useState<Record<string, string>>({});
  const [echantillon, setEchantillon] = useState<CampaignPreviewItem[] | null>(null);

  const fixedTags = useMemo(
    () => (entry ? getFixedTagsFromMapping(entry.mappingVariables, tags) : []),
    [entry, tags]
  );

  useEffect(() => {
    if (status && campagneId && entry && entry.statut !== status.statut) {
      updateCampaignInRegistry(campagneId, { statut: status.statut });
    }
  }, [status, campagneId, entry]);

  useEffect(() => {
    if (isError) {
      notification.error({
        message: "Campagne introuvable",
        description: extractErrorMessage(error, "Impossible de charger le statut de cette campagne."),
      });
    }
  }, [isError, error]);

  const canSendState =
    status?.statut === CampaignStatut.Brouillon || status?.statut === CampaignStatut.Planifiee;

  const effectiveFixes = entry ? sendFixes : manualFixes;
  const allFixedFilled = entry
    ? fixedTags.every((tag) => !!sendFixes[unwrapTag(tag)]?.trim())
    : true;

  const handleSend = () => {
    if (!campagneId) return;
    const variablesFixes =
      Object.keys(effectiveFixes).length > 0 ? effectiveFixes : undefined;
    sendCampaign.mutate(
      { campagneId, variablesFixes },
      {
        onSuccess: (data) => {
          updateCampaignInRegistry(campagneId, { statut: data.statut, audience: data.audience });
          message.success("Envoi lancé");
        },
        onError: (err) => message.error(extractErrorMessage(err, "Erreur lors de l'envoi")),
      }
    );
  };

  const handlePreview = () => {
    if (!campagneId) return;
    previewCampaign.mutate(
      {
        campagneId,
        variablesFixes: Object.keys(effectiveFixes).length ? effectiveFixes : undefined,
      },
      {
        onSuccess: (items) => setEchantillon(items),
        onError: (err) => message.error(extractErrorMessage(err, "Erreur lors de l'aperçu")),
      }
    );
  };

  if (isLoading) {
    return (
      <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 24 }} onClick={() => navigate("/admin/campaigns")}>
          Retour aux campagnes
        </Button>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (isError || !status) {
    return (
      <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
        <Result
          status="404"
          title="Campagne introuvable"
          subTitle="Cette campagne n'existe pas ou n'est plus accessible."
          extra={
            <Button type="primary" onClick={() => navigate("/admin/campaigns")}>
              Retour aux campagnes
            </Button>
          }
        />
      </div>
    );
  }

  const total = status.envoyes + status.echecs + status.enAttente;
  const done = status.envoyes + status.echecs;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Space wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/campaigns")}>
            Retour aux campagnes
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            Campagne {campagneId?.slice(0, 8)}
          </Title>
          <CampaignStatutTag statut={status.statut} />
        </Space>
      </div>

      {entry && (
        <Space wrap style={{ marginBottom: 16 }}>
          <CampaignCanalTag canal={entry.canal} />
          <Text type="secondary">{cibleLabel[entry.cible]}</Text>
          {entry.templateNom && <Text type="secondary">· {entry.templateNom}</Text>}
          {entry.planifieLe && (
            <Text type="secondary">
              · planifiée le {dayjs(entry.planifieLe).format("DD/MM/YYYY HH:mm")}
            </Text>
          )}
        </Space>
      )}

      <Card style={{ marginBottom: 16 }}>
        <Progress
          percent={percent}
          status={status.statut === CampaignStatut.EnCours ? "active" : undefined}
        />
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Statistic title="Envoyés" value={status.envoyes} valueStyle={{ color: "#52c41a" }} />
          </Col>
          <Col span={8}>
            <Statistic title="Échecs" value={status.echecs} valueStyle={{ color: "#ff4d4f" }} />
          </Col>
          <Col span={8}>
            <Statistic title="En attente" value={status.enAttente} />
          </Col>
        </Row>
        {status.statut === CampaignStatut.EnCours && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Envoi en cours — actualisation automatique toutes les 4 secondes.
          </Text>
        )}
      </Card>

      {status.statut === CampaignStatut.Terminee && (
        <Result
          status="success"
          title="Campagne terminée"
          subTitle={`${status.envoyes} message(s) envoyé(s), ${status.echecs} échec(s).`}
        />
      )}

      {canSendState && (
        <Card
          title={
            <Space>
              <SendOutlined />
              Envoi
            </Space>
          }
        >
          {status.statut === CampaignStatut.Planifiee && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="Campagne planifiée : elle partira automatiquement. Vous pouvez aussi forcer l'envoi maintenant en renseignant les variables fixes."
            />
          )}

          {!entry && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message="Mapping non disponible sur ce navigateur"
              description="Cette campagne n'a pas été créée ici : les variables fixes ne peuvent pas être déduites. Renseignez-les manuellement (nom du tag sans accolades → valeur)."
            />
          )}

          <Divider orientation="left" plain style={{ marginTop: 0 }}>
            Variables fixes
          </Divider>

          {entry ? (
            <FixedVariablesInputs
              fixedTags={fixedTags}
              value={sendFixes}
              onChange={setSendFixes}
              required
            />
          ) : (
            <KeyValueEditor value={manualFixes} onChange={setManualFixes} />
          )}

          <Space style={{ marginTop: 16 }} wrap>
            <Button ghost type="primary" loading={previewCampaign.isLoading} onClick={handlePreview}>
              Générer un aperçu
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={sendCampaign.isLoading}
              disabled={!allFixedFilled}
              onClick={handleSend}
            >
              Envoyer maintenant
            </Button>
          </Space>

          {echantillon && (
            <List
              style={{ marginTop: 16 }}
              header={<Text strong>Échantillon ({echantillon.length})</Text>}
              bordered
              dataSource={echantillon}
              locale={{ emptyText: <Empty description="Aucun destinataire" /> }}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" size={2} style={{ width: "100%" }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      client {item.clientId}
                    </Text>
                    <Text style={{ whiteSpace: "pre-wrap" }}>{item.apercuMessage}</Text>
                  </Space>
                </List.Item>
              )}
            />
          )}
        </Card>
      )}
    </div>
  );
}
