import type { ReactNode } from "react";
import { Badge, Space, Tag, Tooltip } from "antd";
import { BellOutlined, MailOutlined, MessageOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { isSendingInProgress } from "@/lib/helpers/reservation-reminders.helper";
import {
  isReminderChannelStatus,
  REMINDER_CHANNEL_LABELS,
  REMINDER_CHANNEL_STATUS_BADGES,
  REMINDER_CHANNELS,
  type ReminderChannel,
  type ReminderChannelsReport,
} from "@/types/reservation-reminders.types";

const CHANNEL_ICONS: Record<ReminderChannel, ReactNode> = {
  push: <BellOutlined />,
  whatsapp: <WhatsAppOutlined />,
  email: <MailOutlined />,
  message: <MessageOutlined />,
};

/** Les 4 canaux d'une relance, chacun avec un Badge de statut ; « Envoi en cours » tant que le rapport est vide. */
export function ReminderChannelIcons({ channels }: { channels: ReminderChannelsReport }) {
  if (isSendingInProgress(channels)) return <Tag color="processing">Envoi en cours</Tag>;

  return (
    <Space size="middle" wrap>
      {REMINDER_CHANNELS.map((channel) => {
        const raw = channels[channel];
        const status = isReminderChannelStatus(raw) ? REMINDER_CHANNEL_STATUS_BADGES[raw] : undefined;
        const text = `${REMINDER_CHANNEL_LABELS[channel]} : ${status?.label ?? "non renseigné"}`;
        return (
          <Tooltip key={channel} title={text}>
            <span aria-label={text} role="img" style={{ fontSize: 16, lineHeight: 1 }}>
              <Badge dot status={status?.badge ?? "default"} offset={[-2, 2]}>
                <span style={{ fontSize: 16 }}>{CHANNEL_ICONS[channel]}</span>
              </Badge>
            </span>
          </Tooltip>
        );
      })}
    </Space>
  );
}
