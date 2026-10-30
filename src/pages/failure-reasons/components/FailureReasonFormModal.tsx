import React, { useEffect } from "react";
import {
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Switch,
  Typography,
  type FormInstance,
  type FormProps,
  type ModalProps,
} from "antd";
import {
  FAILURE_REASON_CODE_MAX_LENGTH,
  FAILURE_REASON_CODE_PATTERN,
  FAILURE_REASON_DISPLAY_ORDER_MAX,
  FAILURE_REASON_LABEL_MAX_LENGTH,
  normalizeCodeInput,
  toCreatePayload,
  toUpdatePayload,
} from "../api";
import { IMMUTABLE_FIELDS_HELP, SYSTEM_LOCK_MESSAGE, canToggleStatus } from "../rules";
import { ACTOR_LABELS } from "../labels";
import type { FailureReason, FailureReasonActor, FailureReasonFormValues } from "../types";

interface FailureReasonFormModalProps {
  mode: "create" | "edit";
  /** Onglet courant : acteur du motif créé. */
  actor: FailureReasonActor;
  /** Motif édité (mode `edit`). */
  record?: FailureReason;
  modalProps: ModalProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formProps: FormProps<any>;
  form: FormInstance;
}

/** Modale d'ajout / modification, branchée sur `useModalForm`. */
export const FailureReasonFormModal: React.FC<FailureReasonFormModalProps> = ({
  mode,
  actor,
  record,
  modalProps,
  formProps,
  form,
}) => {
  const isEdit = mode === "edit";
  const statusLocked = isEdit && record ? !canToggleStatus(record) : false;

  const initialValues: FailureReasonFormValues = isEdit
    ? { label: record?.label, displayOrder: record?.displayOrder, isActive: record?.isActive }
    : { actor, isActive: true };

  // Pas de GET /:id côté back : le formulaire d'édition est rempli depuis la ligne.
  useEffect(() => {
    if (modalProps.open) form.resetFields();
  }, [modalProps.open, record?.id, actor, form]);

  const handleFinish = (values: FailureReasonFormValues) =>
    formProps.onFinish?.(isEdit ? toUpdatePayload(values, record) : toCreatePayload(values, actor));

  return (
    <Modal
      {...modalProps}
      title={isEdit ? "Modifier le motif" : "Ajouter un motif"}
      width={560}
      okText="Enregistrer"
      cancelText="Annuler"
      forceRender
    >
      <Form
        {...formProps}
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={(values) => handleFinish(values as FailureReasonFormValues)}
      >
        {isEdit ? (
          <>
            <Descriptions size="small" column={1} bordered>
              <Descriptions.Item label="Code">{record?.code}</Descriptions.Item>
              <Descriptions.Item label="Acteur">{record ? ACTOR_LABELS[record.actor] : null}</Descriptions.Item>
            </Descriptions>
            <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
              {IMMUTABLE_FIELDS_HELP}
            </Typography.Paragraph>
          </>
        ) : (
          <>
            <Form.Item name="actor" hidden>
              <Input />
            </Form.Item>
            <Form.Item
              name="code"
              label="Code"
              normalize={normalizeCodeInput}
              extra="Majuscules, chiffres et _ uniquement. Non modifiable après création."
              rules={[
                { required: true, message: "Le code est obligatoire" },
                { pattern: FAILURE_REASON_CODE_PATTERN, message: "Majuscules, chiffres et _ uniquement" },
                { max: FAILURE_REASON_CODE_MAX_LENGTH, message: `${FAILURE_REASON_CODE_MAX_LENGTH} caractères maximum` },
              ]}
            >
              <Input maxLength={FAILURE_REASON_CODE_MAX_LENGTH} placeholder="BUDGET_INSUFFISANT" autoComplete="off" />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="label"
          label="Libellé"
          rules={[
            { required: true, whitespace: true, message: "Le libellé est obligatoire" },
            { max: FAILURE_REASON_LABEL_MAX_LENGTH, message: `${FAILURE_REASON_LABEL_MAX_LENGTH} caractères maximum` },
          ]}
        >
          <Input showCount maxLength={FAILURE_REASON_LABEL_MAX_LENGTH} />
        </Form.Item>

        <Form.Item
          name="displayOrder"
          label="Ordre d'affichage"
          extra={isEdit ? undefined : "Facultatif : par défaut, le motif est ajouté en dernier."}
        >
          <InputNumber min={1} max={FAILURE_REASON_DISPLAY_ORDER_MAX} precision={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Actif"
          valuePropName="checked"
          extra={statusLocked ? SYSTEM_LOCK_MESSAGE : undefined}
        >
          <Switch disabled={statusLocked} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
