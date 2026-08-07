import type { CSSProperties } from "react";

// Design tokens — spec docs/drafts/Campagne.md §2
export const T = {
    primary: "#2744DE",
    primaryHover: "#1F37B5",
    ink: "#1A1423",
    ink60: "rgba(26,20,35,0.6)",
    ink40: "rgba(26,20,35,0.4)",
    ink12: "rgba(26,20,35,0.12)",
    ink8: "rgba(26,20,35,0.08)",
    bg: "#FFFFFF",
    surfaceMuted: "rgba(238,224,203,0.3)",
    success: "#35FF69",
    successDark: "#12793A",
    warning: "#FA9F42",
    warningDark: "#8A4A00",
    accentPink: "#F72585",
    accentLilac: "#D4C2FC",
    accentLilacDark: "#5B3B9E",
    accentPeach: "#F9DBBD",
    error: "#F72585",
} as const;

export const cardStyle: CSSProperties = {
    border: `1px solid ${T.ink12}`,
    borderRadius: 12,
    boxShadow: "0 1px 2px rgba(26,20,35,0.04), 0 4px 12px rgba(26,20,35,0.04)",
    background: T.bg,
};

export const focusRingStyle = `
  .campagne-form :where(input, textarea, .ant-select-selector, .ant-picker, .ant-radio-button-wrapper):focus,
  .campagne-form :where(input, textarea, .ant-select-selector, .ant-picker):focus-within {
    outline: 2px solid ${T.primary};
    outline-offset: 2px;
  }
`;
