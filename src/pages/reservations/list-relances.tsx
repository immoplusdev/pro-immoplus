import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { App, Button, Space, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useUrlFilters } from "@/components/admin/common/useUrlFilters";
import { ApiErrorAlert } from "@/components/admin/common/ApiErrorAlert";
import { RemindersFilters } from "@/components/admin/reservation-reminders/RemindersFilters";
import { RemindersStats } from "@/components/admin/reservation-reminders/RemindersStats";
import { RemindersTable } from "@/components/admin/reservation-reminders/RemindersTable";
import { useAdminReminders, usePaidRemindersCount } from "@/hooks/useReservationReminders";
import { extractErrorMessage } from "@/lib/helpers";
import { sanitizeReminderFilters, type ReminderFilterValues } from "@/lib/helpers/reservation-reminders.helper";

const { Title, Text } = Typography;

const PAGE_SIZES = [20, 50, 100] as const;
const DEFAULT_PAGE_SIZE = 20;

const URL_KEYS = ["status", "kind", "trigger", "dateFrom", "dateTo", "perPage"] as const;

/** Relances de réservation (Admin — route protégée par AdminRoute, l'API refuse les autres rôles). */
export function ListRelances() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { values, update, page } = useUrlFilters(URL_KEYS);

  // URL assainie : une URL bricolée ne produit pas de requête invalide.
  const applied = useMemo<ReminderFilterValues>(
    () =>
      sanitizeReminderFilters({
        status: values.status,
        kind: values.kind,
        trigger: values.trigger,
        dateFrom: values.dateFrom,
        dateTo: values.dateTo,
      }),
    [values.status, values.kind, values.trigger, values.dateFrom, values.dateTo]
  );

  const perPageParam = Number(values.perPage);
  const perPage = (PAGE_SIZES as readonly number[]).includes(perPageParam) ? perPageParam : DEFAULT_PAGE_SIZE;

  const list = useAdminReminders({ ...applied, page, perPage });
  const paid = usePaidRemindersCount(applied, !list.isError);

  useEffect(() => {
    if (list.isError) message.error(extractErrorMessage(list.error, "Impossible de charger les relances"));
  }, [list.isError, list.error, message]);

  const onFilterChange = (patch: Partial<ReminderFilterValues>) => update(patch);

  const onReset = () =>
    update({
      status: undefined,
      kind: undefined,
      trigger: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      perPage: undefined,
    });

  return (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 8 }}>
      <Space style={{ marginBottom: 16 }} align="start">
        <Button type="text" icon={<ArrowLeftOutlined />} aria-label="Retour" onClick={() => navigate("/reservations")} />
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Relances des réservations
          </Title>
          <Text type="secondary">
            Rappels envoyés au client (paiement) ou au propriétaire (réponse), automatiquement ou depuis l'app mobile.
          </Text>
        </div>
      </Space>

      <RemindersFilters
        value={applied}
        onChange={onFilterChange}
        onReset={onReset}
      />

      {list.isError ? (
        <ApiErrorAlert
          error={list.error}
          onRetry={() => list.refetch()}
          forbiddenMessage="Accès refusé : les relances sont réservées aux administrateurs"
          loadErrorMessage="Impossible de charger les relances"
        />
      ) : (
        <>
          <RemindersStats
            total={list.data?.meta.total}
            paid={paid.data}
            loading={list.isInitialLoading || list.isFetching}
            paidLoading={paid.isInitialLoading || paid.isFetching}
            paidError={paid.isError}
          />
          <RemindersTable
            rows={list.data?.data ?? []}
            loading={list.isInitialLoading || list.isFetching}
            pagination={{
              current: list.data?.meta.page ?? page,
              pageSize: list.data?.meta.perPage ?? perPage,
              total: list.data?.meta.total ?? 0,
              showSizeChanger: true,
              pageSizeOptions: PAGE_SIZES.map(String),
              showTotal: (total) => `${total} relance(s)`,
            }}
            onChange={({ current, pageSize }) =>
              pageSize && pageSize !== perPage
                ? update({ perPage: pageSize === DEFAULT_PAGE_SIZE ? undefined : String(pageSize) })
                : update({ page: String(current ?? 1) })
            }
          />
        </>
      )}
    </div>
  );
}
