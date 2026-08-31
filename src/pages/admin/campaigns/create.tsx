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
  Steps,
  Typography,
  message,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
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
import {
  FixedVariablesInputs,
  getFixedTagsFromMapping,
} from "@/components/admin/campaigns/FixedVariablesInputs";
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
  const [audienceFiltre, setAudienceFiltre] = useState<Record<string, string>>({});
  const [planifieLe, setPlanifieLe] = useState<Dayjs | null>(null);

  // Après création
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  // Étape 4 (aperçu) / 5 (envoi)
  const [previewFixes, setPreviewFixes] = useState<Record<string, string>>({});
  const [sendFixes, setSendFixes] = useState<Record<string, string>>({});
  const [echantillon, setEchantillon] = useState<CampaignPreviewItem[] | null>(null);

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

  const fixedTags = useMemo(
    () => getFixedTagsFromMapping(mappingVariables, tags),
    [mappingVariables, tags]
  );

  // vrai si le template ne déclare aucune variable, ou si toutes sont mappées
  const allPositionsMapped = positions.every((p) => !!mappingVariables[p]);

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
        audience: { filtre: audienceFiltre },
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
        onError: (err) =>
          message.error(extractErrorMessage(err, "Erreur lors de l'envoi de la campagne")),
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
                setAudienceFiltre({});
              }}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Le provider est imposé par le canal : WhatsApp ⇔ Twilio, Push ⇔ OneSignal.
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
            <Empty description="Aucun template pour ce canal / cette cible. Lancez d'abord une synchronisation.">
              <Button onClick={() => navigate("/admin/campaigns")}>Retour — synchroniser</Button>
            </Empty>
          ) : (
            <Radio.Group
              style={{ width: "100%" }}
              value={templateId}
              disabled={locked}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {templates.map((tpl) => (
                  <Card key={tpl.templateId} size="small" style={{ width: "100%" }}>
                    <Radio value={tpl.templateId}>
                      <Space direction="vertical" size={0}>
                        <Text strong>{tpl.nom}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {tpl.variables.length} variable(s) : {tpl.variables.map((v) => `{{${v}}}`).join(" ")}
                        </Text>
                      </Space>
                    </Radio>
                  </Card>
                ))}
              </Space>
            </Radio.Group>
          )}
        </Spin>
      ),
      canNext: !!templateId,
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
              Filtre d'audience
            </Divider>
            {cible && (
              <AudienceFilterFields
                cible={cible}
                value={audienceFiltre}
                onChange={setAudienceFiltre}
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
      canNext: allPositionsMapped,
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
                  disabled={!allFixedSendFilled}
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
