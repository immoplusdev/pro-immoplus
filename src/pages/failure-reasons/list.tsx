import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DateField, EditButton, List, useModalForm, useTable } from "@refinedev/antd";
import { useDelete, type HttpError } from "@refinedev/core";
import { App, Button, Empty, Result, Space, Table, Tabs, Tag, Tooltip, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  FAILURE_REASONS_RESOURCE,
  FAILURE_REASON_ACTORS,
  errorNotification,
  getFailureReasonErrorCode,
  getFormFieldErrors,
  getUsageCountFromError,
  moveFailureReason,
  parseActor,
} from "./api";
import { useReorderFailureReasons, useSetFailureReasonStatus } from "./hooks";
import { ACTOR_LABELS } from "./labels";
import { INACTIVE_INFO_MESSAGE, SYSTEM_LOCK_MESSAGE, canDelete, getDeleteDecision, inUseMessage } from "./rules";
import { DragHandle, SortableRow, SortingDisabledContext } from "./components/SortableRow";
import { StatusSwitch } from "./components/StatusSwitch";
import { FailureReasonFormModal } from "./components/FailureReasonFormModal";
import type { FailureReason, FailureReasonActor, FailureReasonFormValues } from "./types";

const DEFAULT_ACTOR: FailureReasonActor = "CLIENT";

const isInUseError = (error: unknown) => getFailureReasonErrorCode(error) === "FAILURE_REASON_IN_USE";

/** Motifs d'échec proposés au client et au pro (Admin uniquement : route sous AdminRoute, 403 du back sinon). */
export const FailureReasonList: React.FC = () => {
  const { modal } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const actor = parseActor(searchParams.get("actor")) ?? DEFAULT_ACTOR;

  // L'onglet courant est toujours lisible dans l'URL.
  useEffect(() => {
    if (searchParams.get("actor") !== actor) {
      setSearchParams(
        (prev) => {
          prev.set("actor", actor);
          return prev;
        },
        { replace: true }
      );
    }
  }, [actor, searchParams, setSearchParams]);

  const { tableProps, tableQuery } = useTable<FailureReason, HttpError>({
    resource: FAILURE_REASONS_RESOURCE,
    syncWithLocation: false,
    pagination: { mode: "off" },
    sorters: { mode: "off" },
    filters: {
      permanent: [
        { field: "actor", operator: "eq", value: actor },
        { field: "includeInactive", operator: "eq", value: true },
      ],
    },
    // Erreur de chargement affichée dans la page (Result), pas en notification.
    errorNotification: false,
  });

  const serverItems = tableQuery.data?.data;

  // Ordre local (glisser-déposer) en attendant la liste renvoyée par le serveur.
  const [orderOverride, setOrderOverride] = useState<FailureReason[] | null>(null);
  useEffect(() => setOrderOverride(null), [serverItems]);
  const items = useMemo(() => orderOverride ?? serverItems ?? [], [orderOverride, serverItems]);

  const setStatus = useSetFailureReasonStatus();
  const { reorder, isReordering } = useReorderFailureReasons();
  const { mutate: deleteOne } = useDelete();

  const createModal = useModalForm<FailureReason, HttpError, FailureReasonFormValues>({
    resource: FAILURE_REASONS_RESOURCE,
    action: "create",
    redirect: false,
    successNotification: { type: "success", message: "Motif ajouté" },
    // Le 409 sur le code est affiché sous le champ, sans notification en plus.
    errorNotification: errorNotification("Impossible d'ajouter le motif", (error) => !!getFormFieldErrors(error)),
    onMutationError: (error) => {
      const fields = getFormFieldErrors(error);
      if (fields) createModal.form.setFields(fields);
    },
  });

  const [editingRecord, setEditingRecord] = useState<FailureReason>();
  const editModal = useModalForm<FailureReason, HttpError, FailureReasonFormValues>({
    resource: FAILURE_REASONS_RESOURCE,
    action: "edit",
    redirect: false,
    mutationMode: "pessimistic",
    // Pas de GET /:id : le formulaire est rempli depuis la ligne.
    queryOptions: { enabled: false },
    successNotification: { type: "success", message: "Motif modifié" },
    errorNotification: errorNotification("Impossible de modifier le motif"),
  });

  const openEdit = (record: FailureReason) => {
    setEditingRecord(record);
    editModal.show(record.id);
  };

  const proposeDeactivation = (record: FailureReason, usageCount: number, alreadyInactive = !record.isActive) => {
    if (alreadyInactive) {
      modal.info({
        title: "Suppression impossible",
        content: `Ce motif a été utilisé ${usageCount} fois : il ne peut pas être supprimé. Il est déjà inactif.`,
        okText: "Fermer",
      });
      return;
    }
    modal.confirm({
      title: "Suppression impossible",
      content: inUseMessage(usageCount),
      okText: "Désactiver",
      cancelText: "Annuler",
      onOk: () => setStatus(record, false),
    });
  };

  const handleDelete = (record: FailureReason) => {
    const decision = getDeleteDecision(record);
    if (decision.kind === "locked") return;
    if (decision.kind === "deactivate-instead") {
      proposeDeactivation(record, decision.usageCount, decision.alreadyInactive);
      return;
    }

    modal.confirm({
      title: "Supprimer ce motif ?",
      content: (
        <Space direction="vertical" size={4}>
          <Typography.Text code>{record.code}</Typography.Text>
          <Typography.Text>{record.label}</Typography.Text>
          <Typography.Text type="secondary">Cette action est irréversible.</Typography.Text>
        </Space>
      ),
      okText: "Supprimer",
      okButtonProps: { danger: true },
      cancelText: "Annuler",
      onOk: () =>
        new Promise<void>((resolve) => {
          deleteOne(
            {
              resource: FAILURE_REASONS_RESOURCE,
              id: record.id,
              mutationMode: "pessimistic",
              successNotification: { type: "success", message: "Motif supprimé" },
              errorNotification: errorNotification("Impossible de supprimer le motif", isInUseError),
            },
            {
              onSuccess: () => resolve(),
              onError: (error) => {
                resolve();
                // Utilisé entre-temps : même proposition de désactivation.
                if (isInUseError(error)) {
                  proposeDeactivation(record, getUsageCountFromError(error) ?? record.usageCount, false);
                }
              },
            }
          );
        }),
    });
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 1 } }));

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || isReordering) return;
    const next = moveFailureReason(items, String(active.id), String(over.id));
    setOrderOverride(next);
    const result = await reorder(actor, next);
    setOrderOverride(result.ok ? result.items : null);
  };

  const error = tableQuery.error;

  if (error?.statusCode === 403) {
    return <Result status="403" title="Accès refusé" subTitle="La gestion des motifs d'échec est réservée aux administrateurs." />;
  }

  return (
    <List
      title="Motifs d'échec"
      headerButtons={[
        <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => createModal.show()}>
          Ajouter un motif
        </Button>,
      ]}
    >
      <Typography.Paragraph type="secondary">
        Motifs proposés lorsqu'une réservation échoue. Glissez les lignes pour changer l'ordre d'affichage.{" "}
        {INACTIVE_INFO_MESSAGE}.
      </Typography.Paragraph>

      <Tabs
        activeKey={actor}
        onChange={(key) =>
          setSearchParams((prev) => {
            prev.set("actor", key);
            return prev;
          })
        }
        items={FAILURE_REASON_ACTORS.map((key) => ({ key, label: ACTOR_LABELS[key] }))}
      />

      {error ? (
        <Result
          status="error"
          title="Impossible de charger les motifs"
          subTitle={error.message}
          extra={
            <Button type="primary" onClick={() => tableQuery.refetch()}>
              Réessayer
            </Button>
          }
        />
      ) : (
        <SortingDisabledContext.Provider value={isReordering}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <Table<FailureReason>
                {...tableProps}
                dataSource={items}
                rowKey="id"
                size="middle"
                pagination={false}
                components={{ body: { row: SortableRow } }}
                rowClassName={(record) => (record.isActive ? "" : "failure-reason-row--inactive")}
                locale={{ emptyText: <Empty description="Aucun motif pour cet acteur" /> }}
              >
                <Table.Column key="sort" width={48} align="center" render={() => <DragHandle />} />
                <Table.Column<FailureReason>
                  dataIndex="code"
                  title="Code"
                  render={(code: string) => <Typography.Text code>{code}</Typography.Text>}
                />
                <Table.Column<FailureReason>
                  dataIndex="label"
                  title="Libellé"
                  render={(label: string, record) => (
                    <Space size={4} wrap>
                      <span>{label}</span>
                      {record.isSystem && <Tag color="purple">Système</Tag>}
                      {!record.isActive && <Tag>Inactif</Tag>}
                    </Space>
                  )}
                />
                <Table.Column<FailureReason> dataIndex="displayOrder" title="Ordre" width={80} align="center" />
                <Table.Column<FailureReason>
                  dataIndex="isActive"
                  title="Statut"
                  width={90}
                  align="center"
                  render={(_, record) => <StatusSwitch reason={record} onChange={setStatus} />}
                />
                <Table.Column<FailureReason>
                  dataIndex="usageCount"
                  title="Utilisations"
                  width={110}
                  align="center"
                  render={(count: number) =>
                    count > 0 ? <Tag color="blue">{count}</Tag> : <Typography.Text type="secondary">0</Typography.Text>
                  }
                />
                <Table.Column<FailureReason>
                  dataIndex="updatedAt"
                  title="Modifié le"
                  width={150}
                  render={(value: string) => <DateField value={value} format="DD/MM/YYYY HH:mm" />}
                />
                <Table.Column<FailureReason>
                  key="actions"
                  title="Actions"
                  width={100}
                  align="center"
                  render={(_, record) => (
                    <Space>
                      <EditButton
                        hideText
                        size="small"
                        resource={FAILURE_REASONS_RESOURCE}
                        recordItemId={record.id}
                        onClick={() => openEdit(record)}
                      />
                      <Tooltip title={canDelete(record) ? "Supprimer" : SYSTEM_LOCK_MESSAGE}>
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          aria-label={`Supprimer le motif ${record.code}`}
                          disabled={!canDelete(record)}
                          onClick={() => handleDelete(record)}
                        />
                      </Tooltip>
                    </Space>
                  )}
                />
              </Table>
            </SortableContext>
          </DndContext>
        </SortingDisabledContext.Provider>
      )}

      <FailureReasonFormModal
        mode="create"
        actor={actor}
        modalProps={createModal.modalProps}
        formProps={createModal.formProps}
        form={createModal.form}
      />
      <FailureReasonFormModal
        mode="edit"
        actor={actor}
        record={editingRecord}
        modalProps={editModal.modalProps}
        formProps={editModal.formProps}
        form={editModal.form}
      />
    </List>
  );
};
