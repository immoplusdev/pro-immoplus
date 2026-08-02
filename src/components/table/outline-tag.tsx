import React from "react";

interface Props {
    color: string;
    children: React.ReactNode;
}

export function OutlineTag({ color, children }: Props) {
    return (
        <span
            style={{
                display: "inline-block",
                background: "#FFFFFF",
                border: `1px solid ${color}`,
                color,
                borderRadius: 999,
                padding: "3px 10px",
                fontSize: 12,
                lineHeight: 1.4,
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </span>
    );
}
