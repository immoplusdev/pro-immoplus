import React from "react";
import type { PollStatus } from "./types";
import { T } from "@/lib/design-tokens";

export const STATUS_LABELS: Record<PollStatus, string> = {
  ACTIVE: "Actif",
  CLOSED: "Fermé",
};

export const STATUS_BADGE_CONFIG: Record<PollStatus, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: `${T.success}26`, text: T.successDark, dot: T.success },
  CLOSED: { bg: T.ink8, text: T.ink60, dot: T.ink60 },
};

interface Props {
  status: PollStatus;
  size?: "small" | "default";
}

export function PollStatusBadge({ status, size = "default" }: Props) {
  const cfg = STATUS_BADGE_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: cfg.bg,
        color: cfg.text,
        borderRadius: 999,
        padding: size === "small" ? "2px 8px" : "4px 12px",
        fontSize: size === "small" ? 11 : 13,
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {STATUS_LABELS[status]}
    </span>
  );
}
