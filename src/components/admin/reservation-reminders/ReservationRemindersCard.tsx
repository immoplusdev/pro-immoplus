import { useMemo } from "react";
import { Alert, Button, Card, Empty, Progress, Skeleton, Space, Timeline, Typography } from "antd";
import { NotificationOutlined, ReloadOutlined } from "@ant-design/icons";
import { MappedTag } from "@/components/admin/common/MappedTag";
import { extractErrorMessage, getErrorStatus } from "@/lib/helpers";
import { useReservationReminders } from "@/hooks/useReservationReminders";
import {
  formatReminderDate,
  reminderDotColor,
  sortChronologically,
} from "@/lib/helpers/reservation-reminders.helper";
import {
  getReminderKindLabel,
  getReminderTargetLabel,
  REMINDER_TRIGGER_TAGS,
} from "@/types/reservation-reminders.types";
import { ReminderChannelIcons } from "./ReminderChannelIcons";

const { Text } = Typography;

/**
 * Historique des relances d'une réservation (lecture seule : les relances manuelles
 * sont déclenchées depuis les apps mobiles, pas depuis le dashboard).
 */
export function ReservationRemindersCard({ reservationId }: { reservationId: string | undefined }) {
  const { data, isInitialLoading, isFetching, isError, error, refetch } = useReservationReminders(reservationId);

  const items = useMemo(() => sortChronologically(data?.items ?? []), [data]);
  const manual = data?.manual;

  const body = (() => {
    if (!reservationId || isInitialLoading) return <Skeleton active paragraph={{ rows: 4 }} />;
    if (isError) {
      const forbidden = getErrorStatus(error) === 403;
      return (
        <Alert
          type={forbidden ? "warning" : "error"}
          showIcon
          message={forbidden ? "Accès refusé : historique des relances réservé aux administrateurs" : "Impossible de charger les relances"}
          description={forbidden ? undefined : extractErrorMessage(error, "Une erreur est survenue.")}
          action={
            forbidden ? undefined : (
              <Button size="small" onClick={() => refetch()}>
                Réessayer
              </Button>
            )
          }
        />
      );
    }
    if (items.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucune relance envoyée" />;
    }
    return (
      <Timeline
        style={{ marginTop: 8 }}
        items={items.map((item) => ({
          key: item.id,
          color: reminderDotColor(item),
          children: (
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Space wrap size={[8, 4]}>
                <Text strong>{getReminderKindLabel(item.kind)}</Text>
                <MappedTag value={item.trigger} map={REMINDER_TRIGGER_TAGS} />
              </Space>
              <Text type="secondary">
                {getReminderTargetLabel(item.target)} · {formatReminderDate(item.sentAt)}
              </Text>
              <ReminderChannelIcons channels={item.channels ?? {}} />
            </Space>
          ),
        }))}
      />
    );
  })();

  return (
    <Card
      style={{ border: "1px solid #E8E9EE", borderRadius: 10 }}
      title={
        <Space>
          <NotificationOutlined />
          <span>Relances</span>
        </Space>
      }
      extra={
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined spin={isFetching && !isInitialLoading} />}
          aria-label="Rafraîchir les relances"
          onClick={() => refetch()}
          disabled={!reservationId}
        />
      }
    >
      {manual && (
        <div style={{ marginBottom: 16 }}>
          <Text>
            Relances manuelles : {manual.sent} / {manual.max}
          </Text>
          <Progress
            percent={manual.max > 0 ? Math.min(100, Math.round((manual.sent / manual.max) * 100)) : 100}
            showInfo={false}
            size="small"
            status={manual.sent >= manual.max ? "exception" : "normal"}
          />
          {manual.nextAllowedAt && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Prochaine relance manuelle possible à partir du {formatReminderDate(manual.nextAllowedAt)}
            </Text>
          )}
        </div>
      )}
      {body}
    </Card>
  );
}
