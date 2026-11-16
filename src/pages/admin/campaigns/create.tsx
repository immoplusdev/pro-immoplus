import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Divider,
  Empty,
  List,
  Radio,
  Result,
  Select,
  Space,
  Spin,
  Statistic,
  Steps,
  Typography,
  message,
} from "antd";
import { ArrowLeftOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import {
  useCampaignTemplateTags,
  useCampaignTemplates,
  useCreateCampaign,
  usePreviewCampaign,
  useSendCampaign,
} from "@/hooks/useCampaigns";
import { addCampaignToRegistry, updateCampaignInRegistry } from "@/hooks/useCampaignRegistry";
import { VariableMappingList } from "@/components/admin/campaigns/VariableMappingList";
import { AudienceFilterFields } from "@/components/admin/campaigns/AudienceFilterFields";
import { AudienceRecipientsPicker } from "@/components/admin/campaigns/AudienceRecipientsPicker";
import type { RecipientPick } from "@/components/admin/campaigns/RecipientPickerModal";
import {
  FixedVariablesInputs,
  getFixedTagsFromMapping,
} from "@/components/admin/campaigns/FixedVariablesInputs";
import { CampaignSendErrorAlert } from "@/components/admin/campaigns/CampaignSendErrorAlert";
import { TemplateStatusBadge } from "@/components/admin/campaigns/TemplateStatusBadge";
import {
  PUSH_AUDIENCE_HINT,
  getHttpStatus,
  isPushTemplateBlocked,
} from "@/components/admin/campaigns/campaign-helpers";
import { extractErrorMessage } from "@/lib/helpers";
import {
  CampaignCanal,
  CampaignCible,
  CampaignStatut,
  canalLabel,
  canalOptions,
  cibleLabel,
  cibleOptions,
  unwrapTag,
} from "@/types/campaigns.types";
import type { Campaign, CampaignPreviewItem } from "@/types/campaigns.types";

const { Title, Text, Paragraph } = Typography;

export function CampaignCreate() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  // Étape 1
  const [canal, setCanal] = useState<CampaignCanal>();
  const [cible, setCible] = useState<CampaignCible>();

  // Étape 2
  const [templateId, setTemplateId] = useState<string>();

  // Étape 3
  const [mappingVariables, setMappingVariables] = useState<Record<string, string>>({});
  const [audienceMode, setAudienceMode] = useState<"filtre" | "manuel">("filtre");
  const [audienceFiltre, setAudienceFiltre] = useState<Record<string, string>>({});
  const [audienceRecipients, setAudienceRecipients] = useState<RecipientPick[]>([]);
  const [planifieLe, setPlanifieLe] = useState<Dayjs | null>(null);

  // Après création
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  // Étape 4 (aperçu) / 5 (envoi)
  const [previewFixes, setPreviewFixes] = useState<Record<string, string>>({});
  const [sendFixes, setSendFixes] = useState<Record<string, string>>({});
  const [echantillon, setEchantillon] = useState<CampaignPreviewItem[] | null>(null);
  const [sendError, setSendError] = useState<unknown>(null);

  const templatesEnabled = !!canal && !!cible;
  const { data: templates = [], isFetching: loadingTemplates } = useCampaignTemplates(
    { canal, cible },
    templatesEnabled
  );
  const { data: tags = [], isFetching: loadingTags } = useCampaignTemplateTags(cible);

  const createCampaign = useCreateCampaign();
  const previewCampaign = usePreviewCampaign();
  const sendCampaign = useSendCampaign();

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.templateId === templateId),
    [templates, templateId]
  );
  const positions = selectedTemplate?.variables ?? [];
  const templateBlocked = !!selectedTemplate && isPushTemplateBlocked(selectedTemplate, canal);
  const isPush = canal === CampaignCanal.Push;
  // push uniquement : l'audience ne compte que les utilisateurs joignables par FCM
  const noAudience = !!campaign && campaign.canal === CampaignCanal.Push && campaign.audience === 0;

  const fixedTags = useMemo(
    () => getFixedTagsFromMapping(mappingVariables, tags),
    [mappingVariables, tags]
  );

  // vrai si le template ne déclare aucune variable, ou si toutes sont mappées
  const allPositionsMapped = positions.every((p) => !!mappingVariables[p]);
  const audienceValid = audienceMode === "manuel" ? audienceRecipients.length > 0 : true;

  const allFixedSendFilled = fixedTags.every((tag) => !!sendFixes[unwrapTag(tag)]?.trim());

  const locked = !!campaign;

  /* ----------------------------- actions ----------------------------- */

  const handleCreate = () => {
    if (!canal || !cible || !templateId) return;
    createCampaign.mutate(
      {
        canal,
        cible,
        templateId,
        mappingVariables,
        audience:
          audienceMode === "manuel"
            ? { recipientIds: audienceRecipients.map((r) => r.id) }
            : { filtre: audienceFiltre },
        ...(planifieLe ? { planifieLe: planifieLe.toISOString() } : {}),
      },
      {
        onSuccess: (data) => {
          setCampaign(data);
          addCampaignToRegistry({
            campagneId: data.campagneId,
            canal: data.canal,
            cible: data.cible,
            templateId: data.templateId,
            templateNom: selectedTemplate?.nom ?? "",
            statut: data.statut,
            audience: data.audience,
            planifieLe: data.planifieLe ?? planifieLe?.toISOString() ?? null,
            mappingVariables,
            createdAt: new Date().toISOString(),
          });
          message.success("Campagne créée");
          setCurrent(3);
        },
        onError: (err) =>
          message.error(extractErrorMessage(err, "Erreur lors de la création de la campagne")),
      }
    );
  };

  const handlePreview = () => {
    if (!campaign) return;
    previewCampaign.mutate(
      {
        campagneId: campaign.campagneId,
        variablesFixes: Object.keys(previewFixes).length ? previewFixes : undefined,
      },
      {
        onSuccess: (items) => setEchantillon(items),
        onError: (err) =>
          message.error(extractErrorMessage(err, "Erreur lors de la génération de l'aperçu")),
      }
    );
  };

  const handleSend = () => {
    if (!campaign) return;
    setSendError(null);
    sendCampaign.mutate(
      {
        campagneId: campaign.campagneId,
        variablesFixes: fixedTags.length ? sendFixes : undefined,
      },
      {
        onSuccess: (data) => {
          updateCampaignInRegistry(campaign.campagneId, {
            statut: data.statut,
            audience: data.audience,
          });
          message.success("Campagne envoyée");
          navigate(`/admin/campaigns/${campaign.campagneId}`);
        },
        onError: (err) => {
          if (getHttpStatus(err) === 409) setSendError(err);
          else message.error(extractErrorMessage(err, "Erreur lors de l'envoi de la campagne"));
        },
      }
    );
  };

  /* ----------------------------- steps ----------------------------- */

  const steps = [
    {
      title: "Canal & cible",
      content: (
        <Space direction="vertical" size={16} style={{ width: "100%", maxWidth: 420 }}>
          <div>
            <Text strong>Canal</Text>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              placeholder="WhatsApp ou Push"
              options={canalOptions}
              value={canal}
              disabled={locked}
              onChange={(v) => {
                setCanal(v);
                setTemplateId(undefined);
              }}
            />
          </div>
          <div>
            <Text strong>Cible</Text>
            <Select
              style={{ width: "100%", marginTop: 4 }}
              placeholder="Application concernée"
              options={cibleOptions}
              value={cible}
              disabled={locked}
              onChange={(v) => {
                setCible(v);
                setTemplateId(undefined);
                setMappingVariables({});
                setAudienceMode("filtre");
                setAudienceFiltre({});
                setAudienceRecipients([]);
              }}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Le provider est imposé par le canal : WhatsApp ⇔ Twilio, Push ⇔ notifications FCM (modèles
            gérés dans l'admin).
          </Text>
        </Space>
      ),
      canNext: !!canal && !!cible,
    },
    {
      title: "Template",
      content: (
        <Spin spinning={loadingTemplates}>
          {templates.length === 0 && !loadingTemplates ? (
            isPush ? (
              <Empty description="Aucun modèle push pour cette cible.">
                <Button icon={<FileTextOutlined />} onClick={() => navigate("/admin/campaign-templates")}>
                  Créer un modèle push
                </Button>
              </Empty>
            ) : (
              <Empty description="Aucun template pour ce canal / cette cible. Lancez d'abord une synchronisation.">
                <Button onClick={() => navigate("/admin/campaigns")}>Retour — synchroniser</Button>
              </Empty>
            )
          ) : (
            <Space direction="vertical" style={{ width: "100%" }}>
              {isPush && templates.some((t) => isPushTemplateBlocked(t, canal)) && (
                <Alert
                  type="warning"
                  showIcon
                  message="Certains modèles sont à réécrire"
                  description="Ils ont été convertis depuis OneSignal sans titre ou avec une syntaxe non supportée, et seraient refusés à l'envoi. Modifiez-les (titre et texte) pour pouvoir les choisir."
                />
              )}
              <Radio.Group
                style={{ width: "100%" }}
                value={templateId}
                disabled={locked}
                onChange={(e) => setTemplateId(e.target.value)}
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  {templates.map((tpl) => {
                    const blocked = isPushTemplateBlocked(tpl, canal);
                    return (
                      <Card key={tpl.templateId} size="small" style={{ width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <Radio value={tpl.templateId} disabled={blocked}>
                            <Space direction="vertical" size={0}>
                              <Text strong>{tpl.nom}</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {tpl.variables.length} variable(s) : {tpl.variables.map((v) => `{{${v}}}`).join(" ")}
                              </Text>
                            </Space>
                          </Radio>
                          <TemplateStatusBadge template={tpl} canal={canal} showEditLink />
                        </div>
                      </Card>
                    );
                  })}
                </Space>
              </Radio.Group>
              {isPush && (
                <Button
                  type="link"
                  icon={<FileTextOutlined />}
                  style={{ paddingLeft: 0 }}
                  onClick={() => navigate("/admin/campaign-templates")}
                >
                  Gérer les modèles push
                </Button>
              )}
            </Space>
          )}
        </Spin>
      ),
      canNext: !!templateId && !templateBlocked,
    },
    {
      title: "Mapping & audience",
      content: (
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div>
            <Divider orientation="left" plain style={{ marginTop: 0 }}>
              Mapping des variables
            </Divider>
            <VariableMappingList
              positions={positions}
              tags={tags}
              loadingTags={loadingTags}
              value={mappingVariables}
              onChange={setMappingVariables}
            />
            {!allPositionsMapped && positions.length > 0 && (
              <Text type="warning" style={{ fontSize: 12 }}>
                Toutes les positions doivent être mappées avant de continuer.
              </Text>
            )}
          </div>

          <div>
            <Divider orientation="left" plain>
              Audience
            </Divider>
            <Radio.Group
              value={audienceMode}
              onChange={(e) => setAudienceMode(e.target.value)}
              style={{ marginBottom: 12 }}
            >
              <Radio.Button value="filtre">Tous / par segment</Radio.Button>
              <Radio.Button value="manuel">Sélection manuelle</Radio.Button>
            </Radio.Group>

            {audienceMode === "filtre" && cible && (
              <AudienceFilterFields
                cible={cible}
                value={audienceFiltre}
                onChange={setAudienceFiltre}
              />
            )}
            {audienceMode === "manuel" && cible && (
              <AudienceRecipientsPicker
                cible={cible}
                value={audienceRecipients}
                onChange={setAudienceRecipients}
              />
            )}
          </div>

          <div>
            <Divider orientation="left" plain>
              Planification (optionnel)
            </Divider>
            <DatePicker
              showTime
              style={{ width: 260 }}
              placeholder="Envoyer immédiatement"
              value={planifieLe}
              disabledDate={(d) => !!d && d.isBefore(dayjs(), "day")}
              onChange={setPlanifieLe}
            />
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Sans date, la campagne reste en brouillon jusqu'à l'envoi manuel à
                l'étape suivante.
              </Text>
            </div>
          </div>
        </Space>
      ),
      canNext: allPositionsMapped && audienceValid,
    },
    {
      title: "Aperçu",
      content: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Alert
            type="info"
            showIcon
            message="Les valeurs fixes sont optionnelles ici (rendues vides si absentes). Elles seront obligatoires à l'envoi."
          />
          <FixedVariablesInputs
            fixedTags={fixedTags}
            value={previewFixes}
            onChange={setPreviewFixes}
          />
          <Button
            type="primary"
            ghost
            loading={previewCampaign.isLoading}
            onClick={handlePreview}
          >
            Générer l'aperçu
          </Button>

          {echantillon && (
            <List
              header={<Text strong>Échantillon ({echantillon.length})</Text>}
              bordered
              dataSource={echantillon}
              locale={{ emptyText: "Aucun destinataire dans l'échantillon" }}
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
        </Space>
      ),
      canNext: true,
    },
    {
      title: "Envoi",
      content: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {campaign?.statut === CampaignStatut.Planifiee ? (
            <Result
              status="success"
              title="Campagne planifiée"
              subTitle={
                <>
                  Elle sera envoyée automatiquement
                  {planifieLe ? ` le ${planifieLe.format("DD/MM/YYYY à HH:mm")}` : ""}. Vous
                  pouvez suivre son statut, ou forcer l'envoi depuis l'écran de suivi.
                </>
              }
              extra={
                <Button
                  type="primary"
                  onClick={() => navigate(`/admin/campaigns/${campaign.campagneId}`)}
                >
                  Aller au suivi
                </Button>
              }
            />
          ) : (
            <>
              {sendError != null && (
                <CampaignSendErrorAlert
                  error={sendError}
                  templateId={campaign?.templateId}
                  onClose={() => setSendError(null)}
                />
              )}
              <Alert
                type="warning"
                showIcon
                message="Une valeur est obligatoire pour chaque variable fixe référencée dans le mapping, sinon l'envoi est refusé (400)."
              />
              <FixedVariablesInputs
                fixedTags={fixedTags}
                value={sendFixes}
                onChange={setSendFixes}
                required
              />
              <Space>
                <Button
                  type="primary"
                  loading={sendCampaign.isLoading}
                  disabled={!allFixedSendFilled || noAudience}
                  onClick={handleSend}
                >
                  Envoyer maintenant
                </Button>
                <Button onClick={() => navigate("/admin/campaigns")}>
                  Terminer plus tard (brouillon)
                </Button>
              </Space>
            </>
          )}
        </Space>
      ),
      canNext: false,
    },
  ];

  const step = steps[current];

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/campaigns")}>
          Retour aux campagnes
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          Nouvelle campagne
        </Title>
      </Space>

      <Steps
        current={current}
        size="small"
        style={{ marginBottom: 24 }}
        items={steps.map((s) => ({ title: s.title }))}
      />

      {locked && current < 3 && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="La campagne est déjà créée : les étapes de configuration ne sont plus modifiables."
        />
      )}

      {canal && cible && current > 0 && (
        <Paragraph type="secondary" style={{ fontSize: 12 }}>
          {canalLabel[canal]} · {cibleLabel[cible]}
          {selectedTemplate ? ` · ${selectedTemplate.nom}` : ""}
        </Paragraph>
      )}

      {campaign && current >= 3 && (
        <Card size="small" style={{ marginBottom: 16 }}>
          {noAudience ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" size={2}>
                  <Text strong>Aucun destinataire</Text>
                  <Text type="secondary">
                    {PUSH_AUDIENCE_HINT} Personne dans cette audience n'a encore l'appli à jour : l'envoi
                    est désactivé.
                  </Text>
                </Space>
              }
            />
          ) : (
            <Space direction="vertical" size={2}>
              <Statistic title="Destinataires" value={campaign.audience} />
              {campaign.canal === CampaignCanal.Push && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {PUSH_AUDIENCE_HINT}
                </Text>
              )}
            </Space>
          )}
        </Card>
      )}

      <div style={{ minHeight: 240, marginBottom: 24 }}>{step.content}</div>

      <Space>
        {current > 0 && current < 3 && !locked && (
          <Button onClick={() => setCurrent((c) => c - 1)}>Précédent</Button>
        )}
        {current === 2 && (
          <Button
            type="primary"
            loading={createCampaign.isLoading}
            disabled={!step.canNext || locked}
            onClick={handleCreate}
          >
            Créer la campagne
          </Button>
        )}
        {current < 2 && (
          <Button
            type="primary"
            disabled={!step.canNext}
            onClick={() => setCurrent((c) => c + 1)}
          >
            Suivant
          </Button>
        )}
        {current === 3 && (
          <Button type="primary" onClick={() => setCurrent(4)}>
            Continuer vers l'envoi
          </Button>
        )}
        {current === 4 && campaign?.statut !== CampaignStatut.Planifiee && (
          <Button onClick={() => setCurrent(3)}>Revenir à l'aperçu</Button>
        )}
      </Space>
    </div>
  );
}
