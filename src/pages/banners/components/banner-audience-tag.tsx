import { Tag } from "antd";
import { useTranslate } from "@refinedev/core";

const config: Record<string, { color: string; label: string }> = {
    buyer: { color: "blue", label: "👤 App Client" },
    seller: { color: "purple", label: "🏢 App Pro" },
    all: { color: "cyan", label: "🌐 Les deux" },
};

export const BannerAudienceTag = ({ audience }: { audience: string }) => {
    const translate = useTranslate();
    const c = config[audience] ?? { color: "default", label: audience };
    return <Tag color={c.color}>{translate(`banners.audience.${audience}`) || c.label}</Tag>;
};
