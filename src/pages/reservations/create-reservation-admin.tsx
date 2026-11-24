import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Form,
  Input,
  InputNumber,
  Result,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import { ArrowLeftOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  adminReservationCreationKeys,
  createAdminReservation,
  previewAdminReservation,
} from "@/hooks/useAdminReservationCreation";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  buildCreationPayload,
  createAdminReservationSubmission,
  formatFcfa,
  getCreationErrorFeedback,
  isResidenceBookable,
  noteAdminError,
  previewTriggerKey,
  usesOverride,
  validateCreationForm,
  type AdminReservationFormField,
  type AdminReservationFormValues,
  type AdminReservationSubmission,
  type CreationErrorFeedback,
} from "@/lib/helpers/admin-reservation-creation.helper";
import {
  ADMIN_RESERVATION_MANUAL_PRICE_MAX,
  ADMIN_RESERVATION_MANUAL_PRICE_MIN,
  ADMIN_RESERVATION_NOTE_ADMIN_MAX_LENGTH,
  ADMIN_RESERVATION_NOTES_MAX_LENGTH,
  ADMIN_RESERVATION_PAYMENT_DELAY_MAX,
  ADMIN_RESERVATION_PAYMENT_DELAY_MIN,
  MAX_ACTIVE_RESERVATIONS_PER_CLIENT,
  type AdminReservationClient,
  type AdminReservationPreview,
  type AdminReservationResidence,
} from "@/types/admin-reservation-creation.types";
import { ClientPicker } from "@/components/admin/reservation-creation/ClientPicker";
import { ResidencePicker } from "@/components/admin/reservation-creation/ResidencePicker";
import { NightsPicker } from "@/components/admin/reservation-creation/NightsPicker";
import { CreationPreviewPanel } from "@/components/admin/reservation-creation/CreationPreviewPanel";
import { CreationFeedbackAlert } from "@/components/admin/reservation-creation/CreationFeedbackAlert";

const { Title, Text } = Typography;

const PREVIEW_DEBOUNCE_MS = 400;
const OPTIONS_PANEL = "options";

/** Règle antd branchée sur `validateCreationForm` : une seule source de vérité pour les messages. */
const helperRule = (field: AdminReservationFormField) => ({ getFieldsValue }: { getFieldsValue: (all: true) => unknown }) => ({
  validator: () => {
    const error = validateCreationForm(getFieldsValue(true) as AdminReservationFormValues).find((e) => e.field === field);
    return error ? Promise.reject(new Error(error.message)) : Promise.resolve();
  },
});

/**
 * « Créer une réservation pour un client » (rôle Admin) : client, résidence et nuits, options,
 * aperçu sans écriture, puis création idempotente. Le client paie dans l'app.
 */
export function CreateReservationAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const initialClientId = searchParams.get("clientId");

  const [form] = Form.useForm<AdminReservationFormValues>();
  const watched = Form.useWatch((values: AdminReservationFormValues) => values, form);
  const values: AdminReservationFormValues = useMemo(() => watched ?? {}, [watched]);

  const [residence, setResidence] = useState<AdminReservationResidence | null>(null);
  const [optionsOpen, setOptionsOpen] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<CreationErrorFeedback | null>(null);
  const [forbidden, setForbidden] = useState(false);

  // Une clé d'idempotence par formulaire, générée à l'ouverture de l'écran.
  const submissionRef = useRef<AdminReservationSubmission>();
  if (!submissionRef.current) submissionRef.current = createAdminReservationSubmission({ send: createAdminReservation });
  const submission = submissionRef.current;

  // ─── Aperçu ────────────────────────────────────────────────────────────────
  const triggerKey = previewTriggerKey(values);
  const debouncedKey = useDebouncedValue(triggerKey, PREVIEW_DEBOUNCE_MS);
  const formErrors = validateCreationForm(values);
  const payloadReady = !!buildCreationPayload(values) && formErrors.length === 0;
  const previewQuery = useQuery<AdminReservationPreview>({
    queryKey: adminReservationCreationKeys.preview(debouncedKey),
    // Le contenu (dont `notes` et `noteAdmin`) est lu au moment de l'appel.
    queryFn: ({ signal }) => {
      const payload = buildCreationPayload(form.getFieldsValue(true));
      if (!payload) throw new Error("Formulaire incomplet");
      return previewAdminReservation(payload, signal);
    },
    enabled: payloadReady && debouncedKey === triggerKey && !forbidden,
    retry: false,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
  });
  const previewFeedback = useMemo(
    () => (previewQuery.isError ? getCreationErrorFeedback(previewQuery.error) : null),
    [previewQuery.isError, previewQuery.error],
  );
  const previewUpToDate = debouncedKey === triggerKey && !previewQuery.isFetching;
  const preview = previewUpToDate && !previewQuery.isError ? previewQuery.data : undefined;
  const canCreate = payloadReady && !!preview && !submitting;

  // Le contenu a changé : l'ancienne erreur d'envoi n'est plus d'actualité.
  const contentKey = useMemo(() => JSON.stringify(buildCreationPayload(values)), [values]);
  useEffect(() => {
    setSubmitError((current) => (current?.action === "retry-same-key" || current?.action === "key-reused" ? current : null));
  }, [contentKey]);

  // ─── Réactions aux refus du back ───────────────────────────────────────────
  const focusField = (field: AdminReservationFormField) => {
    form.scrollToField(field);
    (form.getFieldInstance(field) as { focus?: () => void } | undefined)?.focus?.();
  };

  const openOptionsAndFocusNote = () => {
    setOptionsOpen([OPTIONS_PANEL]);
    // Le panneau est rendu d'avance (forceRender) : le champ existe déjà.
    setTimeout(() => {
      form.validateFields(["noteAdmin"]).catch(() => undefined);
      focusField("noteAdmin");
    }, 0);
  };

  const enableOverride = (field: "forcerRegles" | "ignorerLimiteReservations") => {
    form.setFieldValue(field, true);
    openOptionsAndFocusNote();
  };

  const applyFeedback = (feedback: CreationErrorFeedback) => {
    switch (feedback.action) {
      case "pick-client":
        form.setFields([{ name: "clientId", errors: [feedback.message] }]);
        focusField("clientId");
        return;
      case "pick-residence":
        form.setFields([{ name: "residenceId", errors: [feedback.message] }]);
        focusField("residenceId");
        return;
      case "change-dates":
        // Seules les dates prises sont rechargées (invalider l'aperçu relancerait la même erreur en boucle).
        queryClient.invalidateQueries([...adminReservationCreationKeys.all, "occupied-dates"]);
        form.setFields([{ name: "nights", errors: [feedback.hint ?? feedback.message] }]);
        return;
      case "focus-note-admin":
        openOptionsAndFocusNote();
        return;
      case "hide":
        setForbidden(true);
        return;
      default:
    }
  };

  useEffect(() => {
    if (previewFeedback) applyFeedback(previewFeedback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewQuery.errorUpdatedAt]);

  // ─── Création ──────────────────────────────────────────────────────────────
  // Verrou posé dès le clic (avant la validation asynchrone du formulaire) : un double clic
  // n'envoie qu'une requête. Le serveur protège de toute façon grâce à la même Idempotency-Key.
  const clickLockRef = useRef(false);
  const runCreate = async () => {
    if (clickLockRef.current || submission.isSubmitting()) return;
    clickLockRef.current = true;
    setSubmitting(true);
    try {
      try {
        await form.validateFields();
      } catch {
        return;
      }
      const payload = buildCreationPayload(form.getFieldsValue(true));
      if (!payload || !preview) return;
      const outcome = await submission.submit(payload);
      if (outcome.status === "ignored") return;
      if (outcome.status === "success") {
        const reservationId = outcome.data.reservation?.id;
        if (outcome.data.replayed) message.info("Cette réservation avait déjà été créée : voici sa fiche.");
        else message.success("Réservation créée. Le client est prévenu par push et paiera dans l'app.");
        queryClient.invalidateQueries(adminReservationCreationKeys.trace(String(reservationId)));
        navigate(`/reservations/edit/${reservationId}`, { replace: true });
        return;
      }
      setSubmitError(outcome.feedback);
      applyFeedback(outcome.feedback);
    } finally {
      clickLockRef.current = false;
      setSubmitting(false);
    }
  };

  const restartWithNewKey = () => {
    submission.renewKey();
    setSubmitError(null);
  };

  const resetForm = () => {
    form.resetFields();
    setResidence(null);
    setSubmitError(null);
    setOptionsOpen([]);
    // Nouvelle création : nouvelle clé.
    submission.reset();
  };

  if (forbidden) {
    return (
      <Result
        status="403"
        title="Accès refusé"
        subTitle="La création de réservation est réservée aux administrateurs."
        extra={
          <Button type="primary" onClick={() => navigate("/reservations")}>
            Retour aux réservations
          </Button>
        }
      />
    );
  }

  // ─── Rendu ─────────────────────────────────────────────────────────────────
  const overrideUsed = usesOverride(values);
  const noteError = noteAdminError(values);

  const previewBody = (() => {
    if (!buildCreationPayload(values)) {
      return <Alert type="info" showIcon message="Choisissez un client, une résidence et des nuits pour voir l'aperçu." />;
    }
    if (formErrors.length > 0) {
      return (
        <Alert
          type="warning"
          showIcon
          message="Complétez le formulaire pour mettre à jour l'aperçu"
          description={
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {formErrors.map((e) => (
                <li key={e.field}>{e.message}</li>
              ))}
            </ul>
          }
        />
      );
    }
    if (previewFeedback && previewUpToDate) {
      const action =
        previewFeedback.action === "suggest-force" ? (
          <Button size="small" onClick={() => enableOverride("forcerRegles")}>
            Forcer les règles
          </Button>
        ) : previewFeedback.action === "suggest-ignore-limit" ? (
          <Button size="small" onClick={() => enableOverride("ignorerLimiteReservations")}>
            Ignorer la limite
          </Button>
        ) : (
          <Button size="small" onClick={() => previewQuery.refetch()}>
            Réessayer
          </Button>
        );
      return <CreationFeedbackAlert feedback={previewFeedback} action={action} />;
    }
    if (!preview) return <Skeleton active paragraph={{ rows: 8 }} />;
    return <CreationPreviewPanel preview={preview} />;
  })();

  const submitErrorAction = (() => {
    if (!submitError) return undefined;
    if (submitError.action === "retry-same-key")
      return (
        <Button size="small" icon={<ReloadOutlined />} loading={submitting} onClick={runCreate}>
          Réessayer
        </Button>
      );
    if (submitError.action === "key-reused")
      return (
        <Button size="small" danger onClick={restartWithNewKey}>
          Recommencer avec une nouvelle clé
        </Button>
      );
    if (submitError.action === "suggest-force")
      return (
        <Button size="small" onClick={() => enableOverride("forcerRegles")}>
          Forcer les règles
        </Button>
      );
    if (submitError.action === "suggest-ignore-limit")
      return (
        <Button size="small" onClick={() => enableOverride("ignorerLimiteReservations")}>
          Ignorer la limite
        </Button>
      );
    return undefined;
  })();

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <Space style={{ marginBottom: 16 }} align="start">
        <Button type="text" icon={<ArrowLeftOutlined />} aria-label="Retour" onClick={() => navigate(-1)} />
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Créer une réservation pour un client
          </Title>
          <Text type="secondary">
            Demande reçue par téléphone ou WhatsApp : la réservation suit le même parcours que dans l'app.
          </Text>
        </div>
      </Space>

      <Form<AdminReservationFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          clientId: initialClientId,
          nights: [],
          forcerRegles: false,
          ignorerLimiteReservations: false,
          prixManuel: null,
          delaiPaiementMinutes: null,
        }}
        onValuesChange={(changed: Partial<AdminReservationFormValues>) => {
          // Autre résidence : les nuits choisies ne valent plus (autres dates prises).
          if ("residenceId" in changed) form.setFieldValue("nights", []);
        }}
        disabled={submitting}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Card size="small" title="1. Client">
                <Form.Item
                  name="clientId"
                  label="Client existant"
                  extra="On ne crée pas de compte ici : le client doit déjà avoir un compte ImmoPlus."
                  rules={[helperRule("clientId")]}
                  getValueFromEvent={(client: AdminReservationClient | null) => client?.id ?? null}
                  style={{ marginBottom: 0 }}
                >
                  <ClientPicker />
                </Form.Item>
              </Card>

              <Card size="small" title="2. Résidence et nuits">
                <Form.Item
                  name="residenceId"
                  label="Résidence"
                  rules={[helperRule("residenceId")]}
                  getValueFromEvent={(next: AdminReservationResidence | null) => {
                    setResidence(next);
                    return next?.id ?? null;
                  }}
                >
                  <ResidencePicker />
                </Form.Item>
                {residence && !isResidenceBookable(residence) && (
                  <Alert
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="Cette résidence n'est pas validée ou pas disponible : l'API refusera la réservation."
                  />
                )}
                <Form.Item
                  name="nights"
                  label="Nuits"
                  rules={[helperRule("nights")]}
                  style={{ marginBottom: 0 }}
                >
                  <NightsPicker residenceId={values.residenceId ?? null} />
                </Form.Item>
              </Card>

              <Collapse
                activeKey={optionsOpen}
                onChange={(keys) => setOptionsOpen(Array.isArray(keys) ? keys : [keys])}
                items={[
                  {
                    key: OPTIONS_PANEL,
                    label: (
                      <Space>
                        <span>3. Options</span>
                        {overrideUsed && <Text type="warning">(contournement utilisé)</Text>}
                      </Space>
                    ),
                    forceRender: true,
                    children: (
                      <>
                        <Form.Item
                          name="notes"
                          label="Note visible par le client"
                          extra="Apparaît sur la réservation comme une note du client."
                          rules={[helperRule("notes")]}
                        >
                          <Input.TextArea rows={2} showCount maxLength={ADMIN_RESERVATION_NOTES_MAX_LENGTH} />
                        </Form.Item>
                        <Form.Item
                          name="prixManuel"
                          label="Prix manuel de l'hébergement (hors frais)"
                          extra={
                            preview
                              ? `Prix calculé pour ces nuits : ${formatFcfa(preview.prixCalcule)}. Commission et frais sont recalculés sur le prix manuel.`
                              : "Laissez vide pour appliquer le tarif de la résidence. Commission et frais sont recalculés sur ce montant."
                          }
                          rules={[helperRule("prixManuel")]}
                        >
                          <InputNumber<number>
                            min={ADMIN_RESERVATION_MANUAL_PRICE_MIN}
                            max={ADMIN_RESERVATION_MANUAL_PRICE_MAX}
                            precision={0}
                            step={1000}
                            addonAfter="FCFA"
                            placeholder={preview ? String(preview.prixCalcule) : "Tarif de la résidence"}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                        <Form.Item name="forcerRegles" valuePropName="checked" style={{ marginBottom: 8 }}>
                          <Checkbox>Forcer les règles de séjour (durée, préavis, horizon)</Checkbox>
                        </Form.Item>
                        <Form.Item name="ignorerLimiteReservations" valuePropName="checked">
                          <Checkbox>
                            Ignorer la limite de {MAX_ACTIVE_RESERVATIONS_PER_CLIENT} réservations actives
                          </Checkbox>
                        </Form.Item>
                        <Form.Item
                          name="delaiPaiementMinutes"
                          label="Délai de paiement du client (minutes)"
                          extra="Utilisé seulement si la réservation part directement en attente de paiement. Vide : réglage par défaut de l'app."
                          rules={[helperRule("delaiPaiementMinutes")]}
                        >
                          <InputNumber<number>
                            min={ADMIN_RESERVATION_PAYMENT_DELAY_MIN}
                            max={ADMIN_RESERVATION_PAYMENT_DELAY_MAX}
                            precision={0}
                            addonAfter="min"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                        <Form.Item
                          name="noteAdmin"
                          label="Note interne (jamais montrée au client)"
                          required={overrideUsed}
                          dependencies={["forcerRegles", "ignorerLimiteReservations", "prixManuel"]}
                          rules={[helperRule("noteAdmin")]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input.TextArea rows={3} showCount maxLength={ADMIN_RESERVATION_NOTE_ADMIN_MAX_LENGTH} />
                        </Form.Item>
                      </>
                    ),
                  },
                ]}
              />
              {overrideUsed && noteError && !optionsOpen.includes(OPTIONS_PANEL) && (
                <Alert type="warning" showIcon message={noteError} />
              )}
            </Space>
          </Col>

          <Col xs={24} lg={10}>
            <Card
              size="small"
              title="4. Aperçu"
              style={{ position: "sticky", top: 16 }}
              extra={previewQuery.isFetching ? <Text type="secondary">Mise à jour…</Text> : null}
            >
              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                {previewBody}
                <Alert
                  type="info"
                  showIcon
                  message="Aucun paiement n'est encaissé depuis le backoffice"
                  description="Le client sera prévenu par push et paiera dans l'app ImmoPlus."
                />
                {submitError && <CreationFeedbackAlert feedback={submitError} action={submitErrorAction} />}
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    loading={submitting}
                    disabled={!canCreate}
                    onClick={runCreate}
                  >
                    Créer la réservation
                  </Button>
                  <Button onClick={resetForm} disabled={submitting}>
                    Nouvelle création
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
