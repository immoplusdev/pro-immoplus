import React, { useEffect, useState } from "react";
import { BaseRecord, useTranslate } from "@refinedev/core";
import { Button, Popconfirm, Space, Spin, Tag, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import {
    ArrowRightOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
    EyeOutlined,
    LikeOutlined,
    PlayCircleOutlined,
    SwapOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { axiosInstance } from "@/lib/providers/utils/axios";
import { FeedEntityTag } from "./feed-entity-tag";

const { Text } = Typography;

// Une carte occupe 2 colonnes lorsque son contenu (titre + localisation)
// dépasse ce seuil, pour éviter que le texte ne soit trop compressé.
const WIDE_CARD_THRESHOLD = 40;

const statusDotColor: Record<string, string> = {
    ready: "#52c41a",
    processing: "#faad14",
    failed: "#ff4d4f",
    deleted: "#bfbfbf",
};

const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 10px",
    borderRadius: 999,
    background: "#f5f5f5",
    fontSize: 12,
    lineHeight: 1.4,
};

type Props = {
    record: BaseRecord;
    onDelete: (id: string) => void;
    onMigrate: (id: string) => void;
    isMigrating?: boolean;
};

export function FeedLegacyBentoCard({ record, onDelete, onMigrate, isMigrating }: Props) {
    const translate = useTranslate();
    const navigate = useNavigate();

    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoLoading, setVideoLoading] = useState(false);

    useEffect(() => {
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoUrl]);

    const title: string = record?.content?.title ?? "";
    const location: string | undefined = record?.content?.location;
    const price = record?.content?.price;
    const authorName: string | undefined = record?.author?.name;
    const entity: string | undefined = record?.relatedTo?.entity;
    const status: string | undefined = record?.status;
    const migratedAt: string | null = record?.migratedAt ?? null;
    const stats = record?.stats;

    const spanTwoColumns = title.length + (location?.length ?? 0) > WIDE_CARD_THRESHOLD;

    const handlePlayClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoUrl || videoLoading || !record?.videoUrl) return;
        setVideoLoading(true);
        axiosInstance
            .get(record.videoUrl, { responseType: "blob" })
            .then((res) => setVideoUrl(URL.createObjectURL(res.data)))
            .finally(() => setVideoLoading(false));
    };

    return (
        <div
            onClick={() => navigate(`/feed/legacy/show/${record.id}`, { state: { record } })}
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                gridColumn: spanTwoColumns ? "span 2" : undefined,
                border: "1px solid #f0f0f0",
                borderRadius: 12,
                padding: 12,
                background: "#fff",
                cursor: "pointer",
            }}
        >
            {/* Grande sous-carte : vidéo */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#141414",
                    marginBottom: 10,
                }}
            >
                {videoUrl ? (
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                ) : (
                    <div
                        onClick={handlePlayClick}
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: record?.videoUrl ? "pointer" : "default",
                        }}
                    >
                        {videoLoading ? (
                            <Spin />
                        ) : (
                            <PlayCircleOutlined style={{ fontSize: 40, color: "#fff", opacity: 0.9 }} />
                        )}
                    </div>
                )}

                <div
                    title={status ? translate(`feed.status.${status}`) : undefined}
                    style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        boxShadow: "0 0 0 2px rgba(0,0,0,0.35)",
                        background: status ? statusDotColor[status] ?? "#bfbfbf" : "#bfbfbf",
                    }}
                />

                {entity && (
                    <div style={{ position: "absolute", top: 6, right: 6 }}>
                        <FeedEntityTag entity={entity} />
                    </div>
                )}
            </div>

            {/* Titre + auteur */}
            <Text strong style={{ fontSize: 14 }}>
                {title}
            </Text>
            <Space size={4} style={{ marginTop: 2, marginBottom: 8, color: "#8c8c8c" }}>
                <UserOutlined />
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {authorName ?? "-"}
                </Text>
            </Space>

            {/* Petites sous-cartes : données */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {price && (
                    <span style={{ ...chipStyle, background: "#e6f4ff", color: "#1677ff", fontWeight: 600 }}>
                        {price}
                    </span>
                )}
                {location && (
                    <span style={chipStyle}>
                        <EnvironmentOutlined />
                        {location}
                    </span>
                )}
                <span style={chipStyle}>
                    <LikeOutlined />
                    {stats?.likes ?? 0}
                </span>
                <span style={chipStyle}>
                    <EyeOutlined />
                    {stats?.views ?? 0}
                </span>
            </div>

            <div style={{ flex: 1, minHeight: 8 }} />

            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid #f0f0f0",
                }}
            >
                {migratedAt ? (
                    <Tag color="success">{translate("feed.legacy.migratedYes")}</Tag>
                ) : (
                    <Popconfirm
                        title={translate("feed.legacy.migrateTitle")}
                        description={translate("feed.legacy.migrateDescription")}
                        onConfirm={() => onMigrate(record.id as string)}
                        okText={translate("common.yes")}
                        cancelText={translate("common.no")}
                    >
                        <Button
                            size="small"
                            type="primary"
                            icon={<SwapOutlined />}
                            loading={isMigrating}
                            disabled={isMigrating}
                        >
                            {translate("feed.legacy.migrateButton")}
                        </Button>
                    </Popconfirm>
                )}

                <Space size={4}>
                    <Button
                        size="small"
                        icon={<ArrowRightOutlined />}
                        onClick={() => navigate(`/feed/legacy/show/${record.id}`, { state: { record } })}
                    />
                    <Popconfirm
                        title={translate("common.deleteTitle")}
                        description={translate("common.deleteConfirm")}
                        onConfirm={() => onDelete(record.id as string)}
                        okText={translate("common.yes")}
                        cancelText={translate("common.no")}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            </div>
        </div>
    );
}
