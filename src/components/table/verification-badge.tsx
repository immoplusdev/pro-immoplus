import React from "react";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const SUCCESS_COLOR = "#1F8A5B";
const NEUTRAL_COLOR = "#B4B6C0";

interface Props {
    verified: boolean;
}

export function VerificationBadge({ verified }: Props) {
    const color = verified ? SUCCESS_COLOR : NEUTRAL_COLOR;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: `1px solid ${color}`,
                color,
                background: "#FFFFFF",
                fontSize: 11,
            }}
        >
            {verified ? <CheckOutlined /> : <CloseOutlined />}
        </span>
    );
}
