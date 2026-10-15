import { Link } from "react-router-dom";
import { Typography } from "antd";
import type { ConversationParticipant } from "@/types/messaging";

const { Text } = Typography;

export const participantFullName = (user?: ConversationParticipant | null) =>
  [user?.firstName, user?.lastName].map((v) => v?.trim()).filter(Boolean).join(" ");

/** Prénom + nom ; à défaut e-mail, téléphone puis ID (comptes sans profil complété). */
export const participantLabel = (user: ConversationParticipant | null | undefined, fallbackId: string) =>
  participantFullName(user) || user?.email || user?.phoneNumber || fallbackId;

export function ParticipantCell({
  user,
  fallbackId,
  linkToProfile = false,
}: {
  user?: ConversationParticipant | null;
  fallbackId: string;
  linkToProfile?: boolean;
}) {
  const fullName = participantFullName(user);
  const contact = user?.email || user?.phoneNumber || null;
  const label = participantLabel(user, fallbackId);
  return (
    <div>
      <Text ellipsis style={{ display: "block" }} title={label}>
        {linkToProfile ? <Link to={`/users/edit/${fallbackId}`}>{label}</Link> : label}
      </Text>
      {fullName && contact && (
        <Text type="secondary" ellipsis style={{ display: "block", fontSize: 12 }}>
          {contact}
        </Text>
      )}
    </div>
  );
}
