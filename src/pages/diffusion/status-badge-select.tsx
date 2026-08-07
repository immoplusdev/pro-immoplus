import React from "react";
import { Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import type { AdStatus } from "./types";
import { AD_STATUSES } from "./types";
import { StatusBadge } from "./status-badge";
import { T } from "./tokens";

interface Props {
    value?: AdStatus;
    onChange?: (value: AdStatus) => void;
}

export function StatusBadgeSelect({ value = "DRAFT", onChange }: Props) {
    return (
        <Dropdown
            trigger={["click"]}
            menu={{
                items: AD_STATUSES.map((s) => ({
                    key: s,
                    label: <StatusBadge status={s} />,
                })),
                onClick: ({ key }) => onChange?.(key as AdStatus),
                selectedKeys: [value],
            }}
        >
            <button
                type="button"
                style={{
                    background: "none",
                    border: `1px solid ${T.ink12}`,
                    borderRadius: 8,
                    padding: "6px 10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    height: 40,
                }}
            >
                <StatusBadge status={value} />
                <DownOutlined style={{ fontSize: 10, color: T.ink60 }} />
            </button>
        </Dropdown>
    );
}
