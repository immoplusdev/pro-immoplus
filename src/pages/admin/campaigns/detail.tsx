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
  Tooltip,
  Typography,
  message,
  notification,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useCampaignStatus,
  useCampaignTemplate,
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
import { CampaignSendErrorAlert } from "@/components/admin/campaigns/CampaignSendErrorAlert";
import { TemplateStatusBadge } from "@/components/admin/campaigns/TemplateStatusBadge";
import {
  PUSH_AUDIENCE_HINT,
  SANS_APPAREIL_TOOLTIP,
  computeCampaignProgress,
  getHttpStatus,
  isPushTemplateBlocked,
  shouldPollCampaign,
  templateEditPath,
} from "@/components/admin/campaigns/campaign-helpers";
import { extractErrorMessage } from "@/lib/helpers";
import { CampaignCanal, CampaignStatut, cibleLabel, unwrapTag } from "@/types/campaigns.types";
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
  const [sendError, setSendError] = useState<unknown>(null);

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

  const isPush = entry?.canal === CampaignCanal.Push;
  // statut du modèle : un modèle push à réécrire est refusé à l'envoi (409)
  const { data: template } = useCampaignTemplate(isPush && canSendState ? entry?.templateId : undefined);
  const templateBlocked = !!template && isPushTemplateBlocked(template, entry?.canal);
  const noAudience = isPush && entry?.audience === 0;

  const effectiveFixes = entry ? sendFixes : manualFixes;
  const allFixedFilled = entry
    ? fixedTags.every((tag) => !!sendFixes[unwrapTag(tag)]?.trim())
    : true;

  const handleSend = () => {
    if (!campagneId) return;
    setSendError(null);
    const variablesFixes =
      Object.keys(effectiveFixes).length > 0 ? effectiveFixes : undefined;
    sendCampaign.mutate(
      { campagneId, variablesFixes },
      {
        onSuccess: (data) => {
          updateCampaignInRegistry(campagneId, { statut: data.statut, audience: data.audience });
          message.success(
            data.audience === 0 ? "Envoi lancé, mais aucun destinataire joignable" : "Envoi lancé"
          );
        },
        onError: (err) => {
          if (getHttpStatus(err) === 409) setSendError(err);
          else message.error(extractErrorMessage(err, "Erreur lors de l'envoi"));
        },
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

  const progress = computeCampaignProgress(status, entry?.canal);
  const polling = shouldPollCampaign(status);
  const statSpan = progress.showSansAppareil ? 6 : 8;

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
        <Progress percent={progress.percent} status={polling ? "active" : undefined} />
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={12} md={statSpan}>
            <Statistic title="Envoyés" value={progress.envoyes} valueStyle={{ color: "#52c41a" }} />
          </Col>
          <Col xs={12} md={statSpan}>
            <Statistic title="Échecs" value={progress.echecs} valueStyle={{ color: "#ff4d4f" }} />
          </Col>
          {progress.showSansAppareil && (
            <Col xs={12} md={statSpan}>
              <Statistic
                title={
                  <Tooltip title={SANS_APPAREIL_TOOLTIP}>
                    <Space size={4}>
                      Sans appareil
                      <InfoCircleOutlined />
                    </Space>
                  </Tooltip>
                }
                value={progress.sansAppareil}
                valueStyle={{ color: "#8c8c8c" }}
              />
            </Col>
          )}
          <Col xs={12} md={statSpan}>
            <Statistic title="En attente" value={progress.enAttente} />
          </Col>
        </Row>
        <Space direction="vertical" size={2} style={{ marginTop: 12 }}>
          {progress.tauxReussite !== null && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Taux de réussite : {progress.tauxReussite.toLocaleString("fr-FR")} % (envoyés ÷ envoyés + échecs
              {progress.showSansAppareil ? ", hors sans appareil" : ""})
            </Text>
          )}
          {polling && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Envoi en cours, actualisation automatique toutes les 4 secondes.
              {isPush || progress.showSansAppareil
                ? " Les erreurs temporaires sont relancées automatiquement : la fin de l'envoi peut prendre quelques dizaines de secondes de plus."
                : ""}
            </Text>
          )}
        </Space>
      </Card>

      {status.statut === CampaignStatut.Terminee && !polling && (
        <Result
          status="success"
          title="Campagne terminée"
          subTitle={
            `${progress.envoyes} message(s) envoyé(s), ${progress.echecs} échec(s)` +
            (progress.showSansAppareil ? `, ${progress.sansAppareil} sans appareil` : "") +
            ` sur ${progress.total} destinataire(s).`
          }
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

          {sendError != null && (
            <CampaignSendErrorAlert
              error={sendError}
              templateId={entry?.templateId}
              onClose={() => setSendError(null)}
            />
          )}

          {templateBlocked && template && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
              message={
                <Space>
                  Modèle « {template.nom} »
                  <TemplateStatusBadge template={template} canal={entry?.canal} />
                </Space>
              }
              description="Ce modèle doit être réécrit (titre et texte) avant envoi. Une fois enregistré, il redevient utilisable et la campagne peut partir."
              action={
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => navigate(templateEditPath(template.templateId))}
                >
                  Modifier le modèle
                </Button>
              }
            />
          )}

          {isPush && entry && (
            <Alert
              type={noAudience ? "warning" : "info"}
              showIcon
              style={{ marginBottom: 16 }}
              message={
                noAudience
                  ? "Aucun destinataire joignable par notification"
                  : `${entry.audience.toLocaleString("fr-FR")} destinataire(s) estimé(s) à la création`
              }
              description={
                noAudience
                  ? `${PUSH_AUDIENCE_HINT} Aucun utilisateur de cette audience n'a encore l'appli à jour : l'envoi est désactivé.`
                  : `${PUSH_AUDIENCE_HINT} Le chiffre est recalculé au moment de l'envoi.`
              }
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
              disabled={!allFixedFilled || templateBlocked || noAudience}
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
