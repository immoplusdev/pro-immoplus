import React from "react";
import type { AdStatus } from "./types";
import { T } from "./tokens";

export const STATUS_LABELS: Record<AdStatus, string> = {
    DRAFT: "Brouillon",
    ACTIVE: "Active",
    SUSPENDED: "Suspendue",
    EXPIRED: "Expirée",
};

export const STATUS_BADGE_CONFIG: Record<AdStatus, { bg: string; text: string; dot: string }> = {
    DRAFT: { bg: `${T.warning}26`, text: T.warningDark, dot: T.warning },
    ACTIVE: { bg: `${T.success}26`, text: T.successDark, dot: T.success },
    SUSPENDED: { bg: `${T.accentLilac}4D`, text: T.accentLilacDark, dot: T.accentLilac },
    EXPIRED: { bg: T.ink8, text: T.ink60, dot: T.ink60 },
};

interface Props {
    status: AdStatus;
    size?: "small" | "default";
}

export function StatusBadge({ status, size = "default" }: Props) {
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
