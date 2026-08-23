import React from "react";
import { T } from "@/lib/design-tokens";

export type PillTone = "success" | "warning" | "error" | "info" | "accent" | "neutral";

const TONE_CONFIG: Record<PillTone, { bg: string; text: string; dot: string }> = {
    success: { bg: `${T.success}26`, text: T.successDark, dot: T.success },
    warning: { bg: `${T.warning}26`, text: T.warningDark, dot: T.warning },
    error: { bg: `${T.error}1F`, text: T.errorDark, dot: T.error },
    info: { bg: `${T.info}1F`, text: T.infoDark, dot: T.info },
    accent: { bg: `${T.accentLilac}66`, text: T.accentLilacDark, dot: T.accentLilacDark },
    neutral: { bg: T.ink8, text: T.ink60, dot: T.ink40 },
};

interface Props {
    tone: PillTone;
    children: React.ReactNode;
    size?: "small" | "default";
    variant?: "filled" | "outline";
}

export function PillTag({ tone, children, size = "default", variant = "filled" }: Props) {
    const cfg = TONE_CONFIG[tone];
    const isOutline = variant === "outline";
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: isOutline ? T.bg : cfg.bg,
                border: isOutline ? `1px solid ${cfg.dot}` : "1px solid transparent",
                color: cfg.text,
                borderRadius: 999,
                padding: size === "small" ? "2px 8px" : "3px 10px",
                fontSize: size === "small" ? 11 : 12,
                fontWeight: 600,
                lineHeight: 1.4,
                whiteSpace: "nowrap",
            }}
        >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
            {children}
        </span>
    );
}
