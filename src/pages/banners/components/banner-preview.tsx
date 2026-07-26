import { Space, Button, Typography } from "antd";
import {
    PlusCircleOutlined,
    CheckSquareOutlined,
    BellOutlined,
    HomeOutlined,
    StarOutlined,
    SoundOutlined,
    CreditCardOutlined,
    CheckCircleOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

const { Text } = Typography;

export const ICON_MAP: Record<string, ReactNode> = {
    "plus-circle": <PlusCircleOutlined />,
    "calendar-check": <CheckSquareOutlined />,
    "bell": <BellOutlined />,
    "home": <HomeOutlined />,
    "star": <StarOutlined />,
    "megaphone": <SoundOutlined />,
    "credit-card": <CreditCardOutlined />,
    "check-circle": <CheckCircleOutlined />,
};

interface BannerPreviewProps {
    title?: string;
    subtitle?: string;
    cta_label?: string;
    cta2_label?: string;
    icon?: string;
    bg_color?: string;
    icon_color?: string;
    text_color?: string;
    dismissible?: boolean;
}

export const BannerPreview = ({
    title,
    subtitle,
    cta_label,
    cta2_label,
    icon,
    bg_color = "#5B3FE4",
    icon_color = "#FFFFFF",
    text_color = "#FFFFFF",
    dismissible,
}: BannerPreviewProps) => {
    const iconNode = icon ? ICON_MAP[icon] : null;

    return (
        <div
            style={{
                backgroundColor: bg_color,
                borderRadius: 14,
                padding: "20px 24px",
                color: "#fff",
                position: "relative",
                minHeight: 130,
                boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
            }}
        >
            {dismissible && (
                <CloseOutlined
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 14,
                        color: "rgba(255,255,255,0.65)",
                        fontSize: 13,
                    }}
                />
            )}
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Space size={10} align="center">
                    {iconNode && (
                        <span style={{ fontSize: 20, color: icon_color, lineHeight: 1 }}>
                            {iconNode}
                        </span>
                    )}
                    <Text
                        style={{
                            color: text_color,
                            fontWeight: 700,
                            fontSize: 15,
                            lineHeight: "1.3",
                        }}
                    >
                        {title || <span style={{ opacity: 0.45 }}>Titre de la bannière</span>}
                    </Text>
                </Space>

                {subtitle && (
                    <Text
                        style={{
                            color: text_color,
                            opacity: 0.82,
                            fontSize: 13,
                            lineHeight: "1.45",
                        }}
                    >
                        {subtitle}
                    </Text>
                )}

                {(cta_label || cta2_label) && (
                    <Space style={{ marginTop: 6 }}>
                        {cta_label && (
                            <Button
                                size="small"
                                style={{
                                    background: "rgba(255,255,255,0.22)",
                                    border: "1px solid rgba(255,255,255,0.45)",
                                    color: "#fff",
                                    borderRadius: 6,
                                    fontWeight: 600,
                                    fontSize: 12,
                                }}
                            >
                                {cta_label}
                            </Button>
                        )}
                        {cta2_label && (
                            <Button
                                size="small"
                                style={{
                                    background: "transparent",
                                    border: "1px solid rgba(255,255,255,0.3)",
                                    color: "rgba(255,255,255,0.78)",
                                    borderRadius: 6,
                                    fontSize: 12,
                                }}
                            >
                                {cta2_label}
                            </Button>
                        )}
                    </Space>
                )}
            </Space>
        </div>
    );
};
