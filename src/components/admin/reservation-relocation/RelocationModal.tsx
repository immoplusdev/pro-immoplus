import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, App, Button, Checkbox, Descriptions, Form, Input, Modal, Select, Skeleton, Space, Steps, Typography } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { previewRelocation, relocateReservation, relocationQueryKeys } from "@/hooks/useReservationRelocation";
import {
  createRelocationConfirmation,
  formatFcfa,
  getRelocationErrorFeedback,
  type RelocationErrorFeedback,
} from "@/lib/helpers/reservation-relocation.helper";
import {
  RELOCATION_MOTIF_LABELS,
  RELOCATION_NOTE_MAX_LENGTH,
  RelocationMotif,
  type RelocationCandidate,
  type RelocationPreview,
  type RelocationRequestBody,
  type RelocationResult,
} from "@/types/reservation-relocation.types";
import { RelocationCandidatePicker } from "./RelocationCandidatePicker";
import { RelocationPreviewPanel } from "./RelocationPreviewPanel";

const { Text } = Typography;

type Step = 0 | 1 | 2;

interface FormValues {
  motif?: RelocationMotif;
  note?: string;
  forcerRegles?: boolean;
}

const MOTIF_OPTIONS = (Object.keys(RELOCATION_MOTIF_LABELS) as RelocationMotif[]).map((value) => ({
  value,
  label: RELOCATION_MOTIF_LABELS[value],
}));

interface Props {
  open: boolean;
  reservationId: string;
  currentResidenceId?: string | null;
  currentResidenceName?: string | null;
  onClose: () => void;
  /** Succès (y compris `replayed`) : recharger la réservation et l'historique. */
  onRelocated: (result: RelocationResult) => void;
  /** Statut changé entre-temps : recharger la réservation. */
  onReloadReservation: () => void;
  /** 403 : rôle non Admin, la fonctionnalité doit disparaître. */
  onForbidden: () => void;
}

/** Erreur métier affichée dans l'étape courante (message du back, complément, détails). */
function FeedbackAlert({ feedback, action }: { feedback: RelocationErrorFeedback; action?: React.ReactNode }) {
  return (
    <Alert
      type="error"
      showIcon
      message={feedback.message}
      action={action}
      description={
        feedback.hint || feedback.details.length > 0 ? (
          <Space direction="vertical" size={2}>
            {feedback.hint && <Text>{feedback.hint}</Text>}
            {feedback.details.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {feedback.details.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </Space>
        ) : undefined
      }
    />
  );
}

/** Parcours « Changer de résidence » en 3 étapes : résidence, motif + aperçu, confirmation. */
export function RelocationModal({
  open,
  reservationId,
  currentResidenceId,
  currentResidenceName,
  onClose,
  onRelocated,
  onReloadReservation,
  onForbidden,
}: Props) {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [step, setStep] = useState<Step>(0);
  const [candidate, setCandidate] = useState<RelocationCandidate | null>(null);
  const [stepError, setStepError] = useState<RelocationErrorFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const motif = Form.useWatch("motif", form);
  const note = Form.useWatch("note", form);
  const forcerRegles = !!Form.useWatch("forcerRegles", form);
  const formReady = !!motif && !!note?.trim() && note.trim().length <= RELOCATION_NOTE_MAX_LENGTH;

  // Motif et note sont lus au moment de l'appel : les modifier ne relance pas l'aperçu.
  const latestText = useRef({ motif, note });
  latestText.current = { motif, note };

  const confirmationRef = useRef(
    createRelocationConfirmation({ send: (payload, key) => relocateReservation(reservationId, payload, key) }),
  );

  const buildPayload = (): RelocationRequestBody | null => {
    const values = form.getFieldsValue(true) as FormValues;
    if (!candidate || !values.motif || !values.note?.trim()) return null;
    return {
      residenceId: candidate.id,
      motif: values.motif,
      note: values.note.trim(),
      forcerRegles: !!values.forcerRegles,
    };
  };

  // Aperçu relancé à chaque changement de résidence, de `forcerRegles` ou au retour sur l'onglet du navigateur.
  const previewQuery = useQuery<RelocationPreview>({
    queryKey: [...relocationQueryKeys.all, "preview", reservationId, candidate?.id ?? "", forcerRegles],
    queryFn: ({ signal }) =>
      previewRelocation(
        reservationId,
        {
          residenceId: candidate?.id ?? "",
          motif: latestText.current.motif as RelocationMotif,
          note: (latestText.current.note ?? "").trim(),
          forcerRegles,
        },
        signal,
      ),
    enabled: open && step >= 1 && !!candidate && formReady,
    retry: false,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true,
  });
  const previewFeedback = useMemo(
    () => (previewQuery.isError ? getRelocationErrorFeedback(previewQuery.error) : null),
    [previewQuery.isError, previewQuery.error],
  );

  const resetAll = () => {
    confirmationRef.current.reset();
    form.resetFields();
    setStep(0);
    setCandidate(null);
    setStepError(null);
  };

  const close = () => {
    if (submitting) return;
    resetAll();
    onClose();
  };

  /** Réaction commune aux refus du back (aperçu ou exécution). */
  const applyFeedback = (feedback: RelocationErrorFeedback) => {
    const text = feedback.hint ? `${feedback.message} — ${feedback.hint}` : feedback.message;
    switch (feedback.action) {
      case "back-to-step-1":
        setStep(0);
        setStepError(feedback);
        return;
      case "suggest-force":
        setStep(1);
        setStepError(feedback);
        return;
      case "close":
        message.error(text);
        resetAll();
        onClose();
        return;
      case "close-reload":
        message.warning(text);
        resetAll();
        onClose();
        onReloadReservation();
        return;
      case "hide":
        message.error(feedback.message);
        resetAll();
        onClose();
        onForbidden();
        return;
      default:
        setStepError(feedback);
    }
  };

  // Les refus de l'aperçu pilotent aussi le parcours (retour à l'étape 1, fermeture…).
  useEffect(() => {
    if (!previewFeedback || previewFeedback.action === "suggest-force" || previewFeedback.action === "stay") return;
    applyFeedback(previewFeedback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewQuery.errorUpdatedAt]);

  // Cocher / décocher « Ignorer les règles » relance l'aperçu : l'ancien refus n'est plus d'actualité.
  useEffect(() => {
    setStepError((current) => (current?.action === "suggest-force" ? null : current));
  }, [forcerRegles]);

  const selectCandidate = (next: RelocationCandidate) => {
    setCandidate(next);
    setStepError(null);
  };

  const goToStep2 = () => {
    if (!candidate) return;
    setStepError(null);
    setStep(1);
  };

  const goToStep3 = async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const payload = buildPayload();
    if (!payload || !previewQuery.data) return;
    // Clé générée à l'ouverture de l'étape 3, réutilisée pour tous les renvois.
    confirmationRef.current.open(payload);
    setStepError(null);
    setStep(2);
  };

  const runConfirm = async () => {
    setSubmitting(true);
    try {
      const outcome = await confirmationRef.current.confirm();
      if (outcome.status === "success") {
        const name = outcome.data.nouvelleResidence.nom ?? candidate?.nom ?? "la nouvelle résidence";
        message.success(`Client relogé dans ${name}`);
        resetAll();
        onClose();
        onRelocated(outcome.data);
        return;
      }
      if (outcome.status === "error") {
        if (outcome.feedback.action === "renew-key") {
          setStepError(outcome.feedback);
          openConfirmBox();
          return;
        }
        applyFeedback(outcome.feedback);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const preview = previewQuery.data;

  const recap = preview && (
    <Descriptions size="small" column={1} bordered>
      <Descriptions.Item label="Résidence">
        {currentResidenceName ?? preview.ancienneResidence.nom ?? "—"} → <Text strong>{preview.nouvelleResidence.nom}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Motif">{motif ? RELOCATION_MOTIF_LABELS[motif] : "—"}</Descriptions.Item>
      <Descriptions.Item label="Prix total">
        {formatFcfa(preview.ancienneResidence.montantTotal)} → {formatFcfa(preview.nouvelleResidence.montantTotal)}
      </Descriptions.Item>
      {preview.paid ? (
        <>
          {preview.remboursementClient > 0 && (
            <Descriptions.Item label="Remboursé au client">{formatFcfa(preview.remboursementClient)}</Descriptions.Item>
          )}
          {preview.absorbeImmoplus > 0 && (
            <Descriptions.Item label="Pris en charge par ImmoPlus">
              <Text type="danger">{formatFcfa(preview.absorbeImmoplus)}</Text>
            </Descriptions.Item>
          )}
        </>
      ) : (
        <Descriptions.Item label="À payer par le client">{formatFcfa(preview.nouvelleResidence.montantPaye)}</Descriptions.Item>
      )}
      {preview.reglesForcees && <Descriptions.Item label="Règles">Forcées</Descriptions.Item>}
    </Descriptions>
  );

  function openConfirmBox() {
    modal.confirm({
      title: "Confirmer le changement de résidence ?",
      icon: <SwapOutlined />,
      width: 560,
      content: (
        <Space direction="vertical" style={{ width: "100%" }}>
          {recap}
          <Text type="secondary">Le client et les propriétaires seront notifiés.</Text>
        </Space>
      ),
      okText: "Confirmer le changement",
      cancelText: "Annuler",
      onOk: runConfirm,
    });
  }

  const footer = (() => {
    const cancel = (
      <Button key="cancel" onClick={close} disabled={submitting}>
        Annuler
      </Button>
    );
    if (step === 0) {
      return [
        cancel,
        <Button key="next" type="primary" disabled={!candidate} onClick={goToStep2}>
          Suivant
        </Button>,
      ];
    }
    if (step === 1) {
      return [
        cancel,
        <Button key="back" onClick={() => setStep(0)}>
          Précédent
        </Button>,
        <Button
          key="next"
          type="primary"
          disabled={!formReady || !preview || previewQuery.isFetching}
          onClick={goToStep3}
        >
          Suivant
        </Button>,
      ];
    }
    return [
      cancel,
      <Button key="back" onClick={() => setStep(1)} disabled={submitting}>
        Précédent
      </Button>,
      <Button key="confirm" type="primary" danger loading={submitting} disabled={submitting} onClick={openConfirmBox}>
        Confirmer le changement
      </Button>,
    ];
  })();

  const previewBody = (() => {
    if (!formReady) {
      return <Alert type="info" showIcon message="Renseignez le motif et la note pour lancer l'aperçu." />;
    }
    if (previewQuery.isFetching && !preview) return <Skeleton active paragraph={{ rows: 6 }} />;
    if (previewFeedback && previewFeedback.action === "suggest-force") {
      return (
        <FeedbackAlert
          feedback={previewFeedback}
          action={
            <Button size="small" onClick={() => form.setFieldValue("forcerRegles", true)}>
              Ignorer les règles
            </Button>
          }
        />
      );
    }
    if (previewFeedback) {
      return (
        <FeedbackAlert
          feedback={previewFeedback}
          action={
            <Button size="small" onClick={() => previewQuery.refetch()}>
              Réessayer
            </Button>
          }
        />
      );
    }
    if (!preview) return null;
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        {previewQuery.isFetching && <Text type="secondary">Mise à jour de l'aperçu…</Text>}
        <RelocationPreviewPanel preview={preview} />
      </Space>
    );
  })();

  return (
    <Modal
      open={open}
      onCancel={close}
      title={
        <Space>
          <SwapOutlined />
          <span>Changer de résidence</span>
        </Space>
      }
      width={1040}
      maskClosable={false}
      closable={!submitting}
      keyboard={!submitting}
      destroyOnClose
      footer={footer}
    >
      <Steps
        current={step}
        size="small"
        style={{ marginBottom: 24 }}
        items={[{ title: "Nouvelle résidence" }, { title: "Motif et aperçu" }, { title: "Confirmation" }]}
      />

      {stepError && step !== 1 && <div style={{ marginBottom: 16 }}><FeedbackAlert feedback={stepError} /></div>}

      <div style={{ display: step === 0 ? "block" : "none" }}>
        {currentResidenceName && (
          <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
            Résidence actuelle : {currentResidenceName}
          </Text>
        )}
        <RelocationCandidatePicker
          reservationId={reservationId}
          currentResidenceId={currentResidenceId}
          selected={candidate}
          onSelect={selectCandidate}
        />
      </div>

      <div style={{ display: step === 1 ? "block" : "none" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {candidate && (
            <Text>
              Nouvelle résidence : <Text strong>{candidate.nom}</Text>
            </Text>
          )}
          <Form<FormValues> form={form} layout="vertical" initialValues={{ forcerRegles: false }}>
            <Form.Item name="motif" label="Motif" rules={[{ required: true, message: "Choisissez un motif" }]}>
              <Select placeholder="Choisir un motif" options={MOTIF_OPTIONS} />
            </Form.Item>
            <Form.Item
              name="note"
              label="Note interne (jamais montrée au client)"
              rules={[
                { required: true, whitespace: true, message: "La note est obligatoire" },
                { max: RELOCATION_NOTE_MAX_LENGTH, message: `${RELOCATION_NOTE_MAX_LENGTH} caractères maximum` },
              ]}
            >
              <Input.TextArea rows={3} showCount maxLength={RELOCATION_NOTE_MAX_LENGTH} />
            </Form.Item>
            <Form.Item name="forcerRegles" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Checkbox>Ignorer les règles de la résidence (préavis, durée, préparation)</Checkbox>
            </Form.Item>
          </Form>
          {stepError && step === 1 && !previewFeedback && <FeedbackAlert feedback={stepError} />}
          {previewBody}
        </Space>
      </div>

      {step === 2 && (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {recap}
          <Text type="secondary">
            Même réservation, mêmes dates et mêmes paiements : seule la résidence change. Le client et les propriétaires
            sont notifiés par ImmoPlus.
          </Text>
        </Space>
      )}
    </Modal>
  );
}
