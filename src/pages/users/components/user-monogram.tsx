import React from "react";

const DEFAULT_COLOR = "#5F5E5A";

interface Props {
    firstName?: string;
    lastName?: string;
    color?: string;
}

function getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.trim()?.[0] ?? "";
    const last = lastName?.trim()?.[0] ?? "";
    return (first + last).toUpperCase() || "?";
}

export function UserMonogram({ firstName, lastName, color = DEFAULT_COLOR }: Props) {
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1.5px solid ${color}`,
                color,
                background: "#FFFFFF",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
            }}
        >
            {getInitials(firstName, lastName)}
        </span>
    );
}
