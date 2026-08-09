import type { CSSProperties } from "react";
import { T } from "@/lib/design-tokens";

// Design tokens — spec docs/drafts/Campagne.md §2
export { T } from "@/lib/design-tokens";

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
