import React, { useEffect, useMemo, useState } from "react";
import { Segmented, Typography } from "antd";
import { LeftOutlined, RightOutlined, PictureOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import type { Dayjs } from "dayjs";
import type { AdType, AdStatus, AdPlacement, AdCampaignCategory } from "./types";
import { T, cardStyle } from "./tokens";
import { StatusBadge } from "./status-badge";

const { Text } = Typography;

function useFileObjectUrl(file: UploadFile | undefined): string | undefined {
    const [url, setUrl] = useState<string | undefined>(file?.url);

    useEffect(() => {
        if (file?.url) {
            setUrl(file.url);
            return;
        }
        if (file?.originFileObj) {
            const objectUrl = URL.createObjectURL(file.originFileObj as Blob);
            setUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
        setUrl(undefined);
    }, [file]);

    return url;
}

interface PreviewProps {
    type: AdType;
    status: AdStatus;
    placement?: AdPlacement;
    category?: AdCampaignCategory;
    title?: string;
    subtitle?: string;
    badge?: string;
    ctaLabel?: string;
    imageFiles: UploadFile[];
    videoFiles: UploadFile[];
    startDate?: Dayjs;
    endDate?: Dayjs;
    priority?: number;
    positionIndex?: number;
}

function CarouselMedia({ images }: { images: UploadFile[] }) {
    const [index, setIndex] = useState(0);
    const current = images[Math.min(index, images.length - 1)];
    const url = useFileObjectUrl(current);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {url ? (
                <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
                <EmptyMedia />
            )}
            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                        style={carouselArrowStyle("left")}
                    >
                        <LeftOutlined style={{ fontSize: 10 }} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIndex((i) => (i + 1) % images.length)}
                        style={carouselArrowStyle("right")}
                    >
                        <RightOutlined style={{ fontSize: 10 }} />
                    </button>
                    <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
                        {images.map((_, i) => (
                            <span
                                key={i}
                                style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: "50%",
                                    background: i === index ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function carouselArrowStyle(side: "left" | "right"): React.CSSProperties {
    return {
        position: "absolute",
        top: "50%",
        [side]: 6,
        transform: "translateY(-50%)",
        width: 22,
        height: 22,
        borderRadius: "50%",
        border: "none",
        background: "rgba(0,0,0,0.4)",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    };
}

function EmptyMedia() {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: `${T.accentPeach}33`,
                color: T.ink60,
                textAlign: "center",
                padding: 16,
            }}
        >
            <PictureOutlined style={{ fontSize: 28 }} />
            <Text style={{ fontSize: 12, color: T.ink60 }}>
                Ajoutez une image ou vidéo pour voir l'aperçu
            </Text>
        </div>
    );
}

export function AdCampaignPreview({
    type,
    status,
    placement,
    category,
    title,
    subtitle,
    badge,
    ctaLabel,
    imageFiles,
    videoFiles,
    startDate,
    endDate,
    priority,
    positionIndex,
}: PreviewProps) {
    const [view, setView] = useState<"Mobile" | "Web">("Mobile");
    const firstImageUrl = useFileObjectUrl(imageFiles[0]);
    const firstVideoUrl = useFileObjectUrl(videoFiles[0]);

    const hasMedia =
        (type === "IMAGE" && imageFiles.length > 0) ||
        (type === "VIDEO" && videoFiles.length > 0) ||
        (type === "CAROUSEL" && imageFiles.length > 0);

    const dateSummary = useMemo(() => {
        if (!startDate || !endDate) return null;
        const days = endDate.diff(startDate, "day");
        return `Visible du ${startDate.format("DD/MM")} au ${endDate.format("DD/MM/YYYY")} (${days} jour${days > 1 ? "s" : ""})`;
    }, [startDate, endDate]);

    return (
        <div style={{ ...cardStyle, padding: 20, position: "sticky", top: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>Aperçu</Text>
                <Segmented
                    size="small"
                    options={["Mobile", "Web"]}
                    value={view}
                    onChange={(v) => setView(v as "Mobile" | "Web")}
                />
            </div>

            <div
                style={{
                    width: view === "Mobile" ? 240 : "100%",
                    maxWidth: "100%",
                    margin: "0 auto",
                    border: `1px solid ${T.ink12}`,
                    borderRadius: view === "Mobile" ? 20 : 12,
                    overflow: "hidden",
                    background: "#000",
                    transition: "width 180ms ease-out",
                }}
            >
                <div style={{ position: "relative", width: "100%", aspectRatio: "9 / 12", background: "#000" }}>
                    {!hasMedia && <EmptyMedia />}

                    {hasMedia && type === "IMAGE" && firstImageUrl && (
                        <img src={firstImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}

                    {hasMedia && type === "VIDEO" && firstVideoUrl && (
                        <video src={firstVideoUrl} muted loop autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}

                    {hasMedia && type === "CAROUSEL" && <CarouselMedia images={imageFiles} />}

                    {hasMedia && (
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                bottom: 0,
                                padding: 14,
                                background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                                transition: "opacity 180ms ease-out",
                            }}
                        >
                            {badge && (
                                <span
                                    style={{
                                        alignSelf: "flex-start",
                                        background: T.accentPink,
                                        color: "#FFFFFF",
                                        fontSize: 11,
                                        fontWeight: 700,
                                        borderRadius: 999,
                                        padding: "2px 8px",
                                    }}
                                >
                                    {badge}
                                </span>
                            )}
                            <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 16, lineHeight: 1.25 }}>
                                {title || "Titre de la campagne"}
                            </span>
                            {subtitle && (
                                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{subtitle}</span>
                            )}
                            {ctaLabel && (
                                <span
                                    style={{
                                        alignSelf: "flex-start",
                                        marginTop: 4,
                                        background: T.primary,
                                        color: "#FFFFFF",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        borderRadius: 999,
                                        padding: "6px 14px",
                                    }}
                                >
                                    {ctaLabel}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: T.ink60 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Statut</span>
                    <StatusBadge status={status} size="small" />
                </div>
                <MetaRow label="Type" value={type} />
                <MetaRow label="Placement" value={placement} />
                <MetaRow label="Catégorie" value={category} />
                <MetaRow label="Priorité / Position" value={`${priority ?? 0} / ${positionIndex ?? 0}`} />
                {dateSummary && <MetaRow label="Période" value={dateSummary} />}
            </div>
        </div>
    );
}

function MetaRow({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span>{label}</span>
            <span style={{ color: T.ink, fontWeight: 500, textAlign: "right" }}>{value}</span>
        </div>
    );
}
